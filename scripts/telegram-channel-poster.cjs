#!/usr/bin/env node
/**
 * telegram-channel-poster.cjs
 * Posts the latest UFO digest to Telegram Channel via OpenClaw's bot token
 *
 * Usage: node scripts/telegram-channel-poster.cjs [chat_id]
 *   - If chat_id provided, posts there
 *   - Otherwise prints the message to stdout
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_DIR = path.join(__dirname, '..');
const BLOG_EN_DIR = path.join(SITE_DIR, 'src', 'content', 'blog-en');
const SITE_URL = 'https://disclosurehk.com';
const BOT_TOKEN = process.env.OPENCLAW_TELEGRAM_BOT_TOKEN || '';

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

// Format for Telegram (no markdown tables, friendly)
function formatMessage(post) {
  const title = post.title.replace(/^[🛸🚨🔴]+/g, '').trim();
  const lines = [
    `🚀 *New UFO/UAP Digest*`,
    ``,
    `${title}`,
    ``,
  ];

  // Extract first 5 article titles from the body
  const body = post.body || '';
  const articles = body.match(/^\d+\.\s*\[([^\]]+)\]/gm);
  if (articles) {
    const top5 = articles.slice(0, 5);
    top5.forEach(a => {
      // Extract text between [ and ]
      const match = a.match(/\[([^\]]+)\]/);
      if (match) lines.push(`• ${match[1]}`);
    });
    if (articles.length > 5) {
      lines.push(`… and ${articles.length - 5} more stories`);
    }
  }

  lines.push(``);
  lines.push(`📅 ${post.pubDate || 'Latest update'}`);
  lines.push(`🔗 ${SITE_URL}`);
  lines.push(``);
  lines.push(`#UFO #UAP #DisclosureHK`);

  return lines.join('\n');
}

// Get the latest post
function getLatestPost() {
  if (!fs.existsSync(BLOG_EN_DIR)) {
    console.error(`Directory not found: ${BLOG_EN_DIR}`);
    return null;
  }

  const files = fs.readdirSync(BLOG_EN_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('No blog posts found');
    return null;
  }

  const latest = files[0];
  const content = fs.readFileSync(path.join(BLOG_EN_DIR, latest), 'utf8');
  const fm = parseFrontmatter(path.join(BLOG_EN_DIR, latest));

  if (!fm) return null;

  return {
    title: fm.title || 'UFO News Update',
    pubDate: fm.pubDate || '',
    slug: latest.replace('.md', ''),
    body: content,
  };
}

// Send to Telegram
function sendToTelegram(chatId, message) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(message);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });

    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.ok) {
            console.log(`✅ Posted to Telegram chat ${chatId}`);
            resolve(result);
          } else {
            console.error(`❌ Telegram API error: ${result.description}`);
            reject(new Error(result.description));
          }
        } catch(e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Main
async function main() {
  const chatId = process.argv[2];
  const post = getLatestPost();
  
  if (!post) {
    console.error('❌ No posts found to share');
    process.exit(1);
  }

  const message = formatMessage(post);

  if (chatId) {
    // Need bot token - try reading from openclaw config
    if (!BOT_TOKEN) {
      // Try reading from openclaw config
      const configPath = '/root/.openclaw/openclaw.json';
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // It's redacted in config, can't read it directly
        console.error('❌ Bot token not available via env. Set OPENCLAW_TELEGRAM_BOT_TOKEN');
        process.exit(1);
      } catch(e) {
        console.error('❌ Cannot read config:', e.message);
        process.exit(1);
      }
    }
    await sendToTelegram(chatId, message);
  } else {
    // Just print the message
    console.log(message);
  }
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
