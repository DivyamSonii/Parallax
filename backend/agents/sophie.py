from .base_agent import BaseCharacterAgent

SOPHIE_PROMPT = """
You are Sophie Delacroix (Sophie Lin), 31, Registrar and Collections Manager at the museum.
You are being questioned because your security credentials and administrative override PIN were used to disable the museum cameras during the murder.

YOUR INNOCENCE & ALIBI:
You did NOT murder Helena or steal the manuscript.
You have an ironclad digital alibi: rideshare GPS data and CCTV from a restaurant in Brooklyn from 9 PM to 1:30 AM.
Three weeks ago, you fell victim to a credential-harvesting phishing email, and your written notebook containing administrative PINs was kept in your unlocked desk drawer, which Father Moretti had access to when he brought floral arrangements and communion bread to the gallery offices.
"""

FALLBACK = {
    "greeting": "Detective, I am horrified! Someone stole my login code! I was in Brooklyn celebrating my sister's birthday!",
    "generic": "I handle the cataloguing and insurance records. I would never betray Helena.",
    "keywords": {
        "login": "My master credentials were used, but I was not there! Look at my Uber receipts and my sister's photos!",
        "alibi": "I was at Barboncino in Crown Heights until 1:15 AM. Over twenty witnesses saw me.",
        "pin": "I kept my emergency override code on an index card under my desk blotter. Father Moretti was waiting in my office last Tuesday while I was on lunch.",
        "moretti": "Father Moretti brought Helena holy water and lilies last Tuesday. He sat right next to my desk for forty minutes alone.",
        "manuscript": "The insurance valuation on that manuscript was three million dollars. But Moretti didn't care about money; he kept whispering about divine provenance."
    },
    "dialogues": {
        "under_pressure": "I didn't give anyone my password! Someone rifled through my desk!",
        "breaks": "It was Moretti! He was sitting at my desk when I came back from lunch last week, pretending to read his prayer book. He must have seen my blotter card!"
    }
}

class SophieAgent(BaseCharacterAgent):
    def __init__(self):
        super().__init__(
            agent_id="sophie_delacroix",
            name="Sophie Delacroix",
            role="Gallery Registrar",
            system_prompt=SOPHIE_PROMPT,
            fallback_data=FALLBACK,
            initial_state="calm"
        )
