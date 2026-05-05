#!/usr/bin/env python3
"""Create blog-zh versions from blog/ content."""
import re, os, sys

blog_dir = "src/content/blog"
zh_dir = "src/content/blog-zh"

slugs = [
    "ufo-breaking-202605042218",
    "ufo-filler-202605041800",
    "ufo-filler-202605050200",
    "ufo-news-digest-20260504-evening",
    "ufo-news-digest-20260504-evening-1",
    "ufo-news-digest-202605041504",
    "ufo-news-digest-202605041703",
    "ufo-news-digest-202605041803",
    "ufo-news-digest-202605042003",
    "ufo-news-digest-202605042103",
    "ufo-news-digest-202605042203",
    "ufo-news-digest-202605042306",
    "ufo-news-digest-20260505-morning",
    "ufo-news-digest-202605050005",
    "ufo-news-digest-202605050103",
    "ufo-news-digest-202605050203",
    "ufo-news-digest-202605050303",
]

def extract_frontmatter(content):
    """Extract frontmatter dict and body from markdown content."""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not m:
        return {}, content
    fm_text = m.group(1)
    body = m.group(2)
    
    # Simple YAML-like parser for frontmatter
    fm = {}
    current_key = None
    # Handle multi-line values (like tags arrays)
    lines = fm_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if this line starts a new key
        key_match = re.match(r'^(\w+):\s*(.*)', line)
        if key_match:
            current_key = key_match.group(1)
            value = key_match.group(2).strip()
            if value == '' or value == '|':
                # Multi-line value follows
                value_lines = []
                i += 1
                while i < len(lines) and (lines[i].startswith('  ') or lines[i].startswith('- ')):
                    value_lines.append(lines[i])
                    i += 1
                fm[current_key] = '\n'.join(value_lines)
                continue
            elif value.startswith('['):
                # Parse array on one line
                # Try to collect the full array (might span lines)
                full = value
                i += 1
                while i < len(lines) and not lines[i].strip().startswith(('title:', 'description:', 'pubDate:', 'tags:', 'heroImage:', 'updatedDate:', 'author:', 'image:')):
                    full += ' ' + lines[i].strip()
                    i += 1
                fm[current_key] = full
                continue
            else:
                fm[current_key] = value
                i += 1
                continue
        elif current_key and (line.startswith('  ') or line.startswith('- ')):
            # Continuation of previous value (array items)
            if current_key in fm:
                fm[current_key] = fm[current_key] + '\n' + line
            else:
                fm[current_key] = line
            i += 1
            continue
        else:
            i += 1
            continue
    
    return fm, body

def get_title_en(zh_title, slug):
    """Generate English title from Chinese title."""
    # For now return a placeholder - these will be translated later
    return zh_title

def get_description_en(zh_desc, slug):
    """Generate English description from Chinese description."""
    return zh_desc

for slug in slugs:
    path = f"{blog_dir}/{slug}.md"
    if not os.path.exists(path):
        print(f"WARNING: {path} not found!")
        continue
    
    with open(path) as f:
        content = f.read()
    
    fm, body = extract_frontmatter(content)
    
    title = fm.get('title', '').strip('"').strip("'")
    description = fm.get('description', '').strip('"').strip("'")
    pubDate = fm.get('pubDate', '')
    updatedDate = fm.get('updatedDate', '')
    tags = fm.get('tags', '')
    heroImage = fm.get('heroImage', '')
    image = fm.get('image', '')
    author = fm.get('author', '')
    
    # For zh version, add titleEn and descriptionEn
    # We'll need to translate these. For now, let's write the file and note what needs translation
    
    zh_path = f"{zh_dir}/{slug}.md"
    
    # Write the zh version with titleEn and descriptionEn fields added
    with open(zh_path, 'w') as f:
        f.write('---\n')
        f.write(f'title: {repr(title)}\n')
        # We'll add titleEn and descriptionEn
        f.write(f"# titleEn: '(需要翻譯) {title}'\n")
        f.write(f'description: {repr(description)}\n')
        f.write(f"# descriptionEn: '(需要翻譯) {description}'\n")
        
        # Write other fields
        for key in ['pubDate', 'updatedDate', 'author']:
            val = fm.get(key)
            if val:
                f.write(f"{key}: {val}\n")
        
        # Handle heroImage or image
        if heroImage:
            f.write(f"heroImage: {heroImage}\n")
        elif image:
            # Convert image to heroImage
            f.write(f"heroImage: {image}\n")
        
        # Tags
        f.write(f'tags: {tags}\n' if tags else '')
        
        f.write('---\n')
        f.write(body)
    
    print(f"Created {zh_path}")

print("\nDone! Created blog-zh placeholders. Now need to add actual titleEn and descriptionEn translations.")
