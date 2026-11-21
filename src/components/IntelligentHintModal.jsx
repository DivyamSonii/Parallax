import React, { useState, useEffect } from 'react';
import './IntelligentHintModal.css';
import { requestHintFromAgent } from '../agentService';

const CLIENT_HINT_DATABASE = (evidenceItems = [], questioned = []) => {
    const hasSpeaker = evidenceItems.includes('speaker');
    const hasTobacco = evidenceItems.includes('tobacco');
    const hasRecording = evidenceItems.includes('sdcard') || evidenceItems.includes('diary');
    const askedVince = questioned.includes('vince_okafor');
    const askedWaltz = questioned.includes('waltz');

    if (!hasSpeaker && !askedVince) {
        return {
            stage: 'ACOUSTIC HARDWARE LEAD',
            hints: {
                1: {
                    title: "Atmospheric Pressure & Airflow",
                    lead: "SANCTUARY DOME",
                    text: "The morning mist on the glass dome was unusually dense, and the flowers showed cellular stress without physical bruising. Consider what invisible physical force could circulate through the estate ventilation."
                },
                2: {
                    title: "Vibrational Resonance",
                    lead: "CORONER'S CLUE",
                    text: "Dr. Menon's autopsy notes mention mechanical vibrational shear in the myocardial tissue. Review the personnel on the estate: who possesses professional knowledge of high-SPL acoustic transducers?"
                },
                3: {
                    title: "The Camberwell Equipment Log",
                    lead: "ACTIONABLE LEAD",
                    text: "Cross-examine Vince Okafor, the freelance audio technician. Ask him specifically about the four custom 19Hz subwoofer units he delivered outside The Stellar offices."
                }
            }
        };
    } else if (!hasTobacco && !askedWaltz) {
        return {
            stage: 'BOTANICAL SENSITIZATION LEAD',
            hints: {
                1: {
                    title: "Aromatic Infusion",
                    lead: "ESTATE TRACE",
                    text: "The scent of pipe tobacco was detected in the glass dome, yet Eliza was not a smoker. Someone in her immediate circle was supplying her with botanical infusions under the guise of medicinal research."
                },
                2: {
                    title: "Alkaloid Sensitization",
                    lead: "BIOCHEMICAL MECHANISM",
                    text: "Perique tobacco contains anabasine and nornicotine—rare alkaloids that lower the threshold for fatal cardiac arrhythmia. Who prepared Eliza's afternoon tea during her botanical studies?"
                },
                3: {
                    title: "The Chamomile Extraction Notebook",
                    lead: "ACTIONABLE LEAD",
                    text: "Interrogate Professor Aldous Waltz about his 17th-century herbal tea recipe. Challenge him on the Perique tobacco leaf extract he administered for 15 consecutive days."
                }
            }
        };
    } else if (!hasRecording) {
        return {
            stage: 'DOCUMENTARY EVIDENCE LEAD',
            hints: {
                1: {
                    title: "The Mimicking Voice",
                    lead: "SHUK'S MIMICRY",
                    text: "Shuk the parrot in the sanctuary dome has been mimicking a countdown sequence: 13, 21, 34. Someone recorded that voice shortly before or during the incident."
                },
                2: {
                    title: "The Locked Keypad Sequence",
                    lead: "DOOR TELEMETRY",
                    text: "The audio mimics not only Eliza's voice, but the digital chime of the sanctuary keypad being locked from the outside. An audio recording preserves this exact moment."
                },
                3: {
                    title: "The Housekeeper's Mobile Phone",
                    lead: "ACTIONABLE LEAD",
                    text: "Speak with Rina Soares regarding the audio recording she made of Shuk on her mobile phone, or demand to inspect Kye Harlan's magnetic studio tapes."
                }
            }
        };
    } else {
        return {
            stage: 'SYNTHESIS & ACCUSATION STAGE',
            hints: {
                1: {
                    title: "Convergence of Three Tragedies",
                    lead: "CRIME MECHANISM",
                    text: "Eliza's death was not a simple poisoning or blunt murder. It was a fatal triad: alkaloid sensitization, sealed ventilation, and acoustic resonance. Differentiate between tragic accidents and malicious experimentation."
                },
                2: {
                    title: "Motive vs Circumstance",
                    lead: "CRIMINAL INTENT",
                    text: "Carl locked the door to conceal contraband; Eliot closed the vents out of nostalgic habit; Waltz brewed tea to open her mind. Only one suspect introduced an active weapon and recorded her dying."
                },
                3: {
                    title: "The Final Indictment",
                    lead: "FINAL ACCUSATION",
                    text: "Accuse Kye Harlan on the Deduction Board. He concealed the 19Hz emitters in the vents and recorded eighteen minutes of genuine human panic for his horror film score without rendering aid."
                }
            }
        };
    }
};

export default function IntelligentHintModal({
    isOpen,
    onClose,
    evidenceItems = [],
    questionedSuspects = [],
    onHintUsed,
    unlockedTiers = [1],
    totalHintsUsed = 0
}) {
    const [activeTier, setActiveTier] = useState(1);
    const [currentHint, setCurrentHint] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [localUnlocked, setLocalUnlocked] = useState(new Set(unlockedTiers));

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        const fetchHint = async () => {
            setIsLoading(true);
            // 1. Try server API
            const serverHint = await requestHintFromAgent(evidenceItems, questionedSuspects, activeTier);
            if (isMounted && serverHint?.hint) {
                setCurrentHint({
                    title: serverHint.title,
                    lead: serverHint.lead,
                    text: serverHint.hint
                });
                setIsLoading(false);
                return;
            }

            // 2. Client-side fallback
            const clientDb = CLIENT_HINT_DATABASE(evidenceItems, questionedSuspects);
            const hintObj = clientDb.hints[activeTier] || clientDb.hints[1];
            if (isMounted) {
                setCurrentHint(hintObj);
                setIsLoading(false);
            }
        };

        fetchHint();
        return () => { isMounted = false; };
    }, [isOpen, activeTier, evidenceItems, questionedSuspects]);

    if (!isOpen) return null;

    const isTierUnlocked = localUnlocked.has(activeTier);

    const handleUnlockTier = () => {
        setLocalUnlocked(prev => new Set([...prev, activeTier]));
        onHintUsed?.(activeTier, currentHint?.text);
    };

    return (
        <div className="ih-overlay" onClick={onClose}>
            <div className="ih-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="ih-header">
                    <div className="ih-title-wrap">
                        <span className="ih-icon">💡</span>
                        <div>
                            <h2 className="ih-title">FORENSIC HINT SYSTEM</h2>
                            <div className="ih-subtitle">SCOTLAND YARD DEDUCTIVE INFERENCE ASSISTANT</div>
                        </div>
                    </div>
                    <button className="ih-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div className="ih-body">
                    {/* Tier Selector */}
                    <div className="ih-tiers-nav">
                        <button
                            className={`ih-tier-btn ${activeTier === 1 ? 'active' : ''} ${localUnlocked.has(1) ? 'unlocked' : ''}`}
                            onClick={() => setActiveTier(1)}
                        >
                            <span className="ih-tier-label">TIER 1: SUBTLE DIRECTION</span>
                            <span className="ih-tier-cost">{localUnlocked.has(1) ? '✓ UNLOCKED' : 'FREE INTUITION'}</span>
                        </button>
                        <button
                            className={`ih-tier-btn ${activeTier === 2 ? 'active' : ''} ${localUnlocked.has(2) ? 'unlocked' : ''}`}
                            onClick={() => setActiveTier(2)}
                        >
                            <span className="ih-tier-label">TIER 2: REASONING SUGGESTION</span>
                            <span className="ih-tier-cost">{localUnlocked.has(2) ? '✓ UNLOCKED' : '-3 EFFICIENCY'}</span>
                        </button>
                        <button
                            className={`ih-tier-btn ${activeTier === 3 ? 'active' : ''} ${localUnlocked.has(3) ? 'unlocked' : ''}`}
                            onClick={() => setActiveTier(3)}
                        >
                            <span className="ih-tier-label">TIER 3: SPECIFIC CLUE</span>
                            <span className="ih-tier-cost">{localUnlocked.has(3) ? '✓ UNLOCKED' : '-5 EFFICIENCY'}</span>
                        </button>
                    </div>

                    {/* Hint Content */}
                    <div className="ih-hint-card">
                        {isLoading ? (
                            <div className="ih-locked-hint">
                                <span style={{ fontFamily: 'Special Elite', letterSpacing: '0.15em' }}>Consulting case files...</span>
                            </div>
                        ) : isTierUnlocked ? (
                            <>
                                {currentHint?.lead && (
                                    <div className="ih-hint-lead-badge">LEAD: {currentHint.lead}</div>
                                )}
                                <div className="ih-hint-heading">{currentHint?.title || "Deductive Analysis"}</div>
                                <p className="ih-hint-prose">"{currentHint?.text}"</p>
                            </>
                        ) : (
                            <div className="ih-locked-hint">
                                <span style={{ fontSize: '1.8rem' }}>🔒</span>
                                <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                                    TIER {activeTier} GUIDANCE IS SEALED
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#9d8e72', maxWidth: '380px' }}>
                                    Unlocking higher-level clues provides concrete case direction, but will be factored into your final Investigative Performance Rating.
                                </p>
                                <button className="ih-unlock-action-btn" onClick={handleUnlockTier}>
                                    BREAK SEAL & REVEAL HINT
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="ih-warning-note">
                        <span>⚠</span>
                        <span>Hints guide your deductive synthesis without spoiling the final accusation. Previously unlocked hints can be reviewed freely.</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="ih-footer">
                    <span>HINTS ACCESSED: <strong className="ih-usage-count">{totalHintsUsed}</strong></span>
                    <span>SCOTLAND YARD ARCHIVE REF #4419-B</span>
                </div>
            </div>
        </div>
    );
}
