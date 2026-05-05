// X/Twitter Auto-Post Script
// Finds the latest blog-en article and posts it to X via xurl CLI
// Run: node scripts/twitter-auto-post.cjs
// Cron: Daily at 09:00 HKT (01:00 UTC)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    // Try quoted value first
    const qm = line.match(/^(\w+):\s*['"](.+?)['"]\s*$/);
    if (qm) { fm[qm[1]] = qm[2]; continue; }
    // Then unquoted
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/['"]/g, '');
  }
  return fm;
}

// Strip emoji + markdown for X (pure text)
function stripForX(text) {
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`[twitter-auto-post] Reading blog-en articles from: ${BLOG_EN_DIR}`);

  // Read all .md files in blog-en
  const files = fs.readdirSync(BLOG_EN_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.error('[twitter-auto-post] No blog posts found in blog-en');
    process.exit(1);
  }
  console.log(`[twitter-auto-post] Found ${files.length} files`);

  // Parse frontmatter for each file
  const posts = [];
  for (const file of files) {
    const filePath = path.join(BLOG_EN_DIR, file);
    const fm = parseFrontmatter(filePath);
    if (!fm || !fm.pubDate) {
      console.warn(`[twitter-auto-post] Skipping ${file}: no valid frontmatter/pubDate`);
      continue;
    }
    posts.push({
      slug: file.replace('.md', ''),
      title: fm.titleEn || fm.title || '',
      description: fm.description || '',
      pubDate: new Date(fm.pubDate),
    });
  }

  if (posts.length === 0) {
    console.error('[twitter-auto-post] No valid posts found');
    process.exit(1);
  }

  // Sort by pubDate descending, pick the latest
  posts.sort((a, b) => b.pubDate - a.pubDate);

  // Prioritize breaking news first, then case studies, then other English articles
  // Skip ufo-news-digest (Chinese digest), ufo-filler (auto-generated filler), and ufo-hearing-live (live threads)
  const preferred = posts.filter(p => {
    const slug = p.slug;
    if (slug.startsWith('ufo-news-digest')) return false;
    if (slug.startsWith('ufo-filler')) return false;
    if (slug.startsWith('ufo-hearing-live')) return false;
    return true;
  });

  // Prefer breaking news and case articles
  const breaking = preferred.filter(p => p.slug.startsWith('ufo-breaking'));
  const cases = preferred.filter(p => p.slug.startsWith('ufo-case'));
  const others = preferred.filter(p => !p.slug.startsWith('ufo-breaking') && !p.slug.startsWith('ufo-case'));

  // Pick most recent from breaking > cases > others
  const combine = [...breaking, ...cases, ...others];
  const latest = combine.length > 0 ? combine[0] : preferred[0] || posts[0];
  console.log(`[twitter-auto-post] Latest post: "${latest.title}" (${latest.pubDate.toISOString()})`);

  // Construct tweet ensuring it fits within X's 280 char limit
  const cleanTitle = stripForX(latest.title);
  const cleanDesc = stripForX(latest.description);

  const urlPart = `\n\nRead more: ${SITE_URL}/blog/${latest.slug}/`;
  const prefixLen = 3; // '🛸 ' emoji + space
  const maxTitleLen = 110;
  const titlePart = cleanTitle.length > maxTitleLen
    ? cleanTitle.substring(0, maxTitleLen).trimEnd() + '…'
    : cleanTitle;

  const overhead = prefixLen + titlePart.length + urlPart.length + "\n\n".length * 2;
  const availableForDesc = Math.max(280 - overhead, 0);
  const descPart = cleanDesc.length > availableForDesc
    ? cleanDesc.substring(0, Math.max(availableForDesc - 1, 0)).trimEnd() + '…'
    : cleanDesc;

  const tweetText = `🛸 ${titlePart}\n\n${descPart}\n\nRead more: ${SITE_URL}/blog/${latest.slug}/`;

  if (tweetText.length > 280) {
    console.warn(`[twitter-auto-post] Tweet exceeds 280 chars (${tweetText.length}). Using title-only.`);
    const fallback = `🛸 ${titlePart}\n\nRead more: ${SITE_URL}/blog/${latest.slug}/`;
    if (fallback.length > 280) {
      console.error(`[twitter-auto-post] Title-only tweet is ${fallback.length} chars, cannot post.`);
      process.exit(1);
    }
    const fallbackText = fallback;
    console.log('[twitter-auto-post] Generated tweet:', fallbackText);
    console.log('[twitter-auto-post] Posting to X via xurl...');
    try {
      const result = execSync(
        `xurl post ${JSON.stringify(fallbackText)}`,
        { encoding: 'utf8', timeout: 30000 }
      );
      console.log(`[twitter-auto-post] ✅ Posted successfully!`);
      console.log(`Response: ${result.trim()}`);
    } catch (err) {
      console.error(`[twitter-auto-post] ❌ Failed to post: ${err.message}`);
      if (err.stderr) console.error(`Stderr: ${err.stderr}`);
      process.exit(1);
    }
    return;
  }

  console.log(`[twitter-auto-post] Generated tweet (${tweetText.length} chars):`);
  console.log('---');
  console.log(tweetText);
  console.log('---');

  // Post via xurl CLI
  try {
    console.log('[twitter-auto-post] Posting to X via xurl...');
    const result = execSync(
      `xurl post ${JSON.stringify(tweetText)}`,
      { encoding: 'utf8', timeout: 30000 }
    );
    console.log(`[twitter-auto-post] ✅ Posted successfully!`);
    console.log(`[twitter-auto-post] Response: ${result.trim()}`);
  } catch (err) {
    console.error(`[twitter-auto-post] ❌ Failed to post: ${err.message}`);
    if (err.stderr) console.error(`[twitter-auto-post] Stderr: ${err.stderr}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`[twitter-auto-post] Unhandled error: ${err.message}`);
  process.exit(1);
});
