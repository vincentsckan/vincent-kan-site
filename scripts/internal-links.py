#!/usr/bin/env python3
"""
Internal Link Builder — Zero-Cred Traffic Boost
Adds related posts links at the bottom of each auto-generated UFO alert post
so Google sees a well-linked site (better ranking).
"""
import os, re, glob, random
from datetime import datetime

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_DIR = os.path.join(SITE_DIR, "src", "content", "blog")

# Popular case study slugs for cross-linking
POPULAR_CASES = [
    ("Nimitz Tic-Tac (2004)", "/blog/ufo-case-nimitz/"),
    ("Phoenix Lights (1997)", "/blog/ufo-case-phoenix-lights/"),
    ("Belgian UFO Wave (1989)", "/blog/ufo-case-belgium-wave/"),
    ("Ariel School (1994)", "/blog/ufo-case-ariel/"),
    ("Roswell (1947)", "/blog/ufo-case-roswell/"),
    ("Grusch Hearings (2023)", "/blog/ufo-grusch-hearing/"),
]

def inject_related_posts():
    """Add 'Related Cases' section to auto-generated alert posts."""
    modified = 0
    for f in glob.glob(os.path.join(BLOG_DIR, "ufo-alert-*.md")):
        content = open(f, 'r', encoding='utf-8').read()
        
        # Skip if already has related posts
        if "相關案件" in content or "Related Cases" in content or "relate" in content.lower():
            continue
        
        # Skip if it already ends with a link section
        if content.strip().endswith('</div>') or content.strip().endswith('---'):
            continue
        
        # Pick 3 random cases to link
        cases = random.sample(POPULAR_CASES, min(3, len(POPULAR_CASES)))
        
        related_section = '\n\n---\n\n### 📚 相關案件 / Related Cases\n\n'
        for name, url in cases:
            related_section += f'- [{name}](https://www.disclosurehk.com{url})\n'
        
        content = content.rstrip() + related_section
        
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        modified += 1
    
    return modified

def main():
    print("🔗 Internal Link Builder")
    print("=" * 40)
    
    modified = inject_related_posts()
    print(f"✅ Added related case links to {modified} alert posts")
    
    # Count total internal links now
    total_links = 0
    for f in glob.glob(os.path.join(BLOG_DIR, "*.md")):
        content = open(f, 'r', encoding='utf-8').read()
        links = re.findall(r'\[([^\]]+)\]\(https://www\.disclosurehk\.com[^\)]+\)', content)
        total_links += len(links)
    
    print(f"🔗 Total internal links across all posts: {total_links}")
    print("✅ Internal link builder complete!")

if __name__ == "__main__":
    main()
