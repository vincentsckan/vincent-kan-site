#!/usr/bin/env python3
"""
Fix YAML frontmatter in blog-en/ that breaks Astro build:
- Replace \' inside single-quoted strings with ''
- Ensure no unclosed quotes
- Remove HTML from description fields
"""
import os, re, glob

DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "blog-en")
nsfw_titles = {"Chupacabra", "Chupacabras", "Terrifying"}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Extract frontmatter
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return False
    
    fm = m.group(1)
    body = content[m.end():]
    
    lines = fm.split('\n')
    new_lines = []
    changed = False
    
    for line in lines:
        new_line = line
        
        # Skip non-key-value lines
        if ':' not in line:
            new_lines.append(line)
            continue
        
        key, _, val = line.partition(':')
        key = key.strip()
        val = val.strip()
        
        if not val:
            new_lines.append(line)
            continue
        
        # Detect single-quoted value
        if val.startswith("'") and val.endswith("'"):
            inner = val[1:-1]
            # Replace \' with '' (YAML single-quote escape)
            if "\\'" in inner:
                inner = inner.replace("\\'", "''")
                changed = True
            # Check for unclosed single quotes in inner
            if inner.count("'") % 2 != 0:
                # Remove all quotes
                inner = inner.replace("'", "")
                changed = True
            # Remove HTML
            if '<' in inner:
                inner = inner.split('<')[0].strip()
                changed = True
            # Limit length
            if len(inner) > 158:
                inner = inner[:155].rsplit(' ', 1)[0] + '…'
                changed = True
            new_line = f"{key}: '{inner}'"
        
        # Detect double-quoted value
        elif val.startswith('"') and val.endswith('"'):
            inner = val[1:-1]
            if '<' in inner:
                inner = inner.split('<')[0].strip()
                changed = True
            new_line = f'{key}: "{inner}"'
        
        new_lines.append(new_line)
    
    new_fm = '\n'.join(new_lines)
    new_content = f"---\n{new_fm}\n---{body}"
    
    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    fixed = 0
    for f in sorted(glob.glob(os.path.join(DIR, "*.md"))):
        if fix_file(f):
            print(f"✅ Fixed: {os.path.basename(f)}")
            fixed += 1
    
    print(f"\nFixed {fixed} files")

if __name__ == "__main__":
    main()
