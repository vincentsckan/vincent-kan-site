const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const zhDir = 'src/content/blog-zh';

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

// Chinese → English title/description mapping
const translations = {
  'ufo-breaking-202605042218': {
    titleEn: '🚨 BREAKING: AARO Director Admits UAP Is "Really Peculiar" — White House Coordinates Release of Never-Before-Seen UFO Material',
    descriptionEn: 'Pentagon UFO office AARO Director Dr. Jon Kosloski publicly admits UAP phenomena are "really peculiar and perplexing." Former director says UAP demonstrates flight capabilities beyond known human technology. Meanwhile, the White House is coordinating cross-agency release of never-before-seen UFO material.'
  },
  'ufo-filler-202605041800': {
    titleEn: '👽 Spanish Soldiers Shot at an Alien? 48 Hours of Terror at a 1971 Radar Base',
    descriptionEn: 'In March 1971, bizarre events unfolded at a Spanish military radar base — guard dogs went insane, strange lights appeared, a 2-meter tall mysterious humanoid ignored gunfire, and a fence section vanished into thin air. A Spanish soldier\'s testimony remains classified to this day.'
  },
  'ufo-filler-202605050200': {
    titleEn: '🇧🇷 Brazil\'s UFO Secret History: The Air Force\'s "Operation Saucer" and the Amazon Blood-Sucking Light Mystery',
    descriptionEn: 'In 1977, mysterious UFO phenomena appeared on the small northern Brazilian island of Colares. Locals called it "Chupa Chupa" — lights in the sky that sucked people\'s blood. The Brazilian Air Force sent a secret investigation team codenamed "Operation Saucer" (Operação Prato), with many mysteries still unsolved today.'
  },
  'ufo-news-digest-20260504-evening': {
    titleEn: '🛸 Global UFO/UAP News Digest — 2026-05-04',
    descriptionEn: 'Today\'s UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress'
  },
  'ufo-news-digest-20260504-evening-1': {
    titleEn: '🛸 Global UFO/UAP News Digest — 2026-05-04',
    descriptionEn: 'Today\'s UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress'
  },
  'ufo-news-digest-202605041504': {
    titleEn: '🛸 UFO/UAP News Flash — May 4, 23:04',
    descriptionEn: 'Trump hints UFO files coming soon, Guardian journalist travels to US to chase UFOs, NY Post study says alien tech could destroy Earth instantly, Las Vegas giant alien event revisited'
  },
  'ufo-news-digest-202605041703': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 01:03',
    descriptionEn: 'NUFORC releases new historical 1967 Fortuna radar station high-speed unknown object case | Nevada UFO hotspot feature | US Air Force nuclear missile base UFO connections'
  },
  'ufo-news-digest-202605041803': {
    titleEn: '🛸 UFO/UAP News Flash — May 4, 18:03',
    descriptionEn: 'Trump UFO file release enters final stretch | Mysterious scientist deaths continue to unfold | Amy Eskridge pre-death recording reveals kidnapping plot | UFO researcher mysterious death wave spans decades'
  },
  'ufo-news-digest-202605042003': {
    titleEn: '🛸 UFO/UAP News Flash — May 4, 20:03',
    descriptionEn: 'Trump UFO files about to be released? Disclosure advocate analyzes three driving forces; Amy Eskridge case reveals shocking kidnapping plot; UFO researcher mysterious death pattern exposed'
  },
  'ufo-news-digest-202605042103': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 05:03',
    descriptionEn: 'Serpo mission declassified, triangular UFO night vision footage, mysterious orbs appear during Doha thunderstorm, Congressman questions overseas giant UAP structure'
  },
  'ufo-news-digest-202605042203': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 06:03',
    descriptionEn: 'Intensive UFO/UAP news update: Giant UFO passing the Sun, 1.5-mile long alien ship discovered on the Moon, Ecuador light entity captured, mysterious fireball over Naples Italy, and Project Serpo files revealed!'
  },
  'ufo-news-digest-202605042306': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 07:06',
    descriptionEn: 'Trump hints again: Pentagon preparing to release "never-before-seen" UFO files; UFO researcher David Wilcock dies by suicide; Aliens.gov domain registered by government; FBI investigating mysterious scientist deaths; Congressional UFO hearing whistleblowers swear cover-up'
  },
  'ufo-news-digest-20260505-morning': {
    titleEn: '🛸 Global UFO/UAP News Digest — 2026-05-05',
    descriptionEn: 'Today\'s UFO/UAP news summary: US Congressional hearing follow-ups, global sighting reports, government file declassification progress'
  },
  'ufo-news-digest-202605050005': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 08:05',
    descriptionEn: 'Trump promises UFO file declassification progress | Scientists analyze whether aliens may have already noticed Earth | How would Earth react if ET formally contacted humanity?'
  },
  'ufo-news-digest-202605050103': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 09:03',
    descriptionEn: 'Latest NASA Mars photos may show biological traces, NASA sun satellite captures 7-mile giant UFO flying past, Google Maps reveals reptilian face in Antarctica, shocking inside story of Project Serpo comes to light'
  },
  'ufo-news-digest-202605050203': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 10:03',
    descriptionEn: 'In-depth deconstruction of the Serpo mission, Mars suspected tortoise-like creature discovered, 7-mile UFO flies past the Sun, mysterious lights over Naples Italy — all in this edition of UFO News Flash'
  },
  'ufo-news-digest-202605050303': {
    titleEn: '🛸 UFO/UAP News Flash — May 5, 11:03',
    descriptionEn: 'Trump mentions UFO files to be released again | Scientists\' mysterious deaths and disappearances trigger FBI investigation | UFO researcher David Wilcock passes away | Former Air Force general\'s disappearance linked to UFOs'
  }
};

function parseFrontmatterFull(content) {
    // Split on the first and second ---
    const parts = content.split(/^---\s*$/m);
    if (parts.length < 3) {
        return { fm: {}, body: content, rawFm: '' };
    }
    const rawFm = parts[1];
    const body = parts.slice(2).join('---').trim();
    return { rawFm, body };
}

function reconstructFile(fields, body, extraFields = {}) {
    // Build frontmatter preserving original YAML
    let fm = '---\n';
    
    // Add extra fields first (titleEn, descriptionEn)
    if (extraFields.titleEn) {
        fm += `titleEn: '${extraFields.titleEn.replace(/'/g, "\\'")}'\n`;
    }
    if (extraFields.descriptionEn) {
        fm += `descriptionEn: '${extraFields.descriptionEn.replace(/'/g, "\\'")}'\n`;
    }
    
    // Add all original fields
    for (const [k, v] of Object.entries(fields)) {
        fm += `${k}: ${v}\n`;
    }
    
    fm += '---\n\n';
    fm += body;
    return fm;
}

for (const slug of slugs) {
    const srcPath = `${blogDir}/${slug}.md`;
    if (!fs.existsSync(srcPath)) {
        console.error(`NOT FOUND: ${srcPath}`);
        continue;
    }
    
    const content = fs.readFileSync(srcPath, 'utf-8');
    const { rawFm, body } = parseFrontmatterFull(content);
    const t = translations[slug];
    
    // Build blog-zh version: same content + titleEn + descriptionEn before original fields
    // Parse rawFm lines to extract key fields in order
    const fmLines = rawFm.split('\n');
    const originalFields = {};
    let currentKey = null;
    let currentVal = [];
    let seenKeys = [];
    
    function flushCurrent() {
        if (currentKey) {
            originalFields[currentKey] = currentVal.join('\n');
            if (!seenKeys.includes(currentKey)) seenKeys.push(currentKey);
            currentVal = [];
        }
    }
    
    for (const line of fmLines) {
        const keyMatch = line.match(/^(\w+):\s*(.*)/);
        if (keyMatch) {
            flushCurrent();
            currentKey = keyMatch[1];
            currentVal = [line];
        } else if (currentKey && (line.startsWith('  ') || line.startsWith('- '))) {
            currentVal.push(line);
        }
    }
    flushCurrent();
    
    // Rebuild zh frontmatter: titleEn, descriptionEn first, then all original fields
    let zhFm = '---\n';
    if (t) {
        zhFm += `titleEn: '${t.titleEn.replace(/'/g, "\\'")}'\n`;
        zhFm += `descriptionEn: '${t.descriptionEn.replace(/'/g, "\\'")}'\n`;
    }
    for (const key of ['title', 'description', 'pubDate', 'updatedDate', 'author', 'image', 'heroImage', 'tags']) {
        if (originalFields[key]) {
            zhFm += originalFields[key] + '\n';
        }
    }
    zhFm += '---\n\n';
    zhFm += body;
    
    const zhPath = `${zhDir}/${slug}.md`;
    fs.writeFileSync(zhPath, zhFm);
    console.log(`✓ blog-zh: ${slug}.md`);
}

console.log('\nAll blog-zh files created successfully!');
