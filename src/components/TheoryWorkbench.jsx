import React, { useState } from 'react';
import './TheoryWorkbench.css';

const DEFAULT_THEORIES = [
    {
        id: 'kye',
        suspectId: 'kye',
        name: 'The Acoustic Experiment',
        suspectName: 'Kye Harlan',
        role: "Eliza's Fiancé / Composer",
        summary: "Kye installed custom 19Hz military-grade infrasound subwoofers inside the sanctuary air ducts to induce genuine acoustic panic, recording Eliza's physiological terror for his London symphony horror commission.",
        defaultSupported: [
            "Purchased four 19Hz military-grade infrasound subwoofers via Harlan Productions.",
            "SD card recording captures Eliza's dying countdown alongside door keypad tones.",
            "Eliza's diary explicitly mentions hearing a low humming vibration that made her chest ache.",
            "Admitted seeking 'authentic, unmanufactured fear' for his London score commission."
        ],
        defaultAssumptions: [
            "Did Kye intentionally coordinate with Carl to lock the door, or did he exploit Carl's routine lockup opportunistically?"
        ],
        defaultContradictions: [
            "Kye had an alibi at Grafton Sound, but the subwoofers were pre-installed and remotely/timer triggered."
        ],
        baseScore: 92,
        isTruePerp: true
    },
    {
        id: 'waltz',
        suspectId: 'waltz',
        name: 'The Alchemical Transcendence',
        suspectName: 'Prof. Aldous Waltz',
        role: 'Botanist / Academic Mentor',
        summary: "Professor Waltz spiked Eliza's daily afternoon tea with concentrated Perique tobacco extract over 15 days to force an altered state of consciousness ('the sight') for botanical research, causing fatal alkaloid toxicity.",
        defaultSupported: [
            "Brewed Perique tobacco and chamomile tea for Eliza over 15 consecutive days.",
            "Autopsy confirms alkaloid sensitization lowered her cardiac threshold."
        ],
        defaultAssumptions: [
            "Waltz had zero knowledge of acoustics, wiring, or the 19Hz subwoofers.",
            "Waltz viewed Eliza as his brilliant protégé and intellectual heir, lacking murderous intent."
        ],
        defaultContradictions: [
            "Medical examiner confirms alkaloid tea alone was insufficient to cause death in a healthy 24-year-old."
        ],
        baseScore: 58,
        isTruePerp: false
    },
    {
        id: 'carl',
        suspectId: 'carl',
        name: 'The Contraband Cover-Up',
        suspectName: 'Carl D’Souza',
        role: "Eliza's Brother / Smuggler",
        summary: "Carl murdered Eliza to silence her after she uncovered uncut diamonds concealed inside the false bottom of Shuk's cage, locking the outer keypad to trap her inside.",
        defaultSupported: [
            "Keypad access logs place him at the sanctuary dome at 17:05 and 23:30.",
            "Concealed uncut diamonds in the false bottom of Shuk's cage."
        ],
        defaultAssumptions: [
            "Carl possesses no knowledge of acoustic resonance or ventilation systems.",
            "Locking the door was intended to protect his contraband, not to suffocate his sister."
        ],
        defaultContradictions: [
            "Multiple eyewitnesses confirm Carl was drinking at the Black Dog pub throughout the evening."
        ],
        baseScore: 44,
        isTruePerp: false
    },
    {
        id: 'dsouza',
        suspectId: 'dsouza',
        name: 'The Estate Consolidation',
        suspectName: "Arthur D'Souza",
        role: 'Estate Owner / Husband',
        summary: "Arthur conspired to eliminate Eliza to consolidate the D'Souza tobacco fortune and prevent her from inheriting the estate trust, deliberately closing the ventilation dampers.",
        defaultSupported: [
            "Heir to the estate and partner in The Stellar Tobacco firm.",
            "Frequently closed the ventilation dampers when smoking."
        ],
        defaultAssumptions: [
            "Arthur had no financial motive; Eliza's trust fund was already tied to the D'Souza family estate.",
            "No physical or digital connection to the 19Hz audio emitters in the ducts."
        ],
        defaultContradictions: [
            "Closed vents alone would take days to deplete oxygen in a greenhouse of that volume."
        ],
        baseScore: 28,
        isTruePerp: false
    }
];

const EVIDENCE_INFO = {
    autopsy: { name: 'Autopsy Report', icon: '📋' },
    tobacco: { name: 'Perique Tobacco Residue', icon: '🚬' },
    speaker: { name: '19Hz Infrasound Subwoofer', icon: '🔊' },
    diary: { name: "Eliza's Locked Diary", icon: '📓' },
    sdcard: { name: 'Micro SD Audio Recording', icon: '💾' },
    crime_scene: { name: 'Crime Scene Photo', icon: '📷' }
};

export default function TheoryWorkbench({
    evidenceItems = [],
    onAccuse,
    onBack,
    onTheoryValidated
}) {
    const [theories] = useState(DEFAULT_THEORIES);
    const [selectedTheoryId, setSelectedTheoryId] = useState('kye');
    const [evidenceAttachments, setEvidenceAttachments] = useState({}); // { [theoryId]: { [evId]: 'support' | 'contradict' } }
    const [isComparing, setIsComparing] = useState(false);
    const [compareIdA, setCompareIdA] = useState('kye');
    const [compareIdB, setCompareIdB] = useState('waltz');

    const activeTheory = theories.find(t => t.id === selectedTheoryId) || theories[0];
    const currentAttachments = evidenceAttachments[selectedTheoryId] || {};

    // Available discovered evidence
    const availableEvidence = Array.from(new Set(['autopsy', 'crime_scene', ...(evidenceItems || [])]));

    const toggleEvidence = (evId, type) => {
        setEvidenceAttachments(prev => {
            const currentForTheory = prev[selectedTheoryId] || {};
            const existingType = currentForTheory[evId];
            const updatedForTheory = { ...currentForTheory };

            if (existingType === type) {
                delete updatedForTheory[evId];
            } else {
                updatedForTheory[evId] = type;
            }

            return { ...prev, [selectedTheoryId]: updatedForTheory };
        });
        onTheoryValidated?.(selectedTheoryId);
    };

    // Calculate dynamic plausibility score
    const calculateScore = (theory) => {
        const att = evidenceAttachments[theory.id] || {};
        let score = theory.baseScore;
        Object.entries(att).forEach(([ev, type]) => {
            if (type === 'support') {
                if (theory.id === 'kye' && ['speaker', 'sdcard', 'diary'].includes(ev)) score += 3;
                else if (theory.id === 'waltz' && ['tobacco', 'autopsy'].includes(ev)) score += 2;
                else score -= 4; // False support penalty
            } else if (type === 'contradict') {
                if (theory.id !== 'kye') score -= 2;
                else score -= 8;
            }
        });
        return Math.max(10, Math.min(99, score));
    };

    const activeScore = calculateScore(activeTheory);

    return (
        <div className="tw-container">
            {/* Header */}
            <div className="tw-header">
                <div className="tw-title-group">
                    <h1>COMPETING THEORIES WORKBENCH</h1>
                    <p>FORMULATE HYPOTHESES • ATTACH PHYSICAL TRACES • TEST UNSUPPORTED ASSUMPTIONS</p>
                </div>
                <div className="tw-header-actions">
                    <button
                        className={`tw-btn-compare ${isComparing ? 'active' : ''}`}
                        onClick={() => setIsComparing(prev => !prev)}
                    >
                        {isComparing ? '✕ CLOSE COMPARISON' : '⇄ COMPARE THEORIES'}
                    </button>
                    <button
                        className="tw-btn-accuse"
                        onClick={() => onAccuse?.(activeTheory.suspectId)}
                    >
                        ⚑ ACCUSE {activeTheory.suspectName.toUpperCase()}
                    </button>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(183, 143, 47, 0.3)',
                                color: '#b78f2f',
                                padding: '0.45rem 1rem',
                                cursor: 'pointer',
                                fontFamily: 'Cinzel, serif',
                                fontSize: '0.65rem'
                            }}
                        >
                            ← RETURN TO BOARD
                        </button>
                    )}
                </div>
            </div>

            {/* Layout */}
            <div className="tw-main-layout">
                {/* Left: Theory Selector */}
                <div className="tw-sidebar">
                    <div className="tw-section-label">THEORY ROSTER</div>
                    {theories.map(t => {
                        const score = calculateScore(t);
                        return (
                            <div
                                key={t.id}
                                className={`tw-theory-tab ${selectedTheoryId === t.id ? 'active' : ''}`}
                                onClick={() => setSelectedTheoryId(t.id)}
                            >
                                <span className="tw-tab-title">{t.name}</span>
                                <span className="tw-tab-suspect">TARGET: {t.suspectName}</span>
                                <div className="tw-tab-plausibility">
                                    <span style={{ color: '#8c7e62' }}>PLAUSIBILITY</span>
                                    <strong style={{ color: score > 75 ? '#2ecc71' : score > 45 ? '#f39c12' : '#e74c3c' }}>
                                        {score}%
                                    </strong>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Center: Active Theory Deep-Dive */}
                <div className="tw-content-stage">
                    {/* Banner */}
                    <div className="tw-theory-banner">
                        <div className="tw-banner-info">
                            <h2>{activeTheory.name}</h2>
                            <p>"{activeTheory.summary}"</p>
                        </div>
                        <div className="tw-score-dial">
                            <span className="tw-dial-num">{activeScore}%</span>
                            <span className="tw-dial-lbl">CONSISTENCY</span>
                        </div>
                    </div>

                    {/* Assumptions vs Supported Points */}
                    <div className="tw-analysis-grid">
                        <div className="tw-analysis-card supported">
                            <div className="tw-card-header success">
                                <span>✓ CORROBORATED PHYSICAL FACTS</span>
                                <span>{activeTheory.defaultSupported.length} POINTS</span>
                            </div>
                            <ul className="tw-bullet-list">
                                {activeTheory.defaultSupported.map((p, i) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="tw-analysis-card assumptions">
                            <div className="tw-card-header warning">
                                <span>⚠ UNVERIFIED ASSUMPTIONS & HOLES</span>
                                <span>LOGICAL GAPS</span>
                            </div>
                            <ul className="tw-bullet-list">
                                {activeTheory.defaultAssumptions.map((a, i) => (
                                    <li key={i} style={{ color: '#f39c12' }}>{a}</li>
                                ))}
                                {activeTheory.defaultContradictions.map((c, i) => (
                                    <li key={i} style={{ color: '#e74c3c' }}>{c}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right: Evidence Attachment Deck */}
                <div className="tw-evidence-dock">
                    <div className="tw-dock-title">ATTACH FORENSIC EVIDENCE</div>
                    <div className="tw-dock-help">
                        Mark whether discovered exhibits SUPPORT or CONTRADICT this theory to test its resilience.
                    </div>

                    {availableEvidence.map(evId => {
                        const evInfo = EVIDENCE_INFO[evId] || { name: evId.toUpperCase(), icon: '🔍' };
                        const status = currentAttachments[evId];
                        return (
                            <div key={evId} className="tw-ev-item">
                                <div className="tw-ev-row">
                                    <span className="tw-ev-icon">{evInfo.icon}</span>
                                    <span className="tw-ev-name">{evInfo.name}</span>
                                </div>
                                <div className="tw-ev-toggles">
                                    <button
                                        className={`tw-toggle-btn support ${status === 'support' ? 'active' : ''}`}
                                        onClick={() => toggleEvidence(evId, 'support')}
                                    >
                                        ✓ SUPPORTS
                                    </button>
                                    <button
                                        className={`tw-toggle-btn contradict ${status === 'contradict' ? 'active' : ''}`}
                                        onClick={() => toggleEvidence(evId, 'contradict')}
                                    >
                                        ✗ CONTRADICTS
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Side-by-Side Comparison Overlay */}
            {isComparing && (
                <div className="tw-compare-overlay">
                    <div className="tw-compare-header">
                        <h2>SIDE-BY-SIDE THEORY COMPARISON</h2>
                        <button className="tw-btn-compare active" onClick={() => setIsComparing(false)}>
                            ✕ CLOSE
                        </button>
                    </div>

                    <div className="tw-compare-grid">
                        {/* Theory A */}
                        <div className="tw-compare-col">
                            <select
                                value={compareIdA}
                                onChange={e => setCompareIdA(e.target.value)}
                                style={{ background: '#0b0806', color: '#d4bc8b', border: '1px solid #b78f2f', padding: '0.4rem', fontFamily: 'Cinzel' }}
                            >
                                {theories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {(() => {
                                const tA = theories.find(t => t.id === compareIdA) || theories[0];
                                const scoreA = calculateScore(tA);
                                return (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#8c7e62' }}>PLAUSIBILITY:</span>
                                            <strong style={{ fontSize: '1.2rem', color: scoreA > 75 ? '#2ecc71' : '#e74c3c' }}>{scoreA}%</strong>
                                        </div>
                                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>"{tA.summary}"</p>
                                        <div>
                                            <strong style={{ fontSize: '0.7rem', color: '#2ecc71' }}>KEY SUPPORTING FACTS:</strong>
                                            <ul className="tw-bullet-list" style={{ marginTop: '0.4rem' }}>
                                                {tA.defaultSupported.slice(0, 2).map((p, i) => <li key={i}>{p}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '0.7rem', color: '#e74c3c' }}>PRIMARY CONTRADICTION:</strong>
                                            <ul className="tw-bullet-list" style={{ marginTop: '0.4rem' }}>
                                                {tA.defaultContradictions.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Theory B */}
                        <div className="tw-compare-col">
                            <select
                                value={compareIdB}
                                onChange={e => setCompareIdB(e.target.value)}
                                style={{ background: '#0b0806', color: '#d4bc8b', border: '1px solid #b78f2f', padding: '0.4rem', fontFamily: 'Cinzel' }}
                            >
                                {theories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {(() => {
                                const tB = theories.find(t => t.id === compareIdB) || theories[1];
                                const scoreB = calculateScore(tB);
                                return (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#8c7e62' }}>PLAUSIBILITY:</span>
                                            <strong style={{ fontSize: '1.2rem', color: scoreB > 75 ? '#2ecc71' : '#e74c3c' }}>{scoreB}%</strong>
                                        </div>
                                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>"{tB.summary}"</p>
                                        <div>
                                            <strong style={{ fontSize: '0.7rem', color: '#2ecc71' }}>KEY SUPPORTING FACTS:</strong>
                                            <ul className="tw-bullet-list" style={{ marginTop: '0.4rem' }}>
                                                {tB.defaultSupported.slice(0, 2).map((p, i) => <li key={i}>{p}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '0.7rem', color: '#e74c3c' }}>PRIMARY CONTRADICTION:</strong>
                                            <ul className="tw-bullet-list" style={{ marginTop: '0.4rem' }}>
                                                {tB.defaultContradictions.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
