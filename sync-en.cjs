const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const enDir = 'src/content/blog-en';

const slugs = [
    'ufo-breaking-202605042218',
    'ufo-filler-202605041800',
    'ufo-filler-202605050200',
    'ufo-news-digest-20260504-evening',
    'ufo-news-digest-20260504-evening-1',
    'ufo-news-digest-202605041504',
    'ufo-news-digest-202605041703',
    'ufo-news-digest-202605041803',
    'ufo-news-digest-202605042003',
    'ufo-news-digest-202605042103',
    'ufo-news-digest-202605042203',
    'ufo-news-digest-202605042306',
    'ufo-news-digest-20260505-morning',
    'ufo-news-digest-202605050005',
    'ufo-news-digest-202605050103',
    'ufo-news-digest-202605050203',
    'ufo-news-digest-202605050303',
];

function parseFrontmatterFull(content) {
    const parts = content.split(/^---\s*$/m);
    if (parts.length < 3) return { rawFm: '', body: content };
    return { rawFm: parts[1], body: parts.slice(2).join('---').trim() };
}

function extractFields(rawFm) {
    const lines = rawFm.split('\n');
    const fields = {};
    let currentKey = null;
    let currentVal = [];
    
    function flush() {
        if (currentKey) {
            fields[currentKey] = currentVal.join('\n');
            currentVal = [];
            currentKey = null;
        }
    }
    
    for (const line of lines) {
        const keyMatch = line.match(/^(\w+):\s*(.*)/);
        if (keyMatch) {
            flush();
            currentKey = keyMatch[1];
            currentVal = [line];
        } else if (currentKey && (line.startsWith('  ') || line.startsWith('- '))) {
            currentVal.push(line);
        }
    }
    flush();
    return fields;
}

// English translations for body content
const enBodyMap = {
  'ufo-breaking-202605042218': `> 🔴 **Breaking News!** Today (May 4), Liberation Times published a bombshell investigation: Pentagon UFO office (AARO) Director Dr. Jon Kosloski publicly admitted for the first time that UAP are "real anomalous phenomena" that he cannot understand despite his physics and engineering background. Former Director Tim Phillips went further, claiming to have seen UAP demonstrate "astonishing performance that no known human system can achieve"! The White House is preparing to release never-before-seen UFO material to the public.

![Breaking UFO News](/vincent-kan-site/_astro/blog-placeholder-1.Bx0Zcyzv.jpg)

---

## 🚨 Headline: Pentagon UFO Office Admits "UAP Are Real"

### 1️⃣ White House Prepares to Release Unprecedented UFO Material

Liberation Times published a blockbuster report today by Christopher Sharp, citing US War Department officials stating that **the White House is coordinating multiple federal agencies to prepare the release of never-before-seen UAP (Unidentified Anomalous Phenomena) material**.

A War Department spokesperson stated:
> "AARO is working closely with the White House to integrate existing UAP records across agencies, pushing for the fastest possible release of never-before-seen UAP information. We welcome the President's push for transparency in this area."

This move is seen as the latest major development since Trump's February order requiring agencies to identify and release UFO documents.

| 📍 *Washington D.C., USA* | 📅 *May 4, 2026* | 🔍 *Official Disclosure* |

<div class="video-embed"><iframe src="https://www.youtube.com/embed/mY3ikVNFz2o" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

---

### 2️⃣ AARO Director: UAP Are "Really Peculiar, Perplexing"

Dr. Jon Kosloski, current Director of the Pentagon's UFO office (All-domain Anomaly Resolution Office), **publicly admitted for the first time** that even with his physics and engineering background, plus years of intelligence community experience, he cannot understand certain UAP phenomena.

He described UAP as "**really peculiar**" and "**perplexing**".

![AARO Director](/vincent-kan-site/_astro/blog-placeholder-2.Bx0Zcyzv.jpg)

This public admission is significant — this isn't speculation from civilian UFO enthusiasts, but the head of the Pentagon's official office speaking directly.

| 📍 *The Pentagon* | 📅 *May 2026* | 🔍 *Official Acknowledgment* |

<div class="video-embed"><iframe src="https://www.youtube.com/embed/--aPGyvS9w0" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

---

### 3️⃣ Former Director Phillips: UAP Demonstrate Non-Human Technology-Level Performance

Former AARO Director Tim Phillips revealed to Liberation Times that among the cases AARO has handled, **UAP demonstrate performance that no known human aircraft or spacecraft can achieve**.

Phillips emphasized:
> "We can determine it's not a known system, whether enemy or friendly. Reported by highly qualified observers, they witnessed genuinely astonishing performance — **things no known human system can do**."

While Phillips didn't directly call this extraterrestrial activity, his statement implies: **The existence of UFOs is no longer in doubt. The real questions are: Where do they come from? What do they want?**

| 📍 *USA* | 📅 *May 2026* | 🔍 *Former Official Testimony* |

<div class="video-embed"><iframe src="https://www.youtube.com/embed/CVkSTmLKEx8" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

---

### 4️⃣ Congresswoman Luna Demands 46 UFO Videos

Representative Anna Paulina Luna (Chair of the Federal Secrets Working Group) sent a letter to War Secretary Pete Hegseth on March 31, **demanding the release of over 46 UAP videos**, with a deadline of April 14.

When the War Department initially failed to respond promptly, Luna immediately blasted on X:
> "Nobody responded until we followed up. Nobody delivered the letter to the proper officials. How convenient. Anyway, we'll get the list. **I'm not waiting for a briefing with no clear date.** "

Luna directly warned:
> "The War Secretary is my friend and he supports the President. The President has authorized disclosure, so if someone at the Pentagon wants to play games, **they can step aside**."

Investigative journalist Jeremy Corbell said he has personally viewed most of the videos Luna is requesting, and together with George Knapp, has submitted specific file names and locations to Congress.

| 📍 *US Congress* | 📅 *April-May 2026* | 🔍 *Congressional Pressure* |

<div class="video-embed"><iframe src="https://www.youtube.com/embed/PHo5QEB1IX4" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

---

### 5️⃣ Whistleblowers Don't Trust AARO: Structural Conflict of the Intelligence System

The report also revealed AARO's deep-seated problem: While AARO ostensibly promotes transparency, its parent body — OUSDI&S (Office of the Under Secretary of Defense for Intelligence & Security) — is itself responsible for **intelligence, counterintelligence, security, and insider threat policy**.

Whistleblowers are required to submit sensitive UAP data into a system designed precisely to **protect, restrict, and control classified information**. This paradox makes many whistleblowers distrust AARO.

Former Director Phillips admitted that AARO does not have the authority to independently classify material, but can rely on existing classification guidelines to mark data as classified. This means if other agencies control evidence of UAP capture or reverse engineering, AARO can publicly claim "no evidence exists."

This institutional arrangement has been criticized as **a system that knows the truth but cannot speak it**.

| 📍 *USA* | 📅 *2026* | 🔍 *Institutional Issues* |

![UAP Transparency](/vincent-kan-site/_astro/blog-placeholder-4.Bx0Zcyzv.jpg)

---

## 📌 Key Summary

Tonight's news represents a significant milestone in recent UFO transparency progress:

| Key Point | Details |
|-----------|---------|
| 🔴 **AARO Director Admits** | UAP are real anomalous phenomena, cannot be explained by physics background |
| 🔴 **Former Director Confirms** | UAP performance exceeds any known human technology |
| 🔴 **White House Action** | Cross-agency coordination to release never-before-seen UFO material |
| 🔴 **Congressional Pressure** | Luna demands 46+ UAP videos, warns Pentagon not to play games |
| 🔴 **Structural Conflict** | AARO situated within intelligence system, whistleblowers can't trust it |

The pace of this story is clearly accelerating. From the AARO Director's own admission, to former Director's technical revelations, to the White House preparing to release new material — **this transparency movement appears to have entered a new phase**.

As the report concluded: The existence of UFOs is no longer the question. The real questions now are **where they come from and what they want**.

---

### 🔗 Source Links

- [Liberation Times: Pentagon's UFO Office Knows They're Real](https://www.liberationtimes.com/home/the-pentagons-ufo-office-knows-theyre-real-but-can-it-tell-the-truth)
- [Liberation Times: War Department Says White House Coordinating Release](https://www.liberationtimes.com/home/war-department-says-white-house-coordinating-release-of-never-before-seen-ufo-material)
- [War Department: Dr. Kosloski Press Roundtable](https://www.war.gov/News/Transcripts/Transcript/Article/3965734/dr-jon-kosloski-director-aaro-media-roundtable-on-the-fy24-consolidated-annual/)
- [Oversight House: Rep. Luna Letter to Sec. Hegseth](https://oversight.house.gov/release/luna-continues-transparency-investigation-into-uaps/)`,

  'ufo-filler-202605041800': `**March 1971. The Cold War was at its peak off the coast of Spain. The peaceful night at a radar base was shattered completely.**

This story comes from a Spanish corporal named **Jesus Jofre Mila**, one of the soldiers stationed at the base at the time. Decades later, he finally broke his silence and made the night's events public. This case remains one of the most detailed and unsettling accounts in Spain's military UFO archives.

## The Guard Dogs Sensed It First

It all started with the base's German Shepherds.

The normally well-trained patrol dogs suddenly became unusually aggressive that night, impossible to calm, as if sensing something unprecedented. Soon after, a sentry pointed to the sky — above the radar dome appeared a **disc-shaped flying object** emitting a golden light.

> Soldiers watched as the object slowly drifted across the horizon, then accelerated at an unbelievable speed toward the sea, vanishing instantly.

## Blinding Light Erupts from the Sea, Soldier Injured

The incident wasn't over.

Another soldier stationed by the coast later saw the same object descend rapidly toward the sea. When it contacted the water, it erupted in **an extremely powerful flash** bright enough to temporarily blind the soldier. He was found clutching his eyes, which remained red and swollen for days. Base medical personnel had no explanation for the injuries — there was no explosion, no aircraft, no weapon discharge at the scene.

## Strange Green Light and the "Figure" Beyond the Fence

That same night, Mila and another soldier took the dogs near the fence after spotting **a strange green light**.

As they approached, they felt the surrounding air "charged with electricity," like static. Mila said his tongue felt a tingling sensation, similar to touching a battery. Even the dog was unsettled, shaking its head as if in pain.

Then — they heard footsteps. **Heavy, fast, and close.**

## Shots Fired, But the Figure Didn't React

From the darkness emerged an extremely tall silhouette — estimated at **7 feet (about 2.1 meters)**.

The soldiers shouted warnings. When there was no response, one soldier fired first. Mila then fired multiple shots with his 9mm pistol. The muzzle flashes briefly illuminated the figure's silhouette —

What they saw was a completely non-human creature:

- Extremely tall and thin
- Pale skin
- Long, light-colored hair reaching its shoulders
- Wearing a tight, metallic-looking garment with a high collar
- A belt with an **inverted triangle symbol**

Most terrifying of all — **it showed no reaction to the gunfire at all.**

Mila described how time seemed to stand still in that moment. Then the "person" calmly turned around, walked slowly back toward the fence, and disappeared into the darkness.

## Fence Section Vanishes, Edges Charred

Soon after, they heard metallic sounds. By daylight, the evidence was undeniable —

A section of the base's inner fence, **about 50 centimeters wide, had completely vanished**. The edges showed burn marks, as if cut or dissolved. The outer fence was intact. There were no footprints, no debris, no mechanical explanation.

> The base ultimately had to temporarily patch the "vanished" gap with wire.

## Subsequent Dreams, Voices, and Larger-Scale Sightings

For several nights after the event, Mila experienced extremely vivid dreams replaying the encounter. One night he even reported hearing **overlapping voices inside his head** — initially unclear, then the message became distinct, though he hasn't disclosed the content.

On March 27, the lights appeared again — this time witnessed by **over a hundred base personnel**. The object hovered above the base for minutes.

On March 29, even stranger: Two military aircraft approached the object, then all three accelerated away at extreme speed. Officially, **no fighter jets were scrambled that night** — but radar operators disagree.

## US Investigators Arrive, Files Sealed

After the mass sighting, higher-ups got involved. Soldiers were interrogated one by one and required to write reports. Within days, **two American military personnel** and a Spanish Air Force officer arrived at the base.

According to witnesses:
- Soldiers were interrogated separately
- Directly ordered to "forget about this"
- Taken for photographs — using an unusually powerful flash that briefly blinded them

Later, Spanish UFO researcher Antonio Rivera reported seeing American technicians examining the cliff area where the object had gone into the sea. The official explanation was "radar maintenance." The case was subsequently **classified by the Spanish Ministry of Defense**.

## The Mystery Remains Unsolved

Over half a century later, the 1971 radar base incident still has no answers. No radar records, no declassification conclusions, no conventional explanation can fully account for:

- The unusual reaction of guard dogs
- The blinding light that temporarily injured a soldier
- A humanoid that ignored gunfire
- A fence section that vanished into thin air
- Mass sightings over consecutive nights

All that remains are the testimonies of trained military personnel — people who were initially disciplined, rather than praised, for speaking out.

| 📍 *Spanish Coastal Radar Base* | 📅 *March 25-29, 1971* | 🔍 *Military Encounter / Close Contact / Humanoid* |

---

## Related Video

<div class="video-embed"><iframe src="https://www.youtube.com/embed/bQdX55lvM_k" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

---

**Sources:**
- [Spanish Soldiers Fired on a Tall Humanoid After a UFO Landed Near Their Base (1971) - Latest UFO Sightings](https://www.latest-ufo-sightings.net/2026/01/spanish-soldiers-fired-on-a-tall-humanoid-after-a-ufo-landed-near-their-base-1971.html)
- Antonio Rivera Spanish UFO Research Archives
- Jesus Jofre Mila Interview Records`,

  'ufo-filler-202605050200': `## Brazil's UFO Secret History: The Air Force's "Operation Saucer" and the Amazon Blood-Sucking Light Mystery

When people think of UFO hotspots, most think of America's Area 51 or Roswell. But **Brazil in South America** can be considered one of the most active UFO reporting regions globally. The events that occurred in 1977 on the small island of **Colares** in the Amazon River delta in northern Brazil brought together everything: government investigation, mysterious beams, suspected injuries, and the suspicious death of a military investigator.

| 📍 *Colares Island, Brazil* | 📅 *1977* | 🔍 *Government Declassification / Witness Reports* |

---

### 🏝️ The "Light Attacks" at the Amazon River Mouth

In 1977, residents of Colares Island began reporting mysterious luminous objects in the sky. These weren't ordinary lights — they would **actively attack people**. According to locals, these lights would shoot down from the sky, striking humans and causing **burns, pinhole-shaped wounds**, and some even reported feeling like their "blood was being drained."

Locals called these mysterious lights **"Chupa Chupa"** (Portuguese for "suck-suck" — similar to the later Mexican legend of the Chupacabra).

These attacks terrified the island's residents, who would **light fires and set off fireworks** at night to drive away the aerial lights. Mayor José Ildone Favacho Soeiro ultimately called the Brazilian Air Force for help.

---

### 🛸 Air Force Deploys: Operação Prato (Operation Saucer)

The Brazilian Air Force officially launched **Operation Prato** (Operation Saucer), an investigation led by **Captain Uyrangê Bolivar Soares Nogueira de Hollanda Lima**.

The operation had two phases:
- **Phase 1**: October 20 - November 11, 1977
- **Phase 2**: November 25 - December 5, 1977

The investigation team consisted of Air Force and Brazilian National Intelligence Service (SNI) members, bringing camera equipment to Colares Island for on-site documentation.

According to official accounts, they did photograph lights in the sky, but the final conclusion was **"no anomalous phenomena found"**, the operation was closed, and documents were classified.

---

### 😵 The Captain's Suspicious Death and Conspiracy Theories

Twenty years later in 1997, Captain Uyrangê was interviewed by UFO researchers, speaking in detail about his and his team's experiences. **Three months** after the interview, he was found dead at home. The official cause was suicide by hanging with a bathrobe belt.

But the UFO research community widely considers this death highly suspicious — why would an upright Air Force officer suddenly commit suicide after a public interview? This fueled even more conspiracy theories around Operation Prato.

Famous UFO researcher **Jacques Vallée** even pointed out that some people have been killed by "microwave-level radiation" from UAP, with injuries consistent with microwave exposure.

---

### 📄 Declassified Documents and Modern Attention

It wasn't until the late 1990s that Operation Prato's related documents began to be gradually declassified. They can now be found at the **Brazilian National Archives (Arquivo Nacional)** . In 2008, a document about the Fort Itaipu incident was even released by the Brazilian Embassy in the US.

Interestingly, in 2010, the Brazilian Air Force formally established procedures for pilots encountering UFOs — meaning the official level has never actually denied these phenomena's existence.

---

### 📺 Related Video

<div class="video-embed"><iframe src="https://www.youtube.com/embed/7w0VwKJMWs4" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

---

### 📊 Brazil UFO Events at a Glance

| Year | Event | Notes |
|------|-------|-------|
| 1947 | José Higgins Contact Case | Three humanoid beings emerged from lens-shaped craft |
| 1957 | Ubatuba Metal Fragments | Tested as pure magnesium, origin unknown |
| 1957 | Antonio Villas Boas Abduction Case | One of the earliest widely-known alien abduction cases |
| 1957 | Fort Itaipu Attack | Sentries burned by UFO heat wave, entire base lost power |
| 1977 | **Colares Incident / Operation Prato** | Official Air Force investigation, injury reports |
| 1996 | Varginha Incident | Famous case allegedly involving captured alien beings |

---

### 🤔 Why So Many UFOs in Brazil?

Geographically, Brazil is located near the South Atlantic Anomaly, and the Amazon rainforest covers vast, sparsely populated areas — both factors make Brazil a breeding ground for UFO reports. The Brazilian government's attitude toward UFOs is more open than that of the US — the Air Force not only has formal investigations but also releases related documents.

If you're interested in international UFO cases, bookmark this site — we'll continue uncovering more non-US-centric mysterious events!

**Sources:**
- [Wikipedia: Operação Prato](https://en.wikipedia.org/wiki/Operação_Prato)
- [Wikipedia: UFO sightings in Brazil](https://en.wikipedia.org/wiki/UFO_sightings_in_Brazil)
- [ISTOÉ: A história oficial dos OVNIS no Brasil (2013)](https://web.archive.org/web/20160308210509/http://www.istoe.com.br/reportagens/11862_A+HISTORIA+OFICIAL+DOS+OVNIS+NO+BRASIL/)
- [Folha de S. Paulo: SNI investigou óvnis durante a ditadura (2009)](http://www1.folha.uol.com.br/fsp/brasil/fc1101200907.htm)
- [Wikipedia: Colares UFO flap](https://en.wikipedia.org/wiki/Colares_UFO_flap)`,

  'ufo-news-digest-20260504-evening': `> **Daily Update:** Latest developments in the global UFO/UAP disclosure movement. This page is updated automatically every day.

## 📰 Today's Headlines

- **[DisclosureHK — UFO/UAP Research &amp; News](https://www.disclosurehk.com/)**
  — Tech enthusiast • UFO/UAP researcher • AI player • Hong Konger

- **[🛸 2021 UAP Report — America's First Official UFO Report](https://www.disclosurehk.com/blog/ufo-2021-report/)**
  — On June 25, 2021, the US Office of the Director of National Intelligence released the first official UAP assessment report, acknowledging 144 cases as unexplained.

- **[👽 Gray Alien Autopsy — The Most Controversial UFO Film (1995)](https://www.disclosurehk.com/blog/ufo-alien-autopsy/)**
  — The 1995 "Alien Autopsy" footage that shocked the world, allegedly filmed by military personnel, was later revealed to be a hoax. This incident changed public trust in UFO media.

## 🔍 More Information

Want to learn more about UFO/UAP information? Browse other articles on this site or subscribe to the RSS feed for the latest updates.

---
*This article was generated by an automated news monitoring system. Published: 2026-05-04 16:05 UTC*`,

  'ufo-news-digest-20260504-evening-1': `> **Daily Update:** Latest developments in the global UFO/UAP disclosure movement. This page is updated automatically every day.

## 📰 Today's Headlines

- **[DisclosureHK — UFO/UAP Research &amp; News](https://www.disclosurehk.com/)**
  — Tech enthusiast • UFO/UAP researcher • AI player • Hong Konger

- **[🛸 2021 UAP Report — America's First Official UFO Report](https://www.disclosurehk.com/blog/ufo-2021-report/)**
  — On June 25, 2021, the US Office of the Director of National Intelligence released the first official UAP assessment report, acknowledging 144 cases as unexplained.

- **[👽 Gray Alien Autopsy — The Most Controversial UFO Film (1995)](https://www.disclosurehk.com/blog/ufo-alien-autopsy/)**
  — The 1995 "Alien Autopsy" footage that shocked the world, allegedly filmed by military personnel, was later revealed to be a hoax. This incident changed public trust in UFO media.

## 🔍 More Information

Want to learn more about UFO/UAP information? Browse other articles on this site or subscribe to the RSS feed for the latest updates.

---
*This article was generated by an automated news monitoring system. Published: 2026-05-04 20:05 UTC*`,

  'ufo-news-digest-202605041504': `> **UFO/UAP News — Automatically updated daily!** Today's highlights: Trump hints "interesting UFO files coming soon," multiple journalists and researchers continue pushing the disclosure process forward, and alien technology threat discussion sparks debate.

---

## 📰 Headline: Latest Trump UFO File Developments

| 📍 *USA* | 📅 *May 3-4, 2026* | 🔍 *Government Disclosure* |
|---|---|---|

Trump hints again at a new batch of UFO files being released! According to **AP News** and **NBC News**, Trump said reviewing UFO files revealed "interesting documents," sparking widespread attention.

This is Trump's latest comment on UFO disclosure since early this year, once again exciting the UFO community. Speculation suggests new files may include more detailed military sighting reports or even videos.

<div class="video-embed"><iframe src="https://www.youtube.com/embed/EJGjPlzHj_Q" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

📎 Sources: [AP News - Trump UFO files](https://apnews.com/) | [NBC News - Trump UFO files](https://www.nbcnews.com/politics/white-house/trump-review-ufo-files-interesting-documents) | [9News Australia](https://www.9news.com.au)

---

## 📰 The Guardian Journalist Travels to US to Chase UFOs

| 📍 *USA* | 📅 *April 22, 2026* | 🔍 *Media Investigation* |
|---|---|---|

A British Guardian journalist flew to the US to investigate the truth behind the Pentagon's released UFO videos. Titled "The Pentagon released its UFO videos – so I went to the US to chase aliens. This is what I found," the report delves into the progress and controversies of US military UFO investigations.

This kind of mainstream media in-depth reporting is pushing the UFO topic further into public view.

<div class="video-embed"><iframe src="https://www.youtube.com/embed/fQe3vB0dVkE" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

📎 Source: [The Guardian - Pentagon UFO videos](https://www.theguardian.com/)

---

## 📰 Alien Tech Could Destroy Earth in an Instant? Study Sparks Discussion

| 📍 *International* | 📅 *Early May 2026* | 🔍 *Scientific Research* |
|---|---|---|

The New York Post reports researchers stating: "Intelligent alien life is out there — and its technology could destroy us in a microsecond."

While this "alien threat theory" sounds like science fiction, more and more scientists believe humanity needs to seriously consider the potential risks of extraterrestrial civilizations.

<div class="video-embed"><iframe src="https://www.youtube.com/embed/uKYZYBFXwRw" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

📎 Source: [New York Post - Alien technology destroy us](https://nypost.com/)

---

## 📰 Las Vegas "Giant Alien" Event Revisited

| 📍 *Las Vegas, USA* | 📅 *April 30, 2023 - May 4, 2026 discussion* | 🔍 *Classic Sighting* |
|---|---|---|

Reddit community revives discussion of the sensational 2023 Las Vegas "Tall Whites" incident. On the night of April 30, 2023, a Las Vegas family called police reporting 8-9 foot tall giant beings in their backyard. The 911 call captured the family screaming: "They're 8, 9 feet tall... They're not human! Please send someone!"

Police body cameras recorded everything, making this one of the most thoroughly documented high-strangeness events in modern times.

![Las Vegas Giant Alien Incident](/vincent-kan-site/_astro/blog-placeholder-3.Bx0Zcyzv.jpg)

<div class="video-embed"><iframe src="https://www.youtube.com/embed/8g0r8z7vpIM" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

<div class="video-embed"><iframe src="https://www.youtube.com/embed/LJ5MNS5JwAI" frameborder="0" allowfullscreen loading="lazy"></iframe></div>

📎 Sources: [XUFOS.com](https://xufos.com/las-vegas-tall-white-alien-footage.php) | [Reddit r/XUFOS](https://www.reddit.com/r/XUFOS/comments/1t3ihu1/las_vegas_tall_whites_giant_aliens_backyard/)

---

### 🧠 Today's Trivia: UFO Disclosure Timeline

Did you know how many official US government UFO research projects there have been?

1. **Project Blue Book** (1952-1969) — Most famous, investigated 12,618 reports
2. **AAWSAP** (2008-2012) — Secret project studying UFO impact on military facilities
3. **AATIP** (Exposed 2017) — Key project that triggered modern UFO discussion
4. **AARO** (2022-present) — Current official UFO investigation office

![Project Blue Book Historical Photo](/vincent-kan-site/_astro/blog-placeholder-5.Bx0Zcyzv.jpg)

---
*This article is automatically generated every hour. Sources include AP News, NBC News, Newsweek, The Guardian, New York Post, Reddit r/UFOs, YouTube, etc. Updated immediately with breaking news.*`,

  'ufo-news-digest-202605041703': `> **"In the history of science, there are occasions when a subject of great importance, involving phenomena far beyond the boundaries of then-current scientific knowledge, was not regarded as a legitimate subject of scientific inquiry — and the UFO problem is precisely in that situation."**  
> —— James E. McDonald, Senior Physicist, Institute of Atmospheric Physics, University of Arizona, Testimony to the House Committee on Science and Astronautics, July 29, 1968

---

## 📰 Today's Highlights

| 📍 *Location* | 📅 *Date* | 🔍 *Category* |
|---|---|---|
| Fortuna AFS, North Dakota, USA | Spring 1967 (Reported April 2026) | Historical Radar Declassified Case |
| Nevada, USA (Area 51 region) | 1952-2021 | Classic Sighting Case Compilation |

---

## ⭐ Headline: 1967 Fortuna Radar Station Mysterious High-Speed Object — New Historical Case Exposed

**NUFORC (National UFO Reporting Center)** received a highly valuable report on April 12, 2026 — an 80-year-old retired US Air Force radar maintenance technician recounted a stunning event from nearly 60 years ago that had never been made public.

The event occurred in spring 1967, when the technician was stationed at **Fortuna Air Force Radar Station (Fortuna AFS)** in North Dakota, part of the 78th Air Defense Command's SAGE (Semi-Automated Ground Environment) system. They used the massive AN/FPS-35 search radar (antenna diameter 128 feet!) and the AN/FPS-26 height-finding radar.

**Key incident details:**

In the early morning hours, a radar operator named Lenny Kemp received a call from Minot Air Force Base, then suddenly shouted: "**What is this?!** " — The radar screen showed an unprecedented target moving at approximately **5,000 mph** (about 8,000 km/h) from south to north-northwest. While normal aircraft form a stable track line on radar, this target moved "**in jumps**" — every 12 seconds when the radar scanned, it had jumped a great distance, too fast for the height-finding radar to lock onto.

The technician tried to manually operate the height-finding radar to capture the target, but because the object was too fast, even "lead" targeting was impossible.

**Even stranger:** The next day, personnel from the **Air Force Office of Special Investigations (AFOSI)** suddenly arrived at Fortuna Radar Station. The technician described: "**They weren't here for a visit — they came to interrogate us.** " Their only instruction: **Nobody was to mention this again. Act like nothing happened.**

This technician kept the secret for nearly 60 years, until recently watching YouTube videos about **UFOs disabling nuclear missiles at Minot and Malmstrom Air Force bases**, realizing what he saw back then was likely directly connected to these famous nuclear-weapon UFO incidents.

**Parallel Timeline:**

- **March 5, 1967 — Minot AFB Incident:** Radar tracked an unknown object hovering over Minuteman missile facilities. Ground security teams saw a metallic disc-shaped object with flashing lights. F-106 fighters were placed on alert standby, but the UFO suddenly climbed vertically and escaped at high speed.
- **March 16, 1967 — Malmstrom AFB Incident (more famous):** A UFO caused 10 Minuteman ICBMs to suddenly go completely offline. This case has been officially confirmed by multiple former Air Force missile launch officers.

This retired radar technician's report provides new crucial corroborating evidence for these classic nuclear-weapon UFO cases, suggesting there may have been a **broader UFO activity network** covering the entire northern US nuclear missile base region.

<div class="video-embed"><iframe src="https://www.youtube.com/embed/6rD1Yhf9IBE" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
*UFOs and Nuclear Missiles: The Classic Malmstrom AFB 1967 Incident Documentary*

<div class="video-embed"><iframe src="https://www.youtube.com/embed/O9mXrNwav9k" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
*Declassified: Minot AFB 1967 UFO Incident Explained*

---

## 📍 Nevada — America's UFO Sighting Hotspot King

NUFORC recently participated in ABC News Live's "50 States 50 Weeks" series, showcasing **Nevada's** legendary UFO status. As of today, NUFORC has recorded **over 1,800** Nevada sighting reports, and Lincoln County (home to **Area 51** ) has the **highest per-capita UFO sighting rate** in the nation.

Selected Classic Nevada Cases:

| Date | Location | Description |
|------|----------|-------------|
| Feb 1952 | Nellis AFB | Silver disc-shaped object hovered near runway for 20 minutes, vanished when F-86 intercepted |
| Aug 2007 | Highway 375 | Orange cigar/disc-shaped object, side box-like lights turned on and off sequentially |
| Jun 2008 | Groom Lake Road | Red/green flashing lights flying irregularly like a butterfly, nearby mountains illuminated by strong light |
| Sep 2019 | Rachel to Alamo | Orange/amber glowing sphere "inspected" a vehicle up close, then suddenly flew into desert |
| Mar 2021 | Luning | Military vehicles escorting tarp-covered suspected flying disc-shaped object |

<div class="video-embed"><iframe src="https://www.youtube.com/embed/KGR14bb06Gg" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
*Nevada UFO Sighting Records — Area 51 Extraterrestrial Highway Legend*

<div class="video-embed"><iframe src="https://www.youtube.com/embed/U7_pcTHuQ7Y" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
*Nevada's Most Famous UFO Sighting Case Files*

---

## 🧠 UFO Trivia: The SAGE System — Cold War "All-Seeing Eye"

The SAGE (Semi-Automated Ground Environment) system used at Fortuna Radar Station was a technological marvel of the Cold War era. It connected radar stations across North America, computer centers, and interceptor aircraft, making it the first large-scale real-time computer network in human history. Interestingly, SAGE system radars — especially the AN/FPS-35 — were extremely sensitive and often captured anomalous signals that even the Air Force couldn't explain at the time. Many of these "ghost radar echoes" are what we now call UFOs/UAP.

<div class="video-embed"><iframe src="https://www.youtube.com/