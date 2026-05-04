// FAQ Schema Generator for DisclosureHK
// Generates FAQPage structured data for top UFO cases
// This helps Google show FAQ rich snippets in search results

const fs = require('fs');
const path = require('path');

const siteUrl = 'https://www.disclosurehk.com';

const faqData = [
  {
    url: '/blog/ufo-case-nimitz/',
    faqs: [
      { q: 'What happened in the 2004 USS Nimitz UFO incident?', a: 'The USS Nimitz Carrier Strike Group encountered a Tic-Tac shaped craft off the coast of California. The object demonstrated technology far beyond human capabilities — dropping from 80,000 ft to sea level instantly, with no visible propulsion system.' },
      { q: 'Did the Pentagon officially confirm the Nimitz incident?', a: 'Yes. The Pentagon officially released three declassified Navy videos (FLIR, GIMBAL, GOFAST) in 2020 and acknowledged these UAP encounters are real and unexplained.' },
      { q: 'Who were the witnesses in the Nimitz UFO incident?', a: 'Multiple US Navy fighter pilots (including Commander David Fravor), radar operators on the USS Princeton, and the entire carrier strike group command staff witnessed the event.' }
    ]
  },
  {
    url: '/blog/ufo-case-phoenix-lights/',
    faqs: [
      { q: 'What were the Phoenix Lights of 1997?', a: 'On March 13, 1997, thousands of people across Arizona and Nevada reported a massive V-shaped craft silently gliding across the night sky. The object was reportedly miles wide.' },
      { q: 'Did the governor of Arizona see the Phoenix Lights?', a: 'Yes. Arizona Governor Fife Symington was among the witnesses. He later said: "I witnessed a massive delta-shaped craft silently moving over the mountains."' },
      { q: 'Was the Phoenix Lights ever explained?', a: 'The US Air Force claimed they were flares dropped during a training exercise, but witnesses and researchers dispute this, noting the flares didn\'t match the formation or behavior of the reported craft.' }
    ]
  },
  {
    url: '/blog/ufo-grusch-hearing/',
    faqs: [
      { q: 'Who is David Grusch?', a: 'David Grusch is a former US intelligence official and whistleblower who testified before Congress in July 2023. He claimed the US government possesses recovered non-human craft and biological remains.' },
      { q: 'What did David Grusch testify about UFOs?', a: 'Grusch testified under oath that the US government has operated secret UAP crash retrieval and reverse-engineering programs for decades, and that recovered biological specimens were of non-human origin.' },
      { q: 'Was the Grusch hearing significant?', a: 'Yes. It was considered the most significant UFO hearing in decades because it featured a credentialed intelligence official under oath, and bipartisan members of Congress took it seriously.' }
    ]
  },
  {
    url: '/blog/ufo-case-roswell/',
    faqs: [
      { q: 'What happened in Roswell in 1947?', a: 'In July 1947, something crashed on a ranch near Roswell, New Mexico. The US Army initially announced they had recovered a "flying disc," then retracted, claiming it was a weather balloon.' },
      { q: 'Why is Roswell the most famous UFO case?', a: 'Roswell became the foundation of modern UFO culture due to the Army\'s contradictory statements, decades of witness testimony, and the 1980s release of documents suggesting a cover-up.' },
      { q: 'Was the Roswell object really a weather balloon?', a: 'The Air Force\'s official explanation is Project Mogul (a classified balloon-borne spy device). However, many researchers and former military personnel dispute this due to eyewitness accounts of exotic materials.' }
    ]
  },
  {
    url: '/blog/ufo-case-belgium-wave/',
    faqs: [
      { q: 'What was the Belgian UFO wave of 1989-1990?', a: 'Between November 1989 and April 1990, thousands of Belgians reported seeing large triangular UFOs silently moving at low altitude. The Belgian Air Force scrambled F-16 fighters to intercept.' },
      { q: 'Did NATO F-16s confirm the Belgian UFOs?', a: 'Yes. Belgian F-16s locked onto targets using onboard radar, confirming objects that demonstrated impossible acceleration and maneuverability. The data was analyzed by NATO and remains unexplained.' },
      { q: 'How many people saw the Belgian UFOs?', a: 'An estimated 13,500 people filed official reports, making it one of the most documented mass sightings in European history.' }
    ]
  },
  {
    url: '/blog/ufo-case-tehran/',
    faqs: [
      { q: 'What happened in the 1976 Tehran UFO incident?', a: 'On September 19, 1976, two Iranian Air Force F-4 Phantom jets were scrambled to intercept a UFO over Tehran. When approaching the object, all onboard electronics and communications failed.' },
      { q: 'Is the Tehran UFO incident documented?', a: 'Yes. The US Defense Intelligence Agency (DIA) classified the incident in a report. It remains one of the best-documented military UFO encounters in history.' },
      { q: 'Why is the Tehran case significant?', a: 'It\'s significant because it involves military radar confirmation, visual sighting by trained pilots, and documented electromagnetic effects on aircraft systems.' }
    ]
  }
];

// Generate individual FAQ schema files
for (const item of faqData) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': item.faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  const slug = item.url.replace('/blog/', '').replace('/', '');
  const outputDir = path.join(__dirname, '..', 'public', 'schema');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, `${slug}-faq.json`),
    JSON.stringify(schema, null, 2)
  );
  console.log(`✅ Generated FAQ schema for ${slug}`);
}

console.log('🎯 FAQ schema generation complete!');
console.log('🔧 Next step: Reference these schemas in the BaseHead.astro for specific pages');
