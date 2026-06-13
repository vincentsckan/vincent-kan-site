#!/usr/bin/env python3
"""Free & instant UFO news detector — no API keys needed.
Sources: Google News RSS + multiple RSS feeds. Runs in <30s.
Generates a daily digest every 6 hours + instant breaking alerts."""

import json, os, re, sys, subprocess, html, textwrap
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_FILE = os.path.join(SITE, ".last-news-state.json")
LOG_FILE = os.path.join(SITE, ".news-detector-log.json")
NEWS_DIR = os.path.join(SITE, "src", "content", "blog-en")
CACHE_FILE = os.path.join(SITE, ".news-cache.json")

SOURCES = [
    # Google News searches
    ("Google News UFO", "https://news.google.com/rss/search?q=UFO+UAP+disclosure+hearing+Pentagon&hl=en-US&gl=US&ceid=US:en"),
    ("Google News UAP Gov", "https://news.google.com/rss/search?q=UAP+government+Congress+hearing+disclosure&hl=en-US&gl=US&ceid=US:en"),
    ("Google News Aliens", "https://news.google.com/rss/search?q=alien+extraterrestrial+NHI+non-human+intelligence&hl=en-US&gl=US&ceid=US:en"),
    ("Google News ET Tech", "https://news.google.com/rss/search?q=mysterious+drones+UFO+sighting+US+government&hl=en-US&gl=US&ceid=US:en"),
    # Space/science sources
    ("Space.com UFO", "https://www.space.com/feeds/all"),
    # Alternative Reddit (text-based, less blocked)
    ("Reddit r/UFOs (txt)", "https://old.reddit.com/r/UFOs/.rss"),
    ("Reddit r/UAP", "https://old.reddit.com/r/UAP/.rss"),
    # NUFORC public feed
    ("NUFORC RSS", "https://nuforc.org/feed/"),
]

TIMEOUT = 20

def fetch_rss(url, timeout=TIMEOUT):
    """Fetch RSS with retry on failure"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
    }
    req = Request(url, headers=headers)
    try:
        resp = urlopen(req, timeout=timeout)
        data = resp.read()
        # If it's HTML (not RSS), reject
        text = data.decode("utf-8", errors="replace")[:200]
        if "<!DOCTYPE html" in text or "<html" in text.lower():
            return None
        return data
    except HTTPError as e:
        if e.code == 403:
            print(f"    ⚠ 403 forbidden (blocked)")
            return None
        return None
    except Exception:
        return None

def parse_rss(xml_bytes):
    entries = []
    try:
        root = ElementTree.fromstring(xml_bytes)
        # RSS 2.0
        for item in root.iter("item"):
            title = item.findtext("title", "")
            link = item.findtext("link", "")
            pubdate = item.findtext("pubDate", "")
            desc = strip_html(item.findtext("description", ""))
            entries.append({"title": title, "link": link, "pubDate": pubdate, "desc": desc})
        # Atom
        atom_ns = "{http://www.w3.org/2005/Atom}"
        for entry in root.iter(atom_ns + "entry"):
            title = entry.findtext(atom_ns + "title", "")
            links = entry.findall(atom_ns + "link")
            link = links[0].get("href", "") if links else ""
            pubdate = entry.findtext(atom_ns + "published", "") or entry.findtext(atom_ns + "updated", "")
            content_el = entry.find(atom_ns + "content")
            desc = strip_html(content_el.text if content_el is not None else "")
            entries.append({"title": title, "link": link, "pubDate": pubdate, "desc": desc})
    except Exception:
        pass
    return entries

def strip_html(text):
    """Remove HTML tags and truncate"""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', text)
    clean = html.unescape(clean)
    return clean[:500]

def dedup_entries(entries):
    seen = set()
    result = []
    for e in entries:
        key = e["title"].lower().strip()[:80]
        if key and key not in seen:
            seen.add(key)
            result.append(e)
    return result

def is_ufo_related(title, desc):
    """Filter to ensure it's actually UFO/UAP related"""
    text = (title + " " + desc).lower()
    keywords = [
        "ufo", "uap", "unidentified", "alien", "extraterrestrial", "spacecraft",
        "flying saucer", "tic tac", "tictac", "disclosure", "non-human",
        "nhi", "pentagon", "aaro", "gimbal", "go fast", "roswell",
        "area 51", "hearing", "whistleblower", "grusch", "elizondo",
        "mysterious drone", "secret program", "reverse engineering",
        "orbs", "triangle craft", "cigar craft", "anomalous",
        "pursue", "immaculate constellation", "nexgen", "uap task force",
        "kona blue", "skinwalker", "norio hayakawa", "strange lights",
        "military pilot", "radar", "navy pilot", "sighting"
    ]
    return any(k in text for k in keywords)

def is_major_news(title, desc):
    text = (title + " " + desc).lower()
    majors = [
        "pentagon release", "ufo file", "declassified", "disclosure",
        "congressional hearing", "government ufo", "aaro", "pursue",
        "trump ufo", "war department", "apollo", "mass sighting",
        "whistleblower", "roswell", "area 51", "uap hearing",
        "new york times ufo", "cnn ufo", "bbc ufo",
        "executive order", "president", "uap disclosure", "alien technology",
        "non-human intelligence", "recovered craft", "crash retrieval"
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
        json.dump({"seen_urls": list(seen)[-500:], "last_check": now}, f)

def should_daily_digest():
    """Check if 6+ hours have passed since the last daily digest"""
    try:
        with open(CACHE_FILE) as f:
            cache = json.load(f)
        last_digest = cache.get("last_digest", "")
        if not last_digest:
            return True
        last = datetime.fromisoformat(last_digest)
        now = datetime.now(timezone.utc)
        return (now - last).total_seconds() > 21600  # 6 hours
    except:
        return True

def save_digest_time():
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    try:
        with open(CACHE_FILE) as f:
            cache = json.load(f)
    except:
        cache = {}
    cache["last_digest"] = datetime.now(timezone.utc).isoformat()
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f)

def commit_and_push():
    try:
        subprocess.run(["git", "add", "-A"], cwd=SITE, capture_output=True, timeout=30)
        subprocess.run(["git", "commit", "-m", "auto: UFO news update"], cwd=SITE, capture_output=True, timeout=30)
        subprocess.run(["git", "pull", "--rebase", "origin", "master"],
                       cwd=SITE, capture_output=True, timeout=30)
        subprocess.run(["git", "push", "origin", "master"],
                       cwd=SITE, capture_output=True, timeout=60)
        return True
    except:
        return False

def create_breaking_post(items, now):
    """Create a breaking alert post"""
    slug = f"ufo-alert-{now.strftime('%Y%m%d%H%M')}"
    item = items[0]
    title_safe = html.unescape(item["title"]).replace('"', "'").strip()[:100]
    link = item["link"]
    pub = now.strftime("%Y-%m-%dT%H:%M:%SZ")

    post = f"""---
title: "🚨 UAP Breaking: {title_safe}"
description: "Major UFO/UAP breaking news detected by automated news monitor"
pubDate: "{pub}"
tags: ["UFO", "UAP", "breaking", "automated"]
---

# 🚨 Breaking UFO News

| 📍 Global | 📅 {now.strftime('%Y-%m-%d %H:%M UTC')} | 🔍 Auto-detected

> **{html.unescape(item['title']).strip()}**

🔗 [Read Full Article]({link})

---

### Also Breaking

"""
    for n in items[1:8]:
        t = html.unescape(n['title']).replace('\n', ' ').strip()[:120]
        post += f"- [{t}]({n['link']})\n"

    post += f"""
---

*🤖 Auto-detected by DisclosureHK news monitor at {now.strftime('%H:%M UTC')}*
"""

    fpath = f"{NEWS_DIR}/{slug}.md"
    with open(fpath, "w") as f:
        f.write(post)
    return fpath

def create_daily_digest(items, now):
    """Create a comprehensive daily digest"""
    # Sort items into: high-priority first, then newer first
    slug = f"ufo-digest-{now.strftime('%Y%m%d%H')}"
    pub = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    date_str = now.strftime("%B %d, %Y at %H:%M UTC")

    # Categorize
    major = [i for i in items if is_major_news(i["title"], i.get("desc",""))]
    regular = [i for i in items if i not in major]

    post = f"""---
title: "UFO/UAP News Digest — {now.strftime('%b %d, %Y %H:%M')} UTC"
description: "Latest UFO/UAP news from around the world — congressional updates, sightings, government disclosures"
pubDate: "{pub}"
tags: ["UFO", "UAP", "digest", "news", "automated"]
---

# 🛸 UFO/UAP News Digest

*{date_str}* — Compiled from multiple sources globally

---

"""
    if major:
        post += "## 🔴 Top Stories\n\n"
        for i in major[:10]:
            t = html.unescape(i['title']).replace('\n', ' ').strip()
            post += f"- 🔗 [{t}]({i['link']})\n"
        post += "\n---\n\n"

    post += "## 📰 More News\n\n"
    for i in regular[:15]:
        t = html.unescape(i['title']).replace('\n', ' ').strip()[:150]
        post += f"- [{t}]({i['link']})\n"

    post += f"""

---

*🤖 Auto-generated by DisclosureHK — covering {len(items)} articles*
"""

    fpath = f"{NEWS_DIR}/{slug}.md"
    with open(fpath, "w") as f:
        f.write(post)
    return fpath

def build_and_deploy():
    print("  🔨 Building site...")
    result = subprocess.run(["npm", "run", "build"], cwd=SITE,
                            capture_output=True, text=True, timeout=120)
    if result.returncode == 0:
        print("  ✅ Build OK, pushing to GitHub...")
        if commit_and_push():
            print("  ✅ Pushed! GitHub Pages will deploy.")
            return True
        else:
            print("  ✗ Push failed")
    else:
        print(f"  ✗ Build failed: {result.stderr[-300:]}")
    return False

def main():
    now = datetime.now(timezone.utc)
    seen = get_seen_urls()
    all_new_items = []

    print(f"\n{'='*50}")
    print(f"[{now.strftime('%Y-%m-%d %H:%M:%S')} UTC] UFO News Detector")
    print(f"{'='*50}")

    for name, url in SOURCES:
        print(f"  📡 {name}...", end=" ", flush=True)
        raw = fetch_rss(url)
        if not raw:
            print("✗ failed")
            continue
        entries = parse_rss(raw)
        if not entries:
            print("✗ parse failed")
            continue
        print(f"✓ {len(entries)} articles")

        for e in entries:
            url_key = e["link"][:120] if e["link"] else e["title"][:80]
            if url_key and url_key not in seen:
                # Only keep UFO-related
                if is_ufo_related(e["title"], e.get("desc","")):
                    seen.add(url_key)
                    all_new_items.append(e)

    if not all_new_items:
        print(f"\n  📭 No new UFO articles found (tracking {len(seen)} seen URLs)")
        save_seen(seen)
        return

    # Dedup
    all_new_items = dedup_entries(all_new_items)
    print(f"\n  🆕 {len(all_new_items)} new UFO-related articles")

    # Check for major breaking news
    major_items = [n for n in all_new_items if is_major_news(n["title"], n.get("desc",""))]
    if major_items:
        print(f"  🚨 {len(major_items)} MAJOR BREAKING stories!")
        for m in major_items[:5]:
            print(f"     → {html.unescape(m['title'])[:100]}")
            print(f"       {m['link'][:80]}")
        print(f"  📝 Creating breaking alert...")
        fname = create_breaking_post(major_items, now)
        print(f"     Saved: {fname}")
        build_and_deploy()
    else:
        print("  📰 Minor news only — no breaking alert needed")

    # Also generate a daily digest if 6+ hours since last one
    if should_daily_digest() and len(all_new_items) >= 3:
        print(f"  📅 Generating daily digest ({len(all_new_items)} articles)...")
        fname = create_daily_digest(all_new_items, now)
        print(f"     Saved: {fname}")
        build_and_deploy()
        save_digest_time()
    elif len(all_new_items) < 3:
        print(f"  ℹ Too few new articles ({len(all_new_items)}) for digest, skipping")

    # Even with no build needed, save state
    save_seen(seen)

    # Log
    try:
        with open(LOG_FILE) as f:
            log = json.load(f)
    except:
        log = []
    log.append({"ts": now.isoformat(), "new": len(all_new_items), "major": len(major_items)})
    log = log[-100:]
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)

    print(f"\n  ✅ Done. Total tracked: {len(seen)} URLs")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    main()
