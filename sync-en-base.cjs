const fs = require('fs');

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

function parseFm(content) {
    const parts = content.split(/^---\s*$/m);
    if (parts.length < 3) return { raw: '', body: content };
    return { raw: parts[1].trim(), body: parts.slice(2).join('---').trim() };
}

function readFile(slug) {
    return fs.readFileSync(`${blogDir}/${slug}.md`, 'utf-8');
}

// English frontmatter data
const enData = {
    'ufo-breaking-202605042218': {
        title: '🚨 BREAKING: AARO Director Admits UAP "Really Peculiar" — White House Coordinates Release of Never-Before-Seen UFO Material',
        titleEn: "🚨 BREAKING: AARO Director Admits UAP \"Really Peculiar\" — White House Coordinates Release of Never-Before-Seen UFO Material",
        description: "Pentagon UFO office AARO Director Dr. Jon Kosloski publicly admits UAP phenomena are \"really peculiar and perplexing.\" Former director says UAP demonstrates flight capabilities beyond known human technology. Meanwhile, the White House is coordinating cross-agency release of never-before-seen UFO material."
    },
    'ufo-filler-202605041800': {
        title: '👽 Spanish Soldiers Shot at an Alien? 48 Hours of Terror at a 1971 Radar Base',
        titleEn: '👽 Spanish Soldiers Shot at an Alien? 48 Hours of Terror at a 1971 Radar Base',
        description: 'In March 1971, bizarre events unfolded at a Spanish military radar base — guard dogs went insane, strange lights appeared, a 2-meter tall mysterious humanoid ignored gunfire, and a fence section vanished into thin air.'
    },
    'ufo-filler-202605050200': {
        title: '🇧🇷 Brazil\'s UFO Secret History: The Air Force\'s "Operation Saucer" and the Amazon Blood-Sucking Light Mystery',
        titleEn: '🇧🇷 Brazil\'s UFO Secret History: The Air Force\'s "Operation Saucer" and the Amazon Blood-Sucking Light Mystery',
        description: 'In 1977, mysterious UFO phenomena appeared on the small northern Brazilian island of Colares. The Brazilian Air Force sent a secret investigation team codenamed "Operation Saucer" (Operação Prato).'
    },
    'ufo-news-digest-20260504-evening': {
        title: '🛸 Global UFO/UAP News Digest — 2026-05-04',
        titleEn: '🛸 Global UFO/UAP News Digest — 2026-05-04',
        description: "Today's UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress"
    },
    'ufo-news-digest-20260504-evening-1': {
        title: '🛸 Global UFO/UAP News Digest — 2026-05-04',
        titleEn: '🛸 Global UFO/UAP News Digest — 2026-05-04',
        description: "Today's UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress"
    },
    'ufo-news-digest-202605041504': {
        title: '🛸 UFO/UAP News Flash — May 4, 23:04',
        titleEn: '🛸 UFO/UAP News Flash — May 4, 23:04',
        description: 'Trump hints UFO files coming soon, Guardian journalist travels to US to chase UFOs, NY Post says alien tech could destroy Earth instantly, Las Vegas giant alien event revisited'
    },
    'ufo-news-digest-202605041703': {
        title: '🛸 UFO/UAP News Flash — May 5, 01:03',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 01:03',
        description: 'NUFORC releases new 1967 Fortuna radar station high-speed unknown object case | Nevada UFO hotspot feature | US Air Force nuclear missile base UFO connections'
    },
    'ufo-news-digest-202605041803': {
        title: '🛸 UFO/UAP News Flash — May 4, 18:03',
        titleEn: '🛸 UFO/UAP News Flash — May 4, 18:03',
        description: 'Trump UFO file release enters final stretch | Mysterious scientist deaths continue to unfold | Amy Eskridge pre-death recording reveals kidnapping plot | UFO researcher mysterious death wave spans decades'
    },
    'ufo-news-digest-202605042003': {
        title: '🛸 UFO/UAP News Flash — May 4, 20:03',
        titleEn: '🛸 UFO/UAP News Flash — May 4, 20:03',
        description: 'Trump UFO files about to be released? Disclosure advocate analyzes three driving forces; Amy Eskridge case reveals shocking kidnapping plot'
    },
    'ufo-news-digest-202605042103': {
        title: '🛸 UFO/UAP News Flash — May 5, 05:03',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 05:03',
        description: 'Serpo mission declassified, triangular UFO night vision footage, mysterious orbs during Doha thunderstorm, Congressman questions overseas giant UAP structure'
    },
    'ufo-news-digest-202605042203': {
        title: '🛸 UFO/UAP News Flash — May 5, 06:03',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 06:03',
        description: 'Intensive UFO/UAP news: Giant UFO passing the Sun, 1.5-mile alien ship on the Moon, Ecuador light entity captured, mysterious fireball over Naples Italy, Project Serpo revealed!'
    },
    'ufo-news-digest-202605042306': {
        title: '🛸 UFO/UAP News Flash — May 5, 07:06',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 07:06',
        description: 'Trump: Pentagon preparing to release "never-before-seen" UFO files; David Wilcock dies by suicide; Aliens.gov domain registered; FBI investigating scientist deaths'
    },
    'ufo-news-digest-20260505-morning': {
        title: '🛸 Global UFO/UAP News Digest — 2026-05-05',
        titleEn: '🛸 Global UFO/UAP News Digest — 2026-05-05',
        description: "Today's UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress"
    },
    'ufo-news-digest-202605050005': {
        title: '🛸 UFO/UAP News Flash — May 5, 08:05',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 08:05',
        description: 'Trump promises UFO file declassification | Scientists: aliens may have already noticed Earth | How would Earth react if ET formally contacted humanity?'
    },
    'ufo-news-digest-202605050103': {
        title: '🛸 UFO/UAP News Flash — May 5, 09:03',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 09:03',
        description: 'Mars photos may show biological traces, NASA sun satellite captures 7-mile giant UFO, Google Maps reveals reptilian face in Antarctica, Project Serpo uncovered'
    },
    'ufo-news-digest-202605050203': {
        title: '🛸 UFO/UAP News Flash — May 5, 10:03',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 10:03',
        description: 'Serpo mission deep dive, Mars suspected tortoise creature, 7-mile UFO flies past Sun, mysterious lights over Naples Italy'
    },
    'ufo-news-digest-202605050303': {
        title: '🛸 UFO/UAP News Flash — May 5, 11:03',
        titleEn: '🛸 UFO/UAP News Flash — May 5, 11:03',
        description: 'Trump mentions UFO files to be released again | FBI investigating scientist deaths | UFO researcher David Wilcock passes away | Missing general linked to UFOs'
    }
};

// English body content for each slug
const enBody = {
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
  — The 1995 "Alien Autopsy" footage that shocked the world, allegedly filmed by military personnel, was later revealed to be a hoax.

## 🔍 More Information

Want to learn more about UFO/UAP information? Browse other articles on this site or subscribe to the RSS feed for the latest updates.

---
*This article was generated by an automated news monitoring system. Published: 2026-05-04 20:05 UTC*`,

    'ufo-news-digest-20260505-morning': `> **Daily Update:** Latest developments in the global UFO/UAP disclosure movement. This page is updated automatically every day.

## 📰 Today's Headlines

- **[DisclosureHK — UFO/UAP Research &amp; News](https://www.disclosurehk.com/)**
  — Tech enthusiast • UFO/UAP researcher • AI player • Hong Konger

- **[🛸 2021 UAP Report — America's First Official UFO Report](https://www.disclosurehk.com/blog/ufo-2021-report/)**
  — On June 25, 2021, the US Office of the Director of National Intelligence released the first official UAP assessment report, acknowledging 144 cases as unexplained.

- **[👽 Gray Alien Autopsy — The Most Controversial UFO Film (1995)](https://www.disclosurehk.com/blog/ufo-alien-autopsy/)**
  — The 1995 "Alien Autopsy" footage that shocked the world, allegedly filmed by military personnel, was later revealed to be a hoax.

## 🔍 More Information

Want to learn more about UFO/UAP information? Browse other articles on this site or subscribe to the RSS feed for the latest updates.

---
*This article was generated by an automated news monitoring system. Published: 2026-05-05 00:06 UTC*`
};

for (const slug of slugs) {
    const content = readFile(slug);
    const { raw, body } = parseFm(content);
    const en = enData[slug];
    
    // Extract fields from raw frontmatter
    const lines = raw.split('\n');
    let foundPubDate = null, foundAuthor = null, foundImage = null, foundHeroImage = null, foundUpdatedDate = null;
    
    for (const line of lines) {
        const m = line.match(/^(pubDate|updatedDate|author|image|heroImage):\s*(.*)/);
        if (m) {
            const key = m[1];
            const val = m[2].trim();
            if (key === 'pubDate') foundPubDate = val;
            else if (key === 'updatedDate') foundUpdatedDate = val;
            else if (key === 'author') foundAuthor = val;
            else if (key === 'image') foundImage = val;
            else if (key === 'heroImage') foundHeroImage = val;
        }
    }
    
    // Build blog-en file
    let out = '---\n';
    out += `title: "${en.title}"\n`;
    out += `titleEn: '${en.titleEn}'\n`;
    out += `description: "${en.description}"\n`;
    if (foundPubDate) out += `pubDate: ${foundPubDate}\n`;
    if (foundUpdatedDate) out += `updatedDate: ${foundUpdatedDate}\n`;
    if (foundHeroImage) out += `heroImage: ${foundHeroImage}\n`;
    else if (foundImage) out += `heroImage: ${foundImage}\n`;
    out += `tags: ["UFO", "UAP", "news", "auto-update"]\n`;
    out += '---\n\n';
    
    // Body - use translation if available, else original body
    if (enBody[slug]) {
        out += enBody[slug];
    } else {
        // Will add full translations for the remaining articles
        out += body;
    }
    
    out += '\n';
    
    fs.writeFileSync(`${enDir}/${slug}.md`, out);
    console.log(`✓ blog-en: ${slug}.md`);
}

console.log('\nBase blog-en files created. Now need to add full English translations for articles with Chinese body content.');
