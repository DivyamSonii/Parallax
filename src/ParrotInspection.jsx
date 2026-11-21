import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// Audio definitions for Shuk's extracted memory fragments
const FRAGMENT_DEFINITIONS = {
    A: {
        id: 'A',
        name: 'Eliza Counting Petals ("13... 21... 34...")',
        soundDesc: 'Whispered voice & botanical petal measurement',
        toneInfo: 'Fibonacci harmonic resonance (261Hz, 329Hz, 392Hz, 523Hz)'
    },
    B: {
        id: 'B',
        name: 'Low Humming Vibration',
        soundDesc: 'Deep 19Hz infrasonic sub-bass acoustic drone',
        toneInfo: 'Infrasound subwoofer oscillation (38Hz -> 19Hz)'
    },
    C: {
        id: 'C',
        name: 'Parrot Panic Sounds',
        soundDesc: 'Frantic fluttering & avian distress shrieks',
        toneInfo: 'High-frequency screech & wing flapping (700Hz - 1400Hz)'
    },
    D: {
        id: 'D',
        name: 'Door Keypad Lock Beep',
        soundDesc: 'Heavy electronic solenoid latch engage',
        toneInfo: 'Dual-tone electronic keypad solenoid confirmation'
    }
};

// Web Audio API procedural audio clips
const playAudioFragment = (id) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        if (id === 'A') {
            // Eliza counting petals: 4 resonant melodic chimes
            [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.22);
                gain.gain.setValueAtTime(0, now + idx * 0.22);
                gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.22 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.22);
                osc.stop(now + idx * 0.22 + 0.4);
            });
        } else if (id === 'B') {
            // Low humming vibration (19Hz Infrasound)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(38, now);
            osc.frequency.linearRampToValueAtTime(19, now + 1.2);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
            gain.gain.linearRampToValueAtTime(0.01, now + 1.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.5);
        } else if (id === 'C') {
            // Parrot panic fluttering & screeching
            [750, 1200, 900, 1450, 1100].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0.14, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.16);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.18);
            });
        } else if (id === 'D') {
            // External electronic keypad door lock beep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.setValueAtTime(880, now + 0.16);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
        }
    } catch (e) {
        console.warn('Audio synthesis error:', e);
    }
};

export default function ParrotInspection({ onClose, onEvidenceFound, evidenceItems = [] }) {
    const [view, setView] = useState('audio'); // Default directly to audio for instant accessibility
    const [inspectedSections, setInspectedSections] = useState(['feathers', 'nest', 'cage']);
    
    // Ordered array of fragment IDs currently in Slots 1, 2, 3, 4
    const [orderedSlots, setOrderedSlots] = useState(['C', 'A', 'D', 'B']);
    const [audioSolved, setAudioSolved] = useState(() => evidenceItems.includes('parrot-timeline'));
    const [feedbackMsg, setFeedbackMsg] = useState(null);
    const playTimerRef = useRef(null);

    // Physical exam inspection
    const handleInspect = (section) => {
        if (!inspectedSections.includes(section)) {
            const newSections = [...inspectedSections, section];
            setInspectedSections(newSections);
            if (section === 'nest') {
                onEvidenceFound('diamonds');
            }
        }
    };

    // Verification logic
    const checkOrder = useCallback((slots) => {
        const orderStr = slots.join('');
        if (orderStr === 'ABCD') {
            setAudioSolved(true);
            setFeedbackMsg({
                type: 'success',
                text: '✓ TIMELINE RECONSTRUCTION VERIFIED: 1. Eliza Counting -> 2. Low Hum -> 3. Shuk Panic -> 4. Keypad Lock Beep.'
            });
            onEvidenceFound('parrot-timeline');
            return true;
        } else {
            setFeedbackMsg({
                type: 'warning',
                text: 'Incorrect chronology. Clue: Eliza began measuring in silence. The low-frequency acoustic hum startled the bird, and Carl locked the door last.'
            });
            return false;
        }
    }, [onEvidenceFound]);

    // Direct Dropdown Selection: Slot `slotIndex` selects fragment `targetId`
    const handleSelectSlotFragment = (slotIndex, targetId) => {
        const currentSlots = [...orderedSlots];
        const existingSlotForTarget = currentSlots.indexOf(targetId);

        if (existingSlotForTarget !== -1) {
            // Swap to maintain distinct events in each slot
            const displaced = currentSlots[slotIndex];
            currentSlots[slotIndex] = targetId;
            currentSlots[existingSlotForTarget] = displaced;
        } else {
            currentSlots[slotIndex] = targetId;
        }

        setOrderedSlots(currentSlots);
        playAudioFragment(targetId);

        if (currentSlots.join('') === 'ABCD') {
            checkOrder(currentSlots);
        } else {
            setFeedbackMsg({
                type: 'info',
                text: `Slot #${slotIndex + 1} updated to "${FRAGMENT_DEFINITIONS[targetId]?.name}". Click "VERIFY TIMELINE ORDER" when ready.`
            });
        }
    };

    // Move slot item earlier (Up)
    const moveSlotUp = (idx) => {
        if (idx <= 0) return;
        const newSlots = [...orderedSlots];
        const temp = newSlots[idx];
        newSlots[idx] = newSlots[idx - 1];
        newSlots[idx - 1] = temp;
        setOrderedSlots(newSlots);
        if (newSlots.join('') === 'ABCD') {
            checkOrder(newSlots);
        }
    };

    // Move slot item later (Down)
    const moveSlotDown = (idx) => {
        if (idx >= orderedSlots.length - 1) return;
        const newSlots = [...orderedSlots];
        const temp = newSlots[idx];
        newSlots[idx] = newSlots[idx + 1];
        newSlots[idx + 1] = temp;
        setOrderedSlots(newSlots);
        if (newSlots.join('') === 'ABCD') {
            checkOrder(newSlots);
        }
    };

    // Deduce / Auto-Solve
    const handleAutoSolve = () => {
        const correctSlots = ['A', 'B', 'C', 'D'];
        setOrderedSlots(correctSlots);
        checkOrder(correctSlots);
        // Play full sequence in celebration
        correctSlots.forEach((id, i) => {
            setTimeout(() => playAudioFragment(id), i * 600);
        });
    };

    // Shuffle / Reset
    const handleReset = () => {
        const resetSlots = ['C', 'D', 'A', 'B'];
        setOrderedSlots(resetSlots);
        setFeedbackMsg({
            type: 'info',
            text: 'Timeline reset. Select the chronological order of events using the selectors below.'
        });
    };

    // Play all fragments in their current order
    const playCurrentSequence = () => {
        clearTimeout(playTimerRef.current);
        orderedSlots.forEach((id, idx) => {
            setTimeout(() => {
                playAudioFragment(id);
            }, idx * 1100);
        });
    };

    const handleSendLab = () => {
        onEvidenceFound('parrot-autopsy');
        setView('autopsy');
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Courier New', monospace", color: '#cfcfcf'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '920px', maxWidth: '96%', maxHeight: '92vh',
                    background: '#0a0a0c', border: '1px solid #d4af37',
                    boxShadow: '0 0 50px rgba(0,0,0,0.95), inset 0 0 25px rgba(212,175,55,0.15)',
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', borderRadius: '4px'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '14px 22px', borderBottom: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(212,175,55,0.08)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: '#d4af37', letterSpacing: '0.2em' }}>
                            ANIMAL WITNESS TELEMETRY · CASE FILE DAI-004
                        </div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            SHUK THE PARROT — AUDIO MEMORY FORENSICS
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff', padding: '6px 14px', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.75rem', borderRadius: '2px'
                        }}
                    >
                        ✕ CLOSE PANEL
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left Sidebar */}
                    <div style={{ width: '220px', borderRight: '1px solid rgba(212,175,55,0.2)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.4)' }}>
                        <img src="/scenes/shuk_parrot.png" alt="Shuk" style={{ width: '100%', border: '1px solid #444', filter: 'grayscale(0.7)', background: '#111', height: '120px', objectFit: 'cover' }} />
                        <div style={{ fontSize: '0.72rem', lineHeight: '1.5' }}>
                            <strong style={{ color: '#d4af37' }}>Specimen:</strong> Amazon Parrot<br />
                            <strong style={{ color: '#d4af37' }}>Location:</strong> Sanctuary Dome Floor<br />
                            <strong style={{ color: '#d4af37' }}>Memory Status:</strong>{' '}
                            <span style={{ color: audioSolved ? '#2ecc71' : '#f39c12' }}>
                                {audioSolved ? 'DECRYPTED ✓' : 'AWAITING SEQUENCE'}
                            </span>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => setView('audio')}
                                style={{
                                    padding: '8px 12px',
                                    background: view === 'audio' ? 'rgba(212,175,55,0.25)' : 'transparent',
                                    border: `1px solid ${view === 'audio' ? '#d4af37' : '#444'}`,
                                    color: view === 'audio' ? '#dfd8a3' : '#888',
                                    cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold'
                                }}
                            >
                                🎧 AUDIO MEMORY {audioSolved ? '✓' : ''}
                            </button>
                            <button
                                onClick={() => setView('inspect')}
                                style={{
                                    padding: '8px 12px',
                                    background: view === 'inspect' ? 'rgba(212,175,55,0.25)' : 'transparent',
                                    border: `1px solid ${view === 'inspect' ? '#d4af37' : '#444'}`,
                                    color: view === 'inspect' ? '#dfd8a3' : '#888',
                                    cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem'
                                }}
                            >
                                🔍 PHYSICAL EXAM
                            </button>
                            <button
                                onClick={handleSendLab}
                                style={{
                                    padding: '8px 12px',
                                    background: view === 'autopsy' ? 'rgba(212,175,55,0.25)' : 'transparent',
                                    border: `1px solid ${view === 'autopsy' ? '#d4af37' : '#444'}`,
                                    color: view === 'autopsy' ? '#dfd8a3' : (audioSolved ? '#aaa' : '#555'),
                                    cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem'
                                }}
                            >
                                🧪 LAB AUTOPSY
                            </button>
                        </div>
                    </div>

                    {/* Right Interactive Body */}
                    <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                        {/* ─────────────────────────────────────────────────────────────
                           VIEW: AUDIO MEMORY RECONSTRUCTION
                        ───────────────────────────────────────────────────────────── */}
                        {view === 'audio' && (
                            <div>
                                <div style={{ borderBottom: '1px dashed rgba(212,175,55,0.3)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ color: '#d4af37', margin: 0, fontSize: '0.98rem', letterSpacing: '0.12em' }}>
                                        CHRONOLOGICAL SEQUENCE SELECTOR
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={handleAutoSolve}
                                            style={{
                                                background: 'rgba(212,175,55,0.15)',
                                                border: '1px solid #d4af37',
                                                color: '#dfd8a3',
                                                fontSize: '0.68rem',
                                                padding: '4px 10px',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit'
                                            }}
                                            title="Automatically arrange fragments in true chronological order"
                                        >
                                            ⚡ DEDUCE ORDER (AUTO-SOLVE)
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #666',
                                                color: '#aaa',
                                                fontSize: '0.68rem',
                                                padding: '4px 10px',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit'
                                            }}
                                        >
                                            ↺ RESET
                                        </button>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.78rem', color: '#aaa', margin: '10px 0', lineHeight: 1.5 }}>
                                    Select which sound occurred in each chronological slot from the dropdowns below, or use the <strong>[▲] / [▼]</strong> shift arrows.
                                </p>

                                {/* Feedback notification */}
                                {feedbackMsg && (
                                    <div style={{
                                        padding: '8px 12px',
                                        background: feedbackMsg.type === 'success' ? 'rgba(46,204,113,0.15)' : 'rgba(241,196,15,0.12)',
                                        border: `1px solid ${feedbackMsg.type === 'success' ? '#2ecc71' : '#f1c40f'}`,
                                        color: feedbackMsg.type === 'success' ? '#2ecc71' : '#f1c40f',
                                        fontSize: '0.74rem',
                                        borderRadius: '2px',
                                        marginBottom: '10px'
                                    }}>
                                        {feedbackMsg.text}
                                    </div>
                                )}

                                {/* 4 Explicit Chronological Slots with Dropdowns */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[0, 1, 2, 3].map((slotIdx) => {
                                        const fragmentId = orderedSlots[slotIdx];
                                        const def = FRAGMENT_DEFINITIONS[fragmentId];
                                        const slotLabels = ['1ST EVENT (EARLIEST)', '2ND EVENT', '3RD EVENT', '4TH EVENT (FINAL)'];

                                        return (
                                            <div
                                                key={slotIdx}
                                                style={{
                                                    background: audioSolved ? 'rgba(46, 204, 113, 0.06)' : 'rgba(15, 12, 10, 0.85)',
                                                    border: `1px solid ${audioSolved ? '#2ecc71' : '#b78f2f'}`,
                                                    padding: '12px 14px',
                                                    borderRadius: '3px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}
                                            >
                                                {/* Slot Badge */}
                                                <div style={{
                                                    minWidth: '105px',
                                                    background: audioSolved ? '#2ecc71' : '#b78f2f',
                                                    color: '#0d0a08',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.68rem',
                                                    letterSpacing: '0.1em',
                                                    padding: '5px 8px',
                                                    textAlign: 'center',
                                                    borderRadius: '2px'
                                                }}>
                                                    {slotLabels[slotIdx]}
                                                </div>

                                                {/* Native Dropdown Selector for this slot */}
                                                <div style={{ flex: 1 }}>
                                                    <select
                                                        value={fragmentId}
                                                        onChange={(e) => handleSelectSlotFragment(slotIdx, e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            background: '#060504',
                                                            border: '1px solid rgba(183, 143, 47, 0.5)',
                                                            color: '#dfd8a3',
                                                            padding: '7px 10px',
                                                            fontSize: '0.82rem',
                                                            fontFamily: "'Courier New', monospace",
                                                            cursor: 'pointer',
                                                            borderRadius: '2px'
                                                        }}
                                                    >
                                                        {Object.values(FRAGMENT_DEFINITIONS).map(frag => (
                                                            <option key={frag.id} value={frag.id}>
                                                                {frag.name} — ({frag.soundDesc})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div style={{ fontSize: '0.65rem', color: '#8c7e62', marginTop: '3px' }}>
                                                        {def?.toneInfo}
                                                    </div>
                                                </div>

                                                {/* Audio Preview Button */}
                                                <button
                                                    onClick={() => playAudioFragment(fragmentId)}
                                                    style={{
                                                        background: 'rgba(52, 152, 219, 0.15)',
                                                        border: '1px solid #3498db',
                                                        color: '#5dade2',
                                                        padding: '6px 12px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                        borderRadius: '2px'
                                                    }}
                                                    title="Listen to this event sound"
                                                >
                                                    ▶ LISTEN
                                                </button>

                                                {/* Step Reorder Arrows */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <button
                                                        onClick={() => moveSlotUp(slotIdx)}
                                                        disabled={slotIdx === 0}
                                                        style={{
                                                            padding: '2px 8px',
                                                            background: slotIdx === 0 ? 'transparent' : 'rgba(255,255,255,0.1)',
                                                            color: slotIdx === 0 ? '#444' : '#fff',
                                                            border: '1px solid #555',
                                                            cursor: slotIdx === 0 ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.65rem'
                                                        }}
                                                        title="Shift Earlier"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        onClick={() => moveSlotDown(slotIdx)}
                                                        disabled={slotIdx === 3}
                                                        style={{
                                                            padding: '2px 8px',
                                                            background: slotIdx === 3 ? 'transparent' : 'rgba(255,255,255,0.1)',
                                                            color: slotIdx === 3 ? '#444' : '#fff',
                                                            border: '1px solid #555',
                                                            cursor: slotIdx === 3 ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.65rem'
                                                        }}
                                                        title="Shift Later"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Sequence Controls */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                                    <button
                                        onClick={playCurrentSequence}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(183,143,47,0.4)',
                                            color: '#d4af37',
                                            padding: '8px 14px',
                                            fontSize: '0.74rem',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            borderRadius: '2px'
                                        }}
                                    >
                                        ▶ PLAY SEQUENCE IN ORDER (1 → 4)
                                    </button>

                                    <button
                                        onClick={() => checkOrder(orderedSlots)}
                                        style={{
                                            background: 'linear-gradient(to bottom, #725624, #3d2d11)',
                                            border: '1px solid #b78f2f',
                                            color: '#dfd8a3',
                                            padding: '8px 20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            borderRadius: '2px'
                                        }}
                                    >
                                        ✓ VERIFY &amp; CONFIRM ORDER
                                    </button>
                                </div>

                                {audioSolved && (
                                    <div style={{ marginTop: '12px', padding: '10px 14px', border: '1px solid #2ecc71', background: 'rgba(46,204,113,0.1)', color: '#fff', fontSize: '0.8rem', lineHeight: 1.5, borderRadius: '2px' }}>
                                        <strong style={{ color: '#2ecc71' }}>CHRONOLOGICAL DECRYPTION CONFIRMED:</strong><br />
                                        1. <strong>16:30</strong> — Eliza counted daisy petals ("13... 21... 34...").<br />
                                        2. <strong>17:00</strong> — Pre-set subwoofers emitted the 19Hz infrasound wave.<br />
                                        3. <strong>17:02</strong> — Shuk panicked and screeched in severe distress.<br />
                                        4. <strong>17:05</strong> — Keypad solenoid lock beeped, sealing the exit.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─────────────────────────────────────────────────────────────
                           VIEW: PHYSICAL EXAM
                        ───────────────────────────────────────────────────────────── */}
                        {view === 'inspect' && (
                            <div>
                                <h3 style={{ borderBottom: '1px dashed #444', paddingBottom: '8px', color: '#d4af37', margin: 0, fontSize: '0.98rem' }}>
                                    PHYSICAL EXAM PROTOCOL
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                                    <div style={{ border: '1px solid #333', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Feathers &amp; Talons</strong>
                                            <button onClick={() => handleInspect('feathers')} style={{ padding: '4px 10px', background: '#333', border: '1px solid #555', color: '#cfcfcf', cursor: 'pointer', fontSize: '0.7rem' }}>INSPECT</button>
                                        </div>
                                        {inspectedSections.includes('feathers') && (
                                            <div style={{ color: '#aaa', fontSize: '0.76rem', marginTop: '6px' }}>
                                                Feathers ruffled violently; floor tiles show deep stress claw marks.
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ border: '1px solid #333', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Nesting Box False Bottom</strong>
                                            <button onClick={() => handleInspect('nest')} style={{ padding: '4px 10px', background: '#333', border: '1px solid #555', color: '#cfcfcf', cursor: 'pointer', fontSize: '0.7rem' }}>INSPECT</button>
                                        </div>
                                        {inspectedSections.includes('nest') && (
                                            <div style={{ color: '#aaa', fontSize: '0.76rem', marginTop: '6px' }}>
                                                Wax packets discovered containing uncut contraband diamonds. Suspect link: Carl.
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ border: '1px solid #333', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Cage Environment &amp; Door</strong>
                                            <button onClick={() => handleInspect('cage')} style={{ padding: '4px 10px', background: '#333', border: '1px solid #555', color: '#cfcfcf', cursor: 'pointer', fontSize: '0.7rem' }}>INSPECT</button>
                                        </div>
                                        {inspectedSections.includes('cage') && (
                                            <div style={{ color: '#aaa', fontSize: '0.76rem', marginTop: '6px' }}>
                                                Cage door slightly ajar; fresh fruit bowl untouched.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setView('audio')}
                                        style={{
                                            background: 'linear-gradient(to bottom, #725624, #3d2d11)',
                                            border: '1px solid #b78f2f',
                                            color: '#dfd8a3',
                                            padding: '8px 16px',
                                            fontSize: '0.76rem',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            marginTop: '8px',
                                            alignSelf: 'flex-start'
                                        }}
                                    >
                                        OPEN AUDIO MEMORY RECONSTRUCTION →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─────────────────────────────────────────────────────────────
                           VIEW: LAB AUTOPSY
                        ───────────────────────────────────────────────────────────── */}
                        {view === 'autopsy' && (
                            <div>
                                <h3 style={{ borderBottom: '1px dashed #444', paddingBottom: '8px', color: '#d4af37', margin: 0, fontSize: '0.98rem' }}>
                                    LAB AUTOPSY PROTOCOL: SHUK
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                    <div style={{ border: '1px solid #333', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px' }}>
                                        <strong style={{ color: '#fff', fontSize: '0.82rem' }}>ANATOMICAL EXAM</strong>
                                        <ul style={{ color: '#aaa', fontSize: '0.72rem', paddingLeft: '16px', margin: '6px 0 0 0', lineHeight: 1.6 }}>
                                            <li>No defensive wounds or bone fractures.</li>
                                            <li>Zero external blunt trauma.</li>
                                            <li>Crop contains pure seeds; no systemic toxins.</li>
                                        </ul>
                                    </div>
                                    <div style={{ border: '1px solid #333', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px' }}>
                                        <strong style={{ color: '#fff', fontSize: '0.82rem' }}>TOXICOLOGY &amp; HISTOLOGY</strong>
                                        <ul style={{ color: '#aaa', fontSize: '0.72rem', paddingLeft: '16px', margin: '6px 0 0 0', lineHeight: 1.6 }}>
                                            <li>Severe lung oxygen deprivation (hypoxia).</li>
                                            <li>Massive acute myocardial strain.</li>
                                            <li><strong style={{ color: '#ff6666' }}>Inner-ear otolithic shear from 19Hz resonance.</strong></li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #d4af37', background: 'rgba(212,175,55,0.08)', borderRadius: '2px' }}>
                                    <strong style={{ color: '#d4af37', fontSize: '0.8rem' }}>CORONER CONCLUSION:</strong>
                                    <p style={{ color: '#cfcfcf', fontSize: '0.75rem', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                                        Cause of death: Acute cardiovascular collapse caused by low-frequency standing acoustic waves (19Hz) inside a sealed enclosure. Exactly matches the fatal mechanism documented in Eliza D'Souza's autopsy.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
