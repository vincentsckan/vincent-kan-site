#!/usr/bin/env python3
"""Generate real-time news ticker data for the homepage.
Reads latest cached articles, outputs JSON for Astro to import."""

import json, os, re
from datetime import datetime, timezone
from xml.etree import ElementTree
from urllib.request import Request, urlopen

import sys
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TICKER_FILE = os.path.join(SITE, "src", "data", "ticker.json")

# Quick RSS fetch (no dedup, just latest headlines)
SOURCES = [
    ("Google UFO", "https://news.google.com/rss/search?q=UFO+UAP+disclosure+hearing&hl=en-US&gl=US&ceid=US:en"),
    ("Google UAP Gov", "https://news.google.com/rss/search?q=UAP+government+Congress+disclosure&hl=en-US&gl=US&ceid=US:en"),
    ("Reddit r/UFOs", "https://old.reddit.com/r/UFOs/.rss"),
]

def fetch_rss(url, timeout=10):
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urlopen(req, timeout=timeout)
        return resp.read()
    except:
        return None

def parse_rss(xml_bytes):
    entries = []
    try:
        root = ElementTree.fromstring(xml_bytes)
        for item in root.iter("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            if title:
                entries.append({"title": title, "link": link})
        for entry in root.iter("{http://www.w3.org/2005/Atom}entry"):
            title = (entry.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
            links = entry.findall("{http://www.w3.org/2005/Atom}link")
            link = links[0].get("href", "") if links else ""
            if title:
                entries.append({"title": title, "link": link})
    except:
        pass
    return entries

def main():
    all_items = []
    for name, url in SOURCES:
        raw = fetch_rss(url)
        if not raw:
            continue
        entries = parse_rss(raw)
        all_items.extend(entries[:15])
    
    # Dedup
    seen = set()
    ticker = []
    for item in all_items:
        key = item["title"].lower().strip()[:60]
        if key and key not in seen:
            seen.add(key)
            ticker.append(item)
    
    # Use shortest link for dedup across runs
    # Save the ticker data
    data = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "items": ticker[:20]
    }
    os.makedirs(os.path.dirname(TICKER_FILE), exist_ok=True)
    with open(TICKER_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Ticker updated: {len(ticker[:20])} items")

if __name__ == "__main__":
    main()
