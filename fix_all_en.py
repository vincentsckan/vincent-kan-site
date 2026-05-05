#!/usr/bin/env python3
"""Fix all blog-en files that still have Chinese body content."""
import os, re

en_dir = "src/content/blog-en"
blog_dir = "src/content/blog"

# Articles that need their body replaced (still have Chinese)
needs_fix = [
    "ufo-filler-202605041800",
    "ufo-news-digest-202605041504",
    "ufo-news-digest-202605041703",
    "ufo-news-digest-202605041803",
    "ufo-news-digest-202605042003",
    "ufo-news-digest-202605042103",
    "ufo-news-digest-202605042203",
    "ufo-news-digest-202605050005",
    "ufo-news-digest-202605050103",
    "ufo-news-digest-202605050203",
    "ufo-news-digest-202605050303",
]

def split_file(content):
    m = re.match(r'^(---\s*\n.*?\n---)\s*\n(.*)', content, re.DOTALL)
    if not m:
        return content, ""
    return m.group(1), m.group(2).strip()

for slug in needs_fix:
    path = f"{en_dir}/{slug}.md"
    with open(path) as f:
        content = f.read()
    
    fm, _ = split_file(content)
    
    # Build English body (condensed version)
    lines = []
    
    if slug == "ufo-filler-202605041800":
        lines.append("**March 1971. The Cold War was at its peak off the coast of Spain.**\n")
        lines.append("This story comes from Spanish corporal **Jesus Jofre Mila**. Decades later, he finally broke his silence about what happened at a Spanish military radar base.\n")
        lines.append("## The Guard Dogs Sensed It First")
        lines.append("The German Shepherds became unusually aggressive. Soon after, a sentry pointed to the sky — above the radar dome appeared a **disc-shaped flying object** emitting golden light.\n")
        lines.append("## Blinding Light Erupts from the Sea")
        lines.append("Another soldier saw the same object descend rapidly toward the sea. It erupted in **an extremely powerful flash**, temporarily blinding him.\n")
        lines.append("## Strange Green Light and the \"Figure\"")
        lines.append("Mila and another soldier approached the fence after spotting **a strange green light**. The air felt \"charged with electricity.\" Then they heard footsteps — **heavy, fast, and close**.\n")
        lines.append("## Shots Fired, But No Reaction")
        lines.append("From the darkness emerged a figure estimated at **7 feet (about 2.1 meters)**. They fired multiple shots with a 9mm pistol. The figure showed **no reaction to the gunfire**.\n")
        lines.append("## Fence Section Vanishes")
        lines.append("The next day, a section of the base's inner fence **had completely vanished** with burn marks at the edges.\n")
        lines.append("## US Investigators Arrive")
        lines.append("Within days, **American military personnel** arrived. Soldiers were interrogated and ordered to \"forget about this.\" The case was classified by the Spanish Ministry of Defense.\n")
        lines.append("## The Mystery Remains")
        lines.append("Over half a century later, no conventional explanation can account for the guard dogs' reaction, the blinding light, a humanoid that ignored gunfire, or the vanished fence section.\n")
        lines.append("| 📍 *Spanish Coastal Radar Base* | 📅 *March 25-29, 1971* | 🔍 *Military Encounter / Humanoid* |\n")
        lines.append("**Sources:**")
        lines.append("- [Latest UFO Sightings](https://www.latest-ufo-sightings.net/2026/01/spanish-soldiers-fired-on-a-tall-humanoid-after-a-ufo-landed-near-their-base-1971.html)")
    
    elif slug == "ufo-news-digest-202605041504":
        lines.append("> **UFO/UAP News — Automatically updated daily!**\n")
        lines.append("## 📰 Trump UFO File Developments")
        lines.append("| 📍 *USA* | 📅 *May 3-4, 2026* | 🔍 *Government Disclosure* |")
        lines.append("Trump hints at new UFO files being released, calling them \"interesting documents.\"")
        lines.append("📎 [AP News](https://apnews.com/) | [NBC News](https://www.nbcnews.com/politics/white-house/trump-review-ufo-files-interesting-documents)\n")
        lines.append("## 📰 The Guardian Chases UFOs")
        lines.append("| 📍 *USA* | 📅 *April 22, 2026* | 🔍 *Media Investigation* |")
        lines.append("A Guardian journalist traveled to the US to investigate Pentagon UFO videos.")
        lines.append("📎 [The Guardian](https://www.theguardian.com/)\n")
        lines.append("## 📰 Alien Tech Threat Discussion")
        lines.append("| 📍 *International* | 📅 *May 2026* | 🔍 *Scientific Research* |")
        lines.append("NY Post: \"Intelligent alien life is out there — and its technology could destroy us in a microsecond.\"")
        lines.append("📎 [New York Post](https://nypost.com/)\n")
        lines.append("## 📰 Las Vegas \"Giant Alien\" Revisited")
        lines.append("| 📍 *Las Vegas* | 📅 *2023-2026* | 🔍 *Classic Sighting* |")
        lines.append("The 2023 Las Vegas incident where a family reported 8-9 foot beings in their backyard.\n")
        lines.append("*Auto-generated. Sources: AP News, NBC News, Guardian, NY Post, Reddit.*")
    
    elif slug == "ufo-news-digest-202605041703":
        lines.append('> **\"A subject of great importance, involving phenomena far beyond the boundaries of then-current scientific knowledge…\"** — James E. McDonald, 1968\n')
        lines.append("## ⭐ 1967 Fortuna Radar Station Case")
        lines.append("NUFORC received an April 2026 report from an 80-year-old retired USAF radar technician.")
        lines.append("At **Fortuna AFS**, a target appeared moving at **5,000 mph** in \"jumps\" every 12 seconds on the AN/FPS-35 radar.")
        lines.append("The next day, **AFOSI** arrived and ordered everyone to never mention it.\n")
        lines.append("**Related:** March 5, 1967 Minot AFB UFO incident; March 16, 1967 Malmstrom AFB — UFO caused 10 ICBMs to go offline.\n")
        lines.append("## 📍 Nevada — UFO Sighting Hotspot")
        lines.append("NUFORC: **1,800+** Nevada sightings. Lincoln County (Area 51) has highest per-capita UFO rate.\n")
        lines.append("**Sources:** [NUFORC Fortuna Case](https://nuforc.org/fortuna-radar-case/) | [NICAP Malmstrom](https://www.nicap.org/CATEGORIES/10-Nuclear_Connection_Cases/670316malmstrom_dir.htm)")
    
    elif slug == "ufo-news-digest-202605041803":
        lines.append("> **Today's UFO/UAP news:** Trump UFO file release; FBI investigating scientist deaths; Amy Eskridge kidnapping plot.\n")
        lines.append("## 📰 Trump UFO File Release")
        lines.append("Trump: files \"will be released in the near future.\" Stephen Bassett: three forces driving disclosure — public pressure, political upheaval, global instability.\n")
        lines.append("## 📰 FBI Investigating 11 Scientists")
        lines.append("Since 2022, at least 11 scientists and UFO experts have died/disappeared. Includes Maj. Gen. William McCasland (missing), NASA scientist Monica Reza (missing 2025), MIT Prof. Nuno Loureiro (shot Dec 2025), Amy Eskridge (ruled suicide 2022).\n")
        lines.append("## 📰 Amy Eskridge: Kidnapping Plot")
        lines.append("New recordings reveal years of surveillance. 34-year-old anti-gravity researcher found dead 2022. Father rejects suicide finding.\n")
        lines.append("**Sources:** [Daily Mail - Scientist deaths](https://www.dailymail.co.uk/sciencetech/article-15758395/mysterious-ufologist-deaths-ufo-research.html)")
    
    elif slug == "ufo-news-digest-202605042003":
        lines.append("> **May 4, 2026:** Trump hints UFO files; Artemis astronauts react; scientist kidnapping plot.\n")
        lines.append("## 📰 Trump Hints UFO Files")
        lines.append("Trump: \"I think we'll release as much as possible very soon.\" NASA astronauts caught smirking behind him. Months after Feb order, no documents released yet.\n")
        lines.append("## 📰 Bassett: Three Forces Driving Disclosure")
        lines.append("Public pressure (10,000+ articles), political chaos, global instability. Claims Carter tried to reveal truth, Obama got \"no evidence.\"\n")
        lines.append("## 📰 Amy Eskridge: New Audio")
        lines.append("34-year-old UFO scientist found dead 2022. New recordings reveal attempted kidnapping plot.\n")
        lines.append("**Sources:** [Daily Mail - Artemis astronauts](https://www.dailymail.co.uk/sciencetech/article-15776933/trump-ufo-files-release-artemis.html)")
    
    elif slug == "ufo-news-digest-202605042103":
        lines.append("> **Project Serpo, triangular UFO, Doha orbs, giant overseas structure**\n")
        lines.append("## 1️⃣ Project Serpo | 📍 *Zeta Reticuli* | 🔍 *Analysis*")
        lines.append("Deep dive into the alien exchange program. Proposed by former AFOSI agent Richard Doty: 1947 Roswell crash, surviving alien \"Ebe,\" 1960s exchange mission to planet Serpo. 1,800 pages of logs vanished. Doty admits it may be Cold War psy-ops.\n")
        lines.append("## 2️⃣ 🔺 Triangle UFO on Night Vision | 📍 *Sonoma, CA*")
        lines.append("Triangular craft captured on PVS-14 night vision — silent, high-speed.\n")
        lines.append("## 3️⃣ 🇶🇦 Doha Thunderstorm Orbs | 📍 *Qatar*")
        lines.append("Three luminous orbs in formation during thunderstorm.\n")
        lines.append("## 4️⃣ 🏛️ Congressman Questions Giant Structure | 📍 *Overseas*")
        lines.append("Rep. Burlison: massive unknown object with building constructed around it.\n")
        lines.append("**Sources:** [Latest UFO Sightings - Serpo](https://www.latest-ufo-sightings.net/2026/05/the-serpo-mission-inside-one-of-the-most-controversial-ufo-conspiracy-stories-ever-told.html)")
    
    elif slug == "ufo-news-digest-202605042203":
        lines.append("> **Giant UFO past Sun, 1.5-mile Moon ship, Ecuador light entity, Naples fireball, Project Serpo**\n")
        lines.append("### ⭐ 7-Mile UFO Flying Past the Sun")
        lines.append("Scott Waring captured a **7-10 mile** disc-shaped UFO on NASA Helioviewer. NASA labeled it comet but it has **no comet tail**.\n")
        lines.append("### ⭐ 1.5-Mile UFO on the Moon")
        lines.append("Waring found a **1.5-mile UFO** docked at crater edge in Apollo 17 archives.\n")
        lines.append("### ⭐ Ecuador Light Entity")
        lines.append("Meditators photographed a yellow luminous humanoid figure at Ecuador's Mojanda mountains.\n")
        lines.append("**Sources:** [UFO Sightings Daily](https://www.ufosightingsdaily.com/2026/04/7-mile-ufo-shots-past-sun-nasa-calls-it.html)")
    
    elif slug == "ufo-news-digest-202605050005":
        lines.append("> **Daily UFO/UAP tracking 🌍** Trump declassification progress, aliens noticing Earth, Disclosure Day scenarios\n")
        lines.append("## 🇺🇸 Trump UFO Declassification")
        lines.append("Space.com: Trump says he'll declassify UFO files. Experts urge caution — past transparency pledges resulted in heavily redacted releases.\n")
        lines.append("## 🌍 Aliens May Already Know We Exist")
        lines.append("Space.com: Earth's megacities, light pollution, and radio signals broadcast our existence.\n")
        lines.append("## 📢 Disclosure Day Scenarios")
        lines.append("Experts disagree: global panic, humanity's most unifying moment, or technology scramble.\n")
        lines.append("## 🤔 Fermi Paradox: Aliens May Not Want to Talk")
        lines.append("Advanced civilizations may have transcended conquest and greed.\n")
        lines.append("**Sources:** [Space.com](https://www.space.com/space-exploration/search-for-life/trump-says-us-government-will-declassify-its-ufo-files)")
    
    elif slug == "ufo-news-digest-202605050103":
        lines.append("> **Mars biological traces, 7-mile UFO past Sun, reptilian face in Antarctica, Project Serpo**\n")
        lines.append("### 🔥 Mars: Possible Animal Found")
        lines.append("Scott Waring found suspected tortoise-like object and ancient statue faces in NASA Mars photos.\n")
        lines.append("### ☀️ 7-Mile UFO Past Sun")
        lines.append("Waring: 7-10 mile disc-shaped object on Helioviewer — no comet tail.\n")
        lines.append("### ❄️ Antarctica Reptilian Face")
        lines.append("Google Maps coordinates 79°56'17.82\"S 81°45'55.59\"W: reptilian face carved in rock.\n")
        lines.append("### 👽 Project Serpo Deep Dive")
        lines.append("Roswell crash, surviving alien, 1960s interstellar exchange mission.\n")
        lines.append("**Sources:** [UFO Sightings Daily](https://www.ufosightingsdaily.com/2026/04/animal-found-on-mars-in-recent-nasa.html)")
    
    elif slug == "ufo-news-digest-202605050203":
        lines.append("> **Serpo mission deep dive, Mars tortoise creature, 7-mile UFO, Naples lights**\n")
        lines.append("## 1️⃣ 🔥 Serpo Mission: Most Controversial Exchange Program")
        lines.append("Former AFOSI agent Richard Doty claims US government exchanged personnel with Zeta Reticuli aliens. 1,800 pages of logs and 600 tapes vanished.\n")
        lines.append("## 2️⃣ 🪐 Mars: Tortoise Creature?")
        lines.append("Scott Waring: NASA photos show suspected tortoise creature and ancient carved faces.\n")
        lines.append("## 3️⃣ ☀️ 7-Mile UFO Past Sun")
        lines.append("Disc-shaped object with no comet tail — NASA calls it comet.\n")
        lines.append("**Sources:** [Latest UFO Sightings - Serpo](https://www.latest-ufo-sightings.net/2026/05/the-serpo-mission-inside-one-of-the-most-controversial-ufo-conspiracy-stories-ever-told.html)")
    
    elif slug == "ufo-news-digest-202605050303":
        lines.append("> **Trump UFO files, scientist deaths, David Wilcock, missing general**\n")
        lines.append("## 🇺🇸 Trump UFO File Release")
        lines.append("Trump: Pentagon preparing to release \"never-before-seen\" material. Ex-AARO head Kirkpatrick warns: don't expect alien photos — they don't exist.\n")
        lines.append("## 🔬 FBI Probes Scientist Deaths")
        lines.append("10+ scientists linked to nuclear/space research dead or missing. Includes Maj. Gen. McCasland (missing Feb), NASA scientist Reza (missing 2025), MIT Prof. Loureiro (shot Dec 2025).\n")
        lines.append("## 📺 Congressional UFO Hearing")
        lines.append("Whistleblowers testify cover-up. Video shown: Hellfire missile hits orb — object keeps flying.\n")
        lines.append("## 🕊️ David Wilcock Dies at 53")
        lines.append("Ancient Aliens regular found dead April 20 in Colorado. 518K YouTube subscribers.\n")
        lines.append("**Sources:** [The Independent](https://www.independent.co.uk/news/world/americas/ufo-tapes-release-trump-vance-b2969700.html)")
    
    body = '\n'.join(lines)
    new_content = fm + '\n\n' + body + '\n'
    
    with open(path, 'w') as f:
        f.write(new_content)
    
    print(f"✓ Fixed: {slug}")

print("\nAll files fixed!")
