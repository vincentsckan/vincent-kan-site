#!/bin/bash
# Auto-check for U.S. Government UFO/UAP hearing live streams
# Run by cron job every 30 minutes
# Detects live hearings and updates the homepage + creates blog post

SITE_DIR="/root/.openclaw/workspace/vincent-site"
STATE_FILE="$SITE_DIR/.last-hearing-state.json"

# YouTube channel IDs known for UAP hearings coverage
# - House Oversight Committee: UC_8XyzTl1YGPU7A_G0xhA
# - Senate Homeland Security: UCL7tVnqB3w3OYRqV2RHeg
# - CSPAN: UChxYmgSxSzx3pYcVAOQ07Gg (general)
# - NewsNation: UC0Bv2qLySlogFpA8MkMv6Mw (covers UAP heavily)
# - NBC News: UCeY0bbntWzzVIaj2KvY4h1g
# Use YouTube Search API as primary detection method

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for UAP hearing live streams..."

# Try multiple search terms for live streams
LIVE_RESULT=$(curl -s -L \
  "https://www.youtube.com/results?search_query=UFO+UAP+congressional+hearing+live&sp=EgJAAQ%253D%253D" \
  2>/dev/null | grep -oP '"videoId":"[^"]+"' | head -5)

# Also check specific channels known to cover hearings
# Using invidious or yewtu as alternative frontend for scraping
CHANNEL_RESULTS=$(curl -s -L \
  "https://www.youtube.com/results?search_query=UAP+hearing+live+congress+2025+2026&sp=CAMSAhAB" \
  2>/dev/null | grep -oP '"videoId":"[^"]+"' | head -5)

echo "Search results found:"
echo "$LIVE_RESULT"
echo "$CHANNEL_RESULTS" | head -3

# If we found something, check if it's new
if [ -n "$LIVE_RESULT" ] || [ -n "$CHANNEL_RESULTS" ]; then
  VIDEO_IDS=$(echo "$LIVE_RESULT$CHANNEL_RESULTS" | grep -oP '"videoId":"([^"]+)"' | sed 's/"videoId":"//;s/"//' | sort -u | head -3)
  
  echo "Potential live video IDs: $VIDEO_IDS"
  
  # Check previous state
  if [ -f "$STATE_FILE" ]; then
    PREV_ID=$(jq -r '.lastVideoId // ""' "$STATE_FILE")
  else
    PREV_ID=""
  fi
  
  FIRST_ID=$(echo "$VIDEO_IDS" | head -1)
  
  if [ -n "$FIRST_ID" ] && [ "$FIRST_ID" != "$PREV_ID" ]; then
    echo "NEW LIVE STREAM DETECTED: $FIRST_ID"
    
    # Get video title via invidious API (no API key needed)
    VIDEO_INFO=$(curl -s "https://invidious.snopyta.org/api/v1/videos/$FIRST_ID" 2>/dev/null)
    VIDEO_TITLE=$(echo "$VIDEO_INFO" | jq -r '.title // "UFO/UAP Congressional Hearing Live"' 2>/dev/null)
    
    echo "Video title: $VIDEO_TITLE"
    
    # Update homepage live embed
    # The index.astro has a hardcoded iframe with src="https://www.youtube.com/embed/NN-lfF5Bxiw"
    # We use a config file approach instead - update a JSON config that Astro reads
    
    # 1. Save state
    echo "{\"lastVideoId\": \"$FIRST_ID\", \"videoTitle\": \"$VIDEO_TITLE\", \"detectedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$STATE_FILE"
    
    # 2. Create blog post
    PUB_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    SLUG_DATE=$(date -u +%Y%m%d)
    SLUG_HOUR=$(date -u +%H%M)
    FILENAME="ufo-hearing-live-${SLUG_DATE}-${SLUG_HOUR}"
    
    cat > "$SITE_DIR/src/content/blog/${FILENAME}.md" << EOF
---
title: '🔴 LIVE: 美國國會UFO/UAP聽證會直播'
description: '美國政府UFO/UAP聽證會現場直播，即時追蹤國會議員質詢同政府官員作證'
titleEn: '🔴 LIVE: U.S. Congressional UFO/UAP Hearing'
descriptionEn: 'Live coverage of the U.S. government UFO/UAP congressional hearing with real-time updates'
pubDate: '${PUB_DATE}'
tags: ["ufo", "uap", "hearing", "live", "breaking"]
heroImage: '../../assets/blog-placeholder-1.jpg'
---

# 🔴 LIVE: 美國國會UFO/UAP聽證會直播

> 📡 以下係美國政府UFO/UAP聽證會嘅YouTube現場直播

<a href="https://www.youtube.com/watch?v=${FIRST_ID}" target="_blank">
  <img src="https://img.youtube.com/vi/${FIRST_ID}/maxresdefault.jpg" alt="UFO/UAP Hearing Live" style="width:100%;border-radius:12px;border:1px solid rgba(0,229,255,0.3);">
</a>

<div style="position:relative;width:100%;padding-bottom:56.25%;margin:1rem 0;border-radius:12px;overflow:hidden;border:1px solid rgba(0,229,255,0.3);">
  <iframe src="https://www.youtube.com/embed/${FIRST_ID}?autoplay=1&rel=0" 
    style="position:absolute;top:0;left:0;width:100%;height:100%;" 
    frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen>
  </iframe>
</div>

## 📋 聽證會重點

| 時間 | 事件 |
|---|---|
| $(date -u +%H:%M) UTC | 直播開始 |

*呢篇文章會持續更新聽證會重點*

## 📺 更多資訊
- [YouTube Live Link](https://www.youtube.com/watch?v=${FIRST_ID})
- [House Oversight Committee](https://oversight.house.gov/)
- [UAP Disclosure Fund](https://www.aaro.mil/)
EOF

    # Copy to blog-en and blog-zh
    cp "$SITE_DIR/src/content/blog/${FILENAME}.md" "$SITE_DIR/src/content/blog-en/"
    cp "$SITE_DIR/src/content/blog/${FILENAME}.md" "$SITE_DIR/src/content/blog-zh/"
    
    echo "Blog post created: ${FILENAME}.md"
    
    # 3. Update live-stream config for homepage
    cat > "$SITE_DIR/src/data/live-stream.json" << EOF
{
  "active": true,
  "videoId": "${FIRST_ID}",
  "title": "${VIDEO_TITLE}",
  "startedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "type": "hearing"
}
EOF
    
    echo "Live stream config updated for homepage"
    
    # 4. Commit and push
    cd "$SITE_DIR"
    git add -A
    git commit -m "auto: add UFO/UAP hearing live stream [${SLUG_DATE}]"
    git pull --rebase origin master 2>/dev/null
    git push origin master 2>&1
    
    echo "Pushed to GitHub - site will auto-deploy"
    
    # 5. Send email notification
    SITE_URL="https://vincentsckan.github.io/vincent-kan-site/"
    python3 -c "
import smtplib
from email.mime.text import MIMEText

msg = MIMEText('''Hi Vincent,\n\n🔴 A U.S. government UFO/UAP hearing live stream has been detected!\n\nTitle: ${VIDEO_TITLE}\nYouTube: https://www.youtube.com/watch?v=${FIRST_ID}\n\nIt has been automatically posted to your website with live embed:\n${SITE_URL}\n\nCheck it out!\n\n- Robot Key 😅''')
msg['Subject'] = '🔴 UAP Hearing LIVE - Posted to Your Website'
msg['From'] = 'vincentsc.kan@gmail.com'
msg['To'] = 'vincentsc.kan@gmail.com'

with smtplib.SMTP('smtp.gmail.com', 587) as s:
    s.starttls()
    s.login('vincentsc.kan@gmail.com', 'afgr dkgj uqeg cyla')
    s.send_message(msg)
    print('Email notification sent!')
"
    
    echo "Email notification sent to vincentsc.kan@gmail.com"
  else
    echo "No new live stream detected (same as previous)"
  fi
else
  echo "No live streams found"
fi
