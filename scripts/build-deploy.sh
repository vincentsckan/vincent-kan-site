#!/bin/bash
# UAP News - Build & Deploy Script
# Triggered after a new blog post is created

cd "$(dirname "$0")/.." || exit 1

echo "=== Pre-build: generating sitemaps ==="
node scripts/generate-news-sitemap.cjs 2>&1 || true

echo "=== Building site ==="
npm run build 2>&1

echo "=== Deploying to GitHub ==="
git add -A
git commit -m "auto: UFO news update $(date -u +%Y-%m-%d)" 2>/dev/null || true
git push 2>&1

echo "=== SEO Ping ==="
python3 scripts/seo-ping.py 2>&1 || true

echo "=== Social Auto-Post (non-blocking) ==="
bash scripts/social-auto-post.sh all 2>&1 || true

echo "=== Done ==="