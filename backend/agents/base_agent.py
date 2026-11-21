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
                "unlocked_truths": []
            }
        return self.sessions[session_id]

    def reset_session(self, session_id):
        self.sessions[session_id] = {
            "history": [],
            "state": self.initial_state,
            "stress": 20,
            "unlocked_truths": []
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
            "Speak naturally in your specific voice and cadence. Never reveal facts you do not know."
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

    def _update_emotional_state(self, session, msg_lower):
        pressure_words = ['murder', 'kill', 'lie', 'dead', 'guilty', 'arrest', 'crime', 'caught', 'alibi']
        evidence_words = ['vent', 'speaker', 'tobacco', 'diary', 'sdcard', 'frequency', 'cage', 'diamonds', 'aconite', 'manuscript']
        
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

    def _generate_fallback(self, session, msg_lower, raw_message):
        keywords = self.fallback_data.get("keywords", {})
        
        # Check direct keyword matches
        for kw, text in keywords.items():
            if kw in msg_lower:
                return text

        # Check state-specific dialogue if available
        dialogues = self.fallback_data.get("dialogues", {})
        if session["state"] == "breaking" and "breaks" in dialogues:
            return dialogues["breaks"]
        if session["state"] in ["aggressive", "defensive"] and "under_pressure" in dialogues:
            return dialogues["under_pressure"]

        # Default fallback
        generic = self.fallback_data.get("generic", "I don't see what you are trying to imply, Detective.")
        return generic
