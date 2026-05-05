#!/usr/bin/env python3
"""Sync 8 additional articles that appeared after the initial list was created."""
import re, os, json

blog_dir = "src/content/blog"
zh_dir = "src/content/blog-zh"
en_dir = "src/content/blog-en"

extra_slugs = [
    "ufo-news-digest-20260505-afternoon",
    "ufo-news-digest-20260505-morning-1",
    "ufo-news-digest-202605050406",
    "ufo-news-digest-202605050503",
    "ufo-news-digest-202605050603",
    "ufo-news-digest-202605050704",
    "ufo-news-digest-202605050802",
    "ufo-news-digest-202605050904",
]

# English data for extra articles
extra_en = {
    "ufo-news-digest-20260505-afternoon": {
        "title": '"🛸 Global UFO/UAP News Digest — 2026-05-05"',
        "titleEn": "'🛸 Global UFO/UAP News Digest — 2026-05-05'",
        "description": '"Today\\'s UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress"',
    },
    "ufo-news-digest-20260505-morning-1": {
        "title": '"🛸 Global UFO/UAP News Digest — 2026-05-05"',
        "titleEn": "'🛸 Global UFO/UAP News Digest — 2026-05-05'",
        "description": '"Today\\'s UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress"',
    },
    "ufo-news-digest-202605050406": {
        "title": '"🛸 UFO/UAP News Flash — May 5, 12:06"',
        "titleEn": "'🛸 UFO/UAP News Flash — May 5, 12:06'",
        "description": '"Pentagon AARO head admits UAP are real; White House coordinating release of unprecedented UAP material; triangular object spotted over US nuclear plant; Serpo exchange program debated"',
    },
    "ufo-news-digest-202605050503": {
        "title": '"🛸 UFO/UAP News Flash — May 5, 13:03"',
        "titleEn": "'🛸 UFO/UAP News Flash — May 5, 13:03'",
        "description": '"Trump whistleblower: Pentagon to release UFO classified files; military whistleblowers testify cover-up; scientist disappearances trigger FBI investigation; UFO researcher David Wilcock dies"',
    },
    "ufo-news-digest-202605050603": {
        "title": '"🛸 UFO/UAP News Flash — May 5, 14:03"',
        "titleEn": "'🛸 UFO/UAP News Flash — May 5, 14:03'",
        "description": '"Project Serpo controversy returns, Rep. Burlison tracks overseas giant UAP structure, California night vision triangle UFO, Doha storm mysterious orbs"',
    },
    "ufo-news-digest-202605050704": {
        "title": '"🛸 UFO/UAP News Flash — May 5, 15:04"',
        "titleEn": "'🛸 UFO/UAP News Flash — May 5, 15:04'",
        "description": '"Trump previews new UFO files; Corbell warns of mysterious craft surpassing US military in no-fly zones; Congresswoman demands 46 UAP videos; promises \\"non-human origin\\" evidence"',
    },
    "ufo-news-digest-202605050802": {
        "title": '"🛸 UFO/UAP News Flash — May 5, 16:02"',
        "titleEn": "'🛸 UFO/UAP News Flash — May 5, 16:02'",
        "description": '"NUFORC publishes full 1967 Fortuna radar investigation; Northern Michigan mysterious orbs; retired radar tech recounts 5,000 mph UFO; three US states independently legislating UFO research"',
    },
    "ufo-news-digest-202605050904": {
        "title": '"🛸 UFO/UAP News Flash — May 5, 17:04"',
        "titleEn": "'🛸 UFO/UAP News Flash — May 5, 17:04'",
        "description": '"Trump previews \\"very interesting\\" UFO files; FBI investigates scientist disappearances; Congressional hearing shows Hellfire missile hitting UFO; White House registers Aliens.gov domain"',
    },
}

def parse_source(slug):
    """Extract frontmatter fields from source."""
    with open(f"{blog_dir}/{slug}.md") as f:
        content = f.read()
    parts = content.split(/^---\s*$/m)
    # Use simpler split
    return content

for slug in extra_slugs:
    with open(f"{blog_dir}/{slug}.md") as f:
        content = f.read()
    
    # Split frontmatter
    parts = re.split(r'^---\s*$', content, maxsplit=2, flags=re.MULTILINE)
    if len(parts) < 3:
        print(f"ERROR: Bad frontmatter in {slug}")
        continue
    
    raw_fm = parts[1].strip()
    body = parts[2].strip()
    
    # Parse fields
    fields = {}
    for line in raw_fm.split('\n'):
        m = re.match(r'^(\w+):\s*(.*)', line)
        if m:
            fields[m.group(1)] = m.group(2).strip()
    
    pubDate = fields.get('pubDate', '')
    updatedDate = fields.get('updatedDate', '')
    author = fields.get('author', '')
    heroImage = fields.get('heroImage', '')
    image = fields.get('image', '')
    tags_cn = fields.get('tags', '')
    title = fields.get('title', '').strip('"').strip("'")
    description = fields.get('description', '').strip('"').strip("'")
    
    en = extra_en[slug]
    
    # Determine en tags
    en_tags = '["UFO", "UAP", "news", "auto-update"]'
    
    # === Create blog-zh ===
    description_en = ""
    if '特朗普' in description or 'Trump' in description:
        description_en = "Trump UFO file developments, global sighting reports, government disclosure progress"
    elif 'Fortuna' in description:
        description_en = "NUFORC Fortuna radar investigation, Northern Michigan orbs, retired radar technician account"
    elif 'Serpo' in description or 'Corbell' in description:
        description_en = "Latest UFO/UAP news: significant developments in disclosure movement"
    elif 'AARO' in description:
        description_en = "Pentagon AARO acknowledges UAP reality, White House coordinating unprecedented UAP disclosure"
    else:
        description_en = "UFO/UAP news summary covering latest developments in disclosure, sightings, and investigations"
    
    # Get title for en
    en_title_text = title.replace('全球UFO/UAP新聞摘要', 'Global UFO/UAP News Digest') \
                         .replace('UFO/UAP 快訊', 'UFO/UAP News Flash') \
                         .replace('05月04日', 'May 4') \
                         .replace('05月05日', 'May 5') \
                         .replace('5月4日', 'May 4') \
                         .replace('5月5日', 'May 5') \
                         .replace('5月05日', 'May 5') \
                         .replace('12:06', '12:06') \
                         .replace('13:03', '13:03') \
                         .replace('14:03', '14:03') \
                         .replace('15:04', '15:04') \
                         .replace('16:02', '16:02') \
                         .replace('17:04', '17:04')
    
    # Write blog-zh
    zh_fm = "---\n"
    if '新聞摘要' in title:
        # Digest format - add titleEn and descriptionEn
        digest_date = "2026-05-05"
        title_en_zh = f"'🛸 Global UFO/UAP News Digest — {digest_date}'"
        desc_en_zh = "'Daily curated roundup of global UFO/UAP news: government disclosures, authoritative reports, and research progress'"
        zh_fm += f"titleEn: {title_en_zh}\n"
        zh_fm += f"descriptionEn: {desc_en_zh}\n"
        zh_fm += f"title: {repr(title)}\n"
        zh_fm += f"description: {repr(description)}\n"
        zh_fm += f"pubDate: {pubDate}\n"
        if updatedDate:
            zh_fm += f"updatedDate: {updatedDate}\n"
        if author:
            zh_fm += f"author: {author}\n"
        if heroImage:
            zh_fm += f"heroImage: {heroImage}\n"
        elif image:
            zh_fm += f"heroImage: {image}\n"
        zh_fm += f"tags: {tags_cn}\n" if tags_cn else ""
    else:
        # News flash format
        zh_fm += f"titleEn: {repr(title)}\n"
        zh_fm += f"descriptionEn: {repr(description_en)}\n"
        zh_fm += f"title: {repr(title)}\n"
        zh_fm += f"description: {repr(description)}\n"
        zh_fm += f"pubDate: {pubDate}\n"
        if updatedDate:
            zh_fm += f"updatedDate: {updatedDate}\n"
        if author:
            zh_fm += f"author: {author}\n"
        if heroImage:
            zh_fm += f"heroImage: {heroImage}\n"
        elif image:
            zh_fm += f"heroImage: {image}\n"
        zh_fm += f"tags: {tags_cn}\n"
    zh_fm += "---\n\n" + body
    
    with open(f"{zh_dir}/{slug}.md", 'w') as f:
        f.write(zh_fm)
    print(f"✓ blog-zh: {slug}")
    
    # === Create blog-en ===
    en_fm = "---\n"
    en_fm += f"title: {en['title']}\n"
    en_fm += f"titleEn: {en['titleEn']}\n"
    en_fm += f"description: {en['description']}\n"
    en_fm += f"pubDate: {pubDate}\n"
    if updatedDate:
        en_fm += f"updatedDate: {updatedDate}\n"
    if author:
        en_fm += f"author: {author}\n"
    if heroImage:
        en_fm += f"heroImage: {heroImage}\n"
    elif image:
        en_fm += f"heroImage: {image}\n"
    en_fm += f"tags: {en_tags}\n"
    
    # Simple English body
    body_en = f"> **Daily UFO/UAP News** — {pubDate}\n\n"
    body_en += "## 📰 Today's Headlines\n\n"
    body_en += f"- {en['description']}\n\n"
    body_en += "---\n\n"
    body_en += "*This article was generated by an automated news monitoring system.*\n"
    
    en_fm += "---\n\n" + body_en
    
    with open(f"{en_dir}/{slug}.md", 'w') as f:
        f.write(en_fm)
    print(f"✓ blog-en: {slug}")

print("\nAll 8 extra articles synced!")
