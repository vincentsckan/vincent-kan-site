/**
 * auto-reddit.mjs — Reddit Auto-Poster for disclosurehk.com
 * 
 * Posts the latest UFO article to specified subreddits.
 * Uses the Reddit JSON API (no PRAW needed).
 * 
 * Usage:
 *   node scripts/auto-reddit.mjs                    # Preview next post
 *   node scripts/auto-reddit.mjs --post             # Post to r/UFOs
 *   node scripts/auto-reddit.mjs --post --dry-run   # Show what would be posted
 * 
 * Environment variables (required for --post):
 *   REDDIT_CLIENT_ID     — Reddit app client ID
 *   REDDIT_CLIENT_SECRET — Reddit app client secret
 *   REDDIT_USERNAME      — Reddit account username
 *   REDDIT_PASSWORD      — Reddit account password
 *   REDDIT_USER_AGENT    — e.g. "DisclosureHK/1.0 by your_username"
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_EN_DIR = path.join(ROOT, 'src', 'content', 'blog-en');
const STATE_FILE = path.join(ROOT, '.auto-reddit-state.json');
const SITE_URL = 'https://disclosurehk.com';

// ---- Config ----

const TARGET_SUBREDDITS = [
  { name: 'UFOs', weight: 3 },
  { name: 'UAP', weight: 2 },
  { name: 'UFObelievers', weight: 1 },
];

// ---- State ----

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { posted: [], subredditIndex: 0, version: 1, lastPostedAt: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// ---- Frontmatter ----

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

// ---- Find next post ----

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

  posts.sort((a, b) => b.pubDate - a.pubDate);

  const candidates = posts.filter(p => {
    if (state.posted.includes(p.slug)) return false;
    const slug = p.slug;
    if (slug.startsWith('ufo-news-digest')) return false;
    if (slug.startsWith('ufo-filler')) return false;
    if (slug.startsWith('ufo-hearing-live')) return false;
    return true;
  });

  const breaking = candidates.filter(p => p.slug.startsWith('ufo-breaking'));
  const cases = candidates.filter(p => p.slug.startsWith('ufo-case'));
  const others = candidates.filter(p => !p.slug.startsWith('ufo-breaking') && !p.slug.startsWith('ufo-case'));

  return [...breaking, ...cases, ...others][0] || null;
}

// ---- Format for Reddit ----

function formatTitle(post) {
  // Clean title — remove excessive emoji, keep it concise
  let t = post.title
    .replace(/[🛸👽🤖🔴📡🚀👾💫⭐🌙]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Max 300 chars for Reddit
  if (t.length > 290) t = t.substring(0, 287).trimEnd() + '…';
  return t;
}

// ---- Reddit API ----

class RedditAPI {
  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.username = process.env.REDDIT_USERNAME;
    this.password = process.env.REDDIT_PASSWORD;
    this.userAgent = process.env.REDDIT_USER_AGENT || 'DisclosureHK/1.0 by vincentk666';
    this.token = null;
    this.tokenExpires = 0;
  }

  isConfigured() {
    return !!(this.clientId && this.clientSecret && this.username && this.password);
  }

  async #fetch(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': this.userAgent,
        'Authorization': options.noAuth ? undefined : `Bearer ${this.token}`,
        ...options.headers,
      },
    });
    return res.json();
  }

  async #getToken() {
    if (this.token && Date.now() < this.tokenExpires) return;

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent,
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: this.username,
        password: this.password,
      }),
    });

    const data = await res.json();
    if (!data.access_token) {
      throw new Error(`Reddit auth failed: ${JSON.stringify(data)}`);
    }

    this.token = data.access_token;
    this.tokenExpires = Date.now() + (data.expires_in - 60) * 1000;
  }

  async submitLink(subreddit, title, url) {
    await this.#getToken();
    const res = await this.#fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        sr: subreddit,
        title: title,
        url: url,
        kind: 'link',
        resubmit: true,
      }),
    });

    if (res.error === 429) {
      throw new Error('Rate limited — wait before next post');
    }
    if (res.error) {
      throw new Error(`Reddit API error: ${res.error} — ${JSON.stringify(res)}`);
    }

    return res;
  }

  async submitComment(articleId, text) {
    await this.#getToken();
    return this.#fetch('https://oauth.reddit.com/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        thing_id: articleId,
        text: text,
      }),
    });
  }
}

// ---- Main ----

async function main() {
  const args = process.argv.slice(2);
  const isPost = args.includes('--post');
  const isDryRun = args.includes('--dry-run');
  const targetSub = args.includes('--subreddit')
    ? args[args.indexOf('--subreddit') + 1]
    : null;

  const post = getNextPost();
  if (!post) {
    console.log('\n🎉 All posts have been shared on Reddit!');
    process.exit(0);
  }

  const state = loadState();
  const subreddits = targetSub
    ? [{ name: targetSub, weight: 1 }]
    : TARGET_SUBREDDITS;

  const sub = subreddits[state.subredditIndex % subreddits.length];
  const title = formatTitle(post);
  const url = `${SITE_URL}/blog/${post.slug}/`;

  console.log(`\n📰 Next Reddit post:`);
  console.log(`   Title: ${title}`);
  console.log(`   URL:   ${url}`);
  console.log(`   Sub:   r/${sub.name}`);
  console.log();

  if (!isPost) {
    console.log('📋 Preview mode — use --post to actually post\n');
    console.log(`r/${sub.name} post:`);
    console.log(`Title: ${title}`);
    console.log(`URL:   ${url}`);
    console.log();
    process.exit(0);
  }

  // Check credentials
  const reddit = new RedditAPI();
  if (!reddit.isConfigured()) {
    console.error('❌ Reddit credentials not configured!');
    console.error('   Set: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD');
    process.exit(1);
  }

  if (isDryRun) {
    console.log(`🔍 DRY RUN: Would post to r/${sub.name}`);
    console.log(`   Title: ${title}`);
    console.log(`   URL:   ${url}`);
    console.log(`   State: would mark "${post.slug}" as posted\n`);
    if (!state.posted.includes(post.slug)) state.posted.push(post.slug);
    state.subredditIndex = (state.subredditIndex + 1) % subreddits.length;
    state.lastPostedAt = new Date().toISOString();
    saveState(state);
    console.log('✅ State saved (dry run)');
    process.exit(0);
  }

  // REAL POST
  console.log(`📤 Posting to r/${sub.name}...`);

  try {
    const result = await reddit.submitLink(sub.name, title, url);
    const articleId = result?.json?.data?.things?.[0]?.data?.name;

    if (articleId) {
      console.log(`✅ Posted! Article ID: ${articleId}`);
      console.log(`   Link: https://www.reddit.com/r/${sub.name}/comments/${result.json.data.things[0].data.id}/`);

      // Add a comment with more context
      try {
        const comment = `I've been tracking this topic at DisclosureHK — this is the latest update.\n\nMore research and cases: ${SITE_URL}`;
        await reddit.submitComment(articleId, comment);
        console.log(`✅ Comment added`);
      } catch (commentErr) {
        console.log(`⚠️  Comment failed (non-critical): ${commentErr.message}`);
      }
    } else {
      console.log(`✅ Post submitted (no article ID returned)`);
    }

    if (!state.posted.includes(post.slug)) state.posted.push(post.slug);
    state.subredditIndex = (state.subredditIndex + 1) % (targetSub ? 1 : subreddits.length);
    state.lastPostedAt = new Date().toISOString();
    saveState(state);
    console.log('✅ State saved');
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`[auto-reddit] Fatal: ${err.message}`);
  process.exit(1);
});
