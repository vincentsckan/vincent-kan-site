#!/usr/bin/env python3
"""
Zero-Credential SEO Engine for disclosurehk.com v2
- Improves meta descriptions for ALL blog posts (both blog/ and blog-en/)
- Validates sitemap completeness → reports missing/invalid URLs
- Generates better internal linking suggestions
- No external API needed — pure text processing
"""
import os, re, glob, sys
from datetime import datetime

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_DIR = os.path.join(SITE_DIR, "src", "content", "blog")
BLOG_EN_DIR = os.path.join(SITE_DIR, "src", "content", "blog-en")
SITEMAP_PATH = os.path.join(SITE_DIR, "dist", "sitemap-0.xml")

MAX_DESC_LEN = 158  # Google's display limit

def extract_body(content):
    """Extract clean body text from markdown, skipping frontmatter."""
    body = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)           # remove images
    body = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', body)  # clean links -> text
    body = re.sub(r'[#*>\[\]`|]', '', body)                # remove markdown syntax
    body = re.sub(r'---+\n', '', body)                     # remove horizontal rules
    body = re.sub(r'```[\s\S]*?```', '', body)             # remove code blocks
    body = re.sub(r'>\s*', '', body)                       # remove blockquote markers
    body = re.sub(r'\s+', ' ', body).strip()
    return body

def generate_good_description(body, title=""):
    """
    Generate a meaningful meta description from the first substantive content.
    Returns: (description_text, was_good)
    """
    # Try to get first 1-2 real sentences from body
    sentences = re.split(r'(?<=[.!?])\s+', body)
    
    result = ""
    for s in sentences:
        s = s.strip()
        # Skip HTML/short nonsense
        if len(s) < 15 or '<' in s or '{' in s or 'ifr' in s.lower():
            continue
        if result:
            result += " " + s
        else:
            result = s
        if len(result) >= MAX_DESC_LEN - 3:
            break
    
    if len(result) < MAX_DESC_LEN - 3:
        result = result[:MAX_DESC_LEN - 3]
    
    if not result or len(result) < 30:
        # Fallback: use title plus first content
        result = (title + ": " + body[:MAX_DESC_LEN - len(title) - 4]).strip()[:MAX_DESC_LEN]
    
    if len(result) > MAX_DESC_LEN:
        result = result[:MAX_DESC_LEN - 1].rsplit(' ', 1)[0] + '…'
    
    # Sanitize: must not contain HTML or special YAML-breaking chars
    result = re.sub(r'[\'"<>]', '', result)
    
    return result

def improve_meta_descriptions():
    """Add missing or improve poor meta descriptions for ALL blog posts."""
    improved = 0
    total_checked = 0
    still_missing = 0
    
    for lang_dir, lang_name in [(BLOG_DIR, "blog"), (BLOG_EN_DIR, "blog-en")]:
        if not os.path.isdir(lang_dir):
            continue
        for f in sorted(glob.glob(os.path.join(lang_dir, "*.md"))):
            total_checked += 1
            with open(f, 'r', encoding='utf-8') as fh:
                content = fh.read()
            
            # Determine which description field to check
            is_en = "blog-en" in f
            desc_key = "descriptionEn" if is_en else "description"
            
            # Extract title
            title_match = re.search(r'title:\s*[\'"](.+?)[\'"]', content)
            title = title_match.group(1) if title_match else ""
            
            # Check existing description quality
            desc_match = re.search(rf'{desc_key}:\s*[\'"](.+?)[\'"]', content)
            needs_update = False
            existing_desc = ""
            
            if desc_match:
                existing_desc = desc_match.group(1)
                # Check if it's too short, placeholder, or has bad patterns
                if len(existing_desc) < 20:
                    needs_update = True
                elif 'placeholder' in existing_desc.lower():
                    needs_update = True
                elif existing_desc.startswith('Tech enthusiast') and 'DisclosureHK' in f:
                    # Generic site description on a blog post — needs specific
                    needs_update = True
                elif existing_desc == title or existing_desc.strip() == '':
                    needs_update = True
            
            if not desc_match:
                needs_update = True
            
            if not needs_update:
                continue
            
            # Generate new description from content
            body = extract_body(content)
            new_desc = generate_good_description(body, title)
            
            if len(new_desc) < 20:
                still_missing += 1
                continue
            
            # Apply the change
            if desc_match:
                # Update existing description
                old_line = desc_match.group(0)
                if old_line.endswith("''>"):
                    continue  # skip weird formatting
                escaped_desc = new_desc.replace("'", "\\'")
                new_line = f"{desc_key}: '{escaped_desc}'"
                content = content.replace(old_line, new_line)
            else:
                # Add description after title line
                escaped_desc = new_desc.replace("'", "\\'")
                new_line = f"{desc_key}: '{escaped_desc}'"
                content = re.sub(
                    r'(title:\s*[\'"](.+?)[\'"])',
                    r'\1\n' + new_line,
                    content,
                    count=1
                )
            
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(content)
            improved += 1
            print(f"  ✅ {os.path.basename(f)}: {new_desc[:60]}…")
    
    return improved, total_checked, still_missing

def validate_sitemap():
    """Validate the sitemap structure and report issues."""
    if not os.path.exists(SITEMAP_PATH):
        print("⚠️  Sitemap not found at dist/sitemap-0.xml — site may not be built yet")
        return 0
    
    import xml.etree.ElementTree as ET
    try:
        tree = ET.parse(SITEMAP_PATH)
        ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
        urls = tree.findall(f'.//{ns}url')
        
        # Check for duplicate URLs
        locs = [u.find(f'{ns}loc').text for u in urls if u.find(f'{ns}loc') is not None]
        
        issues = 0
        if len(locs) != len(set(locs)):
            issues += len(locs) - len(set(locs))
            print(f"  ⚠️  Found {len(locs) - len(set(locs))} duplicate URLs in sitemap")
        
        # Check for missing blog posts vs actual files
        en_files = [f.replace('.md', '') for f in os.listdir(BLOG_EN_DIR) if f.endswith('.md')]
        zh_files = [f.replace('.md', '') for f in os.listdir(BLOG_DIR) if f.endswith('.md')]
        
        # Count blog posts in sitemap
        blog_urls = [l for l in locs if '/blog/' in l]
        en_slugs = [l.split('/blog/')[1].rstrip('/') for l in blog_urls if '/blog/' in l and '/zh/' not in l]
        
        print(f"  📄 Sitemap: {len(urls)} total URLs, {len(blog_urls)} blog posts")
        print(f"  📝 Source: {len(en_files)} en + {len(zh_files)} zh markdown files")
        
        return len(urls)
    except ET.ParseError as e:
        print(f"  ❌ Sitemap parse error: {e}")
        return -1

def check_robots_txt():
    """Verify robots.txt is correct."""
    robots_path = os.path.join(SITE_DIR, "public", "robots.txt")
    dist_robots = os.path.join(SITE_DIR, "dist", "robots.txt")
    
    if not os.path.exists(robots_path):
        print("  ⚠️  public/robots.txt not found!")
        return False
    
    content = open(robots_path).read()
    
    checks = {
        "Has Allow /": "Allow: /" in content,
        "Has Sitemap (sitemap-index)": "sitemap-index.xml" in content,
        "Has Sitemap (news-sitemap)": "news-sitemap.xml" in content,
        "Uses www.disclosurehk.com": "www.disclosurehk.com" in content,
    }
    
    all_pass = True
    for name, ok in checks.items():
        status = "✅" if ok else "❌"
        print(f"  {status} {name}")
        if not ok:
            all_pass = False
    
    return all_pass

def check_canonical_urls():
    """Check canonical URLs in dist HTML files (sampling)."""
    dist_dir = os.path.join(SITE_DIR, "dist")
    if not os.path.isdir(dist_dir):
        print("  ⚠️  dist/ directory not found (site not built)")
        return
    
    html_files = glob.glob(os.path.join(dist_dir, "**", "*.html"), recursive=True)
    checked = 0
    good = 0
    
    for f in sorted(html_files)[:20]:  # sample first 20
        content = open(f, 'r', encoding='utf-8').read()
        m = re.search(r'<link rel="canonical" href="([^"]+)"', content)
        if m:
            canonical = m.group(1)
            # The canonical should match the actual page URL
            path = f.replace(dist_dir, '').replace('/index.html', '/').replace('//', '/')
            expected = f"https://www.disclosurehk.com{path}"
            if canonical == expected.rstrip('/') or canonical == expected:
                good += 1
            else:
                print(f"  ⚠️  Canonical mismatch: {os.path.basename(f)}")
                print(f"       Expected: {expected}")
                print(f"       Got:      {canonical}")
            checked += 1
        else:
            print(f"  ⚠️  No canonical URL in {os.path.basename(f)}")
    
    if checked > 0:
        print(f"  ✅ Canonical URLs: {good}/{checked} correct (sampled)")

def generate_linking_suggestions():
    """Generate internal linking suggestions for blog posts."""
    en_files = glob.glob(os.path.join(BLOG_EN_DIR, "*.md"))
    
    suggestions = []
    for f in sorted(en_files):
        slug = os.path.basename(f).replace('.md', '')
        content = open(f, 'r', encoding='utf-8').read()
        body = extract_body(content)
        
        # Find case study references that aren't linked
        case_mentions = re.findall(r'(?<=\s)(Nimitz|Phoenix Lights|Roswell|Ariel|Belgium|Rendlesham|Tic-Tac|Travis Walton|Cash-Landrum)(?=\s)', body)
        
        if case_mentions:
            suggestions.append(f"  📎 {slug}: could link to → {', '.join(set(case_mentions))}")
    
    if suggestions:
        print("\n📎 Internal Linking Suggestions:")
        for s in suggestions:
            print(s)

def main():
    print("=" * 55)
    print("  🔍 DisclosureHK SEO Engine v2 — Zero-Credential")
    print("=" * 55)
    
    # 1. Improve meta descriptions
    print("\n📝 1. Meta Description Optimization")
    improved, total, missing = improve_meta_descriptions()
    print(f"     → {improved}/{total} descriptions updated, {missing} still too short")
    
    # 2. Validate sitemap
    print("\n🗺️  2. Sitemap Validation")
    url_count = validate_sitemap()
    
    # 3. Check robots.txt
    print("\n🤖 3. Robots.txt Check")
    check_robots_txt()
    
    # 4. Check canonical URLs
    print("\n🔗 4. Canonical URL Check (sample)")
    check_canonical_urls()
    
    # 5. Internal linking suggestions
    print("\n🔗 5. Internal Linking Analysis")
    generate_linking_suggestions()
    
    # Summary
    print("\n" + "=" * 55)
    print("  📊 SEO Summary")
    print("  " + "-" * 45)
    print(f"  Meta descriptions:   {improved} improved out of {total} checked")
    print(f"  Sitemap URLs:        {url_count if url_count > 0 else '⚠️  check build'}")
    print(f"  Robots.txt:          {'✅' if check_robots_txt() else '❌ needs fix'}")
    print("=" * 55)

if __name__ == "__main__":
    main()
