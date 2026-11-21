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
    suspect_id = request.args.get("suspect_id") or request.json.get("suspect_id", "marcus_chen")
    agent = get_agent(suspect_id)
    sid = f"session_{suspect_id}_{int(time.time() * 1000)}"
    if agent:
        agent.get_or_create_session(sid)
    return jsonify({"session_id": sid, "suspect_id": suspect_id}), 200

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.get_json(force=True, silent=True) or {}
    suspect_id = data.get("suspect_id", "")
    message = data.get("message", "")
    session_id = data.get("session_id", f"session_{suspect_id}_default")

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

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    print(f"\n==================================================================")
    print(f"  GOOGLE ADK AGENT SERVER RUNNING ON http://localhost:{port}")
    print(f"  All Character Agents Registered & Ready for Interrogation")
    print(f"==================================================================\n")
    app.run(host='0.0.0.0', port=port, debug=False)
