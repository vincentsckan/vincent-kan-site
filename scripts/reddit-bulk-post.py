#!/usr/bin/env python3
"""
Reddit Bulk Poster — for DisclosureHK promotion
=================================================
Step 1: Go to https://www.reddit.com/prefs/apps
Step 2: Click "create another app" → choose "script"
Step 3: Name it "disclosurehk-poster" (or anything)
Step 4: Copy the client_id (string under the app name) and client_secret
Step 5: Run this script and paste them when asked
"""

import praw
import sys
import getpass
import time
from datetime import datetime, timezone

# ── The 15 posts ──────────────────────────────────────────────────────────
POSTS = [
    {
        "subreddit": "UFOs",
        "title": "The 2004 Nimitz Tic-Tac: The Pentagon confirmed it, 22 years later it's still unexplained — full breakdown",
        "body": """The Nimitz encounter is the "granddaddy" of modern UAP cases — and for good reason. 

Not just because of the FLIR1 video (though that's impressive). Here's what often gets overlooked:

• The USS Princeton detected the objects DAYS before the visual intercept — tracking them on advanced Aegis radar
• The Tic-Tac dropped from 80,000 feet to sea level in under a second
• Commander Fravor described it as "about 40 feet long, with no wings, no cockpit, no exhaust"
• Multiple assets tracked it simultaneously — it wasn't just one sensor
• The Pentagon's UAPTF deemed this "unresolved"

I compiled a full deep-dive of every detail we know: the radar data, pilot testimony (Fravor, Dietrich, Slaight, Kurth), the Pentagon reports, and what leading analysts believe.

Full writeup here: https://www.disclosurehk.com/blog/ufo-case-nimitz/

What convinced you most about this case — the radar data, the video, or the pilot testimony?""",
        "day": 1
    },
    {
        "subreddit": "UAP",
        "title": "David Grusch under oath: \"The US has recovered non-human craft\" — what he actually said and why it mattered",
        "body": """Two years after the Grusch hearings, I think people still underestimate how significant they were. 

Let's recap what actually happened (not the sensational headlines, but the actual sworn testimony):

1. David Grusch testified under oath before Congress that the US government possesses "vehicles of non-human intelligence"
2. He stated there are "biological remains" recovered from crash sites
3. He named specific individuals involved in classified programs
4. He described retaliation against whistleblowers — people hurt or killed for revealing secrets
5. Over 40 intelligence personnel confirmed his claims before he went public

The hearing was bipartisan. Both Republicans and Democrats pressed for answers.

I wrote a detailed breakdown of the full hearing, including the testimony you may have missed, the pushback from Congress, and what's happened since:

➡️ https://www.disclosurehk.com/blog/ufo-grusch-hearing/

For those who followed this closely — what moment stood out to you most?""",
        "day": 2
    },
    {
        "subreddit": "aliens",
        "title": "The Phoenix Lights (1997): The governor was among thousands who saw a V-shaped craft miles wide — and the official explanation still doesn't add up",
        "body": """On March 13, 1997, something unprecedented happened over Arizona. Thousands of people — including the state's governor — looked up and saw a massive V-shaped craft silently gliding across the sky.

Key facts that often get buried in the noise:

• The governor of Arizona, Fife Symington, was a witness himself. He later said: "I saw a massive delta-shaped craft silently hovering over the Squaw Peak."
• The lights formed a V-shape estimated to be over a mile wide
• There were TWO separate events that night — the famous formation of lights, AND individual red orbs
• The Air Force claimed it was "flare drops from A-10 training" — but this doesn't explain the V-shape hours earlier
• Over 700+ reports were filed with the National UFO Reporting Center

I've written up the complete case — the witness accounts, the government response, the news coverage, and the unresolved questions:

https://www.disclosurehk.com/blog/ufo-case-phoenix-lights/

If you saw the Phoenix Lights or know someone who did — I'd love to hear your story.""",
        "day": 3
    },
    {
        "subreddit": "UFOs",
        "title": "Ariel School (1994): 62 Zimbabwean children described the same alien encounter independently — 30 years later, they still stand by it",
        "body": """In 1994, something extraordinary happened at a rural school in Ruwa, Zimbabwe. 62 schoolchildren — aged 6 to 12 — reported seeing a silver craft land in their schoolyard, and "beings" emerging from it.

What makes this case one of the most compelling in UFO history:

• The children were interviewed independently by Harvard professor John Mack — and their stories matched in extraordinary detail
• They described beings with "big eyes, long black hair, and wearing shiny suits"
• The beings communicated telepathically: "We need to take better care of our planet"
• Multiple children drew remarkably consistent pictures of what they saw
• None of them were influenced by prior UFO media — they had no exposure to it
• 30 years later, many of the now-adult witnesses still maintain their accounts

I wrote a comprehensive article on the Ariel School case, including the psychological skepticism, John Mack's findings, and the recent 30-year follow-up interviews:

➡️ https://www.disclosurehk.com/blog/ufo-case-ariel/

Did you believe the children then — and has your view changed since?""",
        "day": 4
    },
    {
        "subreddit": "UFOB",
        "title": "NATO F-16s scrambled: The 1989 Belgian UFO wave that terrified Europe",
        "body": """Between November 1989 and April 1990, Belgium experienced one of the most well-documented UFO waves in history. The entire country was watching the skies.

Here's what happened:

• Thousands of witnesses reported a large, triangular craft with bright lights moving silently at low altitude
• The Belgian Air Force scrambled F-16 fighters on multiple occasions
• On March 30, 1990, an F-16 locked onto a target using its onboard radar — the object changed altitude from 9,000 to 500 feet and back in seconds
• Radar data from multiple ground stations confirmed the track — this wasn't pilot error
• The famous "Belgian UFO photo" (the triangle with three lights) remains unexplained
• The Belgian military's official report concluded the objects demonstrated "capabilities beyond known aircraft"

I compiled the full case — the radar transcript, F-16 pilot interviews, the photo analysis, and the government investigation:

➡️ https://www.disclosurehk.com/blog/ufo-case-belgium-wave/

If you were in Belgium during this period — what did you see?""",
        "day": 5
    },
    {
        "subreddit": "UAP",
        "title": "Pentagon-confirmed: The USS Omaha filmed a swarm of UFOs and a sphere entering the ocean (2019)",
        "body": """In July 2019, the USS Omaha — a US Navy warship off the coast of California — encountered something that the Pentagon has since confirmed as genuine.

The incident involves two extraordinary pieces of evidence:

1. A swarm of 6-8 unidentified objects tracked on the ship's radar for hours
2. A spherical object that dropped from the sky and ENTERED THE OCEAN — no splash, no heat signature, just water disturbance

The Navy released the FLIR footage showing the sphere entering the water. The Pentagon's UAPTF included this in their official briefings to Congress. AARO has analyzed it and deemed it of "unknown origin."

What makes this case so compelling:
• Military-grade radar + FLIR footage = multiple sensor confirmation
• The sphere entered the ocean without deceleration or damage
• The same area had been tracked by the USS Russell earlier that same week
• The Navy commander directly involved spoke about it in a recorded briefing

I put together a full breakdown of the USS Omaha incident, including the radar tracks, the FLIR footage analysis, and the implications:

➡️ https://www.disclosurehk.com/blog/ufo-case-uss-omaha/

How do you explain an object that can transition between air and sea without any known technology?""",
        "day": 6
    },
    {
        "subreddit": "aliens",
        "title": "Travis Walton was missing for 5 days after a UFO encounter. He passed a polygraph. Here's the full story.",
        "body": """The Travis Walton case is one of the most controversial and well-documented UFO abduction accounts in history. Here's why it still matters:

The facts:
• November 5, 1975 — Walton and six coworkers were driving home from a logging job in Arizona
• They encountered a disc-shaped craft hovering above the ground
• Walton approached the craft and was struck by a beam of light, thrown 10 feet backwards
• His coworkers fled in terror — then returned, but Walton was gone
• He was missing for 5 days and 4 nights
• When he reappeared, he described being aboard the craft and encountering beings

The evidence that skeptics still struggle to explain:
• All six coworkers independently described the same event and passed polygraph tests
• Walton himself passed a polygraph examination administered by law enforcement
• The coworkers were offered rewards to change their stories — they refused
• No body, no ransom demand, no signs of foul play during the 5-day disappearance
• The case was investigated by the district attorney, sheriff's department, and US Forest Service — no charges were ever filed

I wrote a full analysis of the Travis Walton case, including the polygraph evidence, the coworker statements, the skeptical counterarguments, and the aftermath:

➡️ https://www.disclosurehk.com/blog/ufo-case-travis-walton/

What's your take — credible abduction case or elaborate hoax that fooled polygraphs?""",
        "day": 7
    },
    {
        "subreddit": "UFOs",
        "title": "1976: Two Iranian F-4s lost power when approaching a UFO — classified DIA files confirm",
        "body": """One of the most significant military-UFO encounters in history happened on September 19, 1976, near Tehran, Iran. And it's recorded in now-declassified DIA (Defense Intelligence Agency) files.

What happened:
• Multiple civilians reported seeing a brightly colored, flashing light in the night sky over Tehran
• The Iranian Air Force scrambled an F-4 Phantom jet to intercept
• As the F-4 approached, ALL onboard instrumentation and communications failed
• The pilot turned away — and everything came back online
• A second F-4 was scrambled with the same result
• The second F-4's radar locked onto the object — it was estimated to be the size of a Boeing 707
• The object then ejected smaller objects that chased the F-4 at extremely high speed

The DIA classified the encounter as a genuine unknown. The report was declassified through FOIA.

I wrote a complete breakdown of the Tehran F-4 incident, including the full DIA report, the pilot debriefings, and the radar data analysis:

➡️ https://www.disclosurehk.com/blog/ufo-case-tehran/

If a modern F-4 with weapons systems is helpless against a UFO — what does that tell us?""",
        "day": 8
    },
    {
        "subreddit": "HighStrangeness",
        "title": "747 cargo jet pursued by a giant UFO over Alaska for 50 minutes — FAA radar confirmed",
        "body": """On November 17, 1986, Japanese Airlines Flight 1628 — a 747 cargo jet — was flying from Paris to Tokyo over Alaska when something incredible happened.

Captain Kenju Terauchi and his crew saw two small spotlights approach from below. Then a MASSIVE craft — "twice the size of an aircraft carrier" — appeared between them.

The encounter lasted 50 minutes.

Key facts that make this case stand out:
• The FAA in Anchorage confirmed the objects on radar — they tracked the UFO alongside the 747
• The object was so large the crew could see its "pulsating glow" and dark structure in detail
• At one point, the UFO positioned directly in front of the 747's flight path — the crew had to consider evasive action
• The FAA issued a formal statement acknowledging the incident
• The US government later retracted, citing "weather phenomena" — but the radar data was clean and weather was clear

I did a full writeup of the JAL 1628 case with the radar transcripts, the crew testimony, and the government's contradictory responses:

➡️ https://www.disclosurehk.com/blog/ufo-case-jal1628/

A 747 pilot with 29 years of experience, FAA radar confirmation — and still officially "unresolved." What do you think happened?""",
        "day": 9
    },
    {
        "subreddit": "UFObelievers",
        "title": "Britain's Roswell: US Air Force personnel encountered a craft in Rendlesham Forest, Christmas 1980",
        "body": """In December 1980, outside RAF Woodbridge in Suffolk, England, US Air Force personnel encountered something that remains one of the most compelling military UFO cases.

The timeline:
• Dec 26, 1980 — Security patrolmen see strange lights descending into Rendlesham Forest
• Deputy Base Commander Lt. Col. Charles Halt goes to investigate
• The patrol finds a metallic craft with strange markings, resting on a tripod landing gear
• The craft emits pulsing lights and moves through the forest silently
• The following morning — physical impressions found in the ground (three indentations forming a triangle)
• Radiation readings at the site were elevated above background levels
• Dec 28 — Halt's team encounters the object again, this time beaming light into the weapons storage area

The evidence:
• Lt. Col. Halt's audio recording of the encounter (the "Halt Tape") — still available online
• Written memos and official reports from the base
• Multiple witness testimonies from US airmen
• Physical evidence: ground impressions, radiation readings, tree damage

I compiled the evidence from the Rendlesham Forest case — the declassified memos, the Halt Tape transcript, interviews with the key witnesses, and the skeptical counterarguments:

➡️ https://www.disclosurehk.com/blog/ufo-case-rendlesham/

This was investigated by the Ministry of Defence and remains a case they "could not explain." Thoughts?""",
        "day": 10
    },
    {
        "subreddit": "UFOs",
        "title": "2,700 pages of declassified CIA UFO files — what the intelligence community actually knew",
        "body": """The CIA has released thousands of pages of UFO-related documents through FOIA requests. Most people haven't read them — so I did.

What's actually in the CIA UFO files (now online at the CIA's CREST database):

• 1947-1952: The CIA was deeply concerned about UFOs — not as "little green men," but as potential Soviet secret weapons
• The 1953 Robertson Panel: The CIA convened scientists to debunk UFO reports, not to investigate them — they explicitly wanted to reduce public interest
• 1950s-60s: The CIA tracked UFOs over sensitive nuclear and military installations
• 1975: Multiple intrusions over nuclear weapons storage sites in the US — the CIA and Air Force investigated
• 1980s: International UFO cases monitored by intelligence
• The CIA's official position evolved from "Soviet threat" to "natural phenomena" — but the documents show a more complex story

I've organized the key CIA documents into an understandable timeline and analysis:

➡️ https://www.disclosurehk.com/blog/ufo-cia-files/

After reading the actual documents, do you feel the CIA was hiding the truth, or just confused like everyone else?""",
        "day": 11
    },
    {
        "subreddit": "UAP",
        "title": "The Kumburgaz, Turkey UFO footage — over 3 hours recorded, possible occupants visible",
        "body": """Between 2007 and 2009, nightwatchman Yalçın Yalman recorded multiple hours of footage of a UFO over the Kumburgaz region of Istanbul, Turkey.

What makes it unusual:
• Recorded over many months — not a one-off sighting
• The object appears as a structured craft with visible windows
• In some frames, analysts claim to see figures/silhouettes inside the windows
• The footage was analyzed by Turkish media, international UFO researchers, and even some debunkers
• Turkish scientists involved in paranormal research found no evidence of hoaxing

The skeptics say it's a distant cruise ship or hotel reflection. The believers say the structured shape and consistent filming over months rules that out.

I laid out both sides of the debate in my detailed case study:

➡️ https://www.disclosurehk.com/blog/ufo-case-turkey/

What camp are you in — real or cruise ship? I've looked at the enhanced footage and I'm genuinely not sure.""",
        "day": 12
    },
    {
        "subreddit": "aliens",
        "title": "Three women were burned by radiation from a UFO in 1980. Doctors confirmed it. The case went to the Supreme Court.",
        "body": """On December 29, 1980, Betty Cash, Vickie Landrum, and Colby Landrum (Vickie's 6-year-old grandson) were driving home in rural Texas when they encountered a massive diamond-shaped craft hovering over the road.

This case is unique because of what happened AFTER the sighting:

• The craft was emitting intense heat — the inside of their car became unbearably hot
• They stopped the car and watched as military helicopters (CH-47 Chinooks) surrounded the craft
• Within hours, all three developed severe symptoms: nausea, vomiting, diarrhea, skin blisters, and hair loss
• Doctors diagnosed them with acute radiation sickness — consistent with exposure to ionizing radiation
• Their symptoms persisted for years — Betty Cash eventually died from complications
• They sued the US government for $20M in damages
• The case went all the way to the US Supreme Court — but was denied on procedural grounds (the government claimed national security)

I compiled the full Cash-Landrum story — the medical records, the court case, the military connection, and the aftermath:

➡️ https://www.disclosurehk.com/blog/ufo-case-cash-landrum/

A 6-year-old boy, the Supreme Court, and a UFO. If that's not enough to take this seriously, what is?""",
        "day": 13
    },
    {
        "subreddit": "HighStrangeness",
        "title": "3,000+ cattle mutilated since the 1960s with surgical precision and no blood — FBI investigated UFO links",
        "body": """Since the 1960s, over 3,000 cattle mutilations have been reported across the United States, Canada, and South America. The mutilations share bizarre characteristics that have never been adequately explained.

The pattern:
• Incisions are made with surgical precision — far beyond what a predator or human amateur could achieve
• Specific organs are removed: eyes, tongue, lips, genitals, rectum — always the same ones
• NO blood at the scene — as if the blood was drained by an unknown method
• The carcasses are often found in remote areas with no tracks or tire marks nearby
• The bones at the excision sites are often cleanly cut
• Many cases involve unexplained lights or craft sighted in the area around the same time

The government investigations:
• The FBI investigated in the 1970s — their file was over 5,000 pages
• The New Mexico State Police also investigated extensively
• Multiple official reports concluded "unknown cause"
• The cases continue to this day

I wrote a comprehensive study of the animal mutilation phenomenon, covering the history, the scientific analyses, the government files, and the UFO connection:

➡️ https://www.disclosurehk.com/blog/ufo-animal-mutilation/

Natural predators — or something else entirely? I've gone deep on the evidence and I'm still conflicted.""",
        "day": 14
    },
    {
        "subreddit": "UFOB",
        "title": "Canada's official UFO case: A craft crashed into the ocean, Navy searched, government files released",
        "body": """On October 4, 1967, something crashed into the waters off Shag Harbour, Nova Scotia — and the Canadian government took it seriously enough to launch an official investigation.

What happened:
• Multiple witnesses saw a large, low-flying object with flashing lights heading toward the water
• It crashed into the ocean with a loud explosion
• The Royal Canadian Mounted Police (RCMP) and Canadian Navy responded immediately
• The Navy deployed divers and sonar equipment
• An oil-like foam was found on the water surface — samples were collected
• The search continued for days but no wreckage was ever recovered

The official response:
• The Canadian government maintained an official file on the incident (released through FOIA)
• The RCMP officer who responded filed a formal report classifying it as a "UFO crash"
• The Minister of National Defence was briefed
• The case was formally investigated but never resolved

I wrote the full Shag Harbour case — the witness interviews, the RCMP reports, the Navy search logs, and the unreleased government files:

➡️ https://www.disclosurehk.com/blog/ufo-case-shag-harbour/

Canada took this seriously enough to involve the Navy and RCMP. What's your take on this case?""",
        "day": 15
    }
]


def main():
    print("=" * 60)
    print("  DisclosureHK Reddit Bulk Poster")
    print("=" * 60)
    print()
    
    # Get Reddit credentials
    client_id = input("Enter your Reddit Client ID: ").strip()
    client_secret = getpass.getpass("Enter your Reddit Client Secret: ").strip()
    username = input("Enter your Reddit username: ").strip()
    password = getpass.getpass("Enter your Reddit password: ").strip()
    
    print("\nConnecting to Reddit...")
    
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent="disclosurehk-promotion/1.0 (by /u/" + username + ")",
        username=username,
        password=password,
    )
    
    # Verify authentication
    try:
        me = reddit.user.me()
        print(f"✅ Connected as u/{me.name} (karma: {me.link_karma + me.comment_karma})")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        sys.exit(1)
    
    print(f"\n{'=' * 60}")
    print(f"  Ready to post 15 articles across Reddit")
    print(f"  One post per day recommended")
    print(f"{'=' * 60}")
    print()
    
    print("Options:")
    print("  1 = Post all 15 NOW (risky — may trigger spam filter)")
    print("  2 = Post one specific post (#1-15)")
    print("  3 = Preview all posts (no actual posting)")
    print("  q = Quit")
    
    choice = input("\nChoose (1/2/3/q): ").strip().lower()
    
    if choice == "q":
        print("Bye!")
        return
    
    if choice == "3":
        print(f"\n{'=' * 60}")
        print(f"  Preview — 15 posts ready to go")
        print(f"{'=' * 60}")
        for i, p in enumerate(POSTS, 1):
            print(f"\n  #{i} → r/{p['subreddit']}")
            print(f"  Title: {p['title'][:80]}...")
        print(f"\nTotal: 15 posts")
        return
    
    if choice == "2":
        try:
            num = int(input("Enter post number (1-15): "))
            if num < 1 or num > 15:
                print("Invalid number")
                return
            posts_to_submit = [POSTS[num-1]]
            labels = [f"#{num}"]
        except ValueError:
            print("Invalid input")
            return
    elif choice == "1":
        posts_to_submit = POSTS
        labels = [f"#{i}" for i in range(1, 16)]
    else:
        print("Invalid choice")
        return
    
    if choice != "3":
        confirm = input(f"\n⚠️  Are you sure you want to post {len(posts_to_submit)} article(s)? (yes/no): ")
        if confirm.lower() != "yes":
            print("Cancelled.")
            return
    
    results = {"success": 0, "fail": 0}
    
    for idx, (post, label) in enumerate(zip(posts_to_submit, labels)):
        print(f"\n[{label}] Posting to r/{post['subreddit']}...")
        print(f"  Title: {post['title'][:70]}...")
        
        try:
            submission = reddit.subreddit(post['subreddit']).submit(
                title=post['title'],
                selftext=post['body']
            )
            print(f"  ✅ Posted! -> https://reddit.com{submission.permalink}")
            results["success"] += 1
        except Exception as e:
            error_msg = str(e)
            print(f"  ❌ Failed: {error_msg}")
            results["fail"] += 1
            
            # If rate limited, show remaining time
            if "RATELIMIT" in error_msg:
                import re
                match = re.search(r'(\d+) (minute|second|hour)', error_msg)
                if match:
                    print(f"  ⏰ Rate limited — {match.group(0)}")
        
        # Wait between posts to avoid rate limiting
        if idx < len(posts_to_submit) - 1 and choice == "1":
            wait = 60
            print(f"  ⏳ Waiting {wait}s before next post...")
            time.sleep(wait)
    
    print(f"\n{'=' * 60}")
    print(f"  Done! ✅ {results['success']} posted | ❌ {results['fail']} failed")
    print(f"{'=' * 60}")
    
    if results['fail'] > 0 and results['success'] == 0:
        print("\n💡 Tip: If you got 403 errors, you might need more karma in those subreddits")
        print("   Try posting in smaller subs like r/UFOB or r/UFObelievers first")


if __name__ == "__main__":
    main()
