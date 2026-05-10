#!/usr/bin/env python3
"""
Emergency fix for broken YAML frontmatter in blog-en/
Some files have descriptionEn lines that contain HTML or are massively duplicated.
"""
import os, re, glob

DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "blog-en")

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Find frontmatter block
    fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not fm_match:
        return False
    
    fm_text = fm_match.group(1)
    body = content[fm_match.end():]
    
    # Get the title for a proper description
    title_match = re.search(r'title:\s*["\'](.+?)["\']', fm_text)
    title = title_match.group(1) if title_match else "UFO case"
    
    # Clean descriptionEn: strip HTML, quotes that break YAML
    lines = []
    for line in fm_text.split('\n'):
        if line.startswith('descriptionEn:'):
            # Extract text before any HTML or duplication
            cleaned = line
            # If it contains HTML, strip it
            if '<' in line:
                # Get the text before HTML
                text_match = re.match(r"descriptionEn:\s*'(.*?)'", line)
                if not text_match:
                    text_match = re.match(r'descriptionEn:\s*"(.*?)"', line)
                
                if text_match:
                    desc_text = text_match.group(1)
                    # Remove everything after HTML tag starts
                    if '<' in desc_text:
                        desc_text = desc_text.split('<')[0].strip()
                    if "'video-embed" in desc_text:
                        desc_text = desc_text.split("'video-embed")[0].strip()
                    # Truncate to reasonable length
                    if len(desc_text) > 158:
                        desc_text = desc_text[:155].rsplit(' ', 1)[0] + '…'
                    # Remove quotes that break YAML
                    desc_text = desc_text.replace("'", "").replace('"', '').strip()
                    if desc_text and len(desc_text) > 20:
                        cleaned = f"descriptionEn: '{desc_text}'"
                    else:
                        cleaned = f"descriptionEn: 'UFO/UAP case: {title}'"
                else:
                    cleaned = f"descriptionEn: 'UFO/UAP case: {title}'"
            lines.append(cleaned)
        elif line.startswith('description:'):
            # Also fix description if broken
            cleaned = line
            if '<' in line or "'video-embed" in line or len(line) > 200:
                # Generate clean description
                cleaned = f"description: 'UFO/UAP news coverage: {title}'"
            lines.append(cleaned)
        else:
            lines.append(line)
    
    new_fm = '\n'.join(lines)
    # Remove excessive blank lines at start
    new_fm = re.sub(r'^\n+', '', new_fm)
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
    
    print(f"\n📊 Fixed {fixed} files")

if __name__ == "__main__":
    main()
