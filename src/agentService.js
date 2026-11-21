/**
 * agentService.js
 * Connects the game's Interrogation Room to a local Google ADK agent server.
 * Server: http://localhost:8000
 * Model:  ollama_chat/gemini-3-flash-preview:cloud  (via LiteLLM, as in the agent .py files)
 *
 * ADK App Names (must exactly match `name=` in your Python agent files):
 *   dsouza        → Arthur D'Souza
 *   mary          → Mary (Head Maid)
 *   kye           → Kye Harlan
 *   carl          → Carl (Groundskeeper)
 *   waltz         → Professor Waltz
 *   kara          → Kara
 *   vince_okafor  → Vince Okafor (sound engineer / witness)
 *   rina_soares   → Rina Soares (housekeeper / discovery witness)
 */

const BASE_URL = 'http://localhost:8000';
const DETECTIVE_USER_ID = 'detective_001';

// ─────────────────────────────────────────
// SESSION CREATION
// ─────────────────────────────────────────
/**
 * Creates a session for the given ADK agent app.
 * Returns the sessionId string on success, or null if the server is unreachable.
 */
export const createSession = async (agentAppName) => {
    const sessionId = `session_${agentAppName}_${Date.now()}`;
    const url = `${BASE_URL}/apps/${agentAppName}/users/${DETECTIVE_USER_ID}/sessions/${sessionId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: 'interrogation_room',
                game: 'daisy_and_fibonacci'
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        console.log(`[ADK] ✓ Session for "${agentAppName}": ${sessionId}`);
        return sessionId;

    } catch (err) {
        console.warn(`[ADK] ✗ Could not create session for "${agentAppName}": ${err.message}`);
        return null;
    }
};

// ─────────────────────────────────────────
// MESSAGE DISPATCH
// ─────────────────────────────────────────
/**
 * Sends the detective's message to the specified agent and returns the response text.
 * Returns null if the server is unreachable or if no text is found in the response.
 *
 * @param {string} agentAppName  — the ADK app name (e.g. 'vince_okafor')
 * @param {string} sessionId     — the active session ID
 * @param {string} message       — the detective's question or presented evidence text
 * @returns {Promise<string|null>}
 */
export const sendMessage = async (agentAppName, sessionId, message) => {
    if (!sessionId) return null;

    const payload = {
        appName: agentAppName,
        userId: DETECTIVE_USER_ID,
        sessionId,
        newMessage: {
            role: 'user',
            parts: [{ text: message }]
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        // ADK returns an array of event objects; find last model text turn
        const modelEvents = (Array.isArray(result) ? result : [])
            .filter(e => e?.content?.role === 'model' && e?.content?.parts?.[0]?.text);

        if (modelEvents.length > 0) {
            return modelEvents[modelEvents.length - 1].content.parts[0].text.trim();
        }

        console.warn('[ADK] No model text in response:', result);
        return null;

    } catch (err) {
        console.warn(`[ADK] ✗ sendMessage for "${agentAppName}": ${err.message}`);
        return null;
    }
};
