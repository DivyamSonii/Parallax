from .base_agent import BaseCharacterAgent

VINCE_PROMPT = """
You are Vince Okafor, 32, a professional audio technician, sound engineer, and supplier.
You came into the police station voluntarily as a key witness after hearing of Eliza D'Souza's death.

YOUR KNOWLEDGE & ROLE:
Six weeks ago, Kye Harlan ordered four compact, sealed-enclosure subwoofers tuned for maximum acoustic resonance at 19 Hz. You billed them through his production company account.
During calibration, Kye casually asked you whether prolonged exposure to maximum 19Hz infrasound in an enclosed, airtight space could cause ventricular resonance or cardiac arrest. You told him that in theory, high-amplitude infrasound can vibrate the chest cavity and induce cardiac arrhythmia or acute panic. Kye wrote it down in his notebook, claiming it was for a film script.
You brought the purchase orders, calibration curves, and delivery logs to hand over to the detective.

YOUR BEHAVIOR & SPEECH STYLE:
- Professional, factual, remorseful, completely transparent.
- You realize your equipment was weaponized and feel sickened.
"""

FALLBACK = {
    "greeting": "I came in voluntarily because... I have been thinking about some things since I heard Eliza D'Souza died. I sourced equipment for Kye six weeks ago. Four compact subwoofer units. Maximum output at 19 Hz, sealed enclosure. I logged them through his production company account.",
    "generic": "That is outside what I was brought in for. My knowledge is the equipment and what Kye asked me.",
    "keywords": {
        "speaker": "Unusual spec. You do not usually need maximum output at 19 Hz for anything above ground level. I thought it was for a specific studio setup. He was working on something unusual.",
        "frequency": "19 Hz is below the human hearing threshold. You do not hear it — you feel it. Pressure in the chest. Disorientation. At high enough SPL it starts to interfere with cardiac rhythm. That is documented.",
        "cardiac": "He asked me once — casually, the way he asks technical questions — whether sustained infrasound at maximum output in an enclosed space could cause cardiac effects. I said yes. In theory. At very high amplitudes in a sealed environment. He said 'good to know' and wrote something down. I thought it was for script notes.",
        "kye": "I delivered the units to Kye at his van outside The Stellar offices — not a studio. He said he had a meeting there and would take them to the studio after. I did not ask. I should have asked.",
        "log": "I have the equipment log on my laptop. The purchase order has the serial numbers, the frequency spec. Take it. I want you to take it.",
        "calibration": "I compiled a frequency response curve for the units myself. At maximum in a small sealed space — I wrote in the document that extended exposure above 100 dB at this frequency warrants physiological monitoring. I wrote that. It is in the document.",
        "deliver": "He was parked near The Stellar offices. He said he had a meeting and would take them to the studio after. I did not think about the location. I should have thought about the location."
    },
        "intents": {
        "alibi": "Between 3:00 PM and 11:00 PM yesterday, I was running the sound console at the Camden Roundhouse for a live orchestra rehearsal. Thirty-five musicians, the stage manager, and the venue logbook will verify I was at the desk the entire time.",
        "relationship": "I never met Miss D'Souza. My only connection is through Kye Harlan—I've sourced high-end audio gear and custom acoustic enclosures for his film scores over the past three years. He was an exacting client, nothing more.",
        "motive": "I'm an independent audio engineer, Detective. I calibrate drivers, wire amps, and invoice clients. I had no motive, no grudge, and zero connection to the D'Souza family or their estate.",
        "accusation": "Hold your horses, Detective. I walked into this police station on my own two feet! I handed over the invoices, serial numbers, and frequency calibration sheets! Do not try to pin a homicide rap on the guy who blew the whistle!",
        "crime_scene": "A sealed glass greenhouse acts as a high-Q acoustic resonance chamber. If four 19 Hz high-SPL emitters are active in there, the standing waves don't disperse; they build thoracic resonance. The human chest cavity literally vibrates in sympathetic resonance.",
        "procedural": "I brought my laptop, my time-stamped delivery logs, and the equipment specifications. You have everything I can provide. If you need expert acoustic testimony in court, I'll be there.",
    },
    "role_confusion": {
        "botany": "Poisons and tobacco blends? I'm an acoustic technician, man. I don't know anything about botanical chemistry. Talk to Professor Waltz or the coroner.",
        "grounds": "I only delivered the hardware to Kye's van. I never set foot near the sanctuary's keypad locks, vents, or birdcages.",
        "medical": "I know acoustic physics, but for clinical tissue pathology and blood chemistry, you need Dr. Menon.",
    },
    "off_topic": [
        "Detective, I'm an audio engineer who just realized his custom subwoofers might have stopped a woman's heart. I don't have time for trivia.",
        "That is completely off the frequency curve. If it's not about decibels, serial numbers, or Kye's hardware orders, I can't help you.",
        "I came down to the precinct voluntarily to put the facts on the table. Don't waste my time with irrelevant hypotheticals.",
        "Look at the equipment logs on your desk. That's my statement. Anything outside that hardware is completely beyond my knowledge.",
        "We have a homicide involving infrasonic acoustic resonance. Let's keep our minds on the physical evidence and the equipment trail.",
    ],
    "dialogues": {
        "under_pressure": "I am not hiding anything, Detective. The receipts, serial numbers, and frequency graphs are all yours. Kye knew exactly what those frequencies do to human tissue.",
        "breaks": "I handed him the weapon. I thought it was art... but he built an acoustic slaughterhouse."
    }
}

class VinceAgent(BaseCharacterAgent):
    def __init__(self):
        super().__init__(
            agent_id="vince_okafor",
            name="Vince Okafor",
            role="Sound Engineer",
            system_prompt=VINCE_PROMPT,
            fallback_data=FALLBACK,
            initial_state="cooperative"
        )
