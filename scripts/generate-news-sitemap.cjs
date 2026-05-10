// Google News Sitemap Generator
// Generates a Google News-specific sitemap for disclosurehk.com
// Run: node scripts/generate-news-sitemap.cjs

const fs = require('fs');
const path = require('path');

const siteUrl = 'https://www.disclosurehk.com';

// Get ALL English blog posts
const blogEnDir = path.join(__dirname, '..', 'src', 'content', 'blog-en');

// Also get Chinese alert posts (they're super fresh)
const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');

// Collect from ALL relevant prefixes
const relevantPrefixes = ['ufo-news-digest', 'ufo-breaking', 'ufo-hearing-live', 'ufo-alert', 'ufo-rapid', 'ufo-case', 'ufo-'];

// Also grab from blog/ directory (Chinese alerts)
const allBlogFiles = [
  ...fs.readdirSync(blogEnDir).filter(f => f.endsWith('.md')),
  ...fs.readdirSync(blogDir).filter(f => f.endsWith('.md') && f.startsWith('ufo-alert-'))
];

// Parse frontmatter from markdown files
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const fm = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const qm = line.match(/^(\w+):\s*['"](.+?)['"]/);
    if (qm) { fm[qm[1]] = qm[2]; continue; }
    const kv2 = line.match(/^(\w+):\s*(.+)$/);
    if (kv2 && !qm) fm[kv2[1]] = kv2[2].replace(/['"]/g, '');
  }
  return fm;
}

// Generate Google News sitemap entries
const entries = [];
for (const file of allBlogFiles) {
  // Determine directory
  const fileDir = file.endsWith('.md') && file.startsWith('ufo-alert-') ? blogDir : blogEnDir;
  const filePath = path.join(fileDir, file);
  
  if (!fs.existsSync(filePath)) continue;
  
  const data = parseFrontmatter(filePath);
  if (!data || !data.pubDate) continue;
  
  const pubDate = new Date(data.pubDate);
  const now = new Date();
  const daysDiff = (now - pubDate) / (1000 * 60 * 60 * 24);
  
  // Google News requires articles published within the last 48 hours
  // But we're generous — include up to 7 days for alerts
  if (daysDiff > 7) continue;
  
  const articleId = file.replace('.md', '');
  
  // Determine keywords based on type
  let keywords = ['UFO', 'UAP', 'disclosure', 'news'];
  if (file.startsWith('ufo-alert-')) keywords = ['UFO', 'UAP', 'alert', 'breaking', 'news'];
  if (file.startsWith('ufo-rapid-')) keywords = ['UFO', 'UAP', 'digest', 'roundup'];
  if (file.startsWith('ufo-breaking')) keywords = ['UFO', 'UAP', 'breaking', 'news', 'disclosure'];
  if (file.startsWith('ufo-hearing')) keywords = ['UFO', 'UAP', 'congressional', 'hearing', 'disclosure'];
  if (file.startsWith('ufo-case')) keywords = ['UFO', 'UAP', 'case study', 'historical'];
  
  // Determine the URL
  // Alert posts from blog/ go to /blog/slug/ too
  const url = `${siteUrl}/blog/${articleId}/`;
  
  entries.push({
    url: url,
    pubDate: pubDate.toISOString(),
    title: (data.titleEn || data.title || '').replace(/['"]/g, '').substring(0, 200),
    keywords: keywords
  });
}

// Generate XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

for (const entry of entries) {
  xml += '  <url>\n';
  xml += `    <loc>${entry.url}</loc>\n`;
  xml += '    <news:news>\n';
  xml += '      <news:publication>\n';
  xml += '        <news:name>DisclosureHK</news:name>\n';
  xml += '        <news:language>en</news:language>\n';
  xml += '      </news:publication>\n';
  xml += `      <news:publication_date>${entry.pubDate}</news:publication_date>\n`;
  xml += `      <news:title><![CDATA[${entry.title}]]></news:title>\n`;
  xml += `      <news:keywords>${entry.keywords.join(',')}</news:keywords>\n`;
  xml += '    </news:news>\n';
  xml += '  </url>\n';
}

xml += '</urlset>';

// Write to public directory
const outputPath = path.join(__dirname, '..', 'public', 'news-sitemap.xml');
fs.writeFileSync(outputPath, xml);
console.log(`✅ Generated Google News sitemap with ${entries.length} entries → public/news-sitemap.xml`);

// Also update robots.txt if needed
const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
let robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('news-sitemap')) {
  robots += `\nSitemap: ${siteUrl}/news-sitemap.xml\n`;
  fs.writeFileSync(robotsPath, robots);
  console.log('✅ Added news sitemap link to robots.txt');
}
