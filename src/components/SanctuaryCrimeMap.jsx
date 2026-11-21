import React, { useState, useRef, useEffect } from 'react';
import './SanctuaryCrimeMap.css';

const LOCATIONS = [
    {
        id: 'sanctuary_dome',
        name: 'Glass Sanctuary Dome',
        sectorCode: 'SEC-01 · DOME ALPHA',
        tag: 'PRIMARY CRIME SCENE',
        category: 'crime_scene',
        x: 42.9,
        y: 50.3,
        color: '#e74c3c',
        icon: '🏛️',
        caseRef: 'DAI-SANCT-01A',
        reportDate: 'Nov 14, 1948 — 06:30 HRS',
        classification: 'HOMICIDE SCENE — FORENSIC EPICENTER',
        summary: "Eliza D'Souza discovered lifeless on the central tiled mosaic floor. Surrounded by fresh white daisies arranged in concentric Fibonacci clusters (13, 21, 34 petals). Yellow measuring ruler positioned beside her right hand. Glass dome heavily frosted with interior condensation from extreme rapid temperature drop.",
        evidence: [
            { icon: '🌼', label: 'Fibonacci Daisy Spiral', detail: "Concentric rings with 13, 21, 34 petals matching Eliza's phyllotaxis field notes.", tier: 1 },
            { icon: '📏', label: 'Yellow Plastic Ruler', detail: "Placed deliberately beside victim's palm. Fingerprints belong solely to Eliza.", tier: 1 },
            { icon: '🌫️', label: 'Vapor Condensation', detail: 'Dense moisture on glass ceiling indicates rapid oxygen evacuation and temperature inversion.', tier: 2 },
            { icon: '🔬', label: 'Cellular Plant Cavitation', detail: 'Fern and orchid cells show severe vibrational cavitation without physical blunt bruising.', tier: 3 }
        ],
        linkedSuspects: ["Eliza D'Souza (Victim)", 'Kye Harlan', 'Prof. Aldous Waltz'],
        timeline: [
            '16:30 — Eliza enters dome to measure daisy petal phyllotaxis',
            '17:00 — Acoustic transducer begins 19Hz infrasound wave pulse',
            '17:05 — Solenoid keypad lock engaged from outside',
            '17:35 — Acute hypoxic arrhythmia onset; victim collapses',
            '06:15 — Housekeeper Rina discovers the body'
        ],
        verdict: 'PREMEDITATED ACOUSTIC AMBUSH',
        verdictColor: '#e74c3c'
    },
    {
        id: 'vent_tower',
        name: 'Ventilation Duct & Acoustic Tower',
        sectorCode: 'SEC-02 · VENT SHAFT',
        tag: 'ACOUSTIC SABOTAGE SITE',
        category: 'sabotage',
        x: 50.8,
        y: 38.8,
        color: '#f39c12',
        icon: '🔊',
        caseRef: 'DAI-SANCT-01B',
        reportDate: 'Nov 14, 1948 — 08:45 HRS',
        classification: 'LETHAL INSTRUMENT OF SABOTAGE',
        summary: 'Concealed within the overhead exhaust conduit linking the two glass domes are four military-grade 19Hz infrasound transducers wired to an automated timer relay and junction box audio recorder. Custom aluminum heatsinks bear serial markings traced to Grafton Sound.',
        evidence: [
            { icon: '🔊', label: '19Hz Infrasound Transducer', detail: 'High-SPL emitter calibrated precisely to human cardiac and ocular resonant frequency.', tier: 3 },
            { icon: '💾', label: 'Junction Box Micro SD Card', detail: "Captured 18 minutes of Eliza's respiratory distress and failing countdown.", tier: 3 },
            { icon: '⏱️', label: 'Pre-Set Relay Switch', detail: 'Automated remote trigger set for 17:00 sharp. Required zero on-site manual operation during murder.', tier: 2 }
        ],
        linkedSuspects: ['Kye Harlan', 'Vince Okafor'],
        timeline: [
            '3 Weeks Prior — Vince delivers 4 custom subwoofers outside The Stellar',
            '2 Days Prior — Kye conceals transducers behind decorative ventilation grilles',
            '17:00 — Relay engages subwoofers at maximum resonant amplitude'
        ],
        verdict: 'LETHAL ACOUSTIC WEAPON ORIGIN',
        verdictColor: '#f39c12',
        hasTonePlayer: true
    },
    {
        id: 'botanical_lab',
        name: "Prof. Waltz's Botanical Laboratory",
        sectorCode: 'SEC-03 · GREENHOUSE LAB',
        tag: 'TOXICOLOGICAL SOURCE',
        category: 'sabotage',
        x: 59.7,
        y: 30.4,
        color: '#1abc9c',
        icon: '🧪',
        caseRef: 'DAI-SANCT-01D',
        reportDate: 'Nov 14, 1948 — 10:30 HRS',
        classification: 'TOXICOLOGICAL ARCHIVE',
        summary: "Prof. Aldous Waltz's private glass conservatory workbench in the north dome. Retorts contain concentrated decoctions of Perique cured tobacco flake. Research logs outline attempts to produce synthetic sensory synesthesia through dangerous nicotine alkaloid ingestion.",
        evidence: [
            { icon: '🚬', label: 'Perique Flake Infusion', detail: 'High-potency extract rich in anabasine and nornicotine alkaloids that sensitize cardiac myocardium.', tier: 2 },
            { icon: '📓', label: "Waltz's Research Diary", detail: "Documents 15 consecutive days of administering tea to sensitize Eliza's heart.", tier: 3 },
            { icon: '🌿', label: 'Chamomile Dilution Flask', detail: 'Sweet herbal mask used to conceal the pungent bitterness of cured tobacco leaf.', tier: 1 }
        ],
        linkedSuspects: ['Prof. Aldous Waltz'],
        timeline: [
            '15 Days Prior — Waltz initiates daily tea administration to Eliza',
            '15:00 — Eliza drinks final concentrated thermos prior to sanctuary entry',
            '17:00 — Sensitized myocardium fails rapidly under 19Hz acoustic shear'
        ],
        verdict: 'PHYSIOLOGICAL SENSITIZATION CONFIRMED',
        verdictColor: '#1abc9c'
    },
    {
        id: 'aviary_cage',
        name: "Shuk's Aviary & Contraband Stash",
        sectorCode: "SEC-04 · SHUK'S AVIARY",
        tag: 'CONTRABAND SITE',
        category: 'sabotage',
        x: 44.5,
        y: 70.0,
        color: '#9b59b6',
        icon: '🦜',
        caseRef: 'DAI-SANCT-01C',
        reportDate: 'Nov 14, 1948 — 09:15 HRS',
        classification: 'CRIMINAL SMUGGLING & LOCKOUT',
        summary: "Ornamental curved Victorian gallery housing Eliza's Amazon parrot (Shuk). False floor beneath wood shavings contained wax packets of uncut diamonds. Electronic keypad latch shows code entries at 17:05 and 23:30.",
        evidence: [
            { icon: '💎', label: 'Uncut Contraband Diamonds', detail: "Smuggled through The Stellar export cargo lines by Carl D'Souza.", tier: 3 },
            { icon: '🔢', label: 'Solenoid Keypad Log', detail: 'Door lock engaged from exterior at 17:05; unlocked & relocked in panic at 23:30.', tier: 2 },
            { icon: '🦜', label: 'Deceased Amazon Parrot', detail: "Autopsy confirms eardrum rupture and cardiac arrest identical to Eliza's acoustic trauma.", tier: 2 }
        ],
        linkedSuspects: ["Carl D'Souza"],
        timeline: [
            '17:05 — Carl punches code to lock keypad, protecting his diamond stash',
            '17:10 — Eliza trapped inside as infrasound ramps up',
            '23:30 — Carl returns in panic, verifies lock, and flees to Black Dog pub'
        ],
        verdict: 'SECONDARY OBSTRUCTION (LOCKOUT)',
        verdictColor: '#9b59b6'
    },
    {
        id: 'manor_study',
        name: "Arthur D'Souza's Executive Study",
        sectorCode: "SEC-05 · ARTHUR'S STUDY",
        tag: 'ESTATE COMMAND',
        category: 'alibi',
        x: 74.5,
        y: 54.0,
        color: '#3498db',
        icon: '📚',
        caseRef: 'DAI-SANCT-01E',
        reportDate: 'Nov 14, 1948 — 11:45 HRS',
        classification: 'ALIBI VERIFICATION',
        summary: "Arthur D'Souza's study on the second floor of the Victorian manor house. Shipping ledgers and export manifests for The Stellar spread across mahogany desk. Butler confirms Arthur remained inside throughout the critical window.",
        evidence: [
            { icon: '📋', label: 'Estate Shipping Ledgers', detail: "Audit notes show zero financial motive; trust fund already under Arthur's oversight.", tier: 1 },
            { icon: '☕', label: 'Butler Domestic Log', detail: 'Tea served in study at 18:00; Arthur was continuously present with visitors.', tier: 2 },
            { icon: '🚬', label: 'Briar Pipe Residue', detail: 'Matches standard Stellar Perique blend, common to both Arthur and Eliot.', tier: 1 }
        ],
        linkedSuspects: ["Arthur D'Souza"],
        timeline: [
            '16:00-20:00 — Arthur secluded in study reviewing export accounts',
            '18:00 — Butler serves tea; confirms physical presence'
        ],
        verdict: 'ALIBI FULLY CORROBORATED',
        verdictColor: '#2ecc71'
    },
    {
        id: 'eastern_gate',
        name: 'Eastern Garden Path & Damper Lever',
        sectorCode: 'SEC-06 · DAMPER LEVER',
        tag: 'WITNESS TRAIL',
        category: 'alibi',
        x: 87.5,
        y: 36.0,
        color: '#e67e22',
        icon: '🚶',
        caseRef: 'DAI-SANCT-01G',
        reportDate: 'Nov 14, 1948 — 14:00 HRS',
        classification: 'ACCIDENTAL OBSTRUCTION TRAIL',
        summary: "Stone path through Miriam's formal parterre gardens overlooking the lily pond. Eliot D'Souza walked down this path at twilight to smoke his briar pipe. He pulled the external cast-iron damper levers to seal exhaust grilles, unaware Eliza was inside.",
        evidence: [
            { icon: '🕹️', label: 'Cast-Iron Damper Levers', detail: 'Mechanically sealed ventilation from outside. Fingerprints match Eliot.', tier: 2 },
            { icon: '🚬', label: 'Briar Pipe Ash', detail: "Stellar Perique ash on stone bench confirms Eliot's presence at twilight.", tier: 1 },
            { icon: '🕊️', label: "Miriam's Memorial Plaque", detail: "Eliot's emotional anchor; closed vents out of grief and habit, not malice.", tier: 1 }
        ],
        linkedSuspects: ["Eliot D'Souza"],
        timeline: [
            '16:50 — Eliot walks down garden path with pipe',
            '17:00 — Pulls mechanical damper levers to seal dome in memory of Miriam',
            '17:20 — Returns to manor library hearth'
        ],
        verdict: 'ACCIDENTAL CONTRIBUTION (NO MALICE)',
        verdictColor: '#e67e22'
    },
    {
        id: 'coroner_post',
        name: "Dr. Priya Menon's Field Telemetry Post",
        sectorCode: 'SEC-07 · FORENSIC POST',
        tag: 'MEDICAL FORENSICS',
        category: 'alibi',
        x: 68.0,
        y: 79.0,
        color: '#2ecc71',
        icon: '📋',
        caseRef: 'DAI-SANCT-01F',
        reportDate: 'Nov 14, 1948 — 12:30 HRS',
        classification: 'CORONER REPORT — TELEMETRY',
        summary: "Coroner Priya Menon's on-site medical telemetry mobile post in the south entrance forecourt. Analysis of myocardial tissue samples confirmed that mechanical shear waves at 19Hz, coupled with oxygen depletion from sealed vents and tobacco alkaloids, induced fatal arrhythmia.",
        evidence: [
            { icon: '📑', label: 'Autopsy Protocol No. 884', detail: 'Certified cause of death: Hypoxic cardiac arrhythmia with mechanical acoustic shear.', tier: 3 },
            { icon: '🫀', label: 'Tissue Spectrophotometry', detail: 'Cellular disruption concentrated along cardiac and cochlear nerve pathways.', tier: 3 },
            { icon: '🧪', label: 'Blood Gas Analysis', detail: 'Severe hypoxia with zero traumatic blunt force or defensive struggle marks.', tier: 2 }
        ],
        linkedSuspects: ['Dr. Priya Menon'],
        timeline: [
            '07:15 — Dr. Menon arrives on scene with mobile laboratory',
            '09:30 — Documents acoustic vibration patterns in cellular tissue',
            '11:00 — Issues definitive tripartite causation verdict'
        ],
        verdict: 'TRIPARTITE CAUSATION PROVEN',
        verdictColor: '#2ecc71'
    },
    {
        id: 'sunken_garden',
        name: 'Western Sunken Parterre & Service Gate',
        sectorCode: 'SEC-08 · SUNKEN PARTERRE',
        tag: 'PERIMETER ROUTE',
        category: 'alibi',
        x: 22.4,
        y: 41.9,
        color: '#a89d82',
        icon: '🌿',
        caseRef: 'DAI-SANCT-01H',
        reportDate: 'Nov 14, 1948 — 07:00 HRS',
        classification: 'INITIAL DISCOVERY ROUTE',
        summary: 'Intricate sunken Victorian parterre garden west of the Glass Dome. Housekeeper Rina crossed this parterre at 06:15 with fresh cut gardenias when she noticed the condensation and unresponsive figure through the curved glass.',
        evidence: [
            { icon: '👣', label: 'Dew-Marked Footprints', detail: "Size 6 rubber-soled maid shoes matching Rina's morning delivery path.", tier: 1 },
            { icon: '🌸', label: 'Clipped Gardenias Basket', detail: 'Dropped on the flagstone path in shock upon discovering the victim.', tier: 1 },
            { icon: '🗝️', label: 'Service Gate Logbook', detail: 'Western estate service gate opened at 06:00 sharp by morning staff.', tier: 2 }
        ],
        linkedSuspects: ['Rina (Housekeeper)'],
        timeline: [
            '06:00 — Rina unlocks west service gate',
            '06:15 — Walks across sunken parterre, spots condensation on glass',
            '06:18 — Enters sanctuary, discovers Eliza, raises alarm'
        ],
        verdict: 'INNOCENT DISCOVERY WITNESS',
        verdictColor: '#a89d82'
    },
    {
        id: 'north_terrace',
        name: 'Northern Reflection Terrace & Boundary',
        sectorCode: 'SEC-09 · NORTH TERRACE',
        tag: 'ACOUSTIC PERIMETER',
        category: 'sabotage',
        x: 48.4,
        y: 7.5,
        color: '#f1c40f',
        icon: '🔭',
        caseRef: 'DAI-SANCT-01I',
        reportDate: 'Nov 14, 1948 — 15:30 HRS',
        classification: 'ACOUSTIC REFLECTION BOUNDARY',
        summary: 'Elevated circular stone turnaround at the northern estate apex. Forensic sound telemetry indicates the curved masonry walls served as an acoustic parabolic reflector, preventing 19Hz dissipation and concentrating pressure back toward the sanctuary dome.',
        evidence: [
            { icon: '📈', label: 'Decibel Telemetry Log', detail: 'External ambient decibel levels measured zero audible sound; infrasound remained trapped inside.', tier: 2 },
            { icon: '🧱', label: 'Circular Masonry Parapet', detail: 'High density stone wall shaped in exact focal curvature reflecting low frequencies.', tier: 2 }
        ],
        linkedSuspects: ['Kye Harlan', 'Dr. Priya Menon'],
        timeline: [
            '17:00-17:35 — Infrasound waves bounce off north retaining wall without exterior detection'
        ],
        verdict: 'ACOUSTIC TRAP CONFIRMED',
        verdictColor: '#f1c40f'
    }
];

export default function SanctuaryCrimeMap({ onBack }) {
    const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'
    const [visionMode, setVisionMode] = useState('standard'); // 'standard' | 'acoustic' | 'tactical'
    const [showFibonacci, setShowFibonacci] = useState(true);
    const [showAcousticWaves, setShowAcousticWaves] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'crime_scene' | 'sabotage' | 'alibi'
    const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
    const [isPlayingTone, setIsPlayingTone] = useState(false);

    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);

    // Filter locations by selected category
    const filteredLocations = filterCategory === 'all'
        ? LOCATIONS
        : LOCATIONS.filter(l => l.category === filterCategory);

    // Stop audio on unmount
    useEffect(() => {
        return () => {
            if (oscRef.current) {
                try { oscRef.current.stop(); } catch {}
                oscRef.current = null;
            }
            if (audioCtxRef.current) {
                try { audioCtxRef.current.close(); } catch {}
                audioCtxRef.current = null;
            }
        };
    }, []);

    // Toggle 19Hz Sub-Bass Infrasound Resonance Tone Generator
    const toggleResonanceTone = () => {
        if (isPlayingTone) {
            if (oscRef.current) {
                try { oscRef.current.stop(); } catch {}
                oscRef.current = null;
            }
            setIsPlayingTone(false);
            return;
        }

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;

            // 19Hz fundamental infrasound wave
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(19, ctx.currentTime);

            // 38Hz second harmonic audible warm undertone
            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(38, ctx.currentTime);

            const gain1 = ctx.createGain();
            gain1.gain.setValueAtTime(0.3, ctx.currentTime);

            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.08, ctx.currentTime);

            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(ctx.destination);
            gain2.connect(ctx.destination);

            osc1.start();
            osc2.start();

            oscRef.current = {
                stop: () => {
                    try { osc1.stop(); osc2.stop(); } catch {}
                    try { osc1.disconnect(); osc2.disconnect(); } catch {}
                }
            };
            setIsPlayingTone(true);
        } catch (err) {
            console.error('Audio synthesis failed:', err);
        }
    };

    return (
        <div className="scm-wrapper">
            {/* Atmospheric Overlays */}
            <div className="scm-ambient-fog" />
            <div className="scm-scanlines" />

            {/* HUD Header Bar */}
            <header className="scm-hud-header">
                <div className="scm-title-card">
                    <div className="scm-title-row">
                        <span className="scm-badge-estate">D'SOUZA BIRD SANCTUARY</span>
                        <h1 className="scm-main-title">AERIAL CRIME MAP &amp; FIBONACCI TELEMETRY</h1>
                    </div>
                    <div className="scm-sub-title">
                        PRESERVED ESTATE TOPOGRAPHY · GOLDEN SPIRAL Φ = 1.618 · INFRASOUND GRID
                    </div>
                </div>

                <div className="scm-controls-group">
                    {/* Vision Mode Toggle */}
                    <div className="scm-vision-toggle">
                        <button
                            className={`scm-vision-btn ${visionMode === 'standard' ? 'active' : ''}`}
                            onClick={() => setVisionMode('standard')}
                            title="Preserved Aerial Estate Photography"
                        >
                            📷 AERIAL
                        </button>
                        <button
                            className={`scm-vision-btn ${visionMode === 'acoustic' ? 'active' : ''}`}
                            onClick={() => {
                                setVisionMode('acoustic');
                                setShowAcousticWaves(true);
                            }}
                            title="19Hz Acoustic Resonance Thermal Scan"
                        >
                            🔊 19Hz WAVES
                        </button>
                        <button
                            className={`scm-vision-btn ${visionMode === 'tactical' ? 'active' : ''}`}
                            onClick={() => setVisionMode('tactical')}
                            title="Forensic Blueprint / Night Reconnaissance Grid"
                        >
                            📐 TACTICAL
                        </button>
                    </div>

                    {/* Fibonacci Spiral Vector Toggle */}
                    <button
                        className={`scm-tool-btn ${showFibonacci ? 'active' : ''}`}
                        onClick={() => setShowFibonacci(!showFibonacci)}
                        title="Toggle Golden Ratio Logarithmic Spiral Overlay"
                    >
                        🌀 SPIRAL {showFibonacci ? 'ON' : 'OFF'}
                    </button>

                    {/* View Perspective (3D vs 2D) */}
                    <button
                        className={`scm-tool-btn ${viewMode === '3d' ? 'active' : ''}`}
                        onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                        title="Switch between 3D Isometric View and 2D Planar Schematic"
                    >
                        {viewMode === '3d' ? '📐 3D ISOMETRIC' : '🗺️ 2D TOP-DOWN'}
                    </button>

                    {/* Exit / Return */}
                    {onBack && (
                        <button className="scm-tool-btn scm-exit-btn" onClick={onBack}>
                            ← EXIT MAP
                        </button>
                    )}
                </div>
            </header>

            {/* Map Viewport Area */}
            <div className="scm-viewport">
                <div className={`scm-board view-${viewMode}`}>
                    {/* The Preserved Authentic Aerial Image Surface */}
                    <div className="scm-map-media">
                        <img
                            src="/scenes/map1.jpeg"
                            alt="D'Souza Estate Bird Sanctuary Sector Aerial Map"
                            className={`scm-map-img filter-${visionMode}`}
                        />
                        <div className="scm-map-vignette" />
                        <div className="scm-map-border-marks" />

                        {/* Estate Map Compass Rose */}
                        <div className="scm-compass-rose">
                            <div className="scm-compass-pointer">▲</div>
                            <div className="scm-compass-label">N</div>
                        </div>

                        {/* Scale Reference Indicator */}
                        <div className="scm-scale-bar">
                            <div className="scm-scale-ruler">
                                <span className="scm-scale-tick">0</span>
                                <span className="scm-scale-line" />
                                <span className="scm-scale-tick">50m</span>
                                <span className="scm-scale-line" />
                                <span className="scm-scale-tick">100m</span>
                            </div>
                            <div className="scm-scale-caption">SURVEILLANCE SCALE 1:850</div>
                        </div>

                        {/* Topographical Coordinates Stamp */}
                        <div className="scm-map-stamp">
                            <span>LAT 51°28'12"N · LON 0°19'44"W</span>
                            <span style={{ color: '#b78f2f' }}>SECTION 7-B · CRIME SCENE PRESERVED</span>
                        </div>
                    </div>

                    {/* 19Hz Acoustic Resonance Wave Animation Layer */}
                    {(visionMode === 'acoustic' || showAcousticWaves) && (
                        <svg className="scm-acoustic-svg" viewBox="0 0 950 535">
                            <defs>
                                <radialGradient id="acousticEpicenterGrad" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#e74c3c" stopOpacity="0.45" />
                                    <stop offset="60%" stopColor="#f39c12" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#f39c12" stopOpacity="0" />
                                </radialGradient>
                            </defs>

                            {/* Concentric 19Hz Infrasound Waves Radiating from the Ventilation Shaft */}
                            <circle cx="483" cy="208" r="30" className="scm-acoustic-pulse pulse-1" />
                            <circle cx="483" cy="208" r="65" className="scm-acoustic-pulse pulse-2" />
                            <circle cx="483" cy="208" r="105" className="scm-acoustic-pulse pulse-3" />
                            <circle cx="483" cy="208" r="150" className="scm-acoustic-pulse pulse-4" />
                            <circle cx="483" cy="208" r="200" className="scm-acoustic-pulse pulse-5" />

                            {/* Resonance Entrapment Zone in the Glass Sanctuary Dome */}
                            <ellipse cx="408" cy="269" rx="85" ry="72" fill="url(#acousticEpicenterGrad)" className="scm-epicenter-glow" />
                            <text x="360" y="274" fill="#ff7675" fontSize="11" fontFamily="Courier New" letterSpacing="1.5" fontWeight="bold">
                                19Hz EPICENTER
                            </text>
                        </svg>
                    )}

                    {/* Fibonacci Golden Spiral & Geometric Telemetry Overlay */}
                    {showFibonacci && (
                        <svg className="scm-fibonacci-svg" viewBox="0 0 950 535">
                            <defs>
                                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#fff2a3" stopOpacity="0.95" />
                                    <stop offset="50%" stopColor="#dfd8a3" stopOpacity="0.85" />
                                    <stop offset="100%" stopColor="#b78f2f" stopOpacity="0.6" />
                                </linearGradient>
                                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Concentric Golden Section Framing Rectangles anchored around Dome */}
                            <rect x="395" y="255" width="26" height="26" fill="none" stroke="rgba(223, 216, 163, 0.45)" strokeDasharray="3 3" />
                            <rect x="395" y="229" width="42" height="26" fill="none" stroke="rgba(223, 216, 163, 0.45)" strokeDasharray="3 3" />
                            <rect x="353" y="229" width="42" height="68" fill="none" stroke="rgba(223, 216, 163, 0.45)" strokeDasharray="3 3" />
                            <rect x="353" y="297" width="110" height="68" fill="none" stroke="rgba(223, 216, 163, 0.4)" strokeDasharray="4 4" />
                            <rect x="463" y="187" width="178" height="178" fill="none" stroke="rgba(223, 216, 163, 0.35)" strokeDasharray="4 4" />
                            <rect x="285" y="9" width="356" height="356" fill="none" stroke="rgba(223, 216, 163, 0.25)" strokeDasharray="5 5" />

                            {/* Mathematical Logarithmic Golden Spiral Path Aligned with Estate Architecture */}
                            <path
                                d="M 408 269
                                   C 416 269, 421 261, 421 255
                                   C 421 241, 405 229, 395 229
                                   C 372 229, 353 252, 353 269
                                   C 353 306, 385 365, 423 365
                                   C 490 365, 567 290, 567 163
                                   C 567 40,  390 9,   285 45
                                   C 140 95,  120 280, 213 410
                                   C 320 540, 600 515, 708 380
                                   C 780 290, 870 230, 930 200"
                                fill="none"
                                stroke="url(#goldGradient)"
                                strokeWidth="2.8"
                                filter="url(#goldGlow)"
                                className="scm-spiral-path"
                            />

                            {/* Crime Scene Transmission Vectors */}
                            {/* Sabotage Origin (Vent Shaft) -> Glass Sanctuary Dome (Epicenter) */}
                            <line x1="483" y1="208" x2="408" y2="269" stroke="#f39c12" strokeWidth="2" strokeDasharray="6 4" opacity="0.85" />
                            {/* Solenoid Keypad Lockout (Aviary) -> Glass Sanctuary Dome */}
                            <line x1="423" y1="374" x2="408" y2="269" stroke="#9b59b6" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.8" />
                            {/* Mechanical Damper Lever -> Vent Tower */}
                            <line x1="831" y1="193" x2="483" y2="208" stroke="#e67e22" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.8" />
                            {/* Toxicological Sensitization Source (Lab) -> Glass Sanctuary Dome */}
                            <line x1="567" y1="163" x2="408" y2="269" stroke="#1abc9c" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.8" />

                            {/* Phyllotaxis Mathematical Formula Labels */}
                            <g className="scm-math-annotations">
                                <text x="25" y="495" fill="#dfd8a3" fontFamily="Courier New" fontSize="12" letterSpacing="1.8" fontWeight="bold">
                                    GOLDEN RATIO Φ = 1.6180339887 · LOGARITHMIC SPIRAL r = a·e^(bθ)
                                </text>
                                <text x="25" y="515" fill="#b78f2f" fontFamily="Courier New" fontSize="10.5" letterSpacing="1.2">
                                    PHYLLOTAXIS PETAL CLUSTERS: F(n) = 13, 21, 34, 55 · DIVERGENCE ANGLE 137.5°
                                </text>
                            </g>
                        </svg>
                    )}

                    {/* Interactive Landmark Pins Plotted Directly on the Image */}
                    {filteredLocations.map((loc) => {
                        const isSelected = selectedLocation?.id === loc.id;
                        return (
                            <div
                                key={loc.id}
                                className={`scm-marker ${isSelected ? 'selected' : ''}`}
                                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                                onClick={() => setSelectedLocation(loc)}
                            >
                                <div className="scm-pin-content">
                                    {/* Concentric Pulsing Radar Rings */}
                                    <div
                                        className="scm-pin-pulse"
                                        style={{ backgroundColor: loc.color }}
                                    />

                                    {/* Icon Badge */}
                                    <div
                                        className="scm-pin-badge"
                                        style={{
                                            borderColor: loc.color,
                                            boxShadow: isSelected
                                                ? `0 0 20px ${loc.color}, 0 0 35px ${loc.color}88`
                                                : `0 4px 14px rgba(0,0,0,0.85)`
                                        }}
                                    >
                                        <span className="scm-pin-icon">{loc.icon}</span>
                                    </div>

                                    {/* Sector Reference Pill */}
                                    <div className="scm-pin-tag">
                                        <span className="scm-tag-code" style={{ color: loc.color }}>
                                            {loc.sectorCode.split(' · ')[0]}
                                        </span>
                                        <span className="scm-tag-name">{loc.name}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Category Filter Bar */}
            <nav className="scm-filter-bar">
                {[
                    { id: 'all', label: 'ALL SECTORS (9)', count: 9 },
                    { id: 'crime_scene', label: 'CRIME SCENE (1)', count: 1 },
                    { id: 'sabotage', label: 'SABOTAGE SITES (4)', count: 4 },
                    { id: 'alibi', label: 'ALIBIS & FORENSICS (4)', count: 4 }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`scm-filter-pill ${filterCategory === tab.id ? 'active' : ''}`}
                        onClick={() => setFilterCategory(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Slide-In Forensic Dossier Panel */}
            {selectedLocation && (
                <aside className="scm-dossier-panel">
                    <div className="scm-dossier-header">
                        <div>
                            <div className="scm-dossier-ref">{selectedLocation.caseRef} · {selectedLocation.sectorCode}</div>
                            <h2 className="scm-dossier-name">{selectedLocation.name}</h2>
                        </div>
                        <button
                            className="scm-close-dossier-btn"
                            onClick={() => setSelectedLocation(null)}
                            title="Close Forensic Report"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="scm-dossier-body">
                        {/* Classification Stamp */}
                        <div
                            className="scm-stamp-badge"
                            style={{
                                color: selectedLocation.verdictColor || '#b78f2f',
                                borderColor: selectedLocation.verdictColor || '#b78f2f'
                            }}
                        >
                            {selectedLocation.classification}
                        </div>

                        {/* Topographical Summary */}
                        <div>
                            <h3 className="scm-section-title">TOPOGRAPHICAL SUMMARY</h3>
                            <p className="scm-prose-text">{selectedLocation.summary}</p>
                        </div>

                        {/* Infrasound Resonance Test Player (Available for Sabotage sites) */}
                        {selectedLocation.hasTonePlayer && (
                            <div className="scm-resonance-box">
                                <div className="scm-resonance-title">
                                    RESONANCE FREQUENCY TEST · 19Hz INFRASOUND
                                </div>
                                <p className="scm-resonance-desc">
                                    The transducers operated at 19Hz, matching human cardiac arrhythmia resonance and ocular fluid cavitation.
                                </p>
                                <button
                                    className={`scm-tone-btn ${isPlayingTone ? 'playing' : ''}`}
                                    onClick={toggleResonanceTone}
                                >
                                    {isPlayingTone ? '🔊 STOP 19Hz INFRASOUND PULSE' : '▶ SIMULATE 19Hz ACOUSTIC PULSE'}
                                </button>
                            </div>
                        )}

                        {/* Forensic Evidence Found */}
                        <div>
                            <h3 className="scm-section-title">
                                PHYSICAL EVIDENCE LOGGED ({selectedLocation.evidence.length})
                            </h3>
                            <ul className="scm-evidence-list">
                                {selectedLocation.evidence.map((ev, i) => (
                                    <li key={i} className="scm-evidence-item">
                                        <span className="scm-ev-icon">{ev.icon}</span>
                                        <div className="scm-ev-body">
                                            <div className="scm-ev-header">
                                                <strong>{ev.label}</strong>
                                                <span className="scm-ev-tier">TIER {ev.tier}</span>
                                            </div>
                                            <div className="scm-ev-detail">{ev.detail}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Linked Suspects */}
                        <div>
                            <h3 className="scm-section-title">ASSOCIATED SUSPECTS</h3>
                            <div className="scm-suspects-chips">
                                {selectedLocation.linkedSuspects.map((s, i) => (
                                    <span key={i} className="scm-suspect-chip">
                                        👤 {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Chronological Event Timeline */}
                        <div>
                            <h3 className="scm-section-title">CHRONOLOGICAL EVENT LOG</h3>
                            <ul className="scm-timeline-list">
                                {selectedLocation.timeline.map((step, i) => (
                                    <li key={i} className="scm-timeline-step">{step}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Forensic Site Verdict */}
                        <div
                            className="scm-verdict-banner"
                            style={{
                                background: `${selectedLocation.verdictColor}18`,
                                border: `1px solid ${selectedLocation.verdictColor}`,
                                color: selectedLocation.verdictColor
                            }}
                        >
                            SITE VERDICT: {selectedLocation.verdict}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
