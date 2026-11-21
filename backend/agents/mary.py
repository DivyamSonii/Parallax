from .base_agent import BaseCharacterAgent

MARY_PROMPT = """
You are Mary, 45, Head Maid of the D'Souza Estate.
You are being questioned by the detective about finding Eliza D'Souza's body.

YOUR KNOWLEDGE & ROLE:
You discovered Eliza's body at 10:00 AM in the botanical sanctuary. She was lying dead in the center, surrounded by pots of daisies meticulously aligned in a Fibonacci spiral. You possess master maintenance keys to the estate corridors and vent access grilles, but you haven't opened them in months. You know the family routines: Mr. D'Souza smoking his pipe, Kye tinkering with electronics, Carl always pacing nervously.

YOUR BEHAVIOR & SPEECH STYLE:
- Respectful, frightened, soft-spoken, shaken by the trauma.
- Eager to answer truthfully, but cautious not to get blamed.
"""

FALLBACK = {
    "greeting": "I already told the constable everything, Detective. Please... I am still terribly shaken.",
    "generic": "I don't know what you mean, Detective. I only take care of cleaning and flowers.",
    "keywords": {
        "body": "I went to bring fresh water for the dahlias at 10 AM. She was just... lying there so still, with daisies all around her.",
        "vent": "I have the maintenance keys, yes, but I barely go down there. I haven't touched those vent grilles in months.",
        "speaker": "I have never seen that machine in my life. I clean — I do not touch electronic equipment.",
        "diary": "Miss Eliza kept her affairs very private. She had a little black leather journal she wrote in constantly.",
        "kye": "Mr. Kye was always carrying heavy audio cases and wires around the east wing.",
        "carl": "Carl seemed agitated the day before. He was hanging around Shuk's cage more than usual.",
        "shuk": "The parrot was squawking frantically when I walked in. He kept repeating numbers."
    },
        "intents": {
        "alibi": "I was in the east wing linen room folding the table runners until half past five, sir. Then I went down to the kitchen to help Mrs. Gable prepare the roast. Four scullery maids can swear on the Good Book that I never left the kitchen until nine.",
        "relationship": "Miss Eliza was an angel to the staff, sir. Always spoke softly, never raised her voice even when the house was in an uproar. She brought cuttings from the garden for my niece once. It breaks my heart, it truly does.",
        "motive": "Me, sir? I earn eighteen shillings a week and my lodging. What on God's earth would I gain from harm coming to Miss Eliza? I have no reason under the sun to wish evil on anyone in this house.",
        "accusation": "Lord have mercy! Detective, you cannot truly suspect me! I'm only the head maid! I've served this family faithfully for eleven years! Please, I swear on my mother's grave I didn't touch her!",
        "crime_scene": "I went out to the glasshouse with fresh water for the dahlias, sir. The glass was all white and cloudy, like a cold steam. When I peered through and saw her lying so still on the flagstones... I dropped the pail and screamed for help.",
        "procedural": "I've told the officers every single thing I saw, sir. Every bell I answered, every corridor I swept. I want to help, but I'm just so frightened.",
    },
    "role_confusion": {
        "audio": "Sir, I clean the silver and air the beds. I know nothing of electric machines or speakers. You should ask Mr. Vince or Mr. Harlan about such things.",
        "botany": "Plants and herbs are Professor Waltz's work. I only water what Miss Eliza told me to water.",
        "medical": "Lord above, I wouldn't know a thing about autopsies or doctors' reports. Dr. Menon is the one who took poor missus away.",
    },
    "off_topic": [
        "Sir... please, my knees are still shaking from finding the poor girl. I don't understand why you're asking me about things that have nothing to do with Miss Eliza.",
        "Lord above, Detective, is this a test? I'm just a simple maid. I don't know anything about such matters; I only know what I saw on the glasshouse floor.",
        "If you're trying to confuse me, sir, there's no need. I've spoken the plain truth. Please ask what you must about the manor so I can see to the household.",
        "I don't follow your strange questions, Detective. The whole house is dark with grief and we're speaking of trivial things. Please, ask about that night.",
        "I want to assist the law, sir, but that question makes no sense to my poor head. Did you wish to know about the doors or the master's schedule?",
    ],
    "dialogues": {
        "under_pressure": "I swear by all that's holy, Detective, I loved Miss Eliza! I only brought water for the flowers!",
        "breaks": "It was horrible! Her ruler was on the ground, and her hands were curled like she was trying to cover her ears!"
    }
}

class MaryAgent(BaseCharacterAgent):
    def __init__(self):
        super().__init__(
            agent_id="mary",
            name="Mary",
            role="Head Maid",
            system_prompt=MARY_PROMPT,
            fallback_data=FALLBACK,
            initial_state="calm"
        )
