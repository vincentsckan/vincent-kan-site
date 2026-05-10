#!/usr/bin/env python3
"""
SEO enhancement script for disclosurehk.com
Automatically submits URLs to Google/Bing and generates optimizations.
Run after each build/deploy.
"""

import http.client
import json
import os
import sys
import time
import xml.etree.ElementTree as ET

SITEMAP_PATH = os.path.join(os.path.dirname(__file__), "..", "dist", "sitemap-0.xml")
SITE_URL = "https://www.disclosurehk.com"

def get_all_urls():
    """Extract all URLs from the built sitemap."""
    if not os.path.exists(SITEMAP_PATH):
        print(f"⚠️ Sitemap not found at {SITEMAP_PATH}")
        return []
    
    tree = ET.parse(SITEMAP_PATH)
    root = tree.getroot()
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = root.findall('.//s:url', ns)
    
    result = []
    for url in urls:
        loc = url.find('s:loc', ns)
        if loc is not None and loc.text:
            result.append(loc.text)
    return result

def ping_search_engines():
    """Ping search engines about updated sitemap."""
    print("📡 Pinging search engines...")
    
    engines = {
        "Google": f"https://www.google.com/ping?sitemap={SITE_URL}/sitemap-index.xml",
        "Bing": f"https://www.bing.com/ping?sitemap={SITE_URL}/sitemap-index.xml",
    }
    
    for name, url in engines.items():
        try:
            import urllib.request
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                print(f"  ✅ {name} pinged (status {r.status})")
        except Exception as e:
            print(f"  ⚠️ {name} ping failed: {e}")

def main():
    print("🔍 SEO Enhancement Script")
    print("=" * 50)
    
    urls = get_all_urls()
    print(f"📄 Found {len(urls)} URLs in sitemap")
    
    ping_search_engines()
    
    print("\n✅ SEO check complete!")
    print(f"   Site: {SITE_URL}")
    print(f"   URLs: {len(urls)}")
    print(f"   Next: Check Google Search Console manually for index status")
    print(f"   URL: https://search.google.com/search-console?resource_id={SITE_URL}")

if __name__ == "__main__":
    main()
