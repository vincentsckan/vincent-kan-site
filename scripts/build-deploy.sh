#!/bin/bash
# UAP News - Build & Deploy Script
# Triggered after a new blog post is created

cd /root/.openclaw/workspace/vincent-site || exit 1

echo "=== Building site ==="
npm run build 2>&1

echo "=== Deploying to GitHub ==="
git add -A
git commit -m "auto: UFO news update $(date -u +%Y-%m-%d)"
git push
echo "=== Done ==="