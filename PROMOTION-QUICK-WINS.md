# 🚀 DisclosureHK Promotion Quick Wins

**Goal:** Drive traffic to [disclosurehk.com](https://www.disclosurehk.com) with <30 minutes/day

---

## 📦 Prep Work (30 min, do once)

- [ ] Create a Reddit account for DisclosureHK (or use personal) with some karma
- [ ] Join all target subreddits (r/UFOs, r/UAP, r/aliens, r/HighStrangeness, r/UFOB, r/StrangeEarth, r/UFObelievers)
- [ ] Bookmark the template file: `REDDIT-POST-TEMPLATES.md`
- [ ] Set up a simple tracking system: the `.reddit-post-state.json` file or a notes app

---

## Day 1 — Reddit Launch

- [ ] **Post Template 1** (Breaking News) → r/UFOs
  - If no breaking news, use Template 2 (Nimitz) → r/UAP
- [ ] **Post Template 2** (Nimitz Case) → r/UAP *(skip if used above)*
- [ ] **Engage:** Scroll r/UFOs hot/new for 5 min. Comment on 3 threads with useful info. Drop a link to disclosurehk only if relevant.
- [ ] **Mark as done:** `node scripts/reddit-auto-post.cjs --mark-failed <id>` or just note in state file

> **Time:** ~25 min

---

## Day 2 — Reddit Continued

- [ ] **Post Template 3** (Grusch) → r/UFOs
- [ ] **Post Template 4** (Phoenix Lights) → r/aliens
- [ ] **Engage:** Reply to comments on yesterday's posts. Answer questions. Build thread depth.
- [ ] **Engage 2:** Find 2-3 relevant discussions on r/HighStrangeness or r/UFOB. Add value + link.

> **Time:** ~25 min

---

## Day 3 — YouTube Comments

- [ ] Watch 1 popular UFO video (Why Files, Project Unity, or recent news clip)
- [ ] Leave a thoughtful comment that adds value: "Great breakdown. I've been compiling sources on this case at disclosurehk.com — there's a lot more data if anyone's interested."
- [ ] Repeat for 2 more videos (total 3 comments)
- [ ] **Optional:** If you see yesterday's Reddit posts have good engagement, reply more

> **Time:** ~20 min

---

## Day 4 — Cross-Platform

- [ ] **Post Template 5** (News Roundup) → r/UAP
- [ ] **Post Template 7** (Discussion Starter) → r/UFOB
- [ ] **Check GoatCounter** — see which articles are getting traffic → https://vincentkan.goatcounter.com/
- [ ] **Note what's working:** Save 2-3 top-performing headlines for inspiration

> **Time:** ~20 min

---

## Day 5 — Local / Bilingual Angle

- [ ] **Post Template 10** (Bilingual / HK Angle) → r/UFOs
- [ ] **Find HK-specific forums:** Search "Hong Kong UFO forum" "香港 UFO 討論區" — share the Chinese content
- [ ] **Comment on a non-English UFO post** if you find one (Bilibili, Zhihu, HK discussion board)

> **Time:** ~20 min

---

## Day 6 — Deep Dive

- [ ] **Post Template 8** (Lesser-Known: Japan 1235) → r/HighStrangeness
- [ ] **Post Template 9** (Roswell) → r/aliens
- [ ] **Engage:** Reply to all comments from this week. People respond positively when OPs engage.

> **Time:** ~25 min

---

## Day 7 — Review & Rest

- [ ] Check GoatCounter analytics for the week
- [ ] Note which subreddits/templates got the most engagement
- [ ] Update `.reddit-post-state.json` with posted template IDs
- [ ] Plan Week 2 topics
- [ ] **Rest day!** (or answer comments if they're blowing up)

> **Time:** ~10 min

---

## Week 2 — Outreach

### Monday
- [ ] **Post Template 6** (Educational: What is Disclosure?) → r/UFOscience
- [ ] **Email 1 YouTube creator** (Why Files / Jesse Michels / That UFO Podcast) with your site
  - Keep it short: "I run disclosurehk.com — bilingual UAP site. Would love to provide research for a future episode on Asian UFO cases."

### Tuesday
- [ ] **Answer 2 questions on Quora** about UFO cases (link disclosurehk)
- [ ] **Join UFO Discord servers,** lurk for a few days before sharing

### Wednesday
- [ ] **Medium repost:** Take your best article (Nimitz or Grusch), repost on Medium with canonical link back to disclosurehk
- [ ] **Share to 1 new platform** (Telegram UFO group, Forum)

### Thursday
- [ ] **Email 2 journalists** from the outreach list — short pitch about bilingual UAP coverage
- [ ] **Look for HARO/HelpAReporter queries** about UFOs

### Friday
- [ ] **Post to r/UFOs** — recycle a template that did well, but reword it
- [ ] **Check for comments across all platforms** — respond to everything within 24h

### Weekend
- [ ] Write or plan 1 original text post for next week
- [ ] Review analytics: which content type gets most traffic?

---

## 📊 Key Metrics to Track (Weekly)

| Metric | Target | Check |
|--------|--------|-------|
| Reddit post engagement (comments) | >10 per post | |
| Website traffic from Reddit | 50+ clicks/week | GoatCounter |
| YouTube comments placed | 3-5/week | |
| New backlinks | 1-2/week | Search Console |
| Total weekly promotion time | <30 min/day | |

---

## ❌ Common Mistakes to Avoid

- **Don't** spam the same link to 5 subreddits in one day (looks like a bot)
- **Don't** post only links without context (Redditors downvote)
- **Don't** ignore comments (kills engagement — update them conversationally)
- **Don't** use affiliate or tracking links (Reddit blocks them)
- **Don't** post on weekends before noon EST (low engagement)
- **Don't** post to r/Skeptic unless you have strong evidence (they'll tear it apart)

---

## 🛠️ Quick Reference

```
# See what to post next
node scripts/reddit-auto-post.cjs

# List all templates with status
node scripts/reddit-auto-post.cjs --list

# Export for manual posting
node scripts/reddit-auto-post.cjs --export-csv

# Reset state after all posted
node scripts/reddit-auto-post.cjs --reset
```

> **Last Updated:** 2026-05-05
