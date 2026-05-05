// Telegram Channel Auto-Post Script
// Finds the latest blog-en article and generates a Telegram-ready message.
//
// Two output modes:
//   1. Default: prints the formatted message to stdout (for piping/webhook)
//   2. --webhook <bot_token> <chat_id>: sends directly via Telegram Bot API
//
// Run: node scripts/telegram-auto-post.cjs
// Run (webhook): node scripts/telegram-auto-post.cjs --webhook BOT_TOKEN CHAT_ID

const fs = require('fs');
const path = require('path');
const https = require('https');

const BLOG_EN_DIR = path.join(__dirname, '..', 'src', 'content', 'blog-en');
const SITE_URL = 'https://disclosurehk.com';

// Parse frontmatter from a markdown file
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const qm = line.match(/^(\w+):\s*['"](.+?)['"]\s*$/);
    if (qm) { fm[qm[1]] = qm[2]; continue; }
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/['"]/g, '');
  }
  return fm;
}

// Format for Telegram (markdown-style, no tables)
function formatTelegramMessage(latest) {
  // Strip excessive emoji from title (keep some for readability)
  const title = latest.title
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Keep other emoji but remove smileys
    .trim();

  const desc = latest.description.length > 200
    ? latest.description.substring(0, 200).trimEnd() + '…'
    : latest.description;

  const lines = [
    `🛸 *${title}*`,
    '',
    `${desc}`,
    '',
    `🔗 [Read full article](${SITE_URL}/blog/${latest.slug}/)`,
    '',
    `#UFO #UAP #Disclosure #DisclosureHK`,
  ];

  return lines.join('\n');
}

// Send via Telegram Bot API (webhook mode)
function sendViaWebhook(botToken, chatId, message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok) {
            resolve(json);
          } else {
            reject(new Error(`Telegram API error: ${json.description || data}`));
          }
        } catch {
          reject(new Error(`Invalid response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const webhookMode = args[0] === '--webhook';

  console.error(`[telegram-auto-post] Reading blog-en articles from: ${BLOG_EN_DIR}`);

  const files = fs.readdirSync(BLOG_EN_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.error('[telegram-auto-post] No blog posts found');
    process.exit(1);
  }

  const posts = [];
  for (const file of files) {
    const filePath = path.join(BLOG_EN_DIR, file);
    const fm = parseFrontmatter(filePath);
    if (!fm || !fm.pubDate) continue;
    posts.push({
      slug: file.replace('.md', ''),
      title: fm.titleEn || fm.title || '',
      description: fm.description || '',
      pubDate: new Date(fm.pubDate),
    });
  }

  if (posts.length === 0) {
    console.error('[telegram-auto-post] No valid posts found');
    process.exit(1);
  }

  posts.sort((a, b) => b.pubDate - a.pubDate);

  // Skip digest, filler, and hearing-live posts; prefer breaking > cases > others
  const preferred = posts.filter(p => {
    const slug = p.slug;
    if (slug.startsWith('ufo-news-digest')) return false;
    if (slug.startsWith('ufo-filler')) return false;
    if (slug.startsWith('ufo-hearing-live')) return false;
    return true;
  });

  const breaking = preferred.filter(p => p.slug.startsWith('ufo-breaking'));
  const cases = preferred.filter(p => p.slug.startsWith('ufo-case'));
  const others = preferred.filter(p => !p.slug.startsWith('ufo-breaking') && !p.slug.startsWith('ufo-case'));
  const combine = [...breaking, ...cases, ...others];
  const latest = combine.length > 0 ? combine[0] : preferred[0] || posts[0];
  console.error(`[telegram-auto-post] Latest: "${latest.title}" (${latest.pubDate.toISOString()})`);

  const message = formatTelegramMessage(latest);

  if (webhookMode) {
    // Webhook mode: send directly
    const botToken = args[1];
    const chatId = args[2];
    if (!botToken || !chatId) {
      console.error('[telegram-auto-post] Usage: --webhook BOT_TOKEN CHAT_ID');
      process.exit(1);
    }
    try {
      const result = await sendViaWebhook(botToken, chatId, message);
      console.error(`[telegram-auto-post] ✅ Sent to Telegram channel ${chatId}`);
      console.log(JSON.stringify({ ok: true, message_id: result.result?.message_id }));
    } catch (err) {
      console.error(`[telegram-auto-post] ❌ Failed: ${err.message}`);
      process.exit(1);
    }
  } else {
    // Default mode: output the message to stdout (can be piped or used with a webhook tool)
    console.log(message);
    console.error('[telegram-auto-post] 📤 Message printed to stdout (pipe to webhook or use --webhook mode)');
  }
}

main().catch(err => {
  console.error(`[telegram-auto-post] Error: ${err.message}`);
  process.exit(1);
});
