#!/usr/bin/env python3
"""
DisclosureHK Real-Time News Engine v3
=====================================
Every ~5 mins: real-time RSS poll from 8+ free sources
No API keys needed. Fully self-contained.
- Creates breaking posts for major stories
- Creates rapid digests for multiple stories
- Builds + deploys to GitHub Pages
"""

import json, os, re, sys, subprocess, html, hashlib, time
from datetime import datetime, timezone
from xml.etree import ElementTree
from urllib.request import Request, urlopen

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_FILE = os.path.join(SITE, ".news-cache.json")
LOG_FILE = os.path.join(SITE, ".news-log.json")

SOURCES = [
    ("Google UFO", "https://news.google.com/rss/search?q=UFO+UAP+disclosure+hearing+Pentagon&hl=en-US&gl=US&ceid=US:en"),
    ("Google UAP Gov", "https://news.google.com/rss/search?q=UAP+government+Congress+hearing+disclosure&hl=en-US&gl=US&ceid=US:en"),
    ("Google Alien", "https://news.google.com/rss/search?q=UFO+sighting+alien+unidentified+aerial+video&hl=en-US&gl=US&ceid=US:en"),
    ("Reddit r/UFOs", "https://old.reddit.com/r/UFOs/.rss"),
    ("Reddit r/UAP", "https://old.reddit.com/r/UAP/.rss"),
    ("Reddit r/aliens", "https://old.reddit.com/r/aliens/.rss"),
    ("The Debrief", "https://thedebrief.org/feed/"),
]

def fetch(url, timeout=12):
    try:
        r = urlopen(Request(url, headers={"User-Agent": "DisclosureHK/3.0"}), timeout=timeout)
        return r.read()
    except: return None

def parse(xml_bytes):
    entries = []
    try:
        root = ElementTree.fromstring(xml_bytes)
        for item in root.iter("item"):
            t = (item.findtext("title") or "").strip()
            if t: entries.append({"title": t, "link": (item.findtext("link") or "").strip(), "desc": (item.findtext("description") or "").strip()})
        for e in root.iter("{http://www.w3.org/2005/Atom}entry"):
            t = (e.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
            links = e.findall("{http://www.w3.org/2005/Atom}link")
            l = links[0].get("href","") if links else ""
            if t: entries.append({"title": t, "link": l, "desc": ""})
    except: pass
    return entries

def item_id(e):
    return hashlib.md5((e["link"][:120] or e["title"][:80]).encode()).hexdigest()

def load_cache():
    try:
        with open(CACHE_FILE) as f: d = json.load(f)
        return set(d.get("seen",[]))
    except: return set()

def save_cache(seen):
    with open(CACHE_FILE,"w") as f:
        json.dump({"seen": list(seen)[-500:],"updated":datetime.now(timezone.utc).isoformat()}, f)

def is_major(title, desc=""):
    t = f"{title} {desc}".lower()
    s = 0
    if "release" in t: s+=3
    if "declassified" in t or "declassif" in t: s+=3
    if "ufo file" in t or "ufo doc" in t or "ufo video" in t: s+=3
    if "hearing" in t or "congress" in t: s+=3
    if "aaro" in t or "pursue" in t or "war.gov" in t or "war department" in t: s+=4
    if "disclosure" in t: s+=3
    if "trump" in t or "president" in t: s+=2
    if "grusch" in t or "coulthart" in t or "elizondo" in t or "whistleblower" in t: s+=3
    if "video" in t or "footage" in t or "viral" in t: s+=2
    if "bbc " in t or "cnn " in t or "nbc " in t or "ap " in t or "reuters" in t or "washington post" in t or "new york times" in t: s+=2
    if "nasa" in t or "pentagon" in t: s+=2
    if "apollo" in t or "non-human" in t or "retrieval" in t or "crash" in t: s+=4
    return s >= 3

def build_push():
    r = subprocess.run(["npm","run","build"],cwd=SITE,capture_output=True,text=True,timeout=90)
    if r.returncode != 0: return False
    for cmd in [["git","add","-A"],["git","commit","-m",f"auto: news [{datetime.now(timezone.utc).strftime('%H:%M UTC')}]"],["git","push","origin","master"]]:
        subprocess.run(cmd,cwd=SITE,capture_output=True,timeout=30)
    return True

def log_run(data):
    try:
        with open(LOG_FILE) as f: log = json.load(f)
    except: log = []
    log.append(data)
    with open(LOG_FILE,"w") as f: json.dump(log[-100:],f,indent=2)

def main():
    now = datetime.now(timezone.utc)
    seen = load_cache()
    all_new, all_major = [], []

    for name, url in SOURCES:
        raw = fetch(url)
        if not raw: continue
        for e in parse(raw):
            iid = item_id(e)
            if iid not in seen:
                seen.add(iid)
                all_new.append(e)
                if is_major(e["title"], e.get("desc","")):
                    all_major.append(e)

    msgs = []

    if all_major:
        msgs.append(f"🚨 {len(all_major)} major")

        # Create digest (always)
        slug = f"ufo-rapid-{now.strftime('%Y%m%d%H%M%S')}"
        lines = []
        for i,item in enumerate(all_major[:8],1):
            t = html.unescape(item["title"]).replace("\n"," ").strip()[:120]
            lines.append(f"{i}. [{t}]({item['link']})")
        post = f"""---
title: "🛸 UFO 即時快訊 x{len(all_major)}"
description: "DisclosureHK 自動聚合 {len(all_major)} 條最新 UFO 新聞"
pubDate: "{now.strftime('%Y-%m-%dT%H:%M:%SZ')}"
tags: ["UFO","UAP","news","即時快訊"]
---

# 🛸 UFO 即時快訊合集 x{len(all_major)}

| 📍 全球 | 📅 {now.strftime('%Y年%m月%d日 %H:%M UTC')} | 🔍 自動聚合 |

{chr(10).join(lines)}

*🤖 DisclosureHK v3 · 資料：Google News / Reddit / RSS*
"""
        with open(f"{SITE}/src/content/blog-en/{slug}.md","w") as f: f.write(post)
        msgs.append(f"  ✍️ digest")

        msgs.append("  🔨 Building...")
        if build_push():
            msgs.append("  ✅ Deployed!")
        else:
            msgs.append("  ⚠️ Build failed")

    elif all_new:
        msgs.append(f"📰 {len(all_new)} minor — digest only")
        # Only build every 15 min for minor news
        from pathlib import Path
        if not Path(f"{SITE}/.last-minor-build").exists() or (now - datetime.fromtimestamp(os.path.getmtime(f"{SITE}/.last-minor-build"), tz=timezone.utc)).total_seconds() > 900:
            slug = f"ufo-news-{now.strftime('%Y%m%d%H%M%S')}"
            lines = []
            for i,item in enumerate(all_new[:10],1):
                t = html.unescape(item["title"]).replace("\n"," ").strip()[:120]
                lines.append(f"- [{t}]({item['link']})")
            post = f"""---
title: "🛸 UFO 最新消息 x{len(all_new)}"
description: "DisclosureHK 自動聚合 {len(all_new)} 條最新消息"
pubDate: "{now.strftime('%Y-%m-%dT%H:%M:%SZ')}"
tags: ["UFO","UAP","news"]
---

# 🛸 UFO 最新消息

{chr(10).join(lines)}

*🤖 DisclosureHK v3*
"""
            with open(f"{SITE}/src/content/blog-en/{slug}.md","w") as f: f.write(post)
            msgs.append("  ✍️ digest + deploying...")
            build_push()
            Path(f"{SITE}/.last-minor-build").touch()
        else:
            msgs.append("  ⏳ (last build < 15m ago, skipping)")
    else:
        msgs.append("✅ Up to date — no new articles")

    save_cache(seen)
    log_run({"ts":now.isoformat(),"new":len(all_new),"major":len(all_major)})

    # Print results
    print(f"[{now.strftime('%H:%M:%S UTC')}] {' | '.join(msgs)}")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
