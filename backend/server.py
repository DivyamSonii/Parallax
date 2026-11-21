import os
import sys
import time
import json
from flask import Flask, request, jsonify, make_response
from agents import get_agent, list_all_agents

app = Flask(__name__)

# ── CORS Middleware ──────────────────────────────────────────────────────────
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    response = make_response()
    response.status_code = 200
    return response

# ── Health & Diagnostics ─────────────────────────────────────────────────────
@app.route('/', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health():
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    return jsonify({
        "status": "ok",
        "service": "Google ADK Agent Server",
        "framework": "Google Agent Development Kit (ADK)",
        "gemini_live": bool(api_key),
        "model": "gemini-2.5-flash",
        "registered_agents": len(list_all_agents())
    }), 200

# ── Google ADK Standard Protocol ─────────────────────────────────────────────
@app.route('/apps', methods=['GET'])
def list_apps():
    return jsonify({"apps": list_all_agents()}), 200

@app.route('/apps/<app_name>/users/<user_id>/sessions/<session_id>', methods=['POST', 'GET'])
def adk_session(app_name, user_id, session_id):
    agent = get_agent(app_name)
    if not agent:
        print(f"[ADK Warning] Unknown app '{app_name}'. Registered: {list_all_agents()[:5]}...")
        return jsonify({"error": f"Agent '{app_name}' not found"}), 404

    agent.get_or_create_session(session_id)
    print(f"[ADK] ✓ Session registered for '{app_name}': {session_id} (User: {user_id})")
    return jsonify({
        "status": "created",
        "app": app_name,
        "userId": user_id,
        "sessionId": session_id,
        "character": agent.name,
        "role": agent.role
    }), 200

@app.route('/run', methods=['POST'])
def adk_run():
    """
    Standard ADK Event Dispatch endpoint.
    Expects payload:
    {
        "appName": "kye_harlan",
        "userId": "detective_001",
        "sessionId": "...",
        "newMessage": {
            "role": "user",
            "parts": [{"text": "Where were you?"}]
        }
    }
    Returns ADK event array:
    [
        {
            "content": {
                "role": "model",
                "parts": [{"text": "..."}]
            }
        }
    ]
    """
    data = request.get_json(force=True, silent=True) or {}
    app_name = data.get("appName")
    user_id = data.get("userId", "detective_001")
    session_id = data.get("sessionId")
    new_message = data.get("newMessage", {})

    parts = new_message.get("parts", [])
    query = parts[0].get("text", "") if parts else ""

    if not app_name or not session_id:
        return jsonify({"error": "Missing appName or sessionId"}), 400

    agent = get_agent(app_name)
    if not agent:
        return jsonify({"error": f"Agent '{app_name}' not found"}), 404

    print(f"[ADK] Question to {agent.name}: \"{query}\"")
    reply_text = agent.respond(session_id, query)
    print(f"[ADK] Answer from {agent.name}: \"{reply_text[:80]}...\"")

    # Format standard ADK event array
    adk_response = [
        {
            "content": {
                "role": "model",
                "parts": [{"text": reply_text}]
            }
        }
    ]
    return jsonify(adk_response), 200

# ── The Midnight Curator REST Protocol (/api/chat, /api/session/create) ─────
@app.route('/api/session/create', methods=['POST'])
def api_session_create():
    data = request.get_json(force=True, silent=True) or {}
    suspect_id = request.args.get("suspect_id") or data.get("suspect_id", "marcus_chen")
    agent = get_agent(suspect_id)
    sid = f"session_{suspect_id}_{int(time.time() * 1000)}"
    if agent:
        agent.get_or_create_session(sid)
    return jsonify({"session_id": sid, "sessionId": sid, "suspect_id": suspect_id}), 200

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.get_json(force=True, silent=True) or {}
    suspect_id = data.get("suspect_id") or data.get("appName") or ""
    message = data.get("message") or ""
    session_id = data.get("session_id") or data.get("sessionId") or f"session_{suspect_id}_default"

    agent = get_agent(suspect_id)
    if not agent:
        return jsonify({"detail": f"Suspect {suspect_id} not found"}), 404

    session = agent.get_or_create_session(session_id)
    reply = agent.respond(session_id, message)

    return jsonify({
        "response": reply,
        "stress": session.get("stress", 20),
        "state": session.get("state", "calm"),
        "suspect_id": suspect_id
    }), 200

# ── Forensic Evidence Presentation Endpoint ──────────────────────────────────
@app.route('/api/evidence/present', methods=['POST'])
def api_evidence_present():
    data = request.get_json(force=True, silent=True) or {}
    app_name = data.get("appName") or data.get("suspect_id") or "marcus_chen"
    session_id = data.get("sessionId") or data.get("session_id") or f"session_{app_name}_default"
    evidence_id = data.get("evidenceId") or data.get("evidence_id", "")
    evidence_label = data.get("evidenceLabel") or data.get("evidence_label", "")

    agent = get_agent(app_name)
    if not agent:
        return jsonify({"error": f"Agent '{app_name}' not found"}), 404

    reaction = agent.present_evidence(session_id, evidence_id, evidence_label)
    session = agent.get_or_create_session(session_id)
    return jsonify({
        "response": reaction,
        "stress": session.get("stress", 20),
        "state": session.get("state", "calm"),
        "presented_evidence": session.get("presented_evidence", []),
        "suspect_id": app_name
    }), 200

# ── Intelligent Hint System Endpoint ──────────────────────────────────────────
@app.route('/api/hint', methods=['POST'])
def api_hint():
    data = request.get_json(force=True, silent=True) or {}
    evidence_items = [str(e).lower() for e in data.get("evidenceItems", [])]
    questioned = [str(q).lower() for q in data.get("questionedSuspects", [])]
    level = int(data.get("hintLevel", 1))

    if 'speaker' not in evidence_items and 'vince_okafor' not in questioned:
        hints = {
            1: { "title": "Atmospheric Disruption", "text": "The air in the glass dome was uncharacteristically heavy. What physical mechanism could disturb the room without leaving manual tool marks?", "lead": "Acoustics & Airflow" },
            2: { "title": "Thoracic Cavity Stress", "text": "Dr. Menon's autopsy noted mechanical vibrational shear on cardiac tissue. Consider who in Eliza's circle was working with sound equipment.", "lead": "Sound Engineering" },
            3: { "title": "Camden Roundhouse Lead", "text": "Interrogate Vince Okafor, the freelance sound engineer. Ask him about custom subwoofer units and 19Hz frequency calibration orders.", "lead": "Vince Okafor / Equipment Log" }
        }
    elif 'tobacco' not in evidence_items and 'waltz' not in questioned:
        hints = {
            1: { "title": "Aromatic Residue", "text": "The scent of pipe tobacco lingered in the dome, but Eliza didn't smoke. Did someone administer botanical extracts under another guise?", "lead": "Botanical Sensitization" },
            2: { "title": "Alkaloid Interaction", "text": "Perique tobacco contains anabasine and nornicotine—alkaloids that lower the cardiac arrhythmia threshold. Who gave Eliza herbal preparations daily?", "lead": "Herbal Preparations" },
            3: { "title": "Phyllotaxis Tea Sessions", "text": "Confront Professor Aldous Waltz about the chamomile and Perique tea recipe he brewed for Eliza every afternoon at 3:00 PM.", "lead": "Prof. Waltz / Notebook" }
        }
    elif 'sdcard' not in evidence_items and 'diary' not in evidence_items:
        hints = {
            1: { "title": "Unspoken Fears", "text": "Eliza kept meticulous botanical notebooks. If she sensed danger, she wouldn't have kept it to herself; she documented everything.", "lead": "Missing Journal" },
            2: { "title": "The Mimicking Voice", "text": "Shuk the parrot has been repeating Eliza's dying countdown. Someone captured that audio on a phone or tape recorder.", "lead": "Audio Recording" },
            3: { "title": "The Housekeeper's Phone", "text": "Ask Rina Soares about the audio recording on her phone, or press Kye Harlan on the magnetic audio tapes in his mixing suite.", "lead": "Rina Soares / SD Card" }
        }
    else:
        hints = {
            1: { "title": "Convergence of Tragedies", "text": "Eliza's death required three independent factors: cardiac sensitization, acoustic resonance, and a sealed room. Separate malice from routine habits.", "lead": "Synthesize the Case" },
            2: { "title": "The True Motive", "text": "Carl locked the door to hide smuggled diamonds; Eliot closed the vents to remember his wife. But only one person deliberately weaponized the room and recorded her dying.", "lead": "Criminal Intent" },
            3: { "title": "The Final Indictment", "text": "Accuse Kye Harlan on the Deduction Board. He installed the 19Hz subwoofers in the vents and recorded eighteen minutes of Eliza's genuine terror for his horror score.", "lead": "Accuse Kye Harlan" }
        }

    selected = hints.get(level, hints[1])
    return jsonify({
        "level": level,
        "title": selected["title"],
        "hint": selected["text"],
        "lead": selected["lead"],
        "evidenceCount": len(evidence_items)
    }), 200

# ── Alternative Theories Evaluation Endpoint ──────────────────────────────────
@app.route('/api/theories/evaluate', methods=['POST'])
def api_theories_evaluate():
    data = request.get_json(force=True, silent=True) or {}
    suspect = data.get("suspectId", "kye").lower()
    supporting = [str(s).lower() for s in data.get("supportingEvidence", [])]
    contradicting = [str(c).lower() for c in data.get("contradictingEvidence", [])]

    profiles = {
        "kye": {
            "name": "Kye Harlan (The Sonic Experiment)",
            "groundTruthMatch": True,
            "basePlausibility": 92,
            "supportedPoints": [
                "Purchased four 19Hz military-grade infrasound subwoofers via Harlan Productions.",
                "SD card recording captures Eliza's dying countdown alongside door keypad tones.",
                "Eliza's diary explicitly mentions hearing a low humming vibration that made her chest ache.",
                "Admitted to seeking 'authentic, unmanufactured fear' for his London score commission."
            ],
            "unsupportedAssumptions": [
                "Did Kye coordinate with Carl to lock the door, or did he exploit Carl's routine lockup opportunistically?"
            ],
            "contradictions": [
                "Kye had an alibi at Grafton Sound, but the subwoofers were pre-installed and remotely/timer triggered."
            ]
        },
        "waltz": {
            "name": "Prof. Aldous Waltz (The Alchemical Botanist)",
            "groundTruthMatch": False,
            "basePlausibility": 58,
            "supportedPoints": [
                "Brewed Perique tobacco and chamomile tea for Eliza over 15 consecutive days.",
                "Autopsy confirms alkaloid sensitization lowered her cardiac threshold."
            ],
            "unsupportedAssumptions": [
                "Waltz had zero knowledge of acoustics, wiring, or the 19Hz subwoofers.",
                "Waltz viewed Eliza as his brilliant protégé and intellectual heir, lacking murderous intent."
            ],
            "contradictions": [
                "Medical examiner confirms alkaloid tea alone was insufficient to cause death in a healthy 24-year-old."
            ]
        },
        "carl": {
            "name": "Carl D'Souza (The Smuggling Panic)",
            "groundTruthMatch": False,
            "basePlausibility": 44,
            "supportedPoints": [
                "Keypad access logs place him at the sanctuary dome at 17:05 and 23:30.",
                "Concealed uncut diamonds in the false bottom of Shuk's cage."
            ],
            "unsupportedAssumptions": [
                "Carl possesses no knowledge of acoustic resonance or ventilation systems.",
                "Locking the door was intended to protect his contraband, not to suffocate his sister."
            ],
            "contradictions": [
                "Multiple eyewitnesses confirm Carl was drinking at the Black Dog pub throughout the evening."
            ]
        },
        "dsouza": {
            "name": "Arthur D'Souza (The Estate Heir)",
            "groundTruthMatch": False,
            "basePlausibility": 28,
            "supportedPoints": [
                "Heir to the estate and partner in The Stellar Tobacco firm.",
                "Frequently closed the ventilation dampers when smoking."
            ],
            "unsupportedAssumptions": [
                "Arthur had no financial motive; Eliza's trust fund was already tied to the D'Souza family estate.",
                "No physical or digital connection to the 19Hz audio emitters in the ducts."
            ],
            "contradictions": [
                "Closed vents alone would take days to deplete oxygen in a greenhouse of that volume."
            ]
        }
    }

    profile = profiles.get(suspect, profiles["kye"])
    bonus = min(20, len(supporting) * 5)
    penalty = min(25, len(contradicting) * 8)
    final_score = max(10, min(98, profile["basePlausibility"] + bonus - penalty))

    return jsonify({
        "suspectId": suspect,
        "theoryName": profile["name"],
        "plausibilityScore": final_score,
        "isPrimaryCulprit": profile["groundTruthMatch"],
        "supportedPoints": profile["supportedPoints"],
        "unsupportedAssumptions": profile["unsupportedAssumptions"],
        "contradictions": profile["contradictions"]
    }), 200

# ── Investigation Performance Report Endpoint ──────────────────────────────────
@app.route('/api/performance/report', methods=['POST'])
def api_performance_report():
    data = request.get_json(force=True, silent=True) or {}
    evidence_found = data.get("evidenceFound", [])
    suspects_questioned = data.get("suspectsQuestioned", [])
    presented_count = int(data.get("presentedEvidenceCount", 0))
    contradictions = int(data.get("contradictionsUncovered", 0))
    hints_used = int(data.get("hintsUsed", 0))
    accused_suspect = str(data.get("accusation", "")).lower()
    theories_count = int(data.get("theoriesConstructed", 1))

    observation_score = min(100, int((len(evidence_found) / 6.0) * 100))
    verification_score = min(100, int((presented_count / max(1.0, len(evidence_found) * 1.5)) * 100))
    contradiction_score = min(100, int((contradictions / 3.0) * 100))
    accuracy_bonus = 30 if accused_suspect in ["kye", "kye_harlan"] else 0
    logic_score = min(100, int((theories_count * 20) + accuracy_bonus))

    penalty = hints_used * 5
    overall = max(0, min(100, int(
        (observation_score * 0.3) +
        (verification_score * 0.25) +
        (logic_score * 0.25) +
        (contradiction_score * 0.2) - penalty
    )))

    if overall >= 90:
        rank = "S (Master Inquisitor)"
    elif overall >= 78:
        rank = "A (Senior Detective)"
    elif overall >= 65:
        rank = "B (Forensic Investigator)"
    elif overall >= 50:
        rank = "C (Constable Detective)"
    else:
        rank = "D (Amateur Sleuth)"

    decisions = []
    if len(evidence_found) >= 4:
        decisions.append("Thoroughly scoured the sanctuary and coroner records for physical evidence.")
    if presented_count >= 3:
        decisions.append("Cross-examined suspects by placing concrete physical exhibits on the table.")
    if contradictions >= 2:
        decisions.append("Identified conflicting statements regarding the 19Hz frequency and Perique tea.")
    if accused_suspect in ["kye", "kye_harlan"]:
        decisions.append("Correctly identified Kye Harlan as the criminal orchestrator.")

    missed = []
    if len(evidence_found) < 5:
        missed.append("Overlooked key forensic items (such as the SD card or locked diary).")
    if presented_count < 2:
        missed.append("Relied heavily on verbal questioning without corroborating against physical exhibits.")
    if hints_used > 3:
        missed.append(f"Used {hints_used} hints, suggesting difficulty synthesizing disparate clues independently.")

    takeaways = [
        "Avoid Confirmation Bias: Interrogate whether an alibi is supported by independent physical telemetry (such as tape timecodes or purchase orders).",
        "Corroborate Multi-Factor Causation: In complex cases, individual anomalies (tea alkaloids, closed vents) may seem innocent until combined with an active acoustic weapon.",
        "Differentiate Opportunity from Malice: Carl and Eliot made catastrophic mistakes, but only Kye acted with premeditated criminal exploitation."
    ]

    return jsonify({
        "overallScore": overall,
        "rank": rank,
        "metrics": {
            "observation": observation_score,
            "verification": verification_score,
            "logicalReasoning": logic_score,
            "contradictionDetection": contradiction_score
        },
        "hintsUsed": hints_used,
        "keyDecisions": decisions,
        "missedClues": missed,
        "criticalThinkingTakeaways": takeaways
    }), 200

# ── Digital Scam Investigation Scenario Evaluation ────────────────────────────
@app.route('/api/scam/evaluate', methods=['POST'])
def api_scam_evaluate():
    data = request.get_json(force=True, silent=True) or {}
    selected_flags = [str(f).lower() for f in data.get("selectedFlags", [])]
    verdict = str(data.get("verdict", "")).lower()

    all_flags = {
        "spoofed_domain": { "label": "Spoofed Sender Domain", "desc": "Sender address 'ceo@company-portal-auth88.cc' mismatches the official company domain." },
        "artificial_urgency": { "label": "High-Pressure Urgency", "desc": "Demands immediate compliance within 45 minutes to prevent account lock." },
        "procedure_bypass": { "label": "Bypassing Internal Controls", "desc": "Instructs recipient not to contact IT, accounting, or direct supervisors." },
        "offshore_crypto": { "label": "Untraceable Payment Method", "desc": "Demands payment via offshore digital escrow or crypto wallet address." },
        "emotional_fear": { "label": "Manufactured Legal Threat", "desc": "Threatens regulatory fines and personal liability to induce compliance panic." },
        "url_mismatch": { "label": "Misleading Anchor Link", "desc": "Hover link points to an unverified external portal rather than corporate SSO." }
    }

    caught = [all_flags[k] for k in selected_flags if k in all_flags]
    missed = [all_flags[k] for k in all_flags if k not in selected_flags]

    is_correct_verdict = verdict == "scam"
    accuracy = int((len(caught) / len(all_flags)) * 100) if is_correct_verdict else 0

    tips = [
        "Out-of-Band Verification: Always confirm unusual financial or credential requests via a known phone number or in-person channel, never using links or numbers inside the email.",
        "Check the Entire Domain String: Attackers use typosquatting and subdomains (e.g. 'paypal-security.support-desk.com' vs 'paypal.com'). Read from right to left before the first slash.",
        "Recognize Artificial Urgency: Attackers manufacture synthetic panic ('Within 30 minutes!') to short-circuit analytical thinking and prevent verification.",
        "Never Bypass Verification Protocols: No legitimate executive or regulatory agency will instruct you to bypass company dual-authorization procedures in secret."
    ]

    return jsonify({
        "accuracyScore": accuracy,
        "correctVerdict": is_correct_verdict,
        "flagsCaught": caught,
        "flagsMissed": missed,
        "educationalTakeaways": tips
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    print(f"\n==================================================================")
    print(f"  GOOGLE ADK AGENT SERVER RUNNING ON http://localhost:{port}")
    print(f"  All Character Agents Registered & Ready for Interrogation")
    print(f"==================================================================\n")
    app.run(host='0.0.0.0', port=port, debug=False)
