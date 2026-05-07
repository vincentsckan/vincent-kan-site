import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../consts';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.origin || SITE_URL || 'https://www.disclosurehk.com';
  
  const posts = await getCollection('blog-en');
  const zhPosts = await getCollection('blog-zh');

  // Group articles by year for news sitemap
  const newsByYear: Record<string, typeof posts> = {};
  for (const post of posts) {
    const year = post.data.pubDate?.getFullYear()?.toString() || 'unknown';
    if (!newsByYear[year]) newsByYear[year] = [];
    newsByYear[year].push(post);
  }

  // Build news-specific sitemap
  const urls: string[] = [];

  for (const post of posts) {
    const pubDate = post.data.pubDate
      ? post.data.pubDate.toISOString()
      : new Date().toISOString();

    urls.push(`  <url>
    <loc>${siteUrl}blog/${post.id}/</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>DisclosureHK</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate.substring(0, 10)}</news:publication_date>
      <news:title>${escapeXml(post.data.title || post.data.titleEn || '')}</news:title>
    </news:news>
  </url>`);
  }

  // Also add zh pages
  for (const post of zhPosts) {
    const pubDate = post.data.pubDate
      ? post.data.pubDate.toISOString()
      : new Date().toISOString();

    urls.push(`  <url>
    <loc>${siteUrl}zh/blog/${post.id}/</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>DisclosureHK</news:name>
        <news:language>zh-HK</news:language>
      </news:publication>
      <news:publication_date>${pubDate.substring(0, 10)}</news:publication_date>
      <news:title>${escapeXml(post.data.title || '')}</news:title>
    </news:news>
  </url>`);
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  );
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
