#!/usr/bin/env python3
"""
Reddit Auto-Poster for DisclosureHK
- Posts one case study per run to configured subreddits
- Tracks what's been posted in .reddit-auto-state.json
- Uses PRAW to post via Reddit API
- Run: python3 scripts/reddit-auto-poster.py

Environment variables needed (or set in .env):
  REDDIT_CLIENT_ID=xxx
  REDDIT_CLIENT_SECRET=xxx
  REDDIT_USERNAME=DisclosureHK
  REDDIT_PASSWORD=xxx
"""

import json
import os
import re
import sys
import glob
from datetime import datetime, timezone

# ─── Configuration ──────────────────────────────────────────────────────────
SITE_URL = "https://www.disclosurehk.com"
STATE_FILE = os.path.join(os.path.dirname(__file__), "..", ".reddit-auto-state.json")
BLOG_EN_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "blog-en")

# Subreddit mapping: which cases go where
# Format: (slug_starts_with, subreddit, post_title_template)
SUBREDDIT_ROUTES = [
    # Major cases -> r/UFOs (largest audience)
    ("ufo-case-nimitz", "UFOs", "The 2004 Nimitz Tic-Tac: Pentagon confirmed, still unexplained — full breakdown"),
    ("ufo-case-phoenix-lights", "UFOs", "The Phoenix Lights (1997): The governor saw it too — a V-shaped craft miles wide"),
    ("ufo-case-belgium-wave", "UFOs", "NATO F-16s scrambled: The 1989 Belgian UFO wave"),
    ("ufo-case-roswell", "UFOs", "Roswell (1947): What actually happened and why it still matters"),
    ("ufo-case-ariel", "UFOs", "Ariel School (1994): 62 children described the same encounter independently"),
    ("ufo-case-rendlesham", "UFOs", "Britain's Roswell: US Air Force encountered a craft in Rendlesham Forest, 1980"),
    ("ufo-case-tehran", "UFOs", "1976: Two Iranian F-4s lost power approaching a UFO — DIA files confirm"),
    ("ufo-case-travis-walton", "UFObelievers", "Travis Walton was missing 5 days after a UFO. He passed a polygraph."),
    ("ufo-case-turkey", "aliens", "Turkey UFO footage: 3+ hours recorded with possible occupants visible"),
    ("ufo-case-cash-landrum", "aliens", "Three women burned by radiation from a UFO — doctors confirmed, went to Supreme Court"),
    ("ufo-case-uss-omaha", "UAP", "Pentagon-confirmed: USS Omaha filmed a swarm of UFOs entering the ocean"),
    ("ufo-case-jal1628", "UFOB", "747 cargo jet pursued by a giant UFO over Alaska for 50 min — FAA radar confirmed"),
    ("ufo-case-shag-harbour", "HighStrangeness", "Canada's official UFO: craft crashed into ocean, Navy searched, files released"),
    ("ufo-case-kenneth-arnold", "UFOs", "Kenneth Arnold (1947): The sighting that started the modern UFO era"),
    ("ufo-case-kecksburg", "HighStrangeness", "Kecksburg (1965): The 'NASA object' that fell from the sky — military sealed it"),
    ("ufo-case-sutton", "aliens", "The Sutton Farm encounter: West Virginia, 1952 — a craft landed and beings appeared"),
    ("ufo-case-ohare", "UAP", "O'Hare Airport (2006): A saucer hovered over Gate C17 for minutes — FAA employees saw it"),
    ("ufo-case-stephenville", "UFOB", "Stephenville (2008): Hundreds of Texans saw a mile-wide UFO — military admitted F-16s chased it"),
    ("ufo-case-marshall", "UFOs", "Marshall County (1973): A police chase with a UFO that paced their cruiser"),
    ("ufo-case-lubbock", "HighStrangeness", "Lubbock Lights (1951): Physics professors saw a V-formation of lights — it's still unexplained"),
    ("ufo-case-gobi", "UFOs", "The Gobi Desert UFO: A lesser-known case with compelling evidence"),
]

def parse_frontmatter(filepath):
    """Parse markdown frontmatter."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return None
    
    fm = {}
    for line in match.group(1).split('\n'):
        qm = re.match(r"^(\w+):\s*'(.+?)'\s*$", line)
        if qm:
            fm[qm.group(1)] = qm.group(2)
            continue
        kv = re.match(r'^(\w+):\s*(.+)$', line)
        if kv:
            fm[kv.group(1)] = kv.group(2).strip().strip("'\"")
    
    return fm, content

def generate_post(slug, subreddit, title):
    """Generate Reddit post text."""
    filepath = os.path.join(BLOG_EN_DIR, f"{slug}.md")
    if not os.path.exists(filepath):
        return None
    
    fm_data = parse_frontmatter(filepath)
    if not fm_data:
        return None
    
    fm, full_content = fm_data
    
    # Extract a good excerpt from the body (skip frontmatter, first paragraph)
    body = re.sub(r'^---\n.*?\n---\n', '', full_content, flags=re.DOTALL)
    body = re.sub(r'^>.*$', '', body, flags=re.MULTILINE)  # remove blockquotes
    body = re.sub(r'<div.*?>.*?</div>', '', body, flags=re.DOTALL)  # remove divs
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)  # remove images
    body = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', body)  # clean links
    body = re.sub(r'#+ ', '', body)  # remove headers
    body = re.sub(r'\*\*(.*?)\*\*', r'\1', body)  # clean bold
    body = re.sub(r'\n{3,}', '\n\n', body)  # normalize spacing
    
    lines = [l.strip() for l in body.split('\n') if l.strip() and not l.strip().startswith('```')]
    
    # Find the first substantive paragraph
    excerpt_lines = []
    char_count = 0
    for line in lines:
        if len(line) > 30:  # skip short lines
            excerpt_lines.append(line)
            char_count += len(line)
            if char_count > 800:
                break
    
    excerpt = '\n\n'.join(excerpt_lines[:5])  # max 5 paragraphs
    
    post = f"""**{title}**

{excerpt}

---

📖 Full deep-dive with sources, documents, and analysis:
🔗 {SITE_URL}/blog/{slug}/

---

*I run DisclosureHK — a bilingual UFO/UAP research site cataloging cases, tracking disclosure news, and analyzing government documents. This is one of {len(SUBREDDIT_ROUTES)}+ cases we've documented with full source citations.*

What do you think about this case?
"""
    return post

def load_state():
    """Load posted state."""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {"posted": [], "failed": [], "last_posted": None}

def save_state(state):
    """Save posted state."""
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def preview():
    """Preview next unposted template."""
    state = load_state()
    
    print("📋 Reddit Auto-Poster — Template Status\n")
    print(f"{'#':>2} {'Route':<45} {'Status':<12}")
    print("-" * 60)
    
    for i, (slug, sub, title) in enumerate(SUBREDDIT_ROUTES, 1):
        key = f"{slug}->{sub}"
        if key in state.get("posted", []):
            status = "✅ Posted"
        elif key in state.get("failed", []):
            status = "❌ Failed"
        else:
            status = "⏳ Pending"
        
        slug_short = slug[:40] + "…" if len(slug) > 40 else slug
        sub_short = f"r/{sub}"
        print(f"{i:>2} {slug_short:<45} {status:<12} ({sub_short})")
    
    # Show pending count
    pending = [(s, su, t) for s, su, t in SUBREDDIT_ROUTES 
               if f"{s}->{su}" not in state.get("posted", [])
               and f"{s}->{su}" not in state.get("failed", [])]
    
    if pending:
        s, su, t = pending[0]
        print(f"\n📌 Next up: {t[:60]}… → r/{su}")
    else:
        print("\n🎉 All templates posted!")

def main():
    """Main entry point."""
    args = sys.argv[1:]
    
    if args and args[0] == "--preview":
        preview()
        return
    
    if args and args[0] == "--reset":
        save_state({"posted": [], "failed": [], "last_posted": None})
        print("🔄 State reset — all templates will be reposted.")
        return
    
    # Check if Reddit credentials are configured
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    username = os.environ.get("REDDIT_USERNAME")
    password = os.environ.get("REDDIT_PASSWORD")
    
    if not all([client_id, client_secret, username, password]):
        # No credentials — operate in dry-run / preview mode
        print("⚠️ Reddit credentials not configured. Running in PREVIEW mode.\n")
        print("   Set these env vars to enable actual posting:")
        print("   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD")
        print()
        preview()
        return
    
    # Credentials present — import PRAW
    try:
        import praw
    except ImportError:
        print("❌ PRAW not installed. Run: pip3 install praw")
        sys.exit(1)
    
    # Initialize Reddit
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        username=username,
        password=password,
        user_agent=f"DisclosureHK-UFO-Bot/1.0 (by u/{username})"
    )
    
    state = load_state()
    
    # Find next unposted template
    for slug, subreddit_name, title in SUBREDDIT_ROUTES:
        key = f"{slug}->{subreddit_name}"
        if key in state.get("posted", []) or key in state.get("failed", []):
            continue
        
        print(f"📝 Posting: {title[:60]}… → r/{subreddit_name}")
        
        post_text = generate_post(slug, subreddit_name, title)
        if not post_text:
            print(f"   ❌ Could not generate post for {slug}")
            state.setdefault("failed", []).append(key)
            continue
        
        try:
            subreddit = reddit.subreddit(subreddit_name)
            submission = subreddit.submit(
                title=title,
                selftext=post_text,
                send_replies=True
            )
            
            # Flair it if possible
            try:
                flair_text = "UFO Case Study" if "UFOB" != subreddit_name else "Case Study"
                submission.flair.select({"text": flair_text})
            except Exception:
                pass
            
            print(f"   ✅ Posted: https://redd.it/{submission.id}")
            state.setdefault("posted", []).append(key)
            state["last_posted"] = datetime.now(timezone.utc).isoformat()
            save_state(state)
            return  # One post per run
        
        except Exception as e:
            print(f"   ❌ Failed: {e}")
            state.setdefault("failed", []).append(key)
            save_state(state)
    
    # Check if all done
    posted_count = len(state.get("posted", []))
    total = len(SUBREDDIT_ROUTES)
    print(f"\n📊 Posted {posted_count}/{total} templates.")
    if posted_count >= total:
        print("🎉 All done! Add more templates to SUBREDDIT_ROUTES.")

if __name__ == "__main__":
    main()
