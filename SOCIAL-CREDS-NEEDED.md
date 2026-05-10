# DisclosureHK — Social Media & Automation Status

**Last updated: May 10, 2026**

## ✅ Already Working (Zero Credentials)

| Feature | Status | How |
|---------|--------|-----|
| **Telegram Auto-Post** | ✅ **LIVE** | Uses your existing bot token. Bash script posts latest article to Telegram during build-deploy. Already tested. |
| **News Engine (RSS)** | ✅ **LIVE** | `realtime-ufo-news` cron job runs every 5 minutes. Scrapes 7 RSS sources, writes posts, runs full build-deploy pipeline, delivers alerts to Telegram. |
| **SEO Optimization** | ✅ **LIVE** | Meta descriptions, sitemap, canonical URLs, robots.txt, internal linking — all auto-optimized. 278 blog files validated and fixed. |
| **GitHub Deploy** | ✅ **LIVE** | Auto-pushes to GitHub during build-deploy. |
| **SEO Ping** | ✅ **LIVE** | Pings Google/Bing after each deploy. |
| **Full Build Pipeline** | ✅ **LIVE** | `internal-links.py` → `generate-news-sitemap.cjs` → `npm run build` → `seo-engine.py` → git push → `seo-ping.py` → `social-auto-post.sh all` |
| **Cron Jobs (6 total)** | ✅ **Working** | All deliver to your Telegram. YAML validation issues on 278 blog files have all been auto-fixed. |

## ❌ Needs Reddit Credentials

**File:** `scripts/reddit-auto-poster.py` (PRAW 7.8.1 installed)

```bash
# 1. Go to https://www.reddit.com/prefs/apps
# 2. Create a "script" app → get client_id and client_secret
# 3. Set env vars (or add to crontab):
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USERNAME="DisclosureHK"
export REDDIT_PASSWORD="your_password"

# Test:
python3 scripts/reddit-auto-poster.py --preview
```

Once set, the `reddit-weekly-cases` cron (Mon/Wed/Fri @ 12:00 UTC) will auto-post case studies.
Also `social-auto-post.sh` will include Reddit during daily runs.

## ❌ Needs X/Twitter Credentials

**File:** `scripts/twitter-auto-post.cjs` (uses `xurl`)

```bash
# 1. Go to https://developer.twitter.com/en/portal/dashboard
# 2. Create a Project + App (Free tier: 1500 posts/month)
# 3. xurl auth apps add
# 4. node scripts/twitter-auto-post.cjs
```

Once set, the `social-promotion-daily` cron (daily @ 02:00 and 14:00 UTC) will auto-post to X.
Also `social-auto-post.sh` will include X during build-deploy.

## Cron Jobs Summary

| Job | Schedule | Status | Delivers To |
|-----|----------|--------|-------------|
| `realtime-ufo-news` | Every 5 min | ✅ Working | Your Telegram |
| `social-promotion-daily` | Daily 02:00, 14:00 UTC | ✅ Working (Telegram only; X/Reddit need creds) | Your Telegram |
| `reddit-weekly-cases` | Mon/Wed/Fri 12:00 UTC | ✅ Working (Telegram summary; Reddit post needs creds) | Your Telegram |
| `traffic-report-weekly` | Sun 08:00 HKT | ✅ Working | Your Telegram |
| `gateway-health` | Every 15 min | ✅ Working | Telegram |
| `openclaw-health-monitor` | Every 10 min | ✅ Working | WhatsApp |

## Quick Credential Setup

Once you want to enable X and Reddit:

```bash
# Set env vars
export REDDIT_CLIENT_ID="xxx"
export REDDIT_CLIENT_SECRET="xxx"
export REDDIT_USERNAME="DisclosureHK"
export REDDIT_PASSWORD="xxx"

# Auth xurl
xurl auth apps add

# Test both
python3 scripts/reddit-auto-poster.py --preview
node scripts/twitter-auto-post.cjs
```

No code changes needed — scripts detect credentials and gracefully skip when absent.
