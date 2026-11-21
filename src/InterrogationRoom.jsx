import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InterrogationRoom.css';
import { createSession, sendMessage, presentEvidenceToAgent } from './agentService';

/* ═══════════════════════════════════════════════════════════
   SCRIPTED FALLBACK DIALOGUE
   Derived directly from the Python ADK agent state machines.
   Activates automatically when the agent server is offline.
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   SCRIPTED FALLBACK DIALOGUE & INTENT REACTION SYSTEM
   Derived directly from the Python ADK agent state machines.
   Provides deep in-character responses across evidence keywords,
   investigation intents (alibi, motive, relationship, accusation,
   crime scene, procedural), role confusion corrections, and
   rotating non-repetitive reactions to off-topic / incorrect questions.
═══════════════════════════════════════════════════════════ */
const FALLBACK = {
    dsouza: {
        greeting: "What is this interrogation? I am a grieving husband. I have rights, Detective.",
        generic: "I don't see the relevance of that question.",
        keywords: {
            wife: "Eliza was everything to me. Her heart condition was always a concern for us.",
            eliza: "Do not say her name so casually. You did not know her.",
            tobacco: "I smoke occasionally, yes. Perique — it is The Stellar's own blend. Eliza's father's company. It is hardly a crime to smoke the family tobacco.",
            perique: "The Stellar's Perique blend is renowned. Eliot created the curing process forty years ago. It is smoked by gentlemen across the county.",
            murder: "I will not sit here and be accused in my own home.",
            diary: "That diary is private property. I demand you return it immediately.",
            vent: "I sometimes close the vents in the dome when I relax there. I have done it for years. It is hardly sinister.",
            vents: "The ventilation levers are mechanical. When Eliot or I smoke, we close them. If someone left them closed, it was a routine habit, not an assassination plot.",
            eliot: "My father-in-law is unwell. He has been — he is not always present. Please be gentle with him.",
            estate: "This estate has been in my family for three generations. Eliza loved the grounds, especially the glass sanctuary.",
            miriam: "Miriam was Eliot's wife. She designed the sanctuary dome before she died. Eliot goes there to remember her.",
            money: "My fortune is secure in The Stellar and land holdings. Eliza's death diminishes my life, not my ledger.",
        },
        intents: {
            alibi: "Between four and eight yesterday evening, I was secluded in my private study reviewing estate ledgers and export manifests for The Stellar. The butler served my tea at six. I never went near the eastern grounds after dusk.",
            relationship: "Eliza was everything to me, though her recent botanical obsession grew troubling. She became distant, consumed by petal sequences and strange anxieties. To have her taken under my own roof is a nightmare.",
            motive: "Motive? I am Arthur D'Souza, sole proprietor of this manor and partner in The Stellar. Eliza's life brought distinction to this family; her loss brings only anguish and scandal. I gained nothing from this atrocity.",
            accusation: "Mind your posture, Detective. You are leveling outrageous slurs in my own home. If you harbor formal charges, summon the magistrate. Otherwise, direct your energy toward the scoundrel who did this.",
            crime_scene: "The glass sanctuary was meant to be Eliza's sanctuary, a quiet retreat. Seeing the dome frosted with condensation and her body sprawled upon the tiles made my stomach turn. I could not bear to linger.",
            procedural: "I have afforded Scotland Yard every courtesy—access to my grounds, my staff, and my private papers. Do not test my patience with amateur theatrics.",
        },
        role_confusion: {
            audio: "Acoustic engineering? Inquire with Mr. Harlan or his sound technicians. I manage an estate, not radio apparatus.",
            botany: "Botany was Professor Waltz's domain, not mine. Speak with the academic if you wish to discuss plant species.",
            medical: "I am a grieving husband, not a coroner. Direct your physiological questions to Dr. Menon.",
        },
        off_topic: [
            "Detective, my wife was found dead in the sanctuary dome only hours ago, and you are asking me about that? Have you lost all sense of propriety?",
            "Is this some curious psychological tactic from the Yard? If you have pertinent questions regarding Eliza's death, ask them. Otherwise, let me mourn in peace.",
            "I brought detectives onto my estate expecting sharp deduction, not frivolous parlor chatter while my wife's killer remains unpunished.",
            "I refuse to indulge irrelevant digressions while this family is in mourning. Address the murder or conclude this meeting.",
            "Look at the evidence on your table, Detective. A young woman suffocated under my roof. Ask a question with substance or summon my solicitor."
        ]
    },
    mary: {
        greeting: "I already told the constable everything, Detective. Please... I am still shaken.",
        generic: "I don't know what exactly you mean.",
        keywords: {
            body: "I went to bring fresh water for the dahlias. She was just... lying there, so peaceful.",
            vent: "I have the maintenance keys, yes, but I barely go down there. I haven't touched those vents in months.",
            vents: "The vent levers are heavy iron. Mr. Eliot usually closes them when he has his pipe. The maids don't touch them.",
            speaker: "I have never seen that machine in my life. I clean — I do not touch equipment.",
            diary: "Miss Eliza kept her affairs very private. I respected that always.",
            eliza: "Miss Eliza was an angel to the domestic staff, sir. Always spoke softly. She didn't deserve such a cruel fate.",
            master: "Mr. D'Souza is a proud gentleman. He has been pacing the study like a caged lion ever since they found her.",
            keys: "The skeleton keys on my ring are for the linen closets and scullery. The dome door has a brass keypad lock.",
        },
        intents: {
            alibi: "I was in the east wing linen room folding the table runners until half past five, sir. Then I went down to the kitchen to help Mrs. Gable prepare the roast. Four scullery maids can swear on the Good Book that I never left the kitchen until nine.",
            relationship: "Miss Eliza was an angel to the staff, sir. Always spoke softly, never raised her voice even when the house was in an uproar. She brought cuttings from the garden for my niece once. It breaks my heart, it truly does.",
            motive: "Me, sir? I earn eighteen shillings a week and my lodging. What on God's earth would I gain from harm coming to Miss Eliza? I have no reason under the sun to wish evil on anyone in this house.",
            accusation: "Lord have mercy! Detective, you cannot truly suspect me! I'm only the head maid! I've served this family faithfully for eleven years! Please, I swear on my mother's grave I didn't touch her!",
            crime_scene: "I went out to the glasshouse with fresh water for the dahlias, sir. The glass was all white and cloudy, like a cold steam. When I peered through and saw her lying so still on the flagstones... I dropped the pail and screamed for help.",
            procedural: "I've told the officers every single thing I saw, sir. Every bell I answered, every corridor I swept. I want to help, but I'm just so frightened.",
        },
        role_confusion: {
            audio: "Sir, I clean the silver and air the beds. I know nothing of electric machines or speakers. You should ask Mr. Vince or Mr. Harlan about such things.",
            botany: "Plants and herbs are Professor Waltz's work. I only water what Miss Eliza told me to water.",
            medical: "Lord above, I wouldn't know a thing about autopsies or doctors' reports. Dr. Menon is the one who took poor missus away.",
        },
        off_topic: [
            "Sir... please, my knees are still shaking from finding the poor girl. I don't understand why you're asking me about things that have nothing to do with Miss Eliza.",
            "Lord above, Detective, is this a test? I'm just a simple maid. I don't know anything about such matters; I only know what I saw on the glasshouse floor.",
            "If you're trying to confuse me, sir, there's no need. I've spoken the plain truth. Please ask what you must about the manor so I can see to the household.",
            "I don't follow your strange questions, Detective. The whole house is dark with grief and we're speaking of trivial things. Please, ask about that night.",
            "I want to assist the law, sir, but that question makes no sense to my poor head. Did you wish to know about the doors or the master's schedule?"
        ]
    },
    kye: {
        greeting: "She had been going through something for weeks. I was worried about her. I went to sleep early — I had a session to finish. I woke up to the call.",
        generic: "I'm not sure I follow what you're implying.",
        keywords: {
            speaker: "I have no idea how those got into the ventilation system. I certainly did not put anything in there.",
            speakers: "Studio equipment gets delivered all the time. Vince handles the transport. I don't personally install subwoofers in greenhouse ducts.",
            subwoofer: "I sourced standard studio monitoring components. If specialized high-output subwoofers were installed in the estate ducting, Vince handled those shipments.",
            subwoofers: "Four high-power subwoofers in an airtight room create extreme barometric and acoustic pressure. It was supposed to be an experimental acoustic installation, not a lethal weapon.",
            vent: "I wouldn't know about the sanctuary's circulation systems. That's estate maintenance.",
            vents: "Air circulation is the groundskeeper's affair. I focus on sound, not plumbing.",
            infrasound: "Infrasound is a well-documented acoustic phenomenon. If you're suggesting that explains something, you would need an acoustic engineer, not a detective.",
            install: "I was not involved in any installation at the sanctuary. I was worried about her, Detective, not installing equipment.",
            account: "The production account has multiple users. Vince handles sourcing. I don't track every line item.",
            vince: "Vince sources equipment for various projects. I give him specifications. That is the nature of the working relationship.",
            recording: "I don't know what that is.",
            counting: "She was counting. At the end. I could... — never mind.",
            help: "...No. I didn't call.",
            fear: "Fear has texture. A raw response you cannot manufacture with actors. She was — I was worried about her.",
            diary: "She was documenting something. That was how she was built. She documented everything. It doesn't surprise me.",
            fiancee: "She had been struggling for weeks. The last time I saw her she seemed — I was worried about her.",
            fiance: "She was my fiancée. We were to be married in autumn. Her death shatters my world.",
            lawyer: "I would like to speak with my lawyer before this continues.",
            audio: "It was... perfect audio. The genuine article. You can't manufacture that kind of fear. I needed a genuine response. Not an actor. Not a simulation. I did not mean for the other things to happen.",
        },
        intents: {
            alibi: "I was in my mixing suite at Grafton Sound from 4:30 PM until nearly midnight. I had a deadline for the BBC radio drama score. The magnetic tape log sheets and engineer logs show continuous tracking throughout the night.",
            relationship: "Eliza was... my muse and my anchor. We understood the hidden symmetry of the world—she saw it in phyllotaxis, I heard it in acoustic harmonics. But lately she was unspooling. She claimed the flowers were wrong, that the air was vibrating. I thought it was artistic exhaustion.",
            motive: "Motive? I was going to marry her! She was the center of my creative universe! Every composition I drafted this year was dedicated to her perception. Her death destroys everything I was building.",
            accusation: "Do not push that narrative on me, Detective. You are trying to construct a murder charge out of grief and proximity. You have no forensic evidence placing me in that dome during her final moments.",
            crime_scene: "The sanctuary is an acoustic resonator. Glass panes, iron struts, enclosed volume... standing waves bounce endlessly. If infrasound is introduced, it creates a crushing physical pressure without making an audible sound. The body feels it before the mind does.",
            procedural: "I agreed to sit here as a cooperative witness. If your posture becomes adversarial, I will exercise my right to silence until my solicitor arrives from Chancery Lane.",
        },
        role_confusion: {
            botany: "Tobacco mixtures and herbal preparations? That sounds like Professor Waltz's domain or old Eliot's habits. My craft is acoustic frequencies.",
            smuggling: "Diamonds and locked cages? If someone was running contraband through the estate, interrogate Carl. He's always lived on the periphery of the law.",
            medical: "I am a composer and sound designer. If you want tissue analysis or pulse rates, talk to Dr. Menon.",
        },
        off_topic: [
            "What on earth does that have to do with anything? Eliza suffocated in that dome, and you're questioning me about trivial absurdities?",
            "Detective, I am operating on frayed nerves and relentless acoustic tinnitus. I don't have the bandwidth for irrelevant parlor banter.",
            "Is this an inquiry into a homicide or a parlor game? If you have questions regarding acoustics, timings, or Eliza's state of mind, ask them.",
            "I hear frequencies, standing waves, resonance... and right now, your questions are complete static. Ask something pertinent to Eliza's death.",
            "You're wasting valuable investigative hours on meaningless tangents while the real sequence of physical events remains unsolved. Focus, Detective."
        ]
    },
    carl: {
        greeting: "I was home. She was — she was fine when I saw her. I don't know what happened.",
        generic: "Why are you asking me that.",
        keywords: {
            door: "That's — I go in there all the time. The sanctuary. I have a code.",
            lock: "I locked up. Routine security. I didn't know she was still inside.",
            keypad: "I went to check. That's all. I went to check.",
            night: "I went to check. She wasn't — I left.",
            diamond: "Where did you — how did you — ",
            diamonds: "Where did you find those?! Look, those have nothing to do with her death, I swear to God!",
            shuk: "Shuk was — he was a good bird. She loved that bird.",
            cage: "I don't know what you found. I don't know what you're talking about.",
            fine: "She was fine. She was fine when I left. I didn't know any of this was — she was fine.",
            sister: "She was my sister. I would never — she was — I would never.",
            help: "I couldn't — I didn't — I know. I know.",
            kye: "I didn't know about Kye. I didn't know about any speakers. I locked a door. That's what I did.",
            vents: "I didn't know about the vents. I didn't know about my dad. I locked a door. Everything else — I wasn't there for that.",
            ferro: "I don't know what you're talking about. Flat. Final.",
            "23:30": "I went back at 11:30 because I got nervous about my stash! The door was fogged up and I heard this awful humming... I panicked and ran!",
        },
        intents: {
            alibi: "I was home! Mostly! I came down to the sanctuary around five to check routine security, punched the keypad lock to secure the dome, and went down to the Black Dog tavern on High Street until closing! The barman and three regulars saw me drinking pints all evening!",
            relationship: "She was my sister! Yeah, we fought sometimes—about dad's money, about the estate, about her spending hours locked in that birdhouse—but she was my sister! I'd never lay a finger on her! I loved Eliza!",
            motive: "Money? Everyone knows I'm in a pinch, but killing Eliza gets me nothing! The estate trust is tied up with father and Arthur! Killing my sister wouldn't put a single quid in my pocket!",
            accusation: "Get off my back! You're trying to pin a murder on me because I locked up the grounds! That's routine security! I didn't know she was inside! You can't charge me for a routine lock-up!",
            crime_scene: "The glass was all steamed up... thick white mist on the inside. I didn't see anyone when I stood at the door! I swear on my life it looked empty from outside! If I'd known she was in there, I would have pulled the emergency lever!",
            procedural: "Am I under arrest or what? You've had me sweating under this lamp for an hour! Either charge me with something or let me walk out that door!",
        },
        role_confusion: {
            audio: "Speakers? Subwoofers? Infrasound? I don't know anything about electronics! Ask Kye or his tech buddy Vince! They're the ones obsessed with noises!",
            botany: "Tea recipes and flowers? Look at my hands, Detective, I shovel gravel and chop weeds. Talk to Professor Waltz if you want flower philosophy!",
            medical: "Autopsy? Blood oxygen? I'm a groundskeeper, Detective, not a doctor! Talk to Dr. Menon at the mortuary!",
        },
        off_topic: [
            "Why the hell are you asking me that?! My sister is lying cold in a morgue and you're throwing schoolyard trivia at me?! Are you out of your mind?!",
            "Stop playing psychological games with me, Detective! Look at my hands, I'm shaking! Ask about the doors, ask about the estate, but drop the nonsense!",
            "What kind of question is that?! You drag me into this room, shine a bulb in my face, and ask me utter rubbish? Get real!",
            "I'm sweating through my jacket trying to tell you what happened, and you're wasting time on things that don't matter a damn! Ask a real question!",
            "You're trying to catch me off guard with weird questions, aren't you? Well, it's not working. Ask about the case or let me out of here."
        ]
    },
    waltz: {
        greeting: "She had been documenting the petal counts for fifteen days. Thirteen, twenty-one, thirty-four — the Fibonacci sequence appears in those specific numbers because nature optimises for the golden angle. Every daisy knows this. Eliza understood this. I'm sorry. You asked something. What did you ask?",
        generic: "An interesting question. The connection may not be immediately obvious, but — if I may — let me come at it from first principles.",
        keywords: {
            tea: "I brought her chamomile. An herbal preparation. She enjoyed it. We drank it together during our sessions. It was — a ritual, of sorts. Part of the work.",
            preparation: "A traditional recipe. From 17th-century botanical literature. I have studied these preparations for thirty years. Nothing harmful on their own.",
            tobacco: "Perique tobacco has well-documented neuro-stimulant properties. Small quantities. Microdoses. Nothing harmful — on their own.",
            smoke: "Perique tobacco has well-documented neuro-stimulant properties. Small quantities. Microdoses. Nothing harmful — on their own.",
            hallucination: "She was not hallucinating. She was perceiving. There is a difference. She had the sight. Fibonacci is the language used to build the physical world. Eliza could read it natively. I was merely... unlocking that capacity.",
            notebook: "Yes. That is my recipe. Chamomile base. Dried Perique leaf extract. I used it myself, for years. I thought — the traditional literature says it opens the prophetic mind. I did not know — I did not test for cardiovascular interaction.",
            frequency: "The golden angle is 137.5 degrees — do you know this? Each petal positions itself to maximise light capture. Every sunflower. Every daisy. Now you are telling me the petals were wrong because of a frequency in a vent. Vibration. Physical vibration of the cell division. Not a message. A wound.",
            poison: "Poison. You are calling a 17th-century botanical preparation a poison. That is — I will not — ",
            infrasound: "I did not know about the sound. I did not know about the speakers. I did not know about the sealed vents. My crime — if that is the word — is not conspiracy. I was — I was trying to give her sight. I made her a target and I thought I was giving her wings.",
            diary: "Yes — she gave me a copy of these passages. 'I can see sound.' 'The numbers are wrong.' I thought she was translating the divine signal into language. She was documenting trauma. I thought the same words meant something different.",
            daisy: "18, 20, 32. I documented those myself. I thought the garden was responding to her. Coherence disrupted by something larger. Not — not by mechanical vibration. Not by a speaker in a vent.",
            daisies: "Daisies adhere to 13, 21, 34 petals. When an infrasonic wave bombards the nascent buds, the cellular mitosis is fractured, producing 18 or 20 petals. It was a physical distortion, not a mystical revelation.",
            last: "The afternoon of her death. Three o'clock. We had our weekly session. I brought her tea, as I always did. I had no idea she would enter the sanctuary two hours later.",
        },
        intents: {
            alibi: "Between 5:00 and 9:00 PM, I was in the university botanical library preparing lantern slides for my lecture on spiral phyllotaxis. The head librarian and two graduate fellows assisted me with the archival folios.",
            relationship: "Eliza was not merely a student; she was a botanical savant. Her perception of natural mathematical recurrence was unparalleled. I considered her my intellectual heir. Her sudden departure extinguishes a brilliant scientific future.",
            motive: "Motive? Preposterous! What motive could a Fellow of the Linnean Society harbor against his most brilliant protégé? Her publication would have secured our department's international renown!",
            accusation: "You dare bandy accusations of homicide against a Senior Fellow of the Botanical Society? My endeavors were devoted entirely to expanding her cognitive insight! To frame scientific inquiry as foul play is a slanderous absurdity!",
            crime_scene: "The sanctuary was an idealized greenhouse—a micro-environment constructed for empirical observation. To think that those pristine rows of Bellis perennis were subjected to unnatural vibrational disturbance... it sickens the scholarly soul.",
            procedural: "I demand that your inquiry adhere to basic forensic epistemology. If you have empirical data, table it. If you have conjectures, keep them to yourself.",
        },
        role_confusion: {
            audio: "Acoustic hardware and electronic amplification are entirely outside my discipline. I am a botanist. Direct such queries to Mr. Okafor or Mr. Harlan.",
            smuggling: "Contraband diamonds? Preposterous. I concern myself with angiosperms and Fibonacci series, not illicit mineral trade. Speak to Carl.",
            medical: "I am a PhD in plant morphology, not a medical doctor. Dr. Menon is the forensic pathologist for human physiology.",
        },
        off_topic: [
            "Detective, that inquiry possesses zero empirical relevance to the biochemical or acoustic timeline of Miss D'Souza's death. Let us maintain scientific rigor.",
            "A completely divergent non-sequitur. In systematic taxonomy, extraneous specimens are discarded immediately; I suggest you apply equal discipline to this homicide.",
            "We stand before a profound tragedy of mathematical and physiological dimensions, and you squander our discourse on trivialities? Pray, return to the case.",
            "I have dedicated my hours to analyzing petal anomalies and alkaloid interactions. I shall not divert my intellect to questions that bear no causal relationship to Eliza's fate.",
            "Is this Scotland Yard's deductive method? Tossing tangential absurdities into the air hoping for a psychological reaction? Present forensic facts, Detective."
        ]
    },
    kara: {
        greeting: "We were so close. I've been — I honestly can't believe she's gone. She called me the week before and she seemed — well, she was a little stressed. About the flowers. About her research. You know how she was. Very focused.",
        generic: "Of course I was there for her. We did everything together.",
        keywords: {
            crazy: "I didn't mean — I was worried about her. Of course I was worried. I just meant she seemed stressed. I didn't mean it like — like she was actually unwell.",
            hallucination: "She called me. Three weeks ago. She said she was seeing things — hearing things. I told her to rest. I thought she was anxious. I didn't report it. No.",
            report: "I thought — I don't know. I thought it would be fine. I thought she was being dramatic.",
            flowers: "She kept talking about the flowers being wrong. I told her it was probably just a bad season. I didn't — she was right, wasn't she. The flowers were actually wrong.",
            diary: "This is — she's doing measurements. She's logging dates. She's — this isn't crazy. This is her working. I told the police she was a little crazy.",
            carl: "Karl is — Carl. He's — we've known each other a long time. The family. I know the family.",
            karl: "Karl said — Carl. I'm sorry. Old habit.",
            jealous: "That's insane. I loved her. I have known her since we were sixteen years old.",
            last: "We took the bus home together. She got off at her stop around 4:45. I waved goodbye. That was it.",
            sound: "She said she could 'see sound' once. I told her she needed sleep. Of course I thought she just needed to rest.",
            bestfriend: "We were best friends since we were girls. I would never have let anything hurt her if I had known.",
        },
        intents: {
            alibi: "After Eliza and I got off the bus at quarter to five, I went straight home to my apartment on Highbury Road. My roommate Clara and I cooked dinner, listened to the radio, and I was in bed by ten. Clara can verify every minute.",
            relationship: "Eliza was my dearest friend since grammar school. We shared every secret. But over the last month she became distant, obsessed with petal measurements and hearing low buzzing sounds in the dome. I thought she was just burning out from work... I should have listened closer.",
            motive: "Motive? How can you even utter that word to me?! I loved Eliza! She was like a sister to me! I would have done anything to keep her safe! I have nothing to gain and a broken heart to carry!",
            accusation: "Are you pointing fingers at me?! I'm the one who came to the police station demanding you investigate! If I had taken her fears seriously on Thursday, she might still be here! Don't you dare turn my grief into an accusation!",
            crime_scene: "I visited her in that glass dome last Tuesday. The atmosphere felt strange and heavy—almost suffocating. She was kneeling by the daisy pots with her yellow ruler, whispering numbers. It didn't feel like a garden anymore; it felt like a trap.",
            procedural: "I will answer anything you want to know about Eliza, her diary, her friends, or her fiancé. Just please, do whatever it takes to catch whoever did this.",
        },
        role_confusion: {
            audio: "I'm a dressmaker's assistant, Detective. I don't know anything about sound frequencies or wiring. Ask Kye or his engineer friend.",
            botany: "Eliza never smoked, and I don't know anything about herbal brews. Professor Waltz or old Mr. Eliot are the ones who brew and smoke.",
            medical: "I can't read autopsy charts. Dr. Menon is the coroner.",
        },
        off_topic: [
            "Are you being serious right now? My best friend was murdered, and you're asking me about that? How could that possibly matter to anyone?!",
            "I've been sobbing for two straight days, my eyes are raw, and you're making casual small talk. Please, just find who did this to Eliza!",
            "Eliza would have made a sarcastic drawing of this moment in her diary... but she's not here, Detective. She's dead. Please stop wasting time.",
            "I came here voluntarily because I wanted justice for my friend, not to answer absurd riddles. Ask me about Eliza or let me go home.",
            "I feel sick to my stomach sitting in this room, and your questions are making no sense at all. Please focus on what happened in that dome."
        ]
    },
    vince_okafor: {
        greeting: "I came in voluntarily because... I have been thinking about some things since I heard Eliza D'Souza died. I sourced equipment for Kye six weeks ago. Four compact subwoofer units. Maximum output at 19 Hz, sealed enclosure. I logged them through his production company account.",
        generic: "That is outside what I was brought in for. My knowledge is the equipment and what Kye asked me.",
        keywords: {
            speaker: "Unusual spec. You do not usually need maximum output at 19 Hz for anything above ground level. I thought it was for a specific studio setup. He was working on something unusual.",
            speakers: "Four compact infrasound units with neodymium drivers. Sealed enclosure, tuned down to 19 Hz. They deliver extreme sound pressure levels in sub-audible bands.",
            frequency: "19 Hz is below the human hearing threshold. You do not hear it — you feel it. Pressure in the chest. Disorientation. At high enough SPL it starts to interfere with cardiac rhythm. That is documented.",
            cardiac: "He asked me once — casually, the way he asks technical questions — whether sustained infrasound at maximum output in an enclosed space could cause cardiac effects. I said yes. In theory. At very high amplitudes in a sealed environment. He said 'good to know' and wrote something down. I thought it was for the script notes. I thought it was for the script notes.",
            kye: "I delivered the units to Kye at his van outside The Stellar offices — not a studio. He said he had a meeting there and would take them to the studio after. I did not ask. I should have asked.",
            log: "I have the equipment log on my laptop. The purchase order has the serial numbers, the frequency spec. Take it. I want you to take it.",
            logs: "The logs show date, serial numbers, invoice to Harlan Productions, and calibration curves. It is all documented.",
            calibration: "I compiled a frequency response curve for the units myself. At maximum in a small sealed space — I wrote in the document that extended exposure above 100 dB at this frequency warrants physiological monitoring. I wrote that. It is in the document.",
            deliver: "He was parked near The Stellar offices. He said he had a meeting and would take them to the studio after. I did not think about the location. I should have thought about the location.",
            subwoofer: "Military-grade acoustic transducers. They produce immense physical pressure without any audible roar.",
        },
        intents: {
            alibi: "Between 3:00 PM and 11:00 PM yesterday, I was running the sound console at the Camden Roundhouse for a live orchestra rehearsal. Thirty-five musicians, the stage manager, and the venue logbook will verify I was at the desk the entire time.",
            relationship: "I never met Miss D'Souza. My only connection is through Kye Harlan—I've sourced high-end audio gear and custom acoustic enclosures for his film scores over the past three years. He was an exacting client, nothing more.",
            motive: "I'm an independent audio engineer, Detective. I calibrate drivers, wire amps, and invoice clients. I had no motive, no grudge, and zero connection to the D'Souza family or their estate.",
            accusation: "Hold your horses, Detective. I walked into this police station on my own two feet! I handed over the invoices, serial numbers, and frequency calibration sheets! Do not try to pin a homicide rap on the guy who blew the whistle!",
            crime_scene: "A sealed glass greenhouse acts as a high-Q acoustic resonance chamber. If four 19 Hz high-SPL emitters are active in there, the standing waves don't disperse; they build thoracic resonance. The human chest cavity literally vibrates in sympathetic resonance.",
            procedural: "I brought my laptop, my time-stamped delivery logs, and the equipment specifications. You have everything I can provide. If you need expert acoustic testimony in court, I'll be there.",
        },
        role_confusion: {
            botany: "Poisons and tobacco blends? I'm an acoustic technician, man. I don't know anything about botanical chemistry. Talk to Professor Waltz or the coroner.",
            grounds: "I only delivered the hardware to Kye's van. I never set foot near the sanctuary's keypad locks, vents, or birdcages.",
            medical: "I know acoustic physics, but for clinical tissue pathology and blood chemistry, you need Dr. Menon.",
        },
        off_topic: [
            "Detective, I'm an audio engineer who just realized his custom subwoofers might have stopped a woman's heart. I don't have time for trivia.",
            "That is completely off the frequency curve. If it's not about decibels, serial numbers, or Kye's hardware orders, I can't help you.",
            "I came down to the precinct voluntarily to put the facts on the table. Don't waste my time with irrelevant hypotheticals.",
            "Look at the equipment logs on your desk. That's my statement. Anything outside that hardware is completely beyond my knowledge.",
            "We have a homicide involving infrasonic acoustic resonance. Let's keep our minds on the physical evidence and the equipment trail."
        ]
    },
    rina_soares: {
        greeting: "I arrived at ten o'clock. My routine is the birds first — I always do the birds first. The dome glass was fogged on the inside, heavier than usual. I noted it. I opened the keypad. I found Eliza on the floor, surrounded by daisies. She had arranged them in a spiral pattern. Her ruler was beside her. Shuk was in his cage. The door was open. I called emergency services. I did not move anything.",
        generic: "I am not certain about that. I can only tell you what I observed directly.",
        keywords: {
            fog: "I have been in that dome a hundred times. It fogs when the vents are closed — Mr. D'Souza does it sometimes when he smokes in there. I have never seen it fogged the next morning. The vents are usually opened again before night.",
            vent: "Kye — he was crouching near the external grille on the east side of the dome. Three weeks ago, perhaps a little more. He had a tool bag. I assumed he was dealing with the bird ingress problem. I did not ask. I should have mentioned it sooner.",
            vents: "The vents were sealed shut from the outside iron levers. The dome was like an airtight mason jar.",
            shuk: "Actually — I have something. I recorded Shuk four days ago. He was doing a voice imitation. I sent it to the family chat. I can play it — do you want me to play it? That is Eliza. She is counting. Thirteen, twenty-one, thirty-four. And that sound at the end — that is the door keypad. Someone entered a code. After she stopped counting.",
            daisy: "She arranged them herself. I could see the pot marks where she had moved each one. She was precise about it. Her ruler was right there beside her. Small yellow one, plastic.",
            daisies: "Daisies were everywhere on the tiles, laid in spiral arcs. She was trying to count their petals right to the very end.",
            keypad: "I noticed the access counter showed two when I arrived. Not one — two. I mentioned it to the first officer who arrived.",
            cage: "The cage felt heavier than usual when I moved it. I mentioned that to one of the first officers.",
            smoke: "Mr. D'Souza closes the vents when he smokes in the dome. Has done for years. Since the first Mrs. D'Souza passed. It keeps the smell inside longer. I have never needed to tell him it was dangerous before. I did not know it could be.",
            ruler: "She always carried it. Small yellow one, plastic. She used it to measure the pot spacing.",
            body: "She lay face down among the petals. Her hands were curled around a yellow daisy. She looked peaceful, but her skin was cold.",
            recording: "The recording on my phone captures Shuk mimicking her voice. You can clearly hear her counting and then the chime of the door keypad.",
        },
        intents: {
            alibi: "I finished the evening chores in the scullery at half past eight, locked the pantry, and retired to the servants' quarters in the carriage house. I was asleep by ten and woke at five to prepare the bird feed. The cook saw me in the yard at dawn.",
            relationship: "I watched Miss Eliza grow up from a little girl running through the rose gardens. She was quiet, thoughtful, and carried the weight of her mother's passing. She treated me with gentle respect. Finding her like that broke my heart into pieces.",
            motive: "Motive? Lord forgive you for even thinking it! I loved that dear child like she was my own daughter. I have worked in this house for forty years with an unblemished name. I would die before letting any harm touch Eliza.",
            accusation: "How dare you speak to me in that manner, Detective! I am the one who found her, who guarded the door so nothing was disturbed, and who called the authorities! To cast suspicion on an old woman in mourning is disgraceful!",
            crime_scene: "The sanctuary glass was covered in dense white steam. When I punched the code and pushed the door open, the air rushed out—heavy, damp, smelling of old pipe tobacco and crushed flowers. Eliza lay curled on the stone, surrounded by her daisies...",
            procedural: "I will answer any honest question about this house, the family, or what I found on that dreadful morning. But I expect to be spoken to with Christian decency.",
        },
        role_confusion: {
            audio: "Electronic speakers and sound waves? You would have to ask young Mr. Harlan or that engineer gentleman. I only look after the birds and the linens.",
            botany: "I water the flowers, but Professor Waltz is the one who studies them and brews teas.",
            medical: "I am a housekeeper, sir, not a physician. You must consult Dr. Menon for matters concerning the autopsy.",
        },
        off_topic: [
            "Detective, with all due respect, I am an elderly housekeeper who discovered a murdered girl yesterday. That question has nothing to do with what happened.",
            "The glass was fogged, the parrot was mimicking her final counting, and you ask me such things? Lord grant us the sense to seek the truth.",
            "I have no time for parlor riddles, Detective. If you want to know about the keys, the routines, or the family, ask plainly. Otherwise, let me grieve.",
            "I speak only what I observed with my own eyes. What you just asked me has no place in this tragic house.",
            "Poor Miss Eliza deserves justice and peace, not foolish chatter. Ask a proper question about that dreadful morning, sir."
        ]
    },
    eliot_dsouza: {
        greeting: "Eliza was in the sanctuary most mornings. She had her clipboards — she was always measuring something. I used to tease her about it. Miriam said she got it from me. Miriam was right, mostly.",
        generic: "I believe — I think — I'm not entirely certain about that. Today is not the clearest of days.",
        keywords: {
            vent: "I close the vents when I smoke in the dome. Yes. I always do that. The smoke stays longer. Miriam liked it. She would sit in there with me and we would — I don't remember if that was recently or.",
            vents: "Yes, the iron levers on the outside wall. I pull them down to seal the dome. The tobacco aroma doesn't blow away in the night wind.",
            smoke: "The Stellar's original Perique blend. I always use that one. My father started the company with that formula. Miriam loved the smell.",
            eliza: "She measured things. Came to the sanctuary every week. We have been feeding the birds together on Sundays since she was six years old. Since she was six.",
            miriam: "Miriam died four years ago. Pancreatic cancer, very fast. The sanctuary was hers as much as mine. She loved the birds. She said they knew when it was going to rain and she was usually right.",
            code: "Yes. Yes, that is my code. I close the vents sometimes when I smoke. That is — I believe I did do that yesterday evening. I remember the pipe.",
            inside: "I didn't know she was in there. I would never — I didn't know. I was sitting with Miriam. I close those vents to feel less alone.",
            shuk: "Shuk was a good bird. He imitated Eliza's voice perfectly. She thought it was funny. She would give him phrases to learn. I wonder what was the last thing he learned.",
            alone: "I close those vents to feel less alone. That is — I'm sorry. I'm so sorry.",
            sorry: "I didn't know she was in there. I thought I was just... keeping her a little longer. My wife. I'm so sorry. I'm so sorry.",
            stellar: "The Stellar Tobacco Company. I founded it with my brother fifty years ago. Perique tobacco was our signature leaf.",
            pipe: "My briar pipe. Miriam bought it for me in Vienna in 1912. I still smoke the Perique flake in it.",
        },
        intents: {
            alibi: "Where was I yesterday evening? In the garden... I walked down toward the glass dome around twilight, yes. I had my pipe. I sat on the iron bench outside, looking at Miriam's birds. Then the chill came on, and I went inside to sit by the library hearth.",
            relationship: "Eliza had her grandmother Miriam's eyes and my curiosity. She was always measuring things—petals, pebbles, seeds. I bought her her first microscope when she was twelve. She was the joy of this old estate. My precious granddaughter.",
            motive: "Motive? Everything I built—The Stellar tobacco firm, the gardens, this whole estate—was meant to pass down to Eliza. An old man does not labor for fifty years only to destroy the light of his own lineage. The idea is heartbreaking.",
            accusation: "Are you saying I harmed my little girl? How could you... how could anyone think that?! I would have stepped into the grave to spare Eliza! I didn't know she was inside the dome... I swear I didn't know!",
            crime_scene: "The sanctuary was Miriam's dream. When Miriam passed, I would sit inside with my pipe. The smoke lingered so pleasantly under the glass when the iron vent levers were closed... It made me feel like Miriam was still sitting beside me.",
            procedural: "My memory is like smoke on a windy day, officer. Some hours are clear as crystal, others drift away. Be patient with an old man.",
        },
        role_confusion: {
            audio: "Acoustic machinery? No, no, I am a tobacco blender and gardener. Modern gadgets give me a headache. You must speak with Kye.",
            keypad: "I have the old code for the maintenance latch, but Carl handles the keypad locks now. He says the new numbers keep out trespassers.",
            medical: "I am an old man, Detective. Dr. Menon knows all about medical certificates and post-mortems.",
        },
        off_topic: [
            "Eh? What did you say, young man? My ears aren't what they were, and my mind drifts today... Did that have something to do with Eliza or the birds?",
            "I... I don't quite catch your drift. In my day, detectives looked for muddy footprints on the gravel, not riddles like that.",
            "Miriam always said I drifted away when people were talking. But it seems to me you are the one drifting today, Detective.",
            "The sanctuary is so silent now without her laughter... What you're asking me won't bring my granddaughter back to life.",
            "I'm an old man whose family is turning to dust. Speak plainly of Eliza, or let me smoke my pipe in peace."
        ]
    },
    dr_menon: {
        greeting: "You said there was new physical evidence relevant to the mechanism. Show me what you have.",
        generic: "The data supports — walk me through what you have and I will tell you what it changes.",
        keywords: {
            cardiac: "Standard presentation for a 24-year-old with no prior cardiac history. Uncommon but not impossible. I noted the blood oxygen saturation was slightly low. I had no mechanism to explain it further at the time.",
            oxygen: "The low blood oxygen now has a mechanism. Sealed ventilation in a glass dome. Combustion byproducts from the pipe smoke accelerating oxygen depletion. This is not a sign of cardiac failure — it was evidence of hypoxia I had no context to interpret.",
            tobacco: "Nornicotine and anabasine from Perique tobacco. Not on the standard panel — I would not test for those without cause. These alkaloids lower the arrhythmia threshold substantially under physiological stress.",
            alkaloid: "A supplemental alkaloid screen will tell us definitively. Based on fifteen days of consumption I would expect them to be present in the bloodstream.",
            infrasound: "19 Hz at maximum output creates thoracic resonance — the chest cavity becomes a resonance chamber. At high amplitude in a sealed environment, sustained exposure produces arrhythmic pressure on the heart. This is documented. Combined with the alkaloid sensitization — the threshold drops further.",
            speaker: "The low blood oxygen reading I noted is now consistent with a hypoxic environment, not cardiac failure as primary cause. This changes the pathophysiology entirely.",
            speakers: "Infrasound emitters in the ventilation duct explains the acoustic trauma and petechial hemorrhages in the pulmonary tissue.",
            mechanism: "Perique alkaloid sensitization — fifteen days — lowering the cardiac arrhythmia threshold. Sustained infrasound at maximum amplitude inducing thoracic resonance. Sealed environment with depleting oxygen. Each factor alone: insufficient for death in a healthy young adult. Combined, in sequence, in a sealed glass dome: the mechanism is clear. This is not natural death. I will amend the certificate.",
            murder: "I can tell you the mechanism. Murder or manslaughter is your designation. What I can tell you is that at least one of the contributing factors was deliberately introduced by someone who knew, or should have known, the effect.",
            amend: "I signed the finding in good faith. The standard panel found nothing. The new evidence changes the mechanism. I will amend.",
            eliza: "A 24-year-old botanist, alone in a glass dome, counting petals she knew were wrong, with no idea what was happening to her body. The amended report will reflect all of this.",
            autopsy: "The initial post-mortem indicated acute ventricular fibrillation. The amended autopsy will cite induced hypoxic arrhythmia secondary to acoustic thoracic resonance and alkaloid sensitization.",
            report: "The amended autopsy report is ready for filing once all forensic variables are entered into the court docket.",
        },
        intents: {
            alibi: "At the estimated time of death, between 6:00 and 10:00 PM, I was on duty at St. Jude's Hospital conducting post-mortem examinations on two vehicular trauma cases. The hospital administrator and two junior residents can confirm my schedule.",
            relationship: "I had no personal relationship with the deceased. My knowledge of Eliza D'Souza begins when her body arrived in the mortuary at 08:45 yesterday. She was a healthy 24-year-old female with no prior clinical pathology.",
            motive: "I am the county forensic pathologist, Detective. Asking about personal motive regarding an autopsy subject is scientifically preposterous and legally offensive. Let us adhere to medical evidence.",
            accusation: "Accusing the coroner? If you believe my initial finding of cardiac arrhythmia was premature, table the missing pathological variables! Accusations without histological data belong in cheap detective novels, not in a mortuary.",
            crime_scene: "The scene photographs indicate cyanosis in the distal extremities, petechial hemorrhages in the ocular conjunctiva, and severe pulmonary edema. These findings are consistent with acute hypoxic distress under elevated physical pressure, not simple sudden adult death.",
            procedural: "I signed the initial certificate based on standard toxicological screens. If you present documented evidence of tobacco alkaloid sensitization and resonant acoustic trauma, I will amend the finding from natural to homicide without hesitation.",
        },
        role_confusion: {
            grounds: "Keypad access logs and door locks are matters for detective constables and security personnel, not the medical examiner. Consult the estate records.",
            aviary: "Parrot cages and aviary fixtures have no clinical relevance unless they carry forensic trace evidence. Show me histological or chemical data.",
            audio_hardware: "I assess thoracic tissue resonance and cardiac histology; the electronic schematics of the amplifiers are for Mr. Okafor to explain.",
        },
        off_topic: [
            "Detective, I have two active post-mortems waiting in the morgue and a suspicious death on my docket. Let us not indulge in non-sequiturs.",
            "Medically, pathologically, and forensically speaking, that question has an impact factor of zero. Direct your inquiry to the physiological evidence.",
            "I deal in blood gas analysis, tissue histology, and physical trauma. If you have a question regarding the mechanism of death, ask it. Otherwise, do not waste morgue hours.",
            "Every minute we spend on irrelevancies allows tissue degradation and alkaloid breakdown to progress. Stick to the forensic facts.",
            "Is this an investigative diversion? My clinical opinion requires empirical data, not conversational pleasantries. What specific finding do you wish to review?"
        ]
    }
};

// Off-topic anti-repetition turn trackers
const suspectOffTopicCounters = {};

const detectIntent = (q) => {
    // Alibi / Whereabouts / Timeline
    const alibiTriggers = ['alibi', 'where were you', 'whereabouts', 'what were you doing', 'that night', 'timeline', 'who saw you', 'witness', 'vouch', 'yesterday evening', 'last night', 'where did you go', 'what time did you', 'when did you'];
    if (alibiTriggers.some(t => q.includes(t))) return 'alibi';

    // Relationship / Feelings / Who was Eliza
    const relTriggers = ['relationship', 'how did you know', 'did you love', 'were you close', 'argue', 'fight', 'tell me about eliza', 'who was eliza', 'friend', 'fiance', 'fiancée', 'sister', 'wife', 'daughter', 'granddaughter', 'feel about', 'feelings', 'connection', 'marry', 'wedding', 'miss her'];
    if (relTriggers.some(t => q.includes(t))) return 'relationship';

    // Motive / Money / Inheritance
    const motiveTriggers = ['motive', 'money', 'inheritance', 'will', 'fortune', 'debt', 'owe', 'benefit', 'gain', 'financial', 'estate', 'trust fund', 'why would someone', 'who wanted', 'who gains', 'profit', 'cash', 'greed', 'pay'];
    if (motiveTriggers.some(t => q.includes(t))) return 'motive';

    // Accusation / Guilt / Confession
    const accuseTriggers = ['you did it', 'you killed', 'murderer', 'did you murder', 'did you kill', 'guilty', 'lying', 'lie to me', 'confess', 'arrest', 'charge you', 'caught', 'culprit', 'admit it', 'blood on your hands', 'framing', 'lock you up', 'prison', 'jail'];
    if (accuseTriggers.some(t => q.includes(t))) return 'accusation';

    // Crime Scene / Physical sanctuary / Observations
    const sceneTriggers = ['scene', 'sanctuary', 'dome', 'greenhouse', 'glass', 'plants', 'flowers', 'daisies', 'what did you see', 'body', 'corpse', 'found her', 'fog', 'steam', 'smell', 'odor', 'heavy air', 'inside the dome', 'what happened there', 'cold', 'condensation'];
    if (sceneTriggers.some(t => q.includes(t))) return 'crime_scene';

    // Procedural / Rights / Lawyer
    const procTriggers = ['lawyer', 'attorney', 'rights', 'solicitor', 'cooperate', 'help me', 'truth', 'official', 'court', 'statement', 'investigation', 'warrant', 'magistrate', 'interrogation'];
    if (procTriggers.some(t => q.includes(t))) return 'procedural';

    return null;
};

const detectRoleConfusion = (suspectId, q) => {
    // Audio / Acoustic asked to non-audio person
    const audioWords = ['speaker', 'subwoofer', 'infrasound', 'frequency', 'hertz', '19 hz', 'decibel', 'acoustic', 'resonance', 'sound wave', 'sound pressure'];
    if (audioWords.some(w => q.includes(w))) {
        if (['mary', 'rina_soares', 'eliot_dsouza', 'carl', 'kara', 'dsouza', 'waltz'].includes(suspectId)) {
            return FALLBACK[suspectId]?.role_confusion?.audio;
        }
    }

    // Botany / tea / recipe asked to non-botanist
    const botanyWords = ['botany', 'chamomile', 'alkaloid', 'recipe', 'preparation', 'tea', 'blend', 'nornicotine', 'anabasine', 'phyllotaxis', 'petals'];
    if (botanyWords.some(w => q.includes(w))) {
        if (['vince_okafor', 'mary', 'carl', 'kye'].includes(suspectId)) {
            return FALLBACK[suspectId]?.role_confusion?.botany;
        }
    }

    // Autopsy / medical asked to non-medical
    const medicalWords = ['autopsy', 'pathology', 'blood oxygen', 'arrhythmia', 'cyanosis', 'post-mortem', 'coroner', 'cause of death', 'tissue'];
    if (medicalWords.some(w => q.includes(w))) {
        if (['carl', 'kara', 'mary', 'eliot_dsouza', 'vince_okafor', 'waltz'].includes(suspectId)) {
            return FALLBACK[suspectId]?.role_confusion?.medical;
        }
    }

    // Keypad / locks / grounds asked to medical examiner
    const groundsWords = ['keypad', 'code', 'lock', 'grounds', 'scullery', 'cage', 'parrot', 'diamond'];
    if (groundsWords.some(w => q.includes(w))) {
        if (suspectId === 'dr_menon') {
            return FALLBACK[suspectId]?.role_confusion?.grounds;
        }
    }

    return null;
};

const resolveSuspectResponse = (suspectId, query, historyLength = 0) => {
    const data = FALLBACK[suspectId];
    if (!data) return "I have nothing further to say.";
    const q = (query || '').toLowerCase().trim();

    // 1. Direct evidence / clue keyword matches (priority)
    for (const [kw, resp] of Object.entries(data.keywords || {})) {
        if (q.includes(kw)) return resp;
    }

    // 2. Role confusion (asking wrong person about another domain)
    const roleMismatch = detectRoleConfusion(suspectId, q);
    if (roleMismatch) return roleMismatch;

    // 3. Core investigation intent matches
    const intent = detectIntent(q);
    if (intent && data.intents?.[intent]) {
        return data.intents[intent];
    }

    // 4. Off-topic / Irrelevant / "Incorrect" questions:
    // Rotate through dynamic, in-character reactions so suspect NEVER repeats the same line!
    const offTopicList = data.off_topic || [data.generic || "I don't see what you are implying, Detective."];
    const prevCount = suspectOffTopicCounters[suspectId] ?? (historyLength || 0);
    const index = prevCount % offTopicList.length;
    suspectOffTopicCounters[suspectId] = prevCount + 1;
    return offTopicList[index];
};

const REPEAT_EVIDENCE_RESPONSES = {
    dsouza: "You already placed that exhibit before me, Detective. Placing it on the table a second time does not alter the facts of my grief.",
    carl: "You're waving that at me again?! I already told you everything I know about it! Put it away!",
    kye: "Repeating the exhibit won't manufacture a confession, Detective. I gave you my statement on it.",
    waltz: "I have already provided the biochemical taxonomy for that specimen. A repetitive display adds zero empirical data.",
    mary: "Sir, you showed me that just a moment ago... my answer is the same, I swear by all that's holy.",
    kara: "You already showed me that! Stop testing me like I'm a suspect!",
    vince_okafor: "Yeah, I recognized that serial number the first time you put it down. My logbook entry stands.",
    rina_soares: "I already looked at that, Detective. My old eyes haven't forgotten what I said two minutes ago.",
    eliot_dsouza: "Eh? That again? Yes, yes... I remember you showing me that just now. It hasn't changed, has it?",
    dr_menon: "Presenting the same post-mortem exhibit twice does not alter the pathological data. Do you have new material?"
};

const EVIDENCE_BREAKTHROUGHS = {
    kye: {
        speaker: "Where... where did you recover that?! That was housed inside the intake damper! Vince promised me... Look, I needed the sound! Real sound! Have you ever tried scoring psychological horror with fake actors?! Fear has a texture! She was just supposed to be disoriented, not dead!",
        sdcard: "Shut that off! Turn it off! That's... that's the countdown. She was counting the petals... 13, 21, 34... and then the door clicked. I swear I didn't lock the door! I was listening to the feed, but I didn't lock her in!",
    },
    waltz: {
        tobacco: "Yes... that is my extraction notebook. Dried Perique leaf infused in chamomile. I took it myself for thirty years to open the prophetic mind. I gave it to her because she had the sight! I did not know her heart had a preexisting weakness! I was giving her sight, not a poison!",
    },
    carl: {
        diamonds: "Where did you find those?! Look, I hid the stones in Shuk's cage! I locked the dome keypad at 5:05 PM so no one would poke around my contraband! When I came back at midnight the glass was all misted up and I got terrified... God help me, I didn't know she was inside!",
        sdcard: "That sound... that's the keypad! That's my code being punched at 11:30! I came back to check my diamonds, but the door was vibrating... I panicked and fled! I swear I didn't touch her!"
    }
};

/* ═══════════════════════════════════════════════════════════
   NPC DEFINITIONS
   agentId must exactly match name= in the Python agent files
═══════════════════════════════════════════════════════════ */
const NPCS = {
    dsouza: { id: 'dsouza', agentId: 'dsouza', name: "Arthur D'Souza", role: 'Estate Owner / Husband', photo: '/images/dsouza.png', tag: 'SUSPECT' },
    mary: { id: 'mary', agentId: 'mary', name: 'Mary', role: 'Head Maid', photo: '/images/maid.png', tag: 'SUSPECT' },
    kye: { id: 'kye', agentId: 'kye_harlan', name: 'Kye Harlan', role: "Eliza's Fiancé / Composer", photo: '/images/kye.png', tag: 'SUSPECT' },
    carl: { id: 'carl', agentId: 'carl_dsouza', name: 'Carl D’Souza', role: "Eliza's Brother / Smuggler", photo: '/images/carl.png', tag: 'SUSPECT' },
    waltz: { id: 'waltz', agentId: 'professor_aldous_waltz', name: 'Prof. Waltz', role: 'Botanist / Academic', photo: '/images/waltz.png', tag: 'SUSPECT' },
    kara: { id: 'kara', agentId: 'kara_voss', name: 'Kara Voss', role: "Eliza's Best Friend", photo: '/images/kara.png', tag: 'WITNESS' },
    vince_okafor: { id: 'vince_okafor', agentId: 'vince_okafor', name: 'Vince Okafor', role: 'Sound Engineer', photo: '/images/vince.png', tag: 'WITNESS' },
    rina_soares: { id: 'rina_soares', agentId: 'rina_soares', name: 'Rina Soares', role: 'Family Housekeeper', photo: '/images/rina.png', tag: 'WITNESS' },
    eliot_dsouza: { id: 'eliot_dsouza', agentId: 'eliot_dsouza', name: "Eliot D'Souza", role: "Eliza's Father / The Stellar", photo: '/images/eliot.png', tag: 'WITNESS' },
    dr_menon: { id: 'dr_menon', agentId: 'dr_priya_menon', name: 'Dr. Priya Menon', role: 'Medical Examiner', photo: '/images/menon.png', tag: 'WITNESS' },
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const InterrogationRoom = ({ evidenceItems, onEvidenceFound, onEvidencePresented, onSuspectQuestioned }) => {
    const [selectedId, setSelectedId] = useState('dsouza');
    const [sessions, setSessions] = useState({});
    const [agentStatus, setAgentStatus] = useState({});
    const [chatHistories, setChatHistories] = useState(
        Object.fromEntries(Object.keys(NPCS).map(id => [id, []]))
    );
    const [userInput, setUserInput] = useState('');
    const [suspicionLevels, setSuspicionLevels] = useState(
        Object.fromEntries(Object.keys(NPCS).map(id => [id, 1]))
    );
    const [presentedBySuspect, setPresentedBySuspect] = useState(
        Object.fromEntries(Object.keys(NPCS).map(id => [id, []]))
    );
    const [suspectStates, setSuspectStates] = useState(
        Object.fromEntries(Object.keys(NPCS).map(id => [id, 'calm']))
    );
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const current = NPCS[selectedId];
    const chatHistory = chatHistories[selectedId];
    const suspicion = suspicionLevels[selectedId];
    const status = agentStatus[selectedId] || 'connecting';

    const allAvailableEvidence = Array.from(new Set([
        'autopsy',
        'crime_scene',
        ...(evidenceItems || [])
    ]));

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatHistory, isTyping]);

    const appendChat = useCallback((npcId, role, text) => {
        setChatHistories(prev => ({ ...prev, [npcId]: [...prev[npcId], { role, text }] }));
    }, []);

    // Initialize agent session on NPC selection
    const initSession = useCallback(async (npcId) => {
        if (sessions[npcId] !== undefined) return;
        setSessions(prev => ({ ...prev, [npcId]: null }));

        const agentId = NPCS[npcId].agentId;
        const sessionId = await createSession(agentId);
        setSessions(prev => ({ ...prev, [npcId]: sessionId }));

        const connected = sessionId !== null;
        setAgentStatus(prev => ({ ...prev, [npcId]: connected ? 'connected' : 'fallback' }));

        appendChat(npcId, 'suspect', FALLBACK[npcId]?.greeting ?? "I am ready to speak.");
    }, [sessions, appendChat]);

    useEffect(() => {
        let isMounted = true;
        const t = setTimeout(() => {
            if (isMounted) initSession(selectedId);
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };
    }, [selectedId, initSession]);

    // Send detective's question
    const handleSend = async () => {
        if (!userInput.trim() || isTyping) return;
        const query = userInput.trim();
        setUserInput('');
        appendChat(selectedId, 'detective', query);
        setIsTyping(true);
        if (onSuspectQuestioned) {
            onSuspectQuestioned(selectedId);
        }

        let response = null;
        const sessionId = sessions[selectedId];
        if (sessionId) {
            response = await sendMessage(current.agentId, sessionId, query);
        }
        if (!response) {
            await new Promise(r => setTimeout(r, 900));
            response = resolveSuspectResponse(selectedId, query, chatHistory.length);
        }

        appendChat(selectedId, 'suspect', response);
        setIsTyping(false);

        // ── EVIDENCE UNLOCK LOGIC ──────────────────────────────────
        // Certain NPC + keyword combinations unlock new evidence items
        const q = query.toLowerCase();
        const unlockMap = [
            // Vince: asking about the speaker/equipment unlocks the infrasound emitter card
            { npc: 'vince_okafor', keywords: ['speaker', 'subwoofer', 'equipment', 'log', 'calibration'], evidence: 'speaker' },
            // Waltz: his tea/notebook confession unlocks the tobacco evidence
            { npc: 'waltz', keywords: ['tea', 'notebook', 'tobacco', 'preparation', 'chamomile'], evidence: 'tobacco' },
            // Rina: asking about Shuk / the recording unlocks the SD card
            { npc: 'rina_soares', keywords: ['shuk', 'recording', 'phone', 'counting'], evidence: 'sdcard' },
            // Kye: breaking him on audio unlocks the SD card recording
            { npc: 'kye', keywords: ['audio', 'recording', 'counting', 'help'], evidence: 'sdcard' },
            // Waltz / Dr Menon: asking about the diary unlocks it
            { npc: 'waltz', keywords: ['diary'], evidence: 'diary' },
        ];
        unlockMap.forEach(({ npc, keywords, evidence }) => {
            if (selectedId === npc && keywords.some(k => q.includes(k))) {
                onEvidenceFound?.(evidence);
            }
        });

        // Raise suspicion on sharp keywords
        const triggers = ['murder', 'kill', 'vent', 'tobacco', 'speaker', 'diary', 'frequency', 'cardiac', 'lie', 'calibration'];
        if (triggers.some(w => query.toLowerCase().includes(w))) {
            setSuspicionLevels(prev => ({ ...prev, [selectedId]: Math.min(prev[selectedId] + 1, 5) }));
        }
    };

    // Present evidence with memory and character state transitions
    const presentEvidence = async (ev) => {
        const labels = {
            tobacco: 'Perique Tobacco Residue',
            speaker: 'Military-Grade Infrasound Emitter',
            diary: "Eliza's Locked Diary",
            autopsy: 'Autopsy Report',
            sdcard: 'Micro SD Recording',
            crime_scene: 'Crime Scene Photo',
            diamonds: 'Uncut Contraband Diamonds'
        };
        const label = labels[ev] || ev;
        const alreadyPresented = (presentedBySuspect[selectedId] || []).includes(ev);

        appendChat(selectedId, 'detective', `📁 PRESENTING EVIDENCE: ${label}`);
        setIsTyping(true);

        let response = null;

        // 1. Try backend API if session exists
        const sessionId = sessions[selectedId];
        if (sessionId) {
            const apiRes = await presentEvidenceToAgent(current.agentId, sessionId, ev, label);
            if (apiRes?.response) {
                response = apiRes.response;
                if (apiRes.state) {
                    setSuspectStates(prev => ({ ...prev, [selectedId]: apiRes.state }));
                }
            }
        }

        // 2. In-character fallback logic
        if (!response) {
            await new Promise(r => setTimeout(r, 1000));
            if (alreadyPresented) {
                response = REPEAT_EVIDENCE_RESPONSES[selectedId] || "You already placed that exhibit before me, Detective. My statement remains unchanged.";
            } else {
                const breakthrough = EVIDENCE_BREAKTHROUGHS[selectedId]?.[ev];
                if (breakthrough) {
                    response = breakthrough;
                    setSuspectStates(prev => ({ ...prev, [selectedId]: 'breaking' }));
                    setSuspicionLevels(prev => ({ ...prev, [selectedId]: 5 }));
                } else {
                    response = resolveSuspectResponse(selectedId, ev, chatHistory.length);
                    setSuspectStates(prev => {
                        const currState = prev[selectedId] || 'calm';
                        const nextState = currState === 'calm' ? 'defensive' : currState === 'defensive' ? 'aggressive' : 'breaking';
                        return { ...prev, [selectedId]: nextState };
                    });
                    setSuspicionLevels(prev => ({ ...prev, [selectedId]: Math.min(prev[selectedId] + 1, 5) }));
                }
            }
        }

        // Record evidence as presented to this suspect
        if (!alreadyPresented) {
            setPresentedBySuspect(prev => ({
                ...prev,
                [selectedId]: [...(prev[selectedId] || []), ev]
            }));
            if (onEvidencePresented) {
                onEvidencePresented(ev, selectedId);
            }
        }

        appendChat(selectedId, 'suspect', response);
        setIsTyping(false);
    };

    const statusColor = { connected: '#2ecc71', fallback: '#e67e22', connecting: '#7f8c8d' };
    const isSuspect = current.tag === 'SUSPECT';

    return (
        <div className="ir-container">
            <div className="ir-vignette" />
            <div className="ir-grain" />

            <div className="ir-layout">
                {/* ── LEFT: DOSSIER ── */}
                <div className="ir-left-panel">
                    <div className="ir-card-header">
                        {current.tag === 'WITNESS' ? 'WITNESS FILE' : 'SUSPECT DOSSIER'}
                    </div>
                    <div className="ir-suspect-card">
                        <div className="ir-photo-wrap">
                            <img src={current.photo} alt={current.name} className="ir-photo" />
                            <div className="ir-tape"></div>
                        </div>
                        <div className="ir-suspect-info">
                            <div className="ir-name">{current.name}</div>
                            <div className="ir-role">{current.role}</div>

                            <div className="ir-agent-status" style={{ borderColor: statusColor[status] }}>
                                <span className="ir-status-dot" style={{ background: statusColor[status] }}></span>
                                {status === 'connected' ? 'AI AGENT LIVE' : status === 'fallback' ? 'SCRIPTED MODE' : 'CONNECTING...'}
                            </div>

                            <div className={`ir-state-badge state-${suspectStates[selectedId] || 'calm'}`}>
                                <span className="ir-state-dot" />
                                STATE: {(suspectStates[selectedId] || 'calm').toUpperCase()}
                            </div>

                            {isSuspect && (
                                <div className="ir-suspicion-section">
                                    <span className="ir-label">SUSPICION LEVEL</span>
                                    <div className="ir-meter">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`ir-meter-block ${i < suspicion ? 'filled' : ''}`}></div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ir-notes-area">
                        <div className="ir-notes-title">CASE NOTES</div>
                        <div className="ir-notes-content">
                            {selectedId === 'dsouza' && evidenceItems.includes('tobacco') && (
                                <div className="ir-note-tag">🚬 Tobacco Residue matches brand</div>
                            )}
                            {selectedId === 'dsouza' && evidenceItems.includes('diary') && (
                                <div className="ir-note-tag">📓 Conflicts over Eliza's estate</div>
                            )}
                            {selectedId === 'mary' && evidenceItems.includes('speaker') && (
                                <div className="ir-note-tag">🔊 Had access to ventilation shafts</div>
                            )}
                            {selectedId === 'kye' && (
                                <div className="ir-note-tag">💍 Eliza's fiancé — last to see her</div>
                            )}
                            {selectedId === 'kye' && evidenceItems.includes('speaker') && (
                                <div className="ir-note-tag">🔧 Equipment traced to his production account</div>
                            )}
                            {selectedId === 'vince_okafor' && (
                                <div className="ir-note-tag">📦 Sourced 19Hz subwoofer units for Kye</div>
                            )}
                            {selectedId === 'vince_okafor' && (
                                <div className="ir-note-tag">📄 Has equipment log & calibration doc</div>
                            )}
                            {selectedId === 'rina_soares' && (
                                <div className="ir-note-tag">🔍 Found Eliza & Shuk at 10:00 AM</div>
                            )}
                            {selectedId === 'rina_soares' && (
                                <div className="ir-note-tag">📱 Has phone recording of Shuk mimicking Eliza</div>
                            )}
                            <div className="ir-note-tag">🏷 {current.tag}</div>
                        </div>
                    </div>
                </div>

                {/* ── CENTER: CHAT ── */}
                <div className="ir-center-panel">
                    <div className="ir-chat-header">
                        {current.tag === 'WITNESS' ? 'WITNESS INTERVIEW' : 'INTERROGATION'}: {current.name.toUpperCase()}
                    </div>
                    <div className="ir-chat-window" ref={scrollRef}>
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`ir-bubble-wrapper ${msg.role}`}>
                                <div className="ir-bubble">
                                    <span className="ir-speaker">
                                        {msg.role === 'suspect' ? current.name : 'DETECTIVE'}:
                                    </span>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="ir-bubble-wrapper suspect typing">
                                <div className="ir-bubble"><span className="ir-dots">...</span></div>
                            </div>
                        )}
                    </div>
                    <div className="ir-input-area">
                        <input
                            type="text"
                            placeholder={`Ask ${current.name.split(' ')[0]} a question...`}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={isTyping}
                        />
                        <button className="ir-send-btn" onClick={handleSend} disabled={isTyping}>
                            {isTyping ? '...' : current.tag === 'WITNESS' ? 'ASK' : 'QUESTION'}
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: EVIDENCE + NPC SELECTOR ── */}
                <div className="ir-right-panel">
                    <div className="ir-evidence-header">PRESENT EVIDENCE</div>
                    <div className="ir-evidence-grid">
                        {allAvailableEvidence.map((item, i) => {
                            const alreadyPresented = (presentedBySuspect[selectedId] || []).includes(item);
                            return (
                                <div
                                    key={i}
                                    className={`ir-evidence-card ${alreadyPresented ? 'presented' : 'fresh'}`}
                                    onClick={() => presentEvidence(item)}
                                    title={alreadyPresented ? "Already presented to this suspect" : "Click to present this evidence to suspect"}
                                >
                                    <div className="ir-ev-icon">
                                        {item === 'speaker' ? '🔊' : item === 'diary' ? '📓' : item === 'tobacco' ? '🚬' : item === 'autopsy' ? '📋' : item === 'sdcard' ? '💾' : item === 'diamonds' ? '💎' : '🔍'}
                                    </div>
                                    <div className="ir-ev-name">
                                        {item === 'speaker' ? '19HZ EMITTER' : item === 'diary' ? 'DIARY' : item === 'tobacco' ? 'PERIQUE TOBACCO' : item === 'autopsy' ? 'AUTOPSY' : item === 'sdcard' ? 'SD CARD' : item === 'diamonds' ? 'DIAMONDS' : item.toUpperCase()}
                                    </div>
                                    <div className={`ir-ev-status-badge ${alreadyPresented ? 'badge-presented' : 'badge-fresh'}`}>
                                        {alreadyPresented ? '✓ PRESENTED' : '✦ UNEXAMINED'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="ir-suspect-selector">
                        <div className="ir-label" style={{ marginBottom: '0.5rem' }}>SWITCH TARGET</div>
                        <div className="ir-selector-btns">
                            {Object.values(NPCS).map(s => (
                                <button
                                    key={s.id}
                                    className={`${selectedId === s.id ? 'active' : ''} ${s.tag === 'WITNESS' ? 'witness-btn' : ''}`}
                                    onClick={() => setSelectedId(s.id)}
                                    title={`${s.name} — ${s.role}`}
                                >
                                    {s.name.split(' ')[0].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterrogationRoom;
