#!/usr/bin/env python3
"""
DisclosureHK Real-Time News Engine
==================================
Every 5 minutes: polls multiple free RSS sources + generates posts instantly
Every 30 seconds (systemd timer): watches for breaking news
No API keys needed. Fully self-contained.
"""

import json, os, re, sys, subprocess, html, hashlib, time
from datetime import datetime, timezone
from xml.etree import ElementTree
from urllib.request import Request, urlopen
from urllib.error import URLError

SITE = "/root/.openclaw/workspace/vincent-site"
STATE_FILE = f"{SITE}/.news-engine-state.json"
LOG_FILE = f"{SITE}/.news-engine-log.json"
CACHE_FILE = f"{SITE}/.news-article-cache.json"  # Avoid duplicates across runs
BREAKING_DIR = f"{SITE}/src/content/blog"
DIGEST_DIR = f"{SITE}/src/content/blog"

# === MULTI-SOURCE RSS FEEDS (all free, all instant) ===
SOURCES = [
    # Google News searches (most comprehensive)
    ("Google News UFO", "https://news.google.com/rss/search?q=UFO+UAP+disclosure+hearing+Pentagon&hl=en-US&gl=US&ceid=US:en"),
    ("Google News UAP Gov", "https://news.google.com/rss/search?q=UAP+government+Congress+hearing+disclosure&hl=en-US&gl=US&ceid=US:en"),
    ("Google News Alien", "https://news.google.com/rss/search?q=UFO+sighting+alien+unidentified+aerial&hl=en-US&gl=US&ceid=US:en"),

    # Reddit UFO communities
    ("Reddit r/UFOs", "https://old.reddit.com/r/UFOs/.rss"),
    ("Reddit r/UAP", "https://old.reddit.com/r/UAP/.rss"),
    ("Reddit r/UFObelievers", "https://old.reddit.com/r/UFObelievers/.rss"),
    ("Reddit r/aliens", "https://old.reddit.com/r/aliens/.rss"),
    ("Reddit r/UAPdiscussions", "https://old.reddit.com/r/UAPdiscussions/.rss"),

    # Specialty news
    ("The Debrief", "https://thedebrief.org/feed/"),
    ("Liberation Times", "https://www.liberationtimes.com/feed.xml"),
    ("NUFORC", "https://nuforc.org/feed/"),
]

def log(msg):
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:12]
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def fetch_rss(url, timeout=15):
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; DisclosureHK/2.0)"})
        resp = urlopen(req, timeout=timeout)
        return resp.read()
    except Exception as e:
        return None

def parse_rss(xml_bytes):
    """Parse both RSS 2.0 and Atom feeds"""
    entries = []
    try:
        root = ElementTree.fromstring(xml_bytes)
        # RSS 2.0
        for item in root.iter("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pubdate = (item.findtext("pubDate") or "").strip()
            desc = (item.findtext("description") or "").strip()
            if title:
                entries.append({"title": title, "link": link, "pubDate": pubdate, "desc": desc})
        # Atom
        ns = {"a": "http://www.w3.org/2005/Atom"}
        for entry in root.iter("{http://www.w3.org/2005/Atom}entry"):
            title = (entry.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
            links = entry.findall("{http://www.w3.org/2005/Atom}link")
            link = links[0].get("href", "").strip() if links else ""
            pubdate = (entry.findtext("{http://www.w3.org/2005/Atom}published") or 
                      entry.findtext("{http://www.w3.org/2005/Atom}updated") or "").strip()
            content_el = entry.find("{http://www.w3.org/2005/Atom}content")
            desc = content_el.text or "" if content_el is not None else ""
            if title:
                entries.append({"title": title, "link": link, "pubDate": pubdate, "desc": desc})
    except Exception:
        pass
    return entries

def article_id(entry):
    """Unique ID for dedup"""
    raw = entry["link"][:120] or entry["title"][:80]
    return hashlib.md5(raw.encode()).hexdigest()

def load_cache():
    try:
        with open(CACHE_FILE) as f:
            return set(json.load(f).get("seen", []))
    except:
        return set()

def save_cache(seen_ids):
    seen_list = list(seen_ids)[-500:]  # Keep last 500
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w") as f:
        json.dump({"seen": seen_list, "updated": datetime.now(timezone.utc).isoformat()}, f)

def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except:
        return {"last_major_ts": "2000-01-01T00:00:00Z"}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def is_major_story(title, desc):
    """Score-based system: 3+ points = major breaking"""
    text = f"{title} {desc}".lower()
    score = 0
    
    point = lambda keywords: sum(1 for k in keywords if k in text)
    
    score += point(["release", "release of", "declassified", "declassifying", "pentagon release"]) * 3
    score += point(["ufo files", "ufo documents", "ufo videos", "ufo photos", "disclosure"]) * 3
    score += point(["congressional hearing", "congress hearing", "house hearing", "senate hearing"]) * 3
    score += point(["aaro", "pursue", "department of war", "war.gov"]) * 4
    score += point(["trump", "president", "white house", "government"]) * 2
    score += point(["whistleblower", "whistle-blower", "grusch", "elizondo", "coulthart"]) * 3
    score += point(["mass sighting", "mass ufo", "multiple witnesses", "airport"]) * 3
    score += point(["bbc", "cnn", "new york times", "reuters", "associated press", "washington post"]) * 2
    score += point(["nasa", "pentagon", "military", "navy", "air force"]) * 2
    score += point(["roswell", "area 51", "ufo crash", "retrieval", "non-human"]) * 4
    score += point(["new video", "new footage", "leaked video", "ufo video goes viral"]) * 2
    
    return score >= 3

def build_and_deploy():
    """Build site and push to GitHub"""
    result = subprocess.run(["npm", "run", "build"], cwd=SITE,
                            capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        log(f"  ✗ Build failed: {result.stderr[-300:]}")
        return False
    
    # Git push
    for cmd in [
        ["git", "add", "-A"],
        ["git", "commit", "-m", f"auto: real-time news update [{(datetime.now(timezone.utc).strftime('%H:%M'))}]"],
        ["git", "pull", "--rebase", "origin", "master"],
        ["git", "push", "origin", "master"]
    ]:
        r = subprocess.run(cmd, cwd=SITE, capture_output=True, text=True, timeout=60)
        if r.returncode != 0 and "nothing to commit" not in r.stderr:
            log(f"  ⚠ Git step {' '.join(cmd[:2])}: {r.stderr[-200:]}")
            if "rebase" in " ".join(cmd):
                subprocess.run(["git", "rebase", "--abort"], cwd=SITE, capture_output=True, timeout=10)
                return False
    return True

def create_breaking_post(item, now):
    """Create a mini breaking news post"""
    title = html.unescape(item["title"]).replace('"', "'").strip()
    link = item["link"]
    pub = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    slug = f"ufo-alert-{now.strftime('%Y%m%d%H%M%S')}"
    
    # Extract description text
    desc_text = re.sub(r'<[^>]+>', '', item.get("desc", ""))[:300]
    
    post = f"""---
title: "🚨 即時UFO資訊：{title[:96]}"
description: "DisclosureHK 實時新聞引擎自動偵測 — {desc_text[:150]}"
pubDate: "{pub}"
tags: ["UFO", "UAP", "breaking", "即時新聞"]
---

# 🚨 即時UFO資訊

| 📍 *全球* | 📅 *{now.strftime('%Y年%m月%d日 %H:%M')} UTC* | 🔍 *實時新聞引擎*

> 以下新聞由 DisclosureHK 實時新聞引擎在 {now.strftime('%H:%M:%S UTC')} 自動偵測

## {title}

{desc_text}

🔗 **[閱讀原文 →]({link})**

---

| 資訊 | 詳情 |
|---|---|
| 📰 來源 | 多平台實時聚合 |
| ⏱ 偵測時間 | {now.strftime('%Y-%m-%d %H:%M:%S')} UTC |
| 🤖 引擎 | DisclosureHK Real-Time News Engine v2.0 |

*本文章由自動系統即時生成，確保您第一時間掌握全球UFO/UAP最新資訊*
"""
    
    path = f"{BREAKING_DIR}/{slug}.md"
    with open(path, "w") as f:
        f.write(post)
    log(f"  📝 BREAKING post created: {slug}")
    return path

def create_rapid_digest(items, now):
    """Create a rapid mini-digest when multiple stories break"""
    pub = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    slug = f"ufo-rapid-{now.strftime('%Y%m%d%H%M%S')}"
    
    lines = []
    for i, item in enumerate(items[:8], 1):
        t = html.unescape(item["title"]).replace(chr(10)," ").strip()[:120]
        lines.append(f"{i}. [{t}]({item['link']})")
    
    post = f"""---
title: "🛸 UFO/UAP 即時快訊合集 — {now.strftime('%H:%M UTC')}"
description: "DisclosureHK 自動聚合最新 {len(items)} 條 UFO/UAP 新聞"
pubDate: "{pub}"
tags: ["UFO", "UAP", "news", "即時快訊", "automated"]
---

# 🛸 UFO/UAP 即時快訊合集

| 📍 *全球多個地點* | 📅 *{now.strftime('%Y年%m月%d日 %H:%M UTC')}* | 🔍 *自動聚合*

> 以下新聞由 DisclosureHK 實時新聞引擎自動搜集

{chr(10).join(lines)}

---

*🤖 由 DisclosureHK 實時新聞引擎自動生成 • 每分鐘更新 • 資料來源：Google News / Reddit / RSS*
"""
    
    path = f"{DIGEST_DIR}/{slug}.md"
    with open(path, "w") as f:
        f.write(post)
    log(f"  📝 Rapid digest created: {slug}")
    return path

def main():
    # Check if we should also run a full build (every 10 mins)
    state = load_state()
    now = datetime.now(timezone.utc)
    seen = load_cache()
    
    log(f"🚀 News Engine check starting...")
    
    all_new = []
    all_major = []
    
    for name, url in SOURCES:
        raw = fetch_rss(url)
        if not raw:
            log(f"  ~ {name}: no response")
            continue
        entries = parse_rss(raw)
        if not entries:
            continue
        
        for e in entries:
            aid = article_id(e)
            if aid not in seen:
                seen.add(aid)
                all_new.append(e)
                if is_major_story(e["title"], e.get("desc","")):
                    all_major.append(e)
    
    log(f"  Total: {len(all_new)} new, {len(all_major)} major")
    
    if all_major:
        log(f"  🚨🚨 MAJOR BREAKING: {len(all_major)} stories!")
        for m in all_major[:5]:
            log(f"     → {html.unescape(m['title'])[:80]}")
        
        # Create breaking posts
        for item in all_major[:3]:
            create_breaking_post(item, now)
        
        # Create combined digest if 3+ major stories
        if len(all_major) >= 3:
            create_rapid_digest(all_major, now)
        
        # Build & deploy
        log("  🔨 Building + Deploying (MAJOR)...")
        if build_and_deploy():
            log("  ✅ Done! Site updated with breaking news.")
        else:
            log("  ✗ Deploy failed")
    
    elif all_new:
        log(f"  📰 {len(all_new)} minor new articles — creating digest")
        create_rapid_digest(all_new[:8], now)
        
        # Determine if we should build now or wait
        last_ts = state.get("last_build_ts", "2000-01-01T00:00:00Z")
        last_build = datetime.fromisoformat(last_ts.replace("Z","+00:00"))
        mins_since = (now - last_build).total_seconds() / 60
        
        if mins_since >= 10:  # Build every 10 min for minor news
            log("  🔨 Building + Deploying...")
            if build_and_deploy():
                state["last_build_ts"] = now.isoformat()
                log("  ✅ Done!")
            else:
                log("  ✗ Deploy failed")
        else:
            log(f"  ⏳ Skipping build (last build {int(mins_since)}m ago, need 10m)")
    else:
        log("  ℹ️  No new articles found")
    
    # Save state
    state["last_check"] = now.isoformat()
    state["articles_found"] = state.get("articles_found", 0) + len(all_new)
    save_state(state)
    save_cache(seen)
    
    # Log this run
    try:
        with open(LOG_FILE) as f:
            log_data = json.load(f)
    except:
        log_data = []
    log_data.append({
        "ts": now.isoformat(),
        "new": len(all_new),
        "major": len(all_major),
        "total_seen": len(seen),
        "deployed": bool(all_major or (all_new and mins_since >= 10))
    })
    log_data = log_data[-100:]
    with open(LOG_FILE, "w") as f:
        json.dump(log_data, f, indent=2)

if __name__ == "__main__":
    main()
