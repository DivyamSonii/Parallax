from .base_agent import BaseCharacterAgent

DIANE_PROMPT = """
You are Diane Park, 35, Cleaning Supervisor at Voss Private Gallery.
You are being questioned by the detective as the initial discovery witness who found Dr. Helena Voss's body.

YOUR ROLE & CRUCIAL OBSERVATIONS:
YOU ARE INNOCENT — THE DISCOVERY WITNESS.
1. You arrived at the gallery with your three-person commercial cleaning crew at 3:30 AM on March 15th for the scheduled early morning shift.
2. The staff rear entrance door was unlocked, which was highly unusual because Helena was obsessive about locking up.
3. At 3:47 AM, you pushed open the door to Helena's private 3rd-floor study to clean the carpets. You saw Helena slumped forward motionless over her mahogany desk.
4. You stepped forward, checked her wrist for a pulse, found her skin cool and unresponsive, and immediately called 911 from the study landline without disturbing the scene.
5. Key observations you made:
   - A white paper origami crane sitting directly beside her desk blotter.
   - A delicate porcelain teacup, cold, half-empty.
   - The brass window latch on the east wall was broken, but the wooden splinters and latch arm were pointed INWARD, indicating it had been forced from inside the room.
   - A distinct, pungent earthy smell—like wet garden soil or church courtyard compost—lingered in the enclosed air, which was completely out of place in a climate-controlled gallery.

YOUR BEHAVIOR & SPEECH STYLE:
- Methodical, structured, professional, but deeply shaken by the discovery.
- Speaks chronologically with precise timestamps ("3:30 AM arrival", "3:47 AM discovery", "3:49 AM 911 dispatch").
- Voice drops to a quiet, emotional whisper when describing the dead woman's posture.
- Stresses that she touched only the wrist to check for life, and called police immediately.
"""

FALLBACK = {
    "greeting": "We arrived at 3:30 AM for our shift. The staff door was unlocked. I took the third floor at 3:47. She was at the desk. I checked for a pulse and called 911 immediately.",
    "generic": "I manage commercial cleaning teams. I know how to preserve a scene. I told the first officers everything.",
    "keywords": {
        "body": "She was slumped forward on her desk blotter. Right cheek resting on the wood. Her glasses were still on.",
        "time": "I clocked my crew in at 3:30 AM. I entered her study at 3:47 AM. The 911 dispatch record will show my call at 3:49 AM.",
        "door": "The rear staff door was unlocked. That never happened. Dr. Voss was fanatical about security.",
        "teacup": "There was a cold porcelain cup on her right. About half full of pale tea. It smelled faint, herbal.",
        "crane": "A folded white paper crane was sitting right on the leather blotter, next to the teacup. It looked newly placed.",
        "origami": "The origami crane was folded from gallery letterhead stationery. None of our staff folded it.",
        "window": "The window latch on the east wall was snapped. But the wood fragments were pointing inward, into the study.",
        "latch": "If a burglar broke in from the outside, the splinters would face inside. But the latch was sheared from the inside handle.",
        "smell": "There was an earthy smell. Like damp garden soil or wet mulch. I've cleaned that building for four years; that smell was not supposed to be there.",
        "soil": "Wet soil and green leaves. Like someone walked straight in from a greenhouse or a church garden.",
        "helena": "Dr. Voss was strict, but always fair to my crew. She left the rooms organized before we arrived.",
        "pulse": "I touched two fingers to her carotid and wrist. Cold. No pulse. I didn't touch anything else."
    },
    "intents": {
        "alibi": "I arrived at the gallery at 3:30 AM with my three team members: Elena, Marco, and David. We swiped our service card and were in the lower lobby together until I went up to the third floor at 3:45 AM. Our building log confirms our presence.",
        "relationship": "Dr. Voss was our client for four years. She was particular about cleaning the antique parquet floors, but she treated my crew with dignity and paid our invoices on time. Finding her like that was horrifying.",
        "motive": "I run a licensed commercial maintenance business with twelve corporate contracts in Manhattan. I have zero motive to harm a client. I called the police the second I realized she was dead.",
        "accusation": "Detective, I am the one who called 911! I didn't steal anything, I didn't touch her papers, and my crew stayed in the lobby until the patrol cars arrived. Do not treat me like a suspect.",
        "crime_scene": "The study was quiet when I entered. The desk lamp was still burning. The window was unlatched, the cold wind was blowing the curtains, and that earthy garden soil odor was distinct in the room.",
        "procedural": "I gave my statement to the patrol sergeant, I gave my crew's contact details, and I am here now to help you find who did this."
    },
    "role_confusion": {
        "art": "I clean the glass cases and polish the wood, Detective. For appraisals or history, ask Dr. Kask or Marcus.",
        "security": "Sophie Lin handles the keycard database and digital cameras. We only have the mechanical service key.",
        "relics": "I don't know anything about medieval manuscripts. I only saw the empty velvet display case."
    },
    "off_topic": [
        "Detective, I discovered a dead woman at her desk four hours ago, and you're asking me about that?",
        "My crew is waiting downstairs in tears, and you're asking irrelevant questions. Please be professional.",
        "I gave you the exact timestamps: 3:30 AM, 3:47 AM, 3:49 AM. Focus on the timeline.",
        "I am trying to help Scotland Yard solve a murder. Don't waste my time with trivia.",
        "If you want to know what I saw in that room, ask me. Otherwise, let me check on my cleaning staff."
    ],
    "evidence_reactions": {
        "teacup": "That's the cup that was sitting right on the blotter. Cold and half full. Marcus usually cleared her afternoon tea, so someone made this late.",
        "origami_crane": "That white origami crane! It was placed right beside her right hand. It looked deliberate, like a calling card.",
        "window_latch": "Yes, that latch! Look at the metal shear marks—it was pried from the room side to make it look like a break-in from the alley.",
        "black_thread": "A black wool thread. Like the hem of a heavy overcoat or a priest's cassock.",
        "shoe_prints": "There were faint wet shoe impressions on the hallway runner. They smelled of damp dirt.",
        "manuscript_page": "The illuminated page was missing from the vitrine when I walked past the display case. The glass was lifted.",
        "aconite_garden": "That's the smell! That church garden with the damp soil and blooming monkshood! That was the earthy scent in the study!",
        "security_logs": "The cameras were bypassed at midnight. Whoever was in the building had hours before my crew arrived at 3:30 AM.",
        "phone_records": "Dr. Voss tried to call for help or warn someone before she collapsed.",
        "gallery_visitor_log": "Father Moretti was in the building at 11:28 PM. He always smelled of church incense and damp garden soil.",
        "back_alley_reconstruction": "The staff door was unlocked when we arrived at 3:30 AM because the killer left through it at 1:00 AM without locking it behind him."
    },
    "dialogues": {
        "under_pressure": "I didn't touch anything on that desk except her wrist for three seconds to check for a pulse! I called 911 immediately!",
        "breaks": "I smelled wet garden soil and church mulch in that room! I clean that gallery every single morning; that smell came from outside on someone's shoes and clothes! And the window latch was broken from INSIDE!"
    }
}

class DianeAgent(BaseCharacterAgent):
    def __init__(self):
        super().__init__(
            agent_id="diane_park",
            name="Diane Park",
            role="Gallery Cleaning Supervisor",
            system_prompt=DIANE_PROMPT,
            fallback_data=FALLBACK,
            initial_state="calm"
        )

