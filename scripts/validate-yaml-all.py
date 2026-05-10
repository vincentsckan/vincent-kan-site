#!/usr/bin/env python3
"""
Validate and fix YAML frontmatter in ALL blog-en files.
Step 1: Try to parse as YAML. If it works, re-emit clean.
Step 2: If YAML fails, rebuild frontmatter from regex-extracted fields.
"""
import os, re, glob, json, sys
import yaml

DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "blog-en")

def extract_frontmatter(content):
    m = re.match(r'^---\n(.*?)\n(?:---|\.\.\.)', content, re.DOTALL)
    if m:
        return m.group(1), m.end()
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if m:
        return m.group(1), m.end()
    return None, 0

def safe_str(val):
    """Return a YAML-safe string value."""
    if not isinstance(val, str):
        return val
    # Strip HTML
    if '<' in val:
        val = val.split('<')[0].strip()
    # Remove duplicated content (common corruption pattern)
    if len(val) > 158:
        val = val[:155].rsplit(' ', 1)[0] + '…'
    # Escape for double-quoted YAML string (most robust for special chars)
    escaped = val.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    return json.dumps(escaped) if '"' in escaped or "'" in escaped else f'"{escaped}"'

def write_frontmatter(data):
    """Write clean YAML frontmatter from a dict."""
    lines = ["---"]
    order = ["title", "descriptionEn", "titleEn", "description", "pubDate", "updatedDate", "heroImage", "tags", "category", "author", "draft"]
    seen = set()
    for key in order:
        if key in data and key not in seen:
            val = data[key]
            if isinstance(val, str):
                lines.append(f"{key}: {safe_str(val)}")
            elif isinstance(val, list):
                lines.append(f"{key}: {json.dumps(val, ensure_ascii=False)}")
            elif isinstance(val, bool):
                lines.append(f"{key}: {'true' if val else 'false'}")
            elif val is not None:
                lines.append(f"{key}: {val}")
            seen.add(key)
    # Remaining keys
    for key, val in data.items():
        if key not in seen:
            if isinstance(val, str):
                lines.append(f"{key}: {safe_str(val)}")
            elif isinstance(val, list):
                lines.append(f"{key}: {json.dumps(val, ensure_ascii=False)}")
            elif isinstance(val, bool):
                lines.append(f"{key}: {'true' if val else 'false'}")
            elif val is not None:
                lines.append(f"{key}: {val}")
            seen.add(key)
    lines.append("---")
    return "\n".join(lines)

def extract_keys(raw_fm):
    """Extract key-value pairs from raw frontmatter text using regex."""
    data = {}
    current_key = None
    for line in raw_fm.split('\n'):
        m = re.match(r'^(\w[\w]*):\s*(.*)', line)
        if m:
            current_key = m.group(1)
            val = m.group(2).strip()
            data[current_key] = val
        elif current_key and line.startswith(' '):
            # Continuation line
            pass
    return data

def rebuild_frontmatter(data):
    """Clean data from regex-extracted fields into proper YAML."""
    cleaned = {}
    for key, val in data.items():
        if not isinstance(val, str):
            cleaned[key] = val
            continue
        
        # Strip outer quotes
        sval = val.strip()
        if (sval.startswith("'") and sval.endswith("'")) or \
           (sval.startswith('"') and sval.endswith('"')):
            sval = sval[1:-1]
        
        # Remove HTML
        if '<' in sval:
            sval = sval.split('<')[0].strip()
        
        # Remove duplicated content (text after … that repeats)
        if '…' in sval:
            parts = sval.split('…')
            if len(parts) > 1 and parts[1].strip() in parts[0]:
                sval = parts[0] + '…'
        
        # Remove text after '📍' or '📅' or '🔍' in descriptionEn
        if key == 'descriptionEn' and any(c in sval for c in ['📍', '📅', '🔍']):
            sval = ' '.join(sval.split())
        
        # Limit length
        if len(sval) > 200:
            sval = sval[:197].rsplit(' ', 1)[0] + '…'
        
        # Check if this should be a list (tags, categories)
        if key in ('tags', 'categories'):
            if sval.startswith('['):
                try:
                    cleaned[key] = json.loads(sval)
                    continue
                except:
                    items = re.findall(r"'([^']+)'", sval)
                    if not items:
                        items = re.findall(r'"([^"]+)"', sval)
                    if items:
                        cleaned[key] = items
                        continue
        
        cleaned[key] = sval
    
    # Ensure required keys
    if 'title' not in cleaned:
        cleaned['title'] = 'UFO/UAP Article'
    if 'descriptionEn' not in cleaned:
        cleaned['descriptionEn'] = cleaned.get('description', 'UFO/UAP case coverage')
    if 'description' not in cleaned:
        cleaned['description'] = cleaned['descriptionEn']
    
    return cleaned

def validate_and_fix(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    raw_fm, endpos = extract_frontmatter(content)
    if raw_fm is None:
        return False, "no frontmatter"
    
    body = content[endpos:]
    
    full_fm = f"---\n{raw_fm}\n---"
    
    # Try YAML parse first
    try:
        data = yaml.safe_load(full_fm)
        if not isinstance(data, dict):
            return False, "not_dict"
        
        # Check for issues in values
        needs_rewrite = False
        for key, val in list(data.items()):
            if isinstance(val, str):
                if '<' in val or '>🚀' in val or 'video-embed' in val or '&gt;' in val:
                    needs_rewrite = True
                    cleaned = val.split('<')[0].strip()
                    if len(cleaned) > 200:
                        cleaned = cleaned[:197].rsplit(' ', 1)[0] + '…'
                    data[key] = cleaned
            elif isinstance(val, list):
                # Fix tags that are strings in a weird format
                cleaned = []
                for item in val:
                    if isinstance(item, str) and item.startswith("'"):
                        item = item.strip("'")
                    cleaned.append(item)
                if cleaned != val:
                    data[key] = cleaned
                    needs_rewrite = True
        
        if needs_rewrite:
            new_fm = write_frontmatter(data)
            new_content = new_fm + "\n\n" + body.lstrip('\n')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, "cleaned"
        
        # Also re-emit clean to ensure consistent formatting
        if True:  # Always normalize
            new_fm = write_frontmatter(data)
            new_content = new_fm + "\n\n" + body.lstrip('\n')
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True, "normalized"
        
        return False, "valid"
        
    except yaml.YAMLError:
        # Rebuild from regex
        raw_data = extract_keys(raw_fm)
        data = rebuild_frontmatter(raw_data)
        new_fm = write_frontmatter(data)
        new_content = new_fm + "\n\n" + body.lstrip('\n')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, "rebuilt"

def main():
    fixed = 0
    valid = 0
    errors = 0
    
    for f in sorted(glob.glob(os.path.join(DIR, "*.md"))):
        ok, reason = validate_and_fix(f)
        if ok:
            print(f"  Fixed: {os.path.basename(f)} ({reason})")
            fixed += 1
        elif reason == "valid":
            valid += 1
        else:
            errors += 1
    
    print(f"\n  ✅ {valid} valid | 🛠️ {fixed} fixed | ❌ {errors} errors")

if __name__ == "__main__":
    main()
