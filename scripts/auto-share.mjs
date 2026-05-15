/**
 * auto-share.mjs — Universal Social Auto-Poster
 * 
 * Automatically posts the latest non-digest/non-filler UFO article to:
 *   - X/Twitter (via xurl)
 *   - Telegram channel (via Bot API)
 * 
 * Usage:
 *   node scripts/auto-share.mjs                           # Preview mode
 *   node scripts/auto-share.mjs --post                    # Post to all channels
 *   node scripts/auto-share.mjs --post --dry-run          # Show what would be posted
 *   node scripts/auto-share.mjs --post --platform x       # Post only to X
 *   node scripts/auto-share.mjs --post --platform tg      # Post only to Telegram
 * 
 * State tracking: .auto-share-state.json prevents re-posting
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_EN_DIR = path.join(ROOT, 'src', 'content', 'blog-en');
const STATE_FILE = path.join(ROOT, '.auto-share-state.json');
const SITE_URL = 'https://disclosurehk.com';

// ---- State management ----

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { posted: [], version: 2, lastPostedAt: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// ---- Frontmatter parsing ----

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

// ---- Find next post to share ----

function getNextPost() {
  const state = loadState();
  const files = fs.readdirSync(BLOG_EN_DIR).filter(f => f.endsWith('.md'));
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

  // Sort by pubDate descending (newest first)
  posts.sort((a, b) => b.pubDate - a.pubDate);

  // Filter: exclude already posted, digests, fillers, hearing-live
  const candidates = posts.filter(p => {
    if (state.posted.includes(p.slug)) return false;
    const slug = p.slug;
    if (slug.startsWith('ufo-news-digest')) return false;
    if (slug.startsWith('ufo-filler')) return false;
    if (slug.startsWith('ufo-hearing-live')) return false;
    return true;
  });

  // Priority: breaking > cases > general articles
  const breaking = candidates.filter(p => p.slug.startsWith('ufo-breaking'));
  const cases = candidates.filter(p => p.slug.startsWith('ufo-case'));
  const others = candidates.filter(p => !p.slug.startsWith('ufo-breaking') && !p.slug.startsWith('ufo-case'));

  const ordered = [...breaking, ...cases, ...others];
  return ordered.length > 0 ? ordered[0] : null;
}

// ---- Format messages ----

function formatForX(post) {
  const cleanTitle = post.title.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
  const cleanDesc = post.description.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
  const url = `${SITE_URL}/blog/${post.slug}/`;

  const maxTitleLen = 100;
  const truncatedTitle = cleanTitle.length > maxTitleLen
    ? cleanTitle.substring(0, maxTitleLen).trimEnd() + '…'
    : cleanTitle;

  const urlLine = `\n\n${url}`;
  const overhead = `🛸 ${truncatedTitle}\n\n${urlLine}`.length;
  const available = Math.max(280 - overhead - 2, 0);
  const descPart = cleanDesc.length > available
    ? cleanDesc.substring(0, Math.max(available - 1, 0)).trimEnd() + '…'
    : cleanDesc;

  const tweet = `🛸 ${truncatedTitle}\n\n${descPart}\n\n${url}`;
  return tweet.length <= 280
    ? tweet
    : `🛸 ${truncatedTitle}\n\n${url}`;
}

function formatForTelegram(post) {
  const url = `${SITE_URL}/blog/${post.slug}/`;
  const desc = post.description.length > 200
    ? post.description.substring(0, 200).trimEnd() + '…'
    : post.description;

  return [
    `🛸 *${post.title}*`,
    '',
    `${desc}`,
    '',
    `🔗 [Read full article](${url})`,
    '',
    `#UFO #UAP #Disclosure #DisclosureHK`,
  ].join('\n');
}

// ---- Post functions ----

function postToX(text) {
  console.log(`  [X] Posting (${text.length} chars)...`);
  try {
    const result = execSync(`xurl post ${JSON.stringify(text)}`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    console.log(`  [X] ✅ Posted! Response: ${result.trim()}`);
    return true;
  } catch (err) {
    console.error(`  [X] ❌ Failed: ${err.message}`);
    return false;
  }
}

function postToTelegram(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.log('  [TG] ⏭️ Skipped — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars');
    return false;
  }

  console.log(`  [TG] Posting...`);
  try {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });

    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.ok) resolve(json);
            else reject(new Error(json.description));
          } catch { reject(new Error(data)); }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
    console.log(`  [TG] ✅ Posted!`);
    return true;
  } catch (err) {
    console.error(`  [TG] ❌ Failed: ${err.message}`);
    return false;
  }
}

// ---- Reddit posting helper ----

function formatForReddit(post, subreddit, customTitle) {
  const url = `${SITE_URL}/blog/${post.slug}/`;
  const title = customTitle || post.title;
  const desc = post.description.length > 300
    ? post.description.substring(0, 300).trimEnd() + '…'
    : post.description;

  return {
    title: title,
    url: url,
    body: `I put together a detailed write-up on this topic at DisclosureHK. Figured the community here might find it useful.\n\n${desc}\n\nRead more: ${url}\n\n#UFO #UAP #Disclosure`,
  };
}

// ---- Main ----

async function main() {
  const args = process.argv.slice(2);
  const isPost = args.includes('--post');
  const isDryRun = args.includes('--dry-run');
  const platformFilter = args.includes('--platform') ? args[args.indexOf('--platform') + 1] : null;

  const post = getNextPost();
  if (!post) {
    console.log('\n🎉 All posts have been shared! Run --reset-state to reshare all.');
    process.exit(0);
  }

  console.log(`\n📰 Next post to share:`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Slug:  ${post.slug}`);
  console.log(`   Date:  ${post.pubDate.toISOString()}`);
  console.log(`   Desc:  ${post.description.substring(0, 80)}…\n`);

  if (!isPost) {
    console.log('📋 Preview mode — use --post to actually post\n');

    console.log('─── X/Twitter ───');
    console.log(formatForX(post));
    console.log();

    console.log('─── Telegram ───');
    console.log(formatForTelegram(post));
    console.log();

    console.log('─── Reddit (r/UFOs) ───');
    const reddit = formatForReddit(post, 'r/UFOs');
    console.log(`Title: ${reddit.title}`);
    console.log(`URL:   ${reddit.url}`);
    console.log();

    process.exit(0);
  }

  // ---- POSTING MODE ----
  const state = loadState();
  let postedOk = false;

  if (!platformFilter || platformFilter === 'x') {
    const text = formatForX(post);
    if (isDryRun) {
      console.log(`  [X] DRY RUN: Would post:\n${text}\n`);
    } else {
      const ok = postToX(text);
      if (ok) postedOk = true;
    }
  }

  if (!platformFilter || platformFilter === 'tg') {
    const text = formatForTelegram(post);
    if (isDryRun) {
      console.log(`  [TG] DRY RUN: Would post:\n${text}\n`);
    } else {
      const ok = await postToTelegram(text);
      if (ok) postedOk = true;
    }
  }

  if (postedOk || isDryRun) {
    if (!state.posted.includes(post.slug)) state.posted.push(post.slug);
    state.lastPostedAt = new Date().toISOString();
    saveState(state);
    console.log(`\n✅ State saved — ${post.slug} marked as posted`);
  } else {
    console.log(`\n⚠️  No posts were sent (check credentials)`);
  }
}

main().catch(err => {
  console.error(`[auto-share] Fatal: ${err.message}`);
  process.exit(1);
});
