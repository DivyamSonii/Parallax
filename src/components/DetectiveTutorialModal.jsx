import React, { useState } from 'react';
import './DetectiveTutorialModal.css';

const TUTORIAL_STEPS = [
    {
        id: 'investigation',
        title: 'I. SCENE EXAMINATION',
        headline: 'Gathering Forensic Telemetry',
        icon: '🔍',
        prose: 'Examine the sanctuary dome, coroner autopsy notes, audio recorders, and locked diaries. Physical facts are permanent—suspect testimony must be weighed against tangible evidence.',
        tip: 'CRITICAL RULE: Always inspect the autopsy toxicology and acoustic equipment before concluding death was merely accidental.'
    },
    {
        id: 'interrogation',
        title: 'II. PRESENTING EVIDENCE',
        headline: 'Interrogating Under Psychological Stress',
        icon: '⚖',
        prose: 'Suspects have dynamic psychological states (Calm, Defensive, Aggressive, Breaking). Do not rely solely on general questions. Present specific evidence items directly to suspects to pierce contradictions and unlock suppressed truths.',
        tip: 'CRITICAL RULE: Suspects remember what exhibits you have presented. Showing an exhibit twice will not yield new information—diversify your inquiry.'
    },
    {
        id: 'theories',
        title: 'III. COMPETING THEORIES',
        headline: 'Hypothesis Testing Before Accusation',
        icon: '🧠',
        prose: 'Use the Alternative Theories Workbench to formulate competing narratives (Kye, Waltz, Carl, Arthur). Attach supporting and contradicting exhibits. Beware of unsupported assumptions that sound intuitive but lack corroborating physical proof.',
        tip: 'CRITICAL RULE: Accusing an innocent suspect or failing to establish the full mechanism of death lowers your final performance score.'
    },
    {
        id: 'hints_grading',
        title: 'IV. HINTS & PERFORMANCE',
        headline: 'Intelligent Guidance & Real Evaluation',
        icon: '📊',
        prose: 'If blocked, summon the Intelligent Hint System. Hints unlock progressively in three tiers (Subtle Direction → Reasoning Suggestion → Specific Clue) without ever spoiling the answer. At the conclusion, an objective forensic dossier will grade your critical thinking.',
        tip: 'CRITICAL RULE: Excessive hint reliance reduces your final efficiency rating. Strive for independent deduction.'
    }
];

export default function DetectiveTutorialModal({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];

    return (
        <div className="dtm-overlay" onClick={onClose}>
            <div className="dtm-modal" onClick={e => e.stopPropagation()}>
                <div className="dtm-header">
                    <div>
                        <h2 className="dtm-title">DETECTIVE FIELD MANUAL &amp; ONBOARDING</h2>
                        <div className="dtm-subtitle">SCOTLAND YARD INVESTIGATIVE METHODOLOGY</div>
                    </div>
                    <button className="dtm-nav-btn" onClick={onClose} style={{ padding: '0.2rem 0.6rem' }}>✕ CLOSE</button>
                </div>

                <div className="dtm-steps-nav">
                    {TUTORIAL_STEPS.map((s, idx) => (
                        <button
                            key={s.id}
                            className={`dtm-step-tab ${currentStep === idx ? 'active' : ''}`}
                            onClick={() => setCurrentStep(idx)}
                        >
                            {s.title}
                        </button>
                    ))}
                </div>

                <div className="dtm-body">
                    <div className="dtm-content-card">
                        <div className="dtm-icon-large">{step.icon}</div>
                        <div className="dtm-text-wrap">
                            <h3 className="dtm-headline">{step.headline}</h3>
                            <p className="dtm-prose">{step.prose}</p>
                        </div>
                    </div>

                    <div className="dtm-tip-box">
                        {step.tip}
                    </div>
                </div>

                <div className="dtm-footer">
                    <button
                        className="dtm-nav-btn"
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                    >
                        ← PREVIOUS
                    </button>
                    <div style={{ fontFamily: 'Courier New', fontSize: '0.7rem', color: '#7b6f52' }}>
                        SECTION {currentStep + 1} OF {TUTORIAL_STEPS.length}
                    </div>
                    {currentStep < TUTORIAL_STEPS.length - 1 ? (
                        <button
                            className="dtm-nav-btn primary"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                        >
                            NEXT →
                        </button>
                    ) : (
                        <button
                            className="dtm-nav-btn primary"
                            onClick={onClose}
                        >
                            BEGIN INVESTIGATION ✓
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
