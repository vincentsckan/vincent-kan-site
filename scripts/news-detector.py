#!/usr/bin/env python3
"""Free & instant UFO news detector — no API keys needed.
Sources: Google News RSS + Reddit RSS. Runs in <30s."""

import json, os, re, sys, subprocess, html
from datetime import datetime, timezone
from xml.etree import ElementTree
from urllib.request import Request, urlopen
from urllib.error import URLError

SITE = "/root/.openclaw/workspace/vincent-site"
STATE_FILE = f"{SITE}/.last-news-state.json"
LOG_FILE = f"{SITE}/.news-detector-log.json"
NEWS_DIR = f"{SITE}/src/content/blog"

SOURCES = [
    ("Google News UFO", "https://news.google.com/rss/search?q=UFO+UAP+disclosure+hearing+Pentagon&hl=en-US&gl=US&ceid=US:en"),
    ("Reddit r/UFOs", "https://old.reddit.com/r/UFOs/.rss"),
    ("Google News UAP Gov", "https://news.google.com/rss/search?q=UAP+government+Congress+hearing+disclosure&hl=en-US&gl=US&ceid=US:en"),
]

def fetch_rss(url, timeout=15):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urlopen(req, timeout=timeout)
        return resp.read()
    except Exception as e:
        return None

def parse_rss(xml_bytes):
    entries = []
    try:
        root = ElementTree.fromstring(xml_bytes)
        # Handle both RSS 2.0 and Atom
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for item in root.iter("item"):
            title = item.findtext("title", "")
            link = item.findtext("link", "")
            pubdate = item.findtext("pubDate", "")
            desc = item.findtext("description", "")
            entries.append({"title": title, "link": link, "pubDate": pubdate, "desc": desc})
        for entry in root.iter("{http://www.w3.org/2005/Atom}entry"):
            title = entry.findtext("{http://www.w3.org/2005/Atom}title", "")
            links = entry.findall("{http://www.w3.org/2005/Atom}link")
            link = links[0].get("href", "") if links else ""
            pubdate = entry.findtext("{http://www.w3.org/2005/Atom}published", "") or \
                      entry.findtext("{http://www.w3.org/2005/Atom}updated", "")
            desc = entry.findtext("{http://www.w3.org/2005/Atom}content", "")
            entries.append({"title": title, "link": link, "pubDate": pubdate, "desc": desc})
    except Exception:
        pass
    return entries

def dedup_entries(entries):
    """Deduplicate by title (lowercase, stripped)"""
    seen = set()
    result = []
    for e in entries:
        key = e["title"].lower().strip()[:80]
        if key and key not in seen:
            seen.add(key)
            result.append(e)
    return result

def is_major_news(title, desc):
    """Check if this is a MAJOR breaking story worth immediate alert"""
    text = (title + " " + desc).lower()
    majors = [
        "pentagon release", "ufo file", "declassified", "disclosure",
        "congressional hearing", "government ufo", "aaro", "pursue",
        "trump ufo", "war department", "apollo", "mass sighting",
        "whistleblower", "roswell", "area 51", "uap hearing",
        "new york times ufo", "cnn ufo", "bbc ufo"
    ]
    return any(m in text for m in majors)

def get_seen_urls():
    try:
        with open(STATE_FILE) as f:
            return set(json.load(f).get("seen_urls", []))
    except:
        return set()

def save_seen(seen):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    now = datetime.now(timezone.utc).isoformat()
    with open(STATE_FILE, "w") as f:
        json.dump({"seen_urls": list(seen)[-200:], "last_check": now}, f)

def commit_and_push():
    """Quick deploy for a breaking post"""
    try:
        subprocess.run(["git", "add", "-A"], cwd=SITE, capture_output=True, timeout=30)
        subprocess.run(["git", "commit", "-m", "auto: breaking UFO news [detector]"],
                       cwd=SITE, capture_output=True, timeout=30)
        subprocess.run(["git", "pull", "--rebase", "origin", "master"],
                       cwd=SITE, capture_output=True, timeout=30)
        subprocess.run(["git", "push", "origin", "master"],
                       cwd=SITE, capture_output=True, timeout=60)
        return True
    except:
        return False

def main():
    now = datetime.now(timezone.utc)
    seen = get_seen_urls()
    new_items = []

    print(f"[{now.strftime('%H:%M:%S')} UTC] Checking news sources...")

    for name, url in SOURCES:
        raw = fetch_rss(url)
        if not raw:
            print(f"  ✗ {name}: failed to fetch")
            continue
        entries = parse_rss(raw)
        if not entries:
            print(f"  ✗ {name}: parse failed")
            continue
        print(f"  ✓ {name}: {len(entries)} articles")

        for e in entries:
            url_key = e["link"][:100] if e["link"] else e["title"][:80]
            if url_key and url_key not in seen:
                seen.add(url_key)
                new_items.append(e)

    if not new_items:
        print(f"  No new articles found (checking {len(seen)} seen URLs)")
        save_seen(seen)
        return

    # Dedup and sort
    new_items = dedup_entries(new_items)
    print(f"  🆕 {len(new_items)} new articles")

    # Check for major breaking news
    major_items = [n for n in new_items if is_major_news(n["title"], n.get("desc",""))]
    if major_items:
        print(f"  🚨 {len(major_items)} MAJOR BREAKING news items!")
        for m in major_items[:3]:
            print(f"     → {m['title'][:80]}")
            print(f"       {m['link'][:100]}")

        # Create a quick breaking post
        slug = f"ufo-alert-{now.strftime('%Y%m%d%H%M')}"
        item = major_items[0]
        title = html.unescape(item["title"]).replace('"', "'")
        link = item["link"]
        pub = now.strftime("%Y-%m-%dT%H:%M:%SZ")

        post = f"""---
title: "🚨 突發UFO新聞：{title[:80]}"
description: "News detector 自動偵測到重大UFO新聞"
pubDate: "{pub}"
tags: ["UFO", "UAP", "breaking", "自動偵測"]
---

# 🚨 突發UFO新聞

| 📍 *全球* | 📅 *{now.strftime('%Y年%m月%d日')}* | 🔍 *自動新聞偵測*

> 以下新聞由自動偵測系統在 {now.strftime('%H:%M UTC')} 發現

**{title}**

🔗 [閱讀原文]({link})

---

## 🔍 同場其他新聞

"""
        for n in major_items[1:5]:
            post += f"- [{html.unescape(n['title']).replace(chr(10),' ').strip()[:100]}]({n['link']})\n"

        post += f"""
---

*🤖 由 DisclosureHK 自動新聞偵測系統生成*
"""

        fname = f"{NEWS_DIR}/{slug}.md"
        with open(fname, "w") as f:
            f.write(post)
        print(f"  📝 Post created: {fname}")

        # Build and deploy
        print("  🔨 Building site...")
        result = subprocess.run(["npm", "run", "build"], cwd=SITE,
                                capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print("  ✅ Build OK, pushing to GitHub...")
            if commit_and_push():
                print("  ✅ Pushed! Cloudflare Pages will auto-deploy.")
            else:
                print("  ✗ Push failed")
        else:
            print(f"  ✗ Build failed: {result.stderr[-200:]}")
    else:
        print("  Minor news only — no immediate post needed")
        for n in new_items[:3]:
            print(f"     → {n['title'][:80]}")

    save_seen(seen)

    # Keep a log
    try:
        with open(LOG_FILE) as f:
            log = json.load(f)
    except:
        log = []
    log.append({"ts": now.isoformat(), "new": len(new_items), "major": len(major_items)})
    log = log[-50:]
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)

if __name__ == "__main__":
    main()
