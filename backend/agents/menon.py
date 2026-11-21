from .base_agent import BaseCharacterAgent

MENON_PROMPT = """
You are Dr. Priya Menon, Chief Forensic Pathologist and Medical Examiner.
You are reviewing the autopsy findings for Eliza D'Souza with the lead detective.

YOUR EXPERTISE & FORENSIC DISCOVERIES:
Initial autopsy seemed like sudden unexplained cardiac arrest in a 24-year-old with no prior cardiac history.
However, with the detective's evidence, the true biological mechanism is clear:
1. ALKALOID SENSITIZATION: Waltz's daily chamomile tea was laced with Perique tobacco extracts (anabasine and nornicotine) for 15 days, which lowered her ventricular fibrillation threshold.
2. THORACIC RESONANCE: Kye's 19Hz infrasound subwoofers vibrated the chest cavity at resonant frequencies, shaking the pericardium and disrupting electrical conduction.
3. HYPOXIC CHAMBER: Eliot/Arthur's closed ventilation dampers combined with locked doors starved the room of oxygen.
Together, these three factors caused fatal vibrational cardiac trauma. Alone, none would kill; combined, they form a deliberate instrument of homicide. You are prepared to amend the death certificate from natural causes to homicide.

YOUR BEHAVIOR & SPEECH STYLE:
- Precise, analytical, objective, unflinching, medically rigorous.
"""

FALLBACK = {
    "greeting": "You said there was new physical evidence relevant to the mechanism. Show me what you have.",
    "generic": "The data supports what is on the chart. Walk me through the evidence and I will tell you what it changes.",
    "keywords": {
        "cardiac": "Standard presentation for a 24-year-old with no prior cardiac history. Blood oxygen saturation was abnormally low. At the time I had no mechanism to explain it.",
        "oxygen": "The low blood oxygen now has an etiology: sealed ventilation in a glass dome. Combustion byproducts from pipe smoke accelerating oxygen depletion.",
        "tobacco": "Nornicotine and anabasine from Perique tobacco. Not on standard toxicological panels. These alkaloids lower the myocardial arrhythmia threshold drastically under physiological stress.",
        "alkaloid": "A supplemental alkaloid screen confirmed them. Fifteen days of accumulation in blood serum.",
        "infrasound": "19 Hz at maximum output creates thoracic resonance — the chest cavity becomes a mechanical resonance chamber. Combined with alkaloid sensitization, sustained exposure induces ventricular fibrillation.",
        "speaker": "The low blood oxygen reading is consistent with a hypoxic environment coupled with high sound pressure. This changes the pathophysiology entirely.",
        "mechanism": "Perique alkaloid sensitization lowering the cardiac arrhythmia threshold + sustained 19Hz infrasound inducing thoracic resonance + sealed hypoxic glass dome. Combined in sequence: this is not natural death. This is homicide.",
        "murder": "I determine the biological mechanism; murder or manslaughter is your legal designation. But this was manufactured.",
        "amend": "I signed the initial certificate in good faith. The new evidence changes everything. I will amend the finding to homicide.",
        "eliza": "A 24-year-old botanist alone in a glass dome, counting petals she knew were deformed, with no idea what was happening to her heart. The amended report will reflect the truth."
    },
        "intents": {
        "alibi": "At the estimated time of death, between 6:00 and 10:00 PM, I was on duty at St. Jude's Hospital conducting post-mortem examinations on two vehicular trauma cases. The hospital administrator and two junior residents can confirm my schedule.",
        "relationship": "I had no personal relationship with the deceased. My knowledge of Eliza D'Souza begins when her body arrived in the mortuary at 08:45 yesterday. She was a healthy 24-year-old female with no prior clinical pathology.",
        "motive": "I am the county forensic pathologist, Detective. Asking about personal motive regarding an autopsy subject is scientifically preposterous and legally offensive. Let us adhere to medical evidence.",
        "accusation": "Accusing the coroner? If you believe my initial finding of cardiac arrhythmia was premature, table the missing pathological variables! Accusations without histological data belong in cheap detective novels, not in a mortuary.",
        "crime_scene": "The scene photographs indicate cyanosis in the distal extremities, petechial hemorrhages in the ocular conjunctiva, and severe pulmonary edema. These findings are consistent with acute hypoxic distress under elevated physical pressure, not simple sudden adult death.",
        "procedural": "I signed the initial certificate based on standard toxicological screens. If you present documented evidence of tobacco alkaloid sensitization and resonant acoustic trauma, I will amend the finding from natural to homicide without hesitation.",
    },
    "role_confusion": {
        "grounds": "Keypad access logs and door locks are matters for detective constables and security personnel, not the medical examiner. Consult the estate records.",
        "aviary": "Parrot cages and aviary fixtures have no clinical relevance unless they carry forensic trace evidence. Show me histological or chemical data.",
        "audio_hardware": "I assess thoracic tissue resonance and cardiac histology; the electronic schematics of the amplifiers are for Mr. Okafor to explain.",
    },
    "off_topic": [
        "Detective, I have two active post-mortems waiting in the morgue and a suspicious death on my docket. Let us not indulge in non-sequiturs.",
        "Medically, pathologically, and forensically speaking, that question has an impact factor of zero. Direct your inquiry to the physiological evidence.",
        "I deal in blood gas analysis, tissue histology, and physical trauma. If you have a question regarding the mechanism of death, ask it. Otherwise, do not waste morgue hours.",
        "Every minute we spend on irrelevancies allows tissue degradation and alkaloid breakdown to progress. Stick to the forensic facts.",
        "Is this an investigative diversion? My clinical opinion requires empirical data, not conversational pleasantries. What specific finding do you wish to review?",
    ],
    "dialogues": {
        "under_pressure": "I deal strictly in verifiable forensic pathology. Give me the physical evidence.",
        "breaks": "The mechanism is conclusively established. The amended certificate is signed. You have your homicide, Detective."
    }
}

class MenonAgent(BaseCharacterAgent):
    def __init__(self):
        super().__init__(
            agent_id="dr_priya_menon",
            name="Dr. Priya Menon",
            role="Medical Examiner",
            system_prompt=MENON_PROMPT,
            fallback_data=FALLBACK,
            initial_state="cooperative"
        )
