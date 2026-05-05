#!/usr/bin/env python3
"""Replace Chinese body with English translations in blog-en files that still have Chinese content."""

import re
import os

en_dir = "src/content/blog-en"

def split_file(content):
    """Split frontmatter and body."""
    m = re.match(r'^(---\s*\n.*?\n---)\s*\n(.*)', content, re.DOTALL)
    if not m:
        return content, ""
    return m.group(1), m.group(2).strip()

# Dictionary mapping slug to English body content
# For articles with identical structure, we map them
slug_map = {
    'ufo-breaking-202605042218': 'ufo-breaking-202605042218',
    'ufo-filler-202605041800': 'ufo-filler-202605041800',
    'ufo-filler-202605050200': 'ufo-filler-202605050200',
    'ufo-news-digest-202605041504': 'ufo-news-digest-202605041504',
    'ufo-news-digest-202605041703': 'ufo-news-digest-202605041703',
    'ufo-news-digest-202605041803': 'ufo-news-digest-202605041803',
    'ufo-news-digest-202605042003': 'ufo-news-digest-202605042003',
    'ufo-news-digest-202605042103': 'ufo-news-digest-202605042103',
    'ufo-news-digest-202605042203': 'ufo-news-digest-202605042203',
    'ufo-news-digest-202605042306': 'ufo-news-digest-202605042306',
    'ufo-news-digest-202605050005': 'ufo-news-digest-202605050005',
    'ufo-news-digest-202605050103': 'ufo-news-digest-202605050103',
    'ufo-news-digest-202605050203': 'ufo-news-digest-202605050203',
    'ufo-news-digest-202605050303': 'ufo-news-digest-202605050303',
}

# Read en_body_content.json
import json
with open('en_body_content.json') as f:
    all_content = json.load(f)

for slug, body in all_content.items():
    filepath = f"{en_dir}/{slug}.md"
    if not os.path.exists(filepath):
        print(f"NOT FOUND: {filepath}")
        continue
    
    with open(filepath) as f:
        content = f.read()
    
    fm, old_body = split_file(content)
    
    new_content = fm + '\n\n' + body + '\n'
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"✓ Updated: {slug}.md")

print(f"\nDone! Updated {len(all_content)} files.")
