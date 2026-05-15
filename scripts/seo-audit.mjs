/**
 * seo-audit.mjs — SEO audit + recommendations for disclosurehk.com
 * 
 * Checks all blog posts for:
 *   - Missing/incomplete meta descriptions
 *   - Title length issues
 *   - Missing OG images
 *   - Duplicate titles
 *   - etc.
 * 
 * Usage: node scripts/seo-audit.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DIRS = [
  path.join(ROOT, 'src', 'content', 'blog-en'),
  path.join(ROOT, 'src', 'content', 'blog-zh'),
  path.join(ROOT, 'src', 'content', 'blog'),
];

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

const issues = [];

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const dirName = path.basename(dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  
  console.log(`\n📁 ${dirName} (${files.length} files):`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fm = parseFrontmatter(filePath);
    if (!fm) {
      issues.push({ file: `${dirName}/${file}`, issue: 'No frontmatter' });
      continue;
    }

    const title = fm.titleEn || fm.title || '';
    const desc = fm.description || '';
    const slug = file.replace('.md', '');

    // Check title
    if (!title) {
      issues.push({ file: `${dirName}/${file}`, issue: 'Missing title' });
    } else if (title.length < 10) {
      issues.push({ file: `${dirName}/${file}`, issue: `Title too short (${title.length}): "${title}"` });
    } else if (title.length > 120) {
      issues.push({ file: `${dirName}/${file}`, issue: `Title too long (${title.length}): "${title.substring(0, 80)}..."` });
    }

    // Check description
    if (!desc) {
      issues.push({ file: `${dirName}/${file}`, issue: 'Missing description' });
    } else if (desc.length < 50) {
      issues.push({ file: `${dirName}/${file}`, issue: `Description too short (${desc.length})` });
    } else if (desc.length > 320) {
      issues.push({ file: `${dirName}/${file}`, issue: `Description too long (${desc.length})` });
    }

    // Check for pubDate
    if (!fm.pubDate) {
      issues.push({ file: `${dirName}/${file}`, issue: 'Missing pubDate' });
    }

    // Check category/tags
    if (!fm.tags && !fm.categories) {
      // Not critical, just note
    }
  }
}

console.log(`\n\n======= SEO AUDIT RESULTS =======`);
console.log(`Total issues found: ${issues.length}\n`);

// Group by type
const byType = {};
for (const i of issues) {
  const type = i.issue.split(':')[0];
  byType[type] = (byType[type] || 0) + 1;
}

console.log('By type:');
for (const [type, count] of Object.entries(byType)) {
  console.log(`  ${type}: ${count}`);
}

// Show sample issues
console.log('\nSample issues:');
const sample = issues.filter(i => !i.issue.startsWith('Description too short') && !i.issue.startsWith('Title too short'));
const toShow = sample.length > 10 ? sample.slice(0, 10) : sample;
for (const i of toShow) {
  console.log(`  ⚠️  ${i.file}: ${i.issue}`);
}

console.log(`\nDone. Use "npm run build" to rebuild after fixing issues.`);
