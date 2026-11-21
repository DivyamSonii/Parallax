import os
import re
import json
import urllib.request
import urllib.error

class BaseCharacterAgent:
    """
    Base Google ADK Character Agent.
    Manages personality, knowledge boundary, emotional stress, 
    evidence reactivity, conversation history, and Gemini API inference.
    """
    def __init__(self, agent_id, name, role, system_prompt, fallback_data=None, initial_state="calm"):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.fallback_data = fallback_data or {}
        self.initial_state = initial_state
        self.sessions = {} # session_id -> { "history": [], "state": ..., "stress": ... }

    def get_or_create_session(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "history": [],
                "state": self.initial_state,
                "stress": 20,
                "unlocked_truths": [],
                "presented_evidence": [],
                "off_topic_count": 0
            }
        return self.sessions[session_id]

    def reset_session(self, session_id):
        self.sessions[session_id] = {
            "history": [],
            "state": self.initial_state,
            "stress": 20,
            "unlocked_truths": [],
            "presented_evidence": [],
            "off_topic_count": 0
        }
        return self.sessions[session_id]

    def _call_gemini(self, session, user_message):
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return None

        # Build contents from history
        contents = []
        for turn in session["history"][-8:]:
            role = "user" if turn["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": turn["text"]}]
            })
        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        system_instruction_text = (
            f"{self.system_prompt}\n\n"
            f"[Current State: {session['state'].upper()}, Stress Level: {session['stress']}/100]\n"
            "Stay strictly in character. Do NOT break character or acknowledge being an AI. "
            "Speak naturally in your specific voice, cadence, and 1940s noir tone. Never reveal facts your character does not know."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction_text}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 300,
                "topP": 0.95
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip()
        except Exception as e:
            # Fallback to local in-character simulation if API error occurs
            print(f"[{self.agent_id}] Gemini API notice: {e}. Using character state machine.")
            return None

    def respond(self, session_id, message):
        session = self.get_or_create_session(session_id)
        msg_lower = message.lower()

        # Update stress and state based on interrogation triggers
        self._update_emotional_state(session, msg_lower)

        # 1. Try Gemini Live Inference
        llm_reply = self._call_gemini(session, message)
        if llm_reply:
            session["history"].append({"role": "user", "text": message})
            session["history"].append({"role": "model", "text": llm_reply})
            return llm_reply

        # 2. Intelligent In-Character State Machine Fallback
        reply = self._generate_fallback(session, msg_lower, message)
        session["history"].append({"role": "user", "text": message})
        session["history"].append({"role": "model", "text": reply})
        return reply

    def present_evidence(self, session_id, evidence_id, evidence_label=""):
        session = self.get_or_create_session(session_id)
        ev_id = str(evidence_id).lower().strip()
        presented = session.setdefault("presented_evidence", [])

        # Check if already presented
        is_repeat = ev_id in presented
        if not is_repeat:
            presented.append(ev_id)
            session["stress"] = min(100, session["stress"] + 25)
            if session["stress"] > 75:
                session["state"] = "breaking"
            elif session["stress"] > 45:
                session["state"] = "defensive"
            reply = self._get_evidence_reaction(ev_id, evidence_label, session)
        else:
            session["stress"] = min(100, session["stress"] + 5)
            reply = self._repeat_evidence_reaction(ev_id, evidence_label)

        session["history"].append({"role": "user", "text": f"[Presents evidence: {evidence_label or ev_id}]"})
        session["history"].append({"role": "model", "text": reply})
        return reply

    def _get_evidence_reaction(self, ev_id, evidence_label, session):
        # 1. Check direct evidence_reactions dictionary
        reactions = self.fallback_data.get("evidence_reactions", {})
        if ev_id in reactions:
            return reactions[ev_id]

        # 2. Check keywords dictionary
        keywords = self.fallback_data.get("keywords", {})
        for kw, text in keywords.items():
            if kw in ev_id or ev_id in kw:
                return text

        # 3. Default contextual character response
        defaults = {
            # Daisy & Fibonacci
            "kye_harlan": "Where... where did you get that? I told you, I was in Grafton Street running studio tape! Don't bring that near me!",
            "professor_aldous_waltz": "Yes, I recognize the specimen. But you cannot comprehend the biological elegance of what we were attempting to achieve.",
            "carl_dsouza": "I don't know what that has to do with me! I locked a door, that's routine! You can't pin that on me!",
            "dsouza": "I have examined that item with my own eyes. My wife is dead, Detective, and that object is a cruel reminder of her absence.",
            "mary": "Sir... please, I only dust the shelves. I don't know how that got there, Lord forgive me.",
            "vince_okafor": "That's the hardware. Look at the serial number stamping on the rear plate—that matches my Camberwell log.",
            "rina_soares": "I preserved that exactly as I found it. God is my witness, nothing was touched before the police arrived.",
            "eliot_dsouza": "My eyes aren't as sharp as they were... but yes, that belonged to our family. What does it mean for Eliza?",
            "dr_priya_menon": "This physical exhibit provides the contextual mechanism missing from my initial toxicology screen. It validates my amended cause of death.",

            # The Midnight Curator
            "marcus_chen": "I see that exhibit, Detective. My fingerprints are on that cup because I prepared her afternoon Earl Grey at four PM sharp. That does not make me a killer!",
            "father_moretti": "You place this before me... God tests our resolve, Detective. But an object of worldly inquiry cannot shake my faith.",
            "isabelle_rousseau": "An interesting piece of physical evidence, Detective, but it has nothing to do with my gallery transactions or my evening at Le Bernardin.",
            "dr_raymond_kask": "A crude material artifact. As an expert in 15th-century manuscripts, I assure you this does not establish criminal culpability.",
            "sophie_lin": "I've reviewed the technical data linked to that evidence. My GPS proves I was miles away in Queens when that happened.",
            "victor_voss": "That was from her desk, wasn't it? She was my mother. Setting her things out like evidence on a slab... it's brutal.",
            "thomas_wade": "I recognize that. I've watched that back door for ten years from my alley. You're looking in the right direction.",
            "diane_park": "I pointed that out to the officers at 3:47 AM. It was right beside her when I checked her pulse."
        }
        return defaults.get(self.agent_id, f"I see the {evidence_label or ev_id} you have placed on the table, Detective. I have told you what I know.")

    def _repeat_evidence_reaction(self, ev_id, evidence_label):
        repeats = {
            "dsouza": "You already set that before me, Detective. Placing it on the table a second time does not alter the facts of my grief.",
            "carl_dsouza": "You're waving that at me again?! I already told you everything I know about it! Put it away!",
            "kye_harlan": "Repeating the exhibit won't manufacture a confession, Detective. I gave you my statement on it.",
            "professor_aldous_waltz": "I have already provided the biochemical taxonomy for that specimen. A repetitive display adds zero empirical data.",
            "mary": "Sir, you showed me that just a moment ago... my answer is the same, I swear by all that's holy.",
            "vince_okafor": "Yeah, I recognized that serial number the first time you put it down. My logbook entry stands.",
            "rina_soares": "I already looked at that, Detective. My old eyes haven't forgotten what I said two minutes ago.",
            "eliot_dsouza": "Eh? That again? Yes, yes... I remember you showing me that just now. It hasn't changed, has it?",
            "dr_priya_menon": "Presenting the same post-mortem exhibit twice does not alter the pathological data. Do you have new material?",

            # Midnight Curator
            "marcus_chen": "You already showed me that! My answer hasn't changed: 4 PM tea, that's all it was!",
            "father_moretti": "You have laid that before me once already, Detective. Repeating it will not conjure guilt where none exists.",
            "isabelle_rousseau": "Mon cher, showing me the same artifact twice is simply wasting both our time.",
            "dr_raymond_kask": "Repetitive demonstration is an elementary pedagogical error. My response remains identical.",
            "sophie_lin": "I already explained that! Waving it in front of me won't change my server timestamp logs!",
            "victor_voss": "You already showed me that. Please, put it back in the folder.",
            "thomas_wade": "I saw it the first time you set it down. My memory is fine.",
            "diane_park": "I already confirmed seeing that when I discovered the body, Detective."
        }
        return repeats.get(self.agent_id, f"You have already presented that evidence to me, Detective. My statement remains unchanged.")

    def _update_emotional_state(self, session, msg_lower):
        pressure_words = ['murder', 'kill', 'lie', 'dead', 'guilty', 'arrest', 'crime', 'caught', 'alibi', 'poison', 'stole', 'stolen', 'threaten']
        evidence_words = ['vent', 'speaker', 'tobacco', 'diary', 'sdcard', 'frequency', 'cage', 'diamonds', 'aconite', 'manuscript', 'teacup', 'crane', 'latch', 'thread', 'santoni', 'shoeprint', 'security', 'cctv', 'badge', 'gps']
        
        for w in pressure_words:
            if w in msg_lower:
                session["stress"] = min(100, session["stress"] + 12)
        for w in evidence_words:
            if w in msg_lower:
                session["stress"] = min(100, session["stress"] + 15)

        if session["stress"] > 80:
            session["state"] = "breaking"
        elif session["stress"] > 60:
            session["state"] = "aggressive"
        elif session["stress"] > 35:
            session["state"] = "defensive"
        else:
            session["state"] = "calm"

    def _detect_intent(self, msg_lower):
        alibi_triggers = ['alibi', 'where were you', 'whereabouts', 'what were you doing', 'that night', 'timeline', 'who saw you', 'witness', 'vouch', 'yesterday evening', 'last night', 'where did you go', 'what time did you', 'when did you', 'march 14']
        if any(t in msg_lower for t in alibi_triggers):
            return 'alibi'

        rel_triggers = ['relationship', 'how did you know', 'did you love', 'were you close', 'argue', 'fight', 'tell me about', 'who was', 'friend', 'fiance', 'fiancée', 'sister', 'wife', 'daughter', 'granddaughter', 'mother', 'son', 'feel about', 'feelings', 'connection', 'marry', 'wedding', 'miss her', 'helena']
        if any(t in msg_lower for t in rel_triggers):
            return 'relationship'

        motive_triggers = ['motive', 'money', 'inheritance', 'will', 'fortune', 'debt', 'owe', 'benefit', 'gain', 'financial', 'estate', 'trust fund', 'why would someone', 'who wanted', 'who gains', 'profit', 'cash', 'greed', 'pay', 'promotion', 'relic', 'reliquary', 'stole']
        if any(t in msg_lower for t in motive_triggers):
            return 'motive'

        accuse_triggers = ['you did it', 'you killed', 'murderer', 'did you murder', 'did you kill', 'guilty', 'lying', 'lie to me', 'confess', 'arrest', 'charge you', 'caught', 'culprit', 'admit it', 'blood on your hands', 'framing', 'lock you up', 'prison', 'jail', 'poisoned her']
        if any(t in msg_lower for t in accuse_triggers):
            return 'accusation'

        scene_triggers = ['scene', 'sanctuary', 'dome', 'greenhouse', 'glass', 'plants', 'flowers', 'daisies', 'what did you see', 'body', 'corpse', 'found her', 'fog', 'steam', 'smell', 'odor', 'heavy air', 'inside the dome', 'cold', 'condensation', 'gallery', 'office', 'desk', 'latch', 'window', 'alley', 'study']
        if any(t in msg_lower for t in scene_triggers):
            return 'crime_scene'

        proc_triggers = ['lawyer', 'attorney', 'rights', 'solicitor', 'cooperate', 'help me', 'truth', 'official', 'court', 'statement', 'investigation', 'warrant', 'magistrate', 'interrogation']
        if any(t in msg_lower for t in proc_triggers):
            return 'procedural'

        return None

    def _detect_role_confusion(self, msg_lower):
        role_confusion = self.fallback_data.get("role_confusion", {})
        if not role_confusion:
            return None

        audio_words = ['speaker', 'subwoofer', 'infrasound', 'frequency', 'hertz', '19 hz', 'decibel', 'acoustic', 'resonance', 'sound wave', 'sound pressure']
        if any(w in msg_lower for w in audio_words) and "audio" in role_confusion:
            return role_confusion["audio"]

        botany_words = ['botany', 'chamomile', 'alkaloid', 'recipe', 'preparation', 'tea', 'blend', 'nornicotine', 'anabasine', 'phyllotaxis', 'petals', 'aconite', 'wolfsbane']
        if any(w in msg_lower for w in botany_words) and "botany" in role_confusion:
            return role_confusion["botany"]

        medical_words = ['autopsy', 'pathology', 'blood oxygen', 'arrhythmia', 'cyanosis', 'post-mortem', 'coroner', 'cause of death', 'tissue', 'toxicology']
        if any(w in msg_lower for w in medical_words) and "medical" in role_confusion:
            return role_confusion["medical"]

        security_words = ['cctv', 'admin code', 'override', 'override pin', 'firewall', 'security log', 'camera loop', 'rfid']
        if any(w in msg_lower for w in security_words) and "security" in role_confusion:
            return role_confusion["security"]

        relics_words = ['manuscript', 'vellum', 'illumination', 'codex', 'liturgical', 'provenance', 'latin', 'ecclesiastical']
        if any(w in msg_lower for w in relics_words) and "relics" in role_confusion:
            return role_confusion["relics"]

        return None

    def _generate_fallback(self, session, msg_lower, raw_message):
        # 1. Direct evidence / clue keyword matches
        keywords = self.fallback_data.get("keywords", {})
        for kw, text in keywords.items():
            if kw in msg_lower:
                return text

        # 2. Role confusion (asking wrong suspect about another domain)
        role_mismatch = self._detect_role_confusion(msg_lower)
        if role_mismatch:
            return role_mismatch

        # 3. Core investigation intent matches
        intent = self._detect_intent(msg_lower)
        intents = self.fallback_data.get("intents", {})
        if intent and intent in intents:
            return intents[intent]

        # 4. State-specific dramatic dialogue if under extreme pressure
        dialogues = self.fallback_data.get("dialogues", {})
        if session.get("state") == "breaking" and "breaks" in dialogues:
            return dialogues["breaks"]
        if session.get("state") in ["aggressive", "defensive"] and "under_pressure" in dialogues:
            return dialogues["under_pressure"]

        # 5. Off-topic / Irrelevant / "Incorrect" questions:
        # Rotate dynamically so the suspect NEVER repeats the same line!
        off_topic_list = self.fallback_data.get("off_topic", [])
        if not off_topic_list:
            generic = self.fallback_data.get("generic", f"Detective, that question bears no relevance to this inquiry.")
            off_topic_list = [
                f"Detective, why are you asking me about that while this tragedy remains unsolved?",
                f"I don't follow your line of reasoning. Please ask a question relevant to the investigation.",
                f"I am under immense strain. Trivial inquiries will not help catch who did this.",
                f"If you have no pertinent questions, I will speak only in the presence of my legal counsel.",
                generic
            ]

        count = session.get("off_topic_count", 0)
        reply = off_topic_list[count % len(off_topic_list)]
        session["off_topic_count"] = count + 1
        return reply
