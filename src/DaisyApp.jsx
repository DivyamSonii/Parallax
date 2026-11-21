import React, { useState, useEffect } from 'react';
import './index.css';
import Prologue from './Prologue';
import Chapter1 from './Chapter1';
import SanctuaryScene from './SanctuaryScene';
import DiaryViewer from './DiaryViewer';
import DetectiveRoom from './DetectiveRoom';
import InterrogationRoom from './InterrogationRoom';
import DeductionBoard from './DeductionBoard';
import SuspectsBoard from './SuspectsBoard';
import EndingCinematic from './EndingCinematic';
import IntelligentHintModal from './components/IntelligentHintModal';
import TheoryWorkbench from './components/TheoryWorkbench';
import InvestigationReportModal from './components/InvestigationReportModal';
import DetectiveTutorialModal from './components/DetectiveTutorialModal';
import SanctuaryCrimeMap from './components/SanctuaryCrimeMap';
import DigitalScamLab from './components/DigitalScamLab';

const SAVE_KEY = 'PARALLAX_SAVE_DAISY_V1';
const TUTORIAL_KEY = 'PARALLAX_TUTORIAL_SEEN_V1';

function DaisyApp({ onBack }) {
    const [gamePhase, setGamePhase] = useState('prologue');
    const [hubTab, setHubTab] = useState('board');         // board | interrogate | suspects | deduction
    const [diaryOpen, setDiaryOpen] = useState(false);
    const [evidenceItems, setEvidenceItems] = useState([]); // grows as player finds clues
    const [userNotes, setUserNotes] = useState('');
    const [accusedSuspect, setAccusedSuspect] = useState('kye');

    // Advanced Investigation Tracking
    const [questionedSuspects, setQuestionedSuspects] = useState([]);
    const [presentedCount, setPresentedCount] = useState(0);
    const [hintsUsedCount, setHintsUsedCount] = useState(0);
    const [theoriesCount, setTheoriesCount] = useState(1);

    // Modal states
    const [hintsOpen, setHintsOpen] = useState(false);
    const [theoriesOpen, setTheoriesOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [scamLabOpen, setScamLabOpen] = useState(false);
    const [tutorialOpen, setTutorialOpen] = useState(() => {
        try {
            return !localStorage.getItem(TUTORIAL_KEY);
        } catch {
            return false;
        }
    });

    // Notification toast & resume state
    const [saveToast, setSaveToast] = useState(null);
    const [hasSavedGame, setHasSavedGame] = useState(() => {
        try {
            return Boolean(localStorage.getItem(SAVE_KEY));
        } catch {
            return false;
        }
    });

    // Mark tutorial as seen
    useEffect(() => {
        try {
            if (!localStorage.getItem(TUTORIAL_KEY)) {
                localStorage.setItem(TUTORIAL_KEY, 'true');
            }
        } catch {
            // ignore
        }
    }, []);

    // Save Game State
    const handleSaveGame = () => {
        try {
            const dataToSave = {
                gamePhase,
                hubTab,
                evidenceItems,
                userNotes,
                accusedSuspect,
                questionedSuspects,
                presentedCount,
                hintsUsedCount,
                theoriesCount,
                savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
            setHasSavedGame(true);
            setSaveToast(`CASE DOSSIER SAVED TO DISK ARCHIVE (${dataToSave.savedAt}) ✓`);
            setTimeout(() => setSaveToast(null), 3500);
        } catch {
            setSaveToast("ERROR SAVING CASE DOSSIER ✗");
            setTimeout(() => setSaveToast(null), 3000);
        }
    };

    // Resume Game State
    const handleResumeGame = () => {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.gamePhase) setGamePhase(data.gamePhase);
            if (data.hubTab) setHubTab(data.hubTab);
            if (Array.isArray(data.evidenceItems)) setEvidenceItems(data.evidenceItems);
            if (data.userNotes) setUserNotes(data.userNotes);
            if (data.accusedSuspect) setAccusedSuspect(data.accusedSuspect);
            if (Array.isArray(data.questionedSuspects)) setQuestionedSuspects(data.questionedSuspects);
            if (data.presentedCount !== undefined) setPresentedCount(data.presentedCount);
            if (data.hintsUsedCount !== undefined) setHintsUsedCount(data.hintsUsedCount);
            if (data.theoriesCount !== undefined) setTheoriesCount(data.theoriesCount);

            setSaveToast("CASE DOSSIER RESTORED FROM ARCHIVE ✓");
            setTimeout(() => setSaveToast(null), 3500);
        } catch {
            setSaveToast("FAILED TO RESTORE SAVED FILE ✗");
            setTimeout(() => setSaveToast(null), 3000);
        }
    };

    // Called by SanctuaryScene when player collects evidence
    const addEvidence = (id) => {
        setEvidenceItems(prev => prev.includes(id) ? prev : [...prev, id]);
    };

    const handleRestart = () => {
        setGamePhase('prologue');
        setHubTab('board');
        setDiaryOpen(false);
        setEvidenceItems([]);
        setQuestionedSuspects([]);
        setPresentedCount(0);
        setHintsUsedCount(0);
        setTheoriesCount(1);
    };

    // Prepare gameplay data for performance report
    const gameplayData = {
        evidenceFound: evidenceItems,
        suspectsQuestioned: questionedSuspects,
        presentedEvidenceCount: presentedCount,
        contradictionsUncovered: Math.max(1, Math.min(3, Math.floor(presentedCount / 1.5))),
        hintsUsed: hintsUsedCount,
        accusation: accusedSuspect,
        theoriesConstructed: theoriesCount
    };

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>

            {/* Save / Status Toast Notification */}
            {saveToast && (
                <div style={{
                    position: 'fixed',
                    top: '64px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 999999,
                    background: '#110d0a',
                    border: '1px solid #b78f2f',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(183,143,47,0.3)',
                    color: '#dfd8a3',
                    padding: '0.6rem 1.6rem',
                    borderRadius: '2px',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                }}>
                    <span>{saveToast}</span>
                </div>
            )}

            {/* ── 1. Prologue ── */}
            {gamePhase === 'prologue' && (
                <Prologue onComplete={() => setGamePhase('chapter1')} />
            )}

            {/* ── 2. Chapter 1 — Maid cinematic + Crime Scene + Investigation Hub ── */}
            {gamePhase === 'chapter1' && (
                <Chapter1
                    onComplete={() => setGamePhase('main')}
                    onSolve={() => setGamePhase('ending')}
                />
            )}

            {/* ── 3. Sanctuary cinematic ── */}
            {gamePhase === 'sanctuary' && (
                <SanctuaryScene
                    onComplete={() => setGamePhase('main')}
                    onEvidenceFound={addEvidence}
                />
            )}

            {/* ── 4. MAIN INVESTIGATION HUB ── */}
            {gamePhase === 'main' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', background: '#08060a' }}>

                    {/* TOP NAV BAR */}
                    <nav style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '54px',
                        background: 'linear-gradient(to bottom, #0d0a07 80%, rgba(13,10,7,0.4))',
                        borderBottom: '1px solid rgba(183,143,47,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        zIndex: 50, padding: '0 1.2rem', boxSizing: 'border-box'
                    }}>
                        {/* Left Group: Cases & Progress Meter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(183,143,47,0.3)',
                                        color: '#b78f2f',
                                        fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                        letterSpacing: '0.12em', padding: '0.35rem 0.7rem',
                                        cursor: 'pointer', borderRadius: '2px',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Return to Case Selector"
                                >
                                    ← CASES
                                </button>
                            )}

                            {/* Progress Indicator */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'rgba(183,143,47,0.08)',
                                border: '1px solid rgba(183,143,47,0.2)',
                                padding: '0.3rem 0.7rem', borderRadius: '2px'
                            }}>
                                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', color: '#d4bc8b', letterSpacing: '0.1em' }}>
                                    CLUES: <strong style={{ color: '#fff' }}>{evidenceItems.length}/6</strong>
                                </span>
                                <span style={{ color: 'rgba(183,143,47,0.3)' }}>|</span>
                                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', color: '#d4bc8b', letterSpacing: '0.1em' }}>
                                    SUSPECTS: <strong style={{ color: '#fff' }}>{questionedSuspects.length}/5</strong>
                                </span>
                            </div>

                            {hasSavedGame && (
                                <button
                                    onClick={handleResumeGame}
                                    style={{
                                        background: 'rgba(46, 204, 113, 0.1)',
                                        border: '1px solid rgba(46, 204, 113, 0.4)',
                                        color: '#2ecc71',
                                        fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                                        letterSpacing: '0.12em', padding: '0.35rem 0.6rem',
                                        cursor: 'pointer', borderRadius: '2px'
                                    }}
                                    title="Load saved progress from localStorage"
                                >
                                    ↺ RESUME
                                </button>
                            )}
                        </div>

                        {/* Center Group: Primary Hub Navigation Tabs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {[
                                { id: 'board', label: 'EVIDENCE BOARD' },
                                { id: 'map', label: 'ESTATE MAP' },
                                { id: 'suspects', label: 'SUSPECTS' },
                                { id: 'interrogate', label: 'INTERROGATE' },
                                { id: 'deduction', label: 'DEDUCTION' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setHubTab(tab.id)}
                                    style={{
                                        background: hubTab === tab.id ? 'rgba(183,143,47,0.18)' : 'transparent',
                                        border: '1px solid',
                                        borderColor: hubTab === tab.id ? '#b78f2f' : 'rgba(183,143,47,0.15)',
                                        color: hubTab === tab.id ? '#dfd8a3' : '#7b6f52',
                                        fontFamily: 'Cinzel, serif',
                                        fontSize: '0.65rem',
                                        letterSpacing: '0.18em',
                                        padding: '0.45rem 1.1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        borderRadius: '2px'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Right Group: Intelligent Toolkit Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                                onClick={() => setHintsOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(241, 196, 15, 0.3)',
                                    color: '#f1c40f',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.65rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="Open Intelligent Hint System"
                            >
                                💡 HINTS
                            </button>

                            <button
                                onClick={() => setTheoriesOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(52, 152, 219, 0.35)',
                                    color: '#5dade2',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.65rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="Open Alternative Theories Workbench"
                            >
                                🧠 THEORIES
                            </button>

                            <button
                                onClick={() => setReportOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(46, 204, 113, 0.35)',
                                    color: '#2ecc71',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.65rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="View Real-Time Forensic Performance Report"
                            >
                                📊 REPORT
                            </button>

                            <button
                                onClick={() => setScamLabOpen(true)}
                                style={{
                                    background: 'rgba(231, 76, 60, 0.15)',
                                    border: '1px solid rgba(231, 76, 60, 0.45)',
                                    color: '#ff9999',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.65rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="Open Digital Scam Investigation Lab (Case #902)"
                            >
                                🛡 SCAM LAB
                            </button>

                            <button
                                onClick={() => setTutorialOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(183,143,47,0.25)',
                                    color: '#b78f2f',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.65rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="View Detective Field Manual"
                            >
                                📖 MANUAL
                            </button>

                            <button
                                onClick={handleSaveGame}
                                style={{
                                    background: 'rgba(183,143,47,0.12)',
                                    border: '1px solid #b78f2f',
                                    color: '#dfd8a3',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.75rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="Save Current Game Progress"
                            >
                                💾 SAVE
                            </button>

                            <button
                                onClick={() => setDiaryOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(183,143,47,0.25)',
                                    color: '#a89d82',
                                    fontFamily: 'Cinzel, serif', fontSize: '0.62rem',
                                    letterSpacing: '0.12em', padding: '0.35rem 0.75rem',
                                    cursor: 'pointer', borderRadius: '2px'
                                }}
                                title="Open Detective Field Journal"
                            >
                                📓 JOURNAL
                            </button>
                        </div>
                    </nav>

                    {/* TAB CONTENT (fills below nav) */}
                    <div style={{ position: 'absolute', top: '54px', inset: '54px 0 0 0', overflow: 'hidden' }}>
                        {hubTab === 'board' && (
                            <DetectiveRoom
                                evidenceItems={evidenceItems}
                                onBack={() => setGamePhase('sanctuary')}
                                onOpenDiary={() => setDiaryOpen(true)}
                            />
                        )}
                        {hubTab === 'map' && (
                            <SanctuaryCrimeMap onBack={() => setHubTab('board')} />
                        )}
                        {hubTab === 'suspects' && (
                            <SuspectsBoard evidenceItems={evidenceItems} />
                        )}
                        {hubTab === 'interrogate' && (
                            <InterrogationRoom
                                evidenceItems={evidenceItems}
                                onEvidenceFound={addEvidence}
                                onEvidencePresented={() => setPresentedCount(p => p + 1)}
                                onSuspectQuestioned={(suspectId) => {
                                    setQuestionedSuspects(prev => prev.includes(suspectId) ? prev : [...prev, suspectId]);
                                }}
                            />
                        )}
                        {hubTab === 'deduction' && (
                            <DeductionBoard
                                evidenceItems={evidenceItems}
                                onBack={() => setHubTab('board')}
                                onAccuse={(suspectId) => {
                                    setAccusedSuspect(suspectId || 'kye');
                                    setGamePhase('ending');
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ── 5. ENDING CINEMATIC ── */}
            {gamePhase === 'ending' && (
                <EndingCinematic
                    accusedSuspect={accusedSuspect}
                    onRestart={handleRestart}
                    onViewReport={() => setReportOpen(true)}
                />
            )}

            {/* ── MODALS & WORKBENCHES ── */}

            {/* DiaryViewer */}
            <DiaryViewer
                isOpen={diaryOpen}
                onClose={() => setDiaryOpen(false)}
                userNotes={userNotes}
                onUpdateNotes={setUserNotes}
                onEvidenceDiscovered={addEvidence}
            />

            {/* Intelligent Hint System Modal */}
            <IntelligentHintModal
                isOpen={hintsOpen}
                onClose={() => setHintsOpen(false)}
                evidenceItems={evidenceItems}
                questionedSuspects={questionedSuspects}
                totalHintsUsed={hintsUsedCount}
                onHintUsed={() => setHintsUsedCount(h => h + 1)}
            />

            {/* Alternative Theories Workbench */}
            {theoriesOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(2, 1, 3, 0.94)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <TheoryWorkbench
                        evidenceItems={evidenceItems}
                        onBack={() => setTheoriesOpen(false)}
                        onTheoryValidated={() => setTheoriesCount(t => t + 1)}
                        onAccuse={(suspectId) => {
                            setAccusedSuspect(suspectId);
                            setTheoriesOpen(false);
                            setGamePhase('ending');
                        }}
                    />
                </div>
            )}

            {/* Investigation Performance Report Modal */}
            <InvestigationReportModal
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
                gameplayData={gameplayData}
            />

            {/* Detective Field Manual / Onboarding Guide */}
            <DetectiveTutorialModal
                isOpen={tutorialOpen}
                onClose={() => setTutorialOpen(false)}
            />

            {/* Digital Scam Investigation Lab (Case #902) */}
            {scamLabOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
                    <DigitalScamLab onBack={() => setScamLabOpen(false)} />
                </div>
            )}
        </div>
    );
}

export default DaisyApp;
