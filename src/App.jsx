import React, { useState } from 'react';
import DaisyApp from './DaisyApp';
import CuratorApp from './lets_try_final/CuratorApp';
import DigitalScamLab from './components/DigitalScamLab';
import './index.css';

function MainLauncher() {
    const [selectedGame, setSelectedGame] = useState(null);
    const [hoveredPanel, setHoveredPanel] = useState(null);

    if (selectedGame === 'daisy') return <DaisyApp onBack={() => setSelectedGame(null)} />;
    if (selectedGame === 'curator') return <CuratorApp onBack={() => setSelectedGame(null)} />;
    if (selectedGame === 'scam') return <DigitalScamLab onBack={() => setSelectedGame(null)} />;

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#050302',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Cinzel, serif'
        }}>
            {/* Base Background Image */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: "url('/images/back2.jpeg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 1,
            }} />

            {/* Subtle Vignette & Lighting Filter */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
                zIndex: 2,
                pointerEvents: 'none'
            }} />

            {/* Top Header Banner */}
            <header style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                zIndex: 40,
                padding: '1.2rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(7,5,4,0.92) 50%, transparent)',
                borderBottom: '1px solid rgba(183, 143, 47, 0.25)'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.4rem',
                        letterSpacing: '0.35em',
                        color: '#dfd8a3',
                        textShadow: '0 0 15px rgba(183, 143, 47, 0.4)'
                    }}>
                        PARALLAX
                    </h1>
                    <div style={{
                        fontFamily: 'Courier New, monospace',
                        fontSize: '0.62rem',
                        color: '#b78f2f',
                        letterSpacing: '0.18em',
                        marginTop: '0.2rem'
                    }}>
                        INTELLIGENT FORENSIC INQUIRY &amp; VERIFICATION SUITE
                    </div>
                </div>

                {/* Direct Scenario Selector Button for Cyber Lab */}
                <button
                    onClick={() => setSelectedGame('scam')}
                    style={{
                        background: 'linear-gradient(to bottom, #725624, #3d2d11)',
                        border: '1px solid #b78f2f',
                        color: '#dfd8a3',
                        padding: '0.55rem 1.4rem',
                        fontFamily: 'Cinzel, serif',
                        fontSize: '0.68rem',
                        letterSpacing: '0.16em',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        boxShadow: '0 0 15px rgba(183, 143, 47, 0.3)',
                        transition: 'all 0.25s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(183, 143, 47, 0.6)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(183, 143, 47, 0.3)';
                        e.currentTarget.style.color = '#dfd8a3';
                    }}
                >
                    🛡 LAUNCH DIGITAL SCAM LAB
                </button>
            </header>

            {/* Left/Right Clickable Mystery Case Areas */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 20 }}>
                {/* Left Half - Midnight Curator */}
                <div
                    onClick={() => setSelectedGame('curator')}
                    onMouseEnter={() => setHoveredPanel('curator')}
                    onMouseLeave={() => setHoveredPanel(null)}
                    style={{
                        flex: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '3rem 4rem 6rem 4rem',
                        boxSizing: 'border-box',
                        background: hoveredPanel === 'curator' ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
                        transition: 'background 0.3s ease'
                    }}
                    title="Play The Midnight Curator"
                >
                    <div style={{
                        maxWidth: '440px',
                        background: 'rgba(8, 6, 5, 0.85)',
                        border: '1px solid rgba(183, 143, 47, 0.4)',
                        padding: '1.4rem',
                        borderRadius: '3px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
                    }}>
                        <div style={{ fontFamily: 'Courier New', fontSize: '0.65rem', color: '#b78f2f', letterSpacing: '0.2em' }}>
                            CASE FILE 01 · GOTHIC NOIR
                        </div>
                        <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.2em', color: '#dfd8a3', margin: '0.4rem 0' }}>
                            THE MIDNIGHT CURATOR
                        </h2>
                        <p style={{ fontFamily: 'Georgia', fontSize: '0.78rem', color: '#c5bba8', lineHeight: 1.5, margin: 0 }}>
                            An enigmatic curator murdered amidst priceless relics. Interrogate suspects, decrypt CCTV surveillance, and dismantle deceptive alibis.
                        </p>
                        <div style={{ marginTop: '0.8rem', color: '#dfd8a3', fontSize: '0.68rem', letterSpacing: '0.15em' }}>
                            ENTER ARCHIVES →
                        </div>
                    </div>
                </div>

                {/* Right Half - Daisy & Fibonacci */}
                <div
                    onClick={() => setSelectedGame('daisy')}
                    onMouseEnter={() => setHoveredPanel('daisy')}
                    onMouseLeave={() => setHoveredPanel(null)}
                    style={{
                        flex: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        padding: '3rem 4rem 6rem 4rem',
                        boxSizing: 'border-box',
                        background: hoveredPanel === 'daisy' ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
                        transition: 'background 0.3s ease'
                    }}
                    title="Play Daisy & Fibonacci"
                >
                    <div style={{
                        maxWidth: '440px',
                        background: 'rgba(8, 6, 5, 0.85)',
                        border: '1px solid rgba(183, 143, 47, 0.4)',
                        padding: '1.4rem',
                        borderRadius: '3px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
                        textAlign: 'right'
                    }}>
                        <div style={{ fontFamily: 'Courier New', fontSize: '0.65rem', color: '#b78f2f', letterSpacing: '0.2em' }}>
                            CASE FILE 02 · FORENSIC MYSTERY
                        </div>
                        <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.2em', color: '#dfd8a3', margin: '0.4rem 0' }}>
                            THE DAISY &amp; FIBONACCI
                        </h2>
                        <p style={{ fontFamily: 'Georgia', fontSize: '0.78rem', color: '#c5bba8', lineHeight: 1.5, margin: 0 }}>
                            Botanist Eliza D'Souza found dead inside a locked glass sanctuary. Inspect physical evidence, present exhibits to break alibis, and uncover acoustic sabotage.
                        </p>
                        <div style={{ marginTop: '0.8rem', color: '#dfd8a3', fontSize: '0.68rem', letterSpacing: '0.15em' }}>
                            BEGIN SANCTUARY INQUIRY →
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Cyber Scenario Floating Pill */}
            <div style={{
                position: 'absolute',
                bottom: '1.2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 35,
                background: 'rgba(12, 9, 7, 0.92)',
                border: '1px solid rgba(183, 143, 47, 0.5)',
                boxShadow: '0 0 25px rgba(0,0,0,0.9), 0 0 15px rgba(183, 143, 47, 0.2)',
                borderRadius: '30px',
                padding: '0.5rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer'
            }}
            onClick={() => setSelectedGame('scam')}
            >
                <span style={{ fontSize: '1.1rem' }}>🛡</span>
                <span style={{ fontFamily: 'Cinzel', fontSize: '0.72rem', letterSpacing: '0.16em', color: '#dfd8a3' }}>
                    REAL-WORLD SCENARIO: <strong>CASE #902 — DIGITAL SCAM INVESTIGATION</strong>
                </span>
                <span style={{ fontFamily: 'Courier New', fontSize: '0.65rem', color: '#b78f2f', letterSpacing: '0.1em' }}>
                    [CLICK TO ANALYZE]
                </span>
            </div>
        </div>
    );
}

export default MainLauncher;
