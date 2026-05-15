/**
 * generate-sitemap-index.cjs
 * Generates a sitemap-index.xml that references language-specific sitemaps
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.disclosurehk.com';
const OUTPUT = path.join(__dirname, '..', 'public', 'sitemap-index.xml');

// Astro's built-in sitemap generates sitemap-0.xml (etc.)
// We wrap them + our custom news sitemap

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-0.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/news-sitemap.xml</loc>
  </sitemap>
</sitemapindex>
`;

fs.writeFileSync(OUTPUT, xml);
console.log(`✅ Generated sitemap-index.xml → ${OUTPUT}`);
