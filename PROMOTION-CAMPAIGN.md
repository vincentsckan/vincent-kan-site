# 🚀 DisclosureHK Worldwide Promotion Campaign

**Date:** 2026-05-04
**Site:** https://www.disclosurehk.com
**Articles:** 213+ UFO/UAP articles (English + Chinese)

## ✅ COMPLETED TASKS

### Technical SEO Improvements

1. **✅ Google News Sitemap Generator** → Created `scripts/generate-news-sitemap.js`
   - Generates `public/news-sitemap.xml` for Google News inclusion
   - Run `node scripts/generate-news-sitemap.js` before each deploy

2. **✅ FAQ Schema Generator** → Created `scripts/generate-faq-schema.js`
   - Generates FAQPage structured data for top 6 cases
   - Run `node scripts/generate-faq-schema.js` to regenerate
   - Helps Google show FAQ rich snippets in search results

3. **✅ robots.txt** → Already configured with sitemap reference
4. **✅ Open Graph / Twitter Card metadata** → Already implemented in BaseHead.astro
5. **✅ JSON-LD structured data** → WebSite schema with SearchAction already present
6. **✅ Canonical URLs** → Already configured
7. **✅ hreflang tags** → EN/ZH-Hant bilingual support already configured
8. **✅ RSS feed** → Already generating via `rss.xml.js`

### Analytics

1. **✅ GoatCounter** → Already running at `vincentkan.goatcounter.com` (privacy-first, no cookies)
2. **⚠️ Google Analytics placeholder** → `G-XXXXXXXXXX` needs real GA4 ID

---

## 📋 PENDING ACTIONS (Require Browser / Manual Steps)

### PHASE 1: Social Media — Reddit

**Best articles for each subreddit:**

**r/UFOs** (1.8M members — broad audience, well-researched content does well)
1. **Nimitz Incident** → https://www.disclosurehk.com/blog/ufo-case-nimitz/
   *Title:* "The 2004 USS Nimitz Tic-Tac UFO — Pentagon confirmed, still unexplained 22 years later"
2. **Grusch Hearings** → https://www.disclosurehk.com/blog/ufo-grusch-hearing/
   *Title:* "David Grusch testifying under oath: 'The US has recovered non-human craft' — the full case"
3. **Phoenix Lights** → https://www.disclosurehk.com/blog/ufo-case-phoenix-lights/
   *Title:* "The Phoenix Lights (1997): The governor was among thousands who saw a V-shaped craft miles wide"
4. **Belgian UFO Wave** → https://www.disclosurehk.com/blog/ufo-case-belgium-wave/
   *Title:* "NATO F-16s scrambled: The 1989 Belgian UFO wave that terrified Europe"
5. **Tehran F-4 vs UFO** → https://www.disclosurehk.com/blog/ufo-case-tehran/
   *Title:* "1976: Two Iranian F-4s lost power when approaching a UFO — classified DIA files confirm"
6. **Ariel School** → https://www.disclosurehk.com/blog/ufo-case-ariel/
   *Title:* "Ariel School (1994): 62 Zimbabwean children described the same alien encounter independently — 30 years later, they still stand by it"

**r/UFObelievers** (more welcoming, focus on interesting cases)
7. **Travis Walton** → https://www.disclosurehk.com/blog/ufo-case-travis-walton/
   *Title:* "Travis Walton was missing for 5 days after a UFO encounter. He passed a polygraph. Here's the full story."
8. **Rendlesham Forest** → https://www.disclosurehk.com/blog/ufo-case-rendlesham/
   *Title:* "Britain's Roswell: US Air Force personnel encountered a craft in Rendlesham Forest, Christmas 1980"
9. **USS Omaha Swarm** → https://www.disclosurehk.com/blog/ufo-case-uss-omaha/
   *Title:* "Pentagon-confirmed: The USS Omaha filmed a swarm of UFOs and a sphere entering the ocean (2019)"

**r/aliens** (pop culture + serious mix)
10. **Turkey UFO Video** → https://www.disclosurehk.com/blog/ufo-case-turkey/
    *Title:* "The Kumburgaz, Turkey UFO footage — over 3 hours recorded, possible occupants visible"
11. **Cash-Landrum** → https://www.disclosurehk.com/blog/ufo-case-cash-landrum/
    *Title:* "Three women were burned by radiation from a UFO in 1980. Doctors confirmed it. The case went to the Supreme Court."

**r/HighStrangeness** (weird, fringe, paranormal)
12. **CIA UFO Files** → https://www.disclosurehk.com/blog/ufo-cia-files/
    *Title:* "2,700 pages of declassified CIA UFO files — what the intelligence community actually knew"
13. **Animal Mutilations** → https://www.disclosurehk.com/blog/ufo-animal-mutilation/
    *Title:* "3,000+ cattle mutilated since the 1960s with surgical precision and no blood — FBI investigated UFO links"

**r/UFOB** (serious discussion, evidence-based)
14. **JAL Flight 1628** → https://www.disclosurehk.com/blog/ufo-case-jal1628/
    *Title:* "747 cargo jet pursued by a giant UFO over Alaska for 50 minutes — FAA radar confirmed"
15. **Shag Harbour** → https://www.disclosurehk.com/blog/ufo-case-shag-harbour/
    *Title:* "Canada's official UFO case: A craft crashed into the ocean, Navy searched, government files released"

**Pro-tip for Reddit posting:**
- Create the Reddit account **disclosurehk** or use Vincent's personal
- Post 1 article per day max across all subreddits (don't spam)
- Always engage in the comments
- Never link directly to multiple articles in one post
- Flair posts appropriately
- **For r/UFOs**: Message mods first with your site info and ask permission

### PHASE 1: X/Twitter

**Re-auth required:**
```bash
# Need OAuth2 credentials from X Developer Portal
# Vincent needs to:
# 1. Go to https://developer.twitter.com/en/portal/dashboard
# 2. Create a new Project/App or find existing credentials
# 3. Note the Client ID and Client Secret
# 4. Run:
xurl auth apps add disclosurehk --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
xurl auth oauth2
xurl post "Test post from disclosurehk! 🛸"
```

**Suggested posting schedule (1-2x daily):**
- Morning: Daily News Digest highlight with link
- Evening: Classic case of the day
- Use media (images from the site)
- Threads work well (3-5 tweets summarizing a case)

### PHASE 1: Facebook

**Suggestion:** Create a "DisclosureHK" Facebook Page
- Page category: Science & Education / News & Media
- Post the same content as X/Twitter
- Join UFO groups:
  - UFO/UAP Disclosure (100K+ members)
  - UFOs & Aliens Discussion
  - Hong Kong UFO/UAP Group (local audience)
- Share articles with a compelling intro question

### PHASE 3: Forum Communities

**AboveTopSecret.com** — Create account, participate in discussions
**GodlikeProductions** — More fringe but active
**Telegram channels** — Share in English UFO groups
**Discord servers** — UFO Discord, UAP Discovery
**Quora** — Answer questions about specific UFO cases with links

### PHASE 4: Content Syndication

**Medium Publication Steps:**
1. Create account at medium.com
2. Create publication "DisclosureHK"
3. Export/rewrite top 5 articles:
   - Nimitz Tic-Tac
   - Grusch Hearings
   - Phoenix Lights
   - Belgian UFO Wave
   - CIA UFO Files
4. Include backlinks to disclosurehk.com
5. Use the "Import Story" feature

**Quora Strategy:**
- Search "What happened at [case]?"
- Answer with research from the site
- Include 1-2 links per answer

### PHASE 2: Google Analytics Setup

**Steps for Vincent:**
1. Go to https://analytics.google.com → Admin → Create Property
2. Name: "DisclosureHK"
3. Reporting timezone: Hong Kong (UTC+8)
4. Select "Web" as platform
5. URL: https://www.disclosurehk.com
6. Get tracking ID (G-XXXXXXXXXX)
7. Replace in `src/components/BaseHead.astro`
8. Commit and push

### PHASE 2: Google Search Console

**Steps:**
1. Go to https://search.google.com/search-console
2. Add property: https://www.disclosurehk.com
3. Verify ownership via:
   - DNS TXT record (recommended for GitHub Pages)
   - Or HTML file upload to /public
4. Submit sitemaps:
   - https://www.disclosurehk.com/sitemap-index.xml
   - https://www.disclosurehk.com/news-sitemap.xml

---

## 📊 Traffic Dashboard Setup (Post-GA4)

Once GA4 is live, track these metrics:
1. **Page views by article** — Which case articles get most traffic
2. **Traffic sources** — Where visitors come from (Reddit, X, organic)
3. **Engagement rate** — Time on site, scroll depth
4. **Top landing pages** — What brings people in
5. **User geography** — Where readers are (expected: US, UK, Hong Kong)
6. **Language preference** — English vs Chinese article views

**Conversion tracking goals:**
- Article read (scroll > 50% of page)
- Comment posted (Giscus engagement)
- Return visit within 7 days
- Click through to hearing live stream

---

## 🔄 Ongoing Strategy Suggestions

### Daily (1-2 minutes)
- Check GoatCounter stats
- Post 1 X/Twitter update
- Reply to Reddit comments

### Weekly (10-15 minutes)
- Submit 1-2 Reddit posts to different subreddits
- Answer 1-2 Quora questions
- Check for new communities/forums
- Review Search Console for crawl errors

### Monthly
- Check Google News inclusion status
- Review analytics for top-performing content
- Update FAQ schema for newly popular articles
- Post to Medium (repurpose best article)
- Check backlinks and fix broken links

### Content Ideas
- "Top 10 UFO Cases You Haven't Heard About" (listicle, great for snippets)
- "UFO Disclosure Timeline" (interactive, gets backlinks)
- "What Each Government Says About UFOs" (comparison table)
- "How to Report a UFO Sighting" (practical, link-worthy)

---

## 📝 Notes

- **xurl** needs OAuth2 re-auth (Vincent needs to provide client credentials)
- **Browser automation** currently unavailable on this server
- **GoatCounter** is already providing privacy-first analytics
- **213+ articles** is great content depth — the site is content-rich and needs distribution, not more content
- **Bilingual** is a unique selling point — leverage the Chinese content for Chinese-language forums
