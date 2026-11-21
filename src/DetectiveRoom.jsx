import React, { useState, useMemo } from 'react';
import './DetectiveRoom.css';

/* ═══════════════════════════════════════════════════════════
   BIRD SANCTUARY MURDER — MASTER EVIDENCE REGISTRY
   All 9 forensic leads with high-resolution photographic evidence
   Organized across 2 balanced tiers + 1 bottom suspect gallery
═══════════════════════════════════════════════════════════ */
const EVIDENCE_REGISTRY = {
    'crime_scene': {
        id: 'crime_scene',
        title: "The Spiral Sanctuary",
        category: "CRIME SCENE",
        img: "/images/sanctuary_crime_scene.jpeg",
        desc: "Eliza D'Souza discovered on the sanctuary floor surrounded by daisies aligned in Fibonacci clusters (13, 21, 34 petals). Yellow plastic measuring ruler found beside her hand. No signs of struggle.",
        loc: "Glasshouse Sanctuary Center",
        type: "photo",
        pinPos: { x: 16, y: 22 },
        alwaysVisible: true,
        links: ['dsouza', 'waltz', 'kye']
    },
    'autopsy': {
        id: 'autopsy',
        title: "Autopsy: Eliza D'Souza",
        category: "CORONER REPORT",
        img: "/images/autopsy.jpeg",
        desc: "Cause of death: Cardiac arrest caused by acute ventricular arrhythmia. Cellular examination of myocardial tissue reveals mechanical vibrational shear trauma rather than infarction or standard poisoning.",
        loc: "Forensic Pathology Lab",
        type: "document",
        pinPos: { x: 39, y: 22 },
        links: ['speaker', 'waltz']
    },
    'tobacco': {
        id: 'tobacco',
        title: "Perique Tobacco Residue",
        category: "TOXICOLOGY / TRACE",
        img: "/images/evidence_tobacco.jpg",
        desc: "High concentrations of anabasine and nornicotine alkaloids detected in the sanctuary atmosphere and victim's blood. Traced exclusively to The Stellar's private blend.",
        loc: "Sanctuary Floor & Vent Filter",
        type: "artifact",
        pinPos: { x: 62, y: 22 },
        links: ['dsouza', 'waltz']
    },
    'speaker': {
        id: 'speaker',
        title: "19Hz Infrasonic Emitter",
        category: "PHYSICAL WEAPON",
        img: "/images/vent_closeup.png",
        desc: "Custom-built 19Hz acoustic subwoofers concealed inside Vent Shaft B. Continuous 19Hz resonance matches the thoracic cavity resonant frequency, producing disorientation and fatal cardiac stress in sensitized individuals.",
        loc: "Ventilation Duct B",
        type: "photo",
        pinPos: { x: 85, y: 22 },
        hasTonePlayer: true,
        links: ['kye']
    },
    'parrot-autopsy': {
        id: 'parrot-autopsy',
        title: "Avian Acoustic Trauma",
        category: "LAB REPORT",
        img: "/images/evidence_parrot_pathology.jpg",
        desc: "Bilateral tympanic membrane rupture and cochlear hemorrhage in the sanctuary parrot, confirming high-amplitude standing sound waves inside the dome.",
        loc: "Avian Pathology Unit",
        type: "artifact",
        pinPos: { x: 12, y: 53 },
        links: ['speaker']
    },
    'sdcard': {
        id: 'sdcard',
        title: "Junction Box SD Card",
        category: "AUDIO RECORDING",
        img: "/images/evidence_sdcard.jpg",
        desc: "Recovered from the southern maintenance loop. Contains a high-SPL sub-bass tone recorded at 5:15 PM on the night of Eliza's death. Spectral analysis confirms exact 19Hz resonance.",
        loc: "Southern Junction Box",
        type: "artifact",
        hasTonePlayer: true,
        pinPos: { x: 30, y: 53 },
        links: ['kye']
    },
    'diary': {
        id: 'diary',
        title: "Eliza's Research Log",
        category: "VICTIM DIARY",
        img: "/images/dairy-cover.jpg",
        desc: "Eliza logged petal counts daily for 15 days. Passages express growing terror: 'I can feel the glass vibrating in my teeth... The numbers are wrong... He told me it was just research.'",
        loc: "Secret Bench Compartment",
        type: "document",
        pinPos: { x: 48, y: 53 },
        links: ['waltz', 'kye', 'kara']
    },
    'diamonds': {
        id: 'diamonds',
        title: "Uncut Contraband Diamonds",
        category: "ILLICIT EVIDENCE",
        img: "/images/evidence_diamonds.jpg",
        desc: "Rough uncut stones discovered concealed within the false bottom of Shuk the parrot's heavy iron cage. Tied directly to illegal transport routes.",
        loc: "Shuk's Iron Birdcage",
        type: "artifact",
        pinPos: { x: 66, y: 53 },
        links: ['carl']
    },
    'parrot-timeline': {
        id: 'parrot-timeline',
        title: "Shuk's Audio Timeline",
        category: "AUDIO WITNESS",
        img: "/scenes/shuk_parrot.png",
        desc: "Audio timeline verified from parrot mimicry: (1) Eliza counting petals ('13... 21... 34...') -> (2) Low acoustic hum -> (3) Parrot distress cries -> (4) External keypad lock beep.",
        loc: "Sanctuary Aviary",
        type: "photo",
        pinPos: { x: 84, y: 53 },
        links: ['carl', 'kye']
    }
};

const SUSPECTS_REGISTRY = [
    {
        id: 'dsouza',
        name: "Arthur D'Souza",
        role: "Estate Patriarch",
        img: "/images/dsouza.png",
        pos: { x: 13, y: 83 },
        motive: "Closed the dome ventilation dampers to smoke Perique pipe tobacco, trapping Eliza inside an airtight hypoxic chamber."
    },
    {
        id: 'waltz',
        name: "Prof. Aldous Waltz",
        role: "Botanist / Scholar",
        img: "/images/waltz.png",
        pos: { x: 27, y: 83 },
        motive: "Gave Eliza daily chamomile tea laced with Perique tobacco extracts for 15 days, dangerously sensitizing her myocardium."
    },
    {
        id: 'carl',
        name: "Carl D'Souza",
        role: "Brother / Smuggler",
        img: "/images/carl.png",
        pos: { x: 41, y: 83 },
        motive: "Smuggled uncut diamonds inside Shuk's cage. Locked the sanctuary keypad at 5:05 PM and relocked it at 23:30 in panic."
    },
    {
        id: 'kye',
        name: "Kye Harlan",
        role: "Sound Composer / Fiancé",
        img: "/images/kye.png",
        pos: { x: 55, y: 83 },
        motive: "PRIMARY CULPRIT: Installed 19Hz subwoofers in Vent B for his 'Fear Project', recording Eliza's terminal cardiac panic."
    },
    {
        id: 'mary',
        name: "Mary",
        role: "Head Maid",
        img: "/images/maid.png",
        pos: { x: 69, y: 83 },
        motive: "Discovered the body at 10 AM. Possessed master keys to the maintenance corridors and ventilation grilles."
    },
    {
        id: 'kara',
        name: "Kara Voss",
        role: "Eliza's Best Friend",
        img: "/images/kara.png",
        pos: { x: 83, y: 83 },
        motive: "Dismissed Eliza's warnings about the vibrations as work stress; falsely told police Eliza was 'a little crazy'."
    }
];

export default function DetectiveRoom({ evidenceItems = [], onBack, onOpenDiary }) {
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [selectedSuspect, setSelectedSuspect] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isPlayingTone, setIsPlayingTone] = useState(false);
    const [revealAll, setRevealAll] = useState(false);
    const [showFibonacciCodex, setShowFibonacciCodex] = useState(false);

    // Filter unlocked evidence
    const unlockedEvidenceList = useMemo(() => {
        return Object.values(EVIDENCE_REGISTRY).map(ev => ({
            ...ev,
            isUnlocked: revealAll || ev.alwaysVisible || evidenceItems.includes(ev.id)
        }));
    }, [evidenceItems, revealAll]);

    // Calculate dynamic connection strings between unlocked evidence and suspects
    const connectionStrings = useMemo(() => {
        const strings = [];
        unlockedEvidenceList.forEach(ev => {
            if (!ev.isUnlocked) return;
            (ev.links || []).forEach(suspectId => {
                const suspect = SUSPECTS_REGISTRY.find(s => s.id === suspectId);
                if (suspect) {
                    strings.push({
                        id: `${ev.id}-${suspect.id}`,
                        evId: ev.id,
                        suspectId: suspect.id,
                        x1: ev.pinPos.x,
                        y1: ev.pinPos.y,
                        x2: suspect.pos.x,
                        y2: suspect.pos.y,
                        isActive: hoveredItem === ev.id || hoveredItem === suspect.id
                    });
                }
            });
        });
        return strings;
    }, [unlockedEvidenceList, hoveredItem]);

    // Play 19Hz infrasonic resonance simulation using Web Audio API
    const playResonanceTone = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const harmonicOsc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(19, ctx.currentTime);

            // Subtle audible 38Hz overtone so speaker vibration is perceptible on typical speakers
            harmonicOsc.type = 'sine';
            harmonicOsc.frequency.setValueAtTime(38, ctx.currentTime);

            gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.4);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

            osc.connect(gainNode);
            harmonicOsc.connect(gainNode);
            gainNode.connect(ctx.destination);

            setIsPlayingTone(true);
            osc.start();
            harmonicOsc.start();

            setTimeout(() => {
                try {
                    osc.stop();
                    harmonicOsc.stop();
                } catch {
                    // ignore
                }
                setIsPlayingTone(false);
            }, 3000);
        } catch {
            setIsPlayingTone(false);
        }
    };

    const inspectedData = selectedEvidence ? EVIDENCE_REGISTRY[selectedEvidence] : null;
    const inspectedSuspectData = selectedSuspect ? SUSPECTS_REGISTRY.find(s => s.id === selectedSuspect) : null;
    const discoveredCount = unlockedEvidenceList.filter(e => e.isUnlocked).length;

    return (
        <div className="eb-room-container">
            {/* AMBIENT CORKBOARD & LIGHTING */}
            <div className="eb-cork-wall" />
            <div className="eb-lamp-glow" />
            <div className="eb-room-vignette" />

            {/* HEADER HUD */}
            <div className="eb-hud-bar">
                <div className="eb-hud-left">
                    <button className="eb-btn eb-back-btn" onClick={onBack}>
                        ← BACK TO SCENE
                    </button>
                    <div className="eb-case-badge">
                        <span className="eb-badge-pulse" />
                        CASE FILE: BIRD SANCTUARY MURDER
                    </div>
                </div>

                <div className="eb-hud-center">
                    <div className="eb-counter-box">
                        <span className="eb-counter-number">{discoveredCount}</span>
                        <span className="eb-counter-total">/ 9 LEADS PINNED</span>
                    </div>

                    <button
                        className={`eb-btn eb-toggle-btn ${revealAll ? 'is-active' : ''}`}
                        onClick={() => setRevealAll(!revealAll)}
                        title="Toggle view between discovered leads and revealing all 9 pinned evidence items"
                    >
                        {revealAll ? '👁 SHOWING ALL EXHIBITS' : '🔍 DISCOVERED ONLY'}
                    </button>
                </div>

                <div className="eb-hud-right">
                    <button
                        className="eb-btn eb-codex-btn"
                        onClick={() => setShowFibonacciCodex(true)}
                        title="Inspect Master Fibonacci Series Dossier"
                    >
                        📜 FIBONACCI CODEX
                    </button>
                    <button className="eb-btn eb-journal-btn" onClick={onOpenDiary}>
                        📓 ELIZA'S JOURNAL
                    </button>
                </div>
            </div>

            {/* THE CORKBOARD SURFACE */}
            <div className={`eb-corkboard-surface ${selectedEvidence || selectedSuspect || showFibonacciCodex ? 'board-dimmed' : ''}`}>
                {/* SVG YARN STRING CONNECTIONS */}
                <svg className="eb-yarn-layer" aria-hidden="true">
                    <defs>
                        <filter id="yarn-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                            <feOffset dx="1" dy="2" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.5" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {connectionStrings.map(conn => (
                        <line
                            key={conn.id}
                            x1={`${conn.x1}%`}
                            y1={`${conn.y1}%`}
                            x2={`${conn.x2}%`}
                            y2={`${conn.y2}%`}
                            className={`eb-yarn-line ${conn.isActive ? 'yarn-highlight' : ''}`}
                            filter="url(#yarn-shadow)"
                        />
                    ))}
                </svg>

                {/* ── 1. EVIDENCE CARDS LAYER (Top & Middle Tiers) ── */}
                {unlockedEvidenceList.map(ev => {
                    const isHovered = hoveredItem === ev.id;
                    return (
                        <div
                            key={ev.id}
                            className={`eb-pin-item eb-item-${ev.id} ${ev.isUnlocked ? 'is-unlocked' : 'is-locked'} ${isHovered ? 'is-hovered' : ''}`}
                            style={{ left: `${ev.pinPos.x}%`, top: `${ev.pinPos.y}%` }}
                            onMouseEnter={() => setHoveredItem(ev.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => ev.isUnlocked && setSelectedEvidence(ev.id)}
                            title={ev.isUnlocked ? `Click to inspect: ${ev.title}` : "Evidence not yet discovered in the sanctuary"}
                        >
                            {/* Metallic brass pushpin */}
                            <div className={`eb-pushpin ${ev.isUnlocked ? 'pin-gold' : 'pin-grey'}`} />

                            {/* Card Frame */}
                            <div className="eb-card-frame">
                                {ev.isUnlocked ? (
                                    <>
                                        <div className="eb-card-img-wrap">
                                            <img src={ev.img} alt={ev.title} className="eb-card-img" />
                                        </div>
                                        <div className="eb-card-meta">
                                            <span className="eb-card-cat">{ev.category}</span>
                                            <h4 className="eb-card-title">{ev.title}</h4>
                                        </div>
                                    </>
                                ) : (
                                    <div className="eb-locked-card">
                                        <span className="eb-locked-icon">🔒</span>
                                        <span className="eb-locked-text">UNDISCOVERED LEAD</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* ── WOODEN SUSPECTS SHELF LEDGE ── */}
                <div className="eb-shelf-rail">
                    <span className="eb-shelf-label">ESTATE SUSPECTS & PERSONS OF INTEREST</span>
                </div>

                {/* ── 2. SUSPECTS DOSSIER LAYER (Pinned along the lower shelf) ── */}
                <div className="eb-suspects-row">
                    {SUSPECTS_REGISTRY.map(suspect => {
                        const isHovered = hoveredItem === suspect.id;
                        return (
                            <div
                                key={suspect.id}
                                className={`eb-suspect-pin-card ${isHovered ? 'is-hovered' : ''}`}
                                style={{ left: `${suspect.pos.x}%`, top: `${suspect.pos.y}%` }}
                                onMouseEnter={() => setHoveredItem(suspect.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                onClick={() => setSelectedSuspect(suspect.id)}
                                title={`Inspect dossier: ${suspect.name}`}
                            >
                                <div className="eb-pushpin pin-red" />
                                <div className="eb-suspect-polaroid">
                                    <img src={suspect.img} alt={suspect.name} className="eb-suspect-img" />
                                    <div className="eb-suspect-caption">
                                        <div className="eb-suspect-name">{suspect.name}</div>
                                        <div className="eb-suspect-role">{suspect.role}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── MODAL INSPECTOR: EVIDENCE DOSSIER ── */}
            {inspectedData && (
                <div className="eb-modal-backdrop" onClick={() => setSelectedEvidence(null)}>
                    <div className="eb-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="eb-modal-header">
                            <div className="eb-modal-tag">{inspectedData.category}</div>
                            <button className="eb-modal-close" onClick={() => setSelectedEvidence(null)}>✕</button>
                        </div>

                        <div className="eb-modal-body">
                            <div className="eb-modal-left">
                                <img src={inspectedData.img} alt={inspectedData.title} className="eb-modal-img" />
                                <div className="eb-modal-loc">📍 {inspectedData.loc}</div>
                            </div>

                            <div className="eb-modal-right">
                                <h2 className="eb-modal-title">{inspectedData.title}</h2>
                                <p className="eb-modal-desc">{inspectedData.desc}</p>

                                {inspectedData.hasTonePlayer && (
                                    <div className="eb-tone-player-box">
                                        <div className="eb-tone-label">RESONANCE FREQUENCY TEST: 19 HZ (SUB-BASS)</div>
                                        <button
                                            className={`eb-btn eb-tone-btn ${isPlayingTone ? 'is-playing' : ''}`}
                                            onClick={playResonanceTone}
                                        >
                                            {isPlayingTone ? '🔊 EMITTING 19Hz RESONANCE...' : '▶ TEST FREQUENCY PULSE'}
                                        </button>
                                    </div>
                                )}

                                <div className="eb-modal-links-section">
                                    <span className="eb-links-label">IDENTIFIED SUSPECT CONNECTIONS:</span>
                                    <div className="eb-links-badges">
                                        {(inspectedData.links || []).map(linkId => {
                                            const s = SUSPECTS_REGISTRY.find(item => item.id === linkId);
                                            return s ? (
                                                <button
                                                    key={linkId}
                                                    className="eb-link-badge clickable"
                                                    onClick={() => {
                                                        setSelectedEvidence(null);
                                                        setSelectedSuspect(s.id);
                                                    }}
                                                    title={`View dossier for ${s.name}`}
                                                >
                                                    🔗 {s.name} ({s.role})
                                                </button>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL INSPECTOR: SUSPECT DOSSIER ── */}
            {inspectedSuspectData && (
                <div className="eb-modal-backdrop" onClick={() => setSelectedSuspect(null)}>
                    <div className="eb-modal-card eb-suspect-modal" onClick={e => e.stopPropagation()}>
                        <div className="eb-modal-header">
                            <div className="eb-modal-tag">SUSPECT DOSSIER</div>
                            <button className="eb-modal-close" onClick={() => setSelectedSuspect(null)}>✕</button>
                        </div>

                        <div className="eb-modal-body">
                            <div className="eb-modal-left">
                                <img src={inspectedSuspectData.img} alt={inspectedSuspectData.name} className="eb-modal-img" />
                                <div className="eb-modal-loc">{inspectedSuspectData.role}</div>
                            </div>

                            <div className="eb-modal-right">
                                <h2 className="eb-modal-title">{inspectedSuspectData.name}</h2>
                                <p className="eb-modal-desc">{inspectedSuspectData.motive}</p>

                                <div className="eb-modal-links-section">
                                    <span className="eb-links-label">LINKED EVIDENCE ON BOARD:</span>
                                    <div className="eb-links-badges">
                                        {unlockedEvidenceList
                                            .filter(e => e.isUnlocked && e.links?.includes(inspectedSuspectData.id))
                                            .map(e => (
                                                <button
                                                    key={e.id}
                                                    className="eb-link-badge clickable"
                                                    onClick={() => {
                                                        setSelectedSuspect(null);
                                                        setSelectedEvidence(e.id);
                                                    }}
                                                    title={`Inspect evidence: ${e.title}`}
                                                >
                                                    📌 {e.title}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MASTER FIBONACCI CODEX MODAL ── */}
            {showFibonacciCodex && (
                <div className="eb-modal-backdrop" onClick={() => setShowFibonacciCodex(false)}>
                    <div className="eb-modal-card eb-codex-modal" onClick={e => e.stopPropagation()}>
                        <div className="eb-modal-header">
                            <div className="eb-modal-tag">MASTER CASE FILE: THE FIBONACCI SERIES</div>
                            <button className="eb-modal-close" onClick={() => setShowFibonacciCodex(false)}>✕</button>
                        </div>

                        <div className="eb-modal-body">
                            <div className="eb-modal-left" style={{ width: '52%' }}>
                                <img
                                    src="/images/2ndpart.jpeg"
                                    alt="The Fibonacci Series Codex"
                                    className="eb-modal-img"
                                    style={{ height: '340px', objectFit: 'contain', background: '#0a0805' }}
                                />
                                <div className="eb-modal-loc">📐 SACRED GEOMETRY (Φ = 1.6180339...)</div>
                            </div>

                            <div className="eb-modal-right" style={{ width: '48%' }}>
                                <h2 className="eb-modal-title">The Fibonacci Sequence & Floral Clusters</h2>
                                <p className="eb-modal-desc">
                                    Eliza D'Souza recorded daily petal counts for 15 consecutive days in the glasshouse sanctuary.
                                    Natural daisies strictly obey Fibonacci spirals: <strong>13, 21, 34, 55 petals</strong>.
                                </p>
                                <div className="eb-codex-box">
                                    <div className="eb-codex-point">
                                        <span className="eb-gold-bullet">◆</span>
                                        <span><strong>Day 10 Anomaly:</strong> 'I can see sound... when Kye tests audio in the studio next door... the flowers are humming back at me. The petals are lying.'</span>
                                    </div>
                                    <div className="eb-codex-point">
                                        <span className="eb-gold-bullet">◆</span>
                                        <span><strong>Day 15 Breach:</strong> 'I am going to the sanctuary tonight. I will measure every daisy. I will prove the sequence is broken... 13... 21... 34... It is just math.'</span>
                                    </div>
                                </div>

                                <div className="eb-modal-actions" style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem' }}>
                                    <button
                                        className="eb-btn eb-journal-btn"
                                        onClick={() => {
                                            setShowFibonacciCodex(false);
                                            onOpenDiary?.();
                                        }}
                                    >
                                        📓 OPEN FULL JOURNAL
                                    </button>
                                    <button
                                        className="eb-btn eb-back-btn"
                                        onClick={() => setShowFibonacciCodex(false)}
                                    >
                                        RETURN TO BOARD
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
