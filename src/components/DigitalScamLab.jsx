import React, { useState } from 'react';
import './DigitalScamLab.css';
import { evaluateScamWithAgent } from '../agentService';

const SUSPICIOUS_FLAGS = [
    {
        id: 'spoofed_domain',
        label: 'Spoofed Sender Address',
        hint: 'Domain is "company-portal-auth88.cc" rather than official "sanctuary-reserve.org".'
    },
    {
        id: 'artificial_urgency',
        label: 'High-Pressure Urgency',
        hint: 'Demands compliance within 45 minutes to short-circuit logical reflection.'
    },
    {
        id: 'emotional_fear',
        label: 'Manufactured Legal Coercion',
        hint: 'Threatens criminal referral and asset forfeiture without prior formal service.'
    },
    {
        id: 'procedure_bypass',
        label: 'Forbidding Internal Verification',
        hint: 'Instructs recipient to keep transaction secret and bypass normal supervisors.'
    },
    {
        id: 'offshore_crypto',
        label: 'Untraceable Payment Method',
        hint: 'Demands payment to a digital crypto escrow wallet instead of audited banking rails.'
    },
    {
        id: 'url_mismatch',
        label: 'Deceptive Anchor Link (Phishing)',
        hint: 'Display text says "portal.sanctuary-reserve.org" but anchor points to external harvesting domain.'
    }
];

export default function DigitalScamLab({ onBack }) {
    // Current Active Step: 1 | 2 | 3
    const [activeStep, setActiveStep] = useState(1);
    const [selectedFlags, setSelectedFlags] = useState([]);
    const [verificationLog, setVerificationLog] = useState(null);
    const [verdict, setVerdict] = useState('');
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [evaluating, setEvaluating] = useState(false);

    const toggleFlag = (id) => {
        setSelectedFlags(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleSimulateVerification = () => {
        setVerificationLog({
            status: 'success',
            msg: 'VERIFICATION CHANNEL: Dialed Dr. Sterling via pre-registered internal directory (Ext. 402). Dr. Sterling confirms: "I never authorized any wire transfer or emergency compliance notice. I am currently in a botanical board meeting. Do not click any links or transfer funds!"'
        });
    };

    const handleSubmitEvaluation = async () => {
        if (!verdict) {
            alert("Please select a formal verdict ('Malicious Scam' or 'Legitimate Directive') before submitting forensic evaluation.");
            return;
        }

        setEvaluating(true);

        const backendResult = await evaluateScamWithAgent({
            selectedFlags,
            verdict
        });

        if (backendResult && backendResult.accuracyScore !== undefined) {
            setEvaluationResult(backendResult);
        } else {
            // Local fallback evaluation
            const caught = SUSPICIOUS_FLAGS.filter(f => selectedFlags.includes(f.id)).map(f => ({
                label: f.label,
                desc: f.hint
            }));
            const missed = SUSPICIOUS_FLAGS.filter(f => !selectedFlags.includes(f.id)).map(f => ({
                label: f.label,
                desc: f.hint
            }));
            const isCorrect = verdict.toLowerCase() === 'scam';
            const score = isCorrect ? Math.round((caught.length / SUSPICIOUS_FLAGS.length) * 100) : 0;

            setEvaluationResult({
                accuracyScore: score,
                correctVerdict: isCorrect,
                flagsCaught: caught,
                flagsMissed: missed,
                educationalTakeaways: [
                    "Out-of-Band Verification: Always confirm unusual financial or credential requests via a known phone number or in-person channel, never using links or numbers inside the email.",
                    "Check the Entire Domain String: Attackers use typosquatting and subdomains (e.g. 'company-portal-auth88.cc' vs 'sanctuary-reserve.org'). Read from right to left before the first slash.",
                    "Recognize Artificial Urgency: Attackers manufacture synthetic panic ('Within 45 minutes!') to short-circuit analytical thinking and prevent verification.",
                    "Never Bypass Verification Protocols: No legitimate executive or regulatory agency will instruct you to bypass company dual-authorization procedures in secret."
                ]
            });
        }
        setEvaluating(false);
    };

    return (
        <div className="dsl-container">
            {/* Top Header */}
            <header className="dsl-top-bar">
                <div className="dsl-title-wrap">
                    <h1>CASE #902: DIGITAL SCAM INVESTIGATION</h1>
                    <div className="dsl-badge-sub">CYBER FORENSICS TRAINING &amp; SOCIAL ENGINEERING RECOGNITION</div>
                </div>
                <button className="dsl-back-btn" onClick={onBack}>
                    ← RETURN TO CASES
                </button>
            </header>

            {/* 3-Step Navigation Stepper Tabs */}
            <nav className="dsl-stepper-bar">
                <button
                    className={`dsl-step-tab ${activeStep === 1 ? 'active' : ''}`}
                    onClick={() => setActiveStep(1)}
                >
                    <div className="dsl-step-num">1</div>
                    <div className="dsl-step-info">
                        <span className="dsl-step-tag">STEP 1: MESSAGE INSPECTION</span>
                        <span className="dsl-step-desc">
                            {selectedFlags.length > 0 ? `${selectedFlags.length}/6 Anomaly Markers Flagged` : 'Audit Headers & Transmission Text'}
                        </span>
                    </div>
                </button>

                <button
                    className={`dsl-step-tab ${activeStep === 2 ? 'active' : ''}`}
                    onClick={() => setActiveStep(2)}
                >
                    <div className="dsl-step-num">2</div>
                    <div className="dsl-step-info">
                        <span className="dsl-step-tag">STEP 2: CHANNEL VERIFICATION</span>
                        <span className="dsl-step-desc">
                            {verificationLog ? 'Out-of-Band Call Completed ✓' : 'Test Alternate Verification Channel'}
                        </span>
                    </div>
                </button>

                <button
                    className={`dsl-step-tab ${activeStep === 3 ? 'active' : ''}`}
                    onClick={() => setActiveStep(3)}
                >
                    <div className="dsl-step-num">3</div>
                    <div className="dsl-step-info">
                        <span className="dsl-step-tag" style={{ color: '#dfd8a3' }}>STEP 3: FINAL FORENSIC VERDICT</span>
                        <span className="dsl-step-desc">
                            {verdict ? `Selected: ${verdict === 'scam' ? 'MALICIOUS SCAM' : 'LEGITIMATE'}` : 'Issue Indictment & Submit Case'}
                        </span>
                    </div>
                </button>
            </nav>

            {/* ─────────────────────────────────────────────────────────────
               STAGE 1: MESSAGE INSPECTION & ANOMALY FLAGGING
            ───────────────────────────────────────────────────────────── */}
            {activeStep === 1 && (
                <div className="dsl-stage-wrapper">
                    <div className="dsl-step1-grid">
                        {/* Email Window */}
                        <div className="dsl-mail-window">
                            <div className="dsl-mail-header">
                                <div className="dsl-field-row">
                                    <span className="dsl-field-lbl">FROM:</span>
                                    <span
                                        className={`dsl-interactive-flag ${selectedFlags.includes('spoofed_domain') ? 'flagged' : ''}`}
                                        onClick={() => toggleFlag('spoofed_domain')}
                                        title="Click to flag suspicious domain"
                                    >
                                        Dr. Julian Sterling &lt;ceo@company-portal-auth88.cc&gt;
                                    </span>
                                </div>
                                <div className="dsl-field-row">
                                    <span className="dsl-field-lbl">TO:</span>
                                    <span className="dsl-field-val">investigator@sanctuary-reserve.org</span>
                                </div>
                                <div className="dsl-field-row">
                                    <span className="dsl-field-lbl">DATE:</span>
                                    <span className="dsl-field-val">Today, 14:15:22 GMT</span>
                                </div>
                                <div className="dsl-field-row">
                                    <span className="dsl-field-lbl">SUBJECT:</span>
                                    <span className="dsl-field-val" style={{ color: '#ff9999', fontWeight: 'bold' }}>
                                        URGENT: IMMEDIATE WIRE COMPLIANCE NOTICE - AUDIT DISCREPANCY #8849
                                    </span>
                                </div>
                            </div>

                            <div className="dsl-mail-body">
                                <p>
                                    Dear Senior Reserve Officer,
                                </p>
                                <p>
                                    Our annual sanctuary compliance audit has detected an immediate administrative irregularity regarding our federal conservation permit.
                                </p>
                                <p>
                                    <span
                                        className={`dsl-interactive-flag ${selectedFlags.includes('emotional_fear') || selectedFlags.includes('artificial_urgency') ? 'flagged' : ''}`}
                                        onClick={() => {
                                            toggleFlag('emotional_fear');
                                            toggleFlag('artificial_urgency');
                                        }}
                                        title="Click to flag manufactured urgency / threat"
                                    >
                                        Failure to submit mandatory compliance verification within 45 minutes will trigger immediate criminal referral, revocation of reserve status, and personal liability under Federal Act 19.
                                    </span>
                                </p>
                                <p>
                                    <span
                                        className={`dsl-interactive-flag ${selectedFlags.includes('procedure_bypass') ? 'flagged' : ''}`}
                                        onClick={() => toggleFlag('procedure_bypass')}
                                        title="Click to flag protocol bypass"
                                    >
                                        In order to protect institutional integrity, you are strictly instructed NOT to contact IT, accounting, or direct supervisors, as internal collusion is under active inquiry.
                                    </span>
                                </p>
                                <p>
                                    <span
                                        className={`dsl-interactive-flag ${selectedFlags.includes('offshore_crypto') ? 'flagged' : ''}`}
                                        onClick={() => toggleFlag('offshore_crypto')}
                                        title="Click to flag suspicious payment method"
                                    >
                                        Remit the statutory expedited bond ($14,250.00) immediately via our certified escrow wallet: 0x7a89fB23C91004C298e21aBc4D.
                                    </span>
                                </p>
                                <p>
                                    Review the formal legal subpoena here:{' '}
                                    <span
                                        className={`dsl-tooltip-link ${selectedFlags.includes('url_mismatch') ? 'dsl-interactive-flag flagged' : ''}`}
                                        data-real-url="Target: http://portal-sanctuary-reserve.cc-security-verify.org/auth"
                                        onClick={() => toggleFlag('url_mismatch')}
                                        title="Hover to view real URL destination; click to flag"
                                    >
                                        portal.sanctuary-reserve.org/legal-notice
                                    </span>
                                </p>
                                <p style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(183, 143, 47, 0.2)', paddingTop: '0.6rem', color: '#998e78', fontSize: '0.82rem' }}>
                                    Executive Office of Dr. Julian Sterling<br />
                                    Confidential &amp; Legally Privileged Transmission
                                </p>
                            </div>
                        </div>

                        {/* Interactive Anomaly Checklist */}
                        <div className="dsl-sidebar-panel">
                            <h2 className="dsl-panel-title">🚩 SUSPICIOUS INDICATORS IDENTIFIED ({selectedFlags.length}/6)</h2>
                            <ul className="dsl-checklist">
                                {SUSPICIOUS_FLAGS.map((item) => {
                                    const isChecked = selectedFlags.includes(item.id);
                                    return (
                                        <li
                                            key={item.id}
                                            className={`dsl-check-item ${isChecked ? 'active' : ''}`}
                                            onClick={() => toggleFlag(item.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                            />
                                            <div className="dsl-check-text">
                                                <strong style={{ color: isChecked ? '#ff9999' : '#cfc6b0' }}>{item.label}</strong>
                                                <div style={{ color: '#8c7e62', fontSize: '0.65rem' }}>{item.hint}</div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Navigation Row */}
                    <div className="dsl-nav-action-row">
                        <span style={{ fontSize: '0.72rem', color: '#b78f2f', fontFamily: 'Courier New' }}>
                            TIP: Click flagged text in the email or tick boxes above to record forensic indicators.
                        </span>
                        <button
                            className="dsl-next-btn"
                            onClick={() => setActiveStep(2)}
                        >
                            PROCEED TO STEP 2: CHANNEL VERIFICATION →
                        </button>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
               STAGE 2: SECONDARY VERIFICATION ACTION
            ───────────────────────────────────────────────────────────── */}
            {activeStep === 2 && (
                <div className="dsl-stage-wrapper">
                    <div className="dsl-step2-card">
                        <h2 className="dsl-step2-headline">📞 STEP 2: SECONDARY CHANNEL VERIFICATION</h2>
                        <p className="dsl-step2-prose">
                            In real-world cybersecurity, social engineers frequently impersonate executives and regulatory bodies while commanding strict secrecy to prevent verification.
                            <strong> Never rely on contact information provided inside a suspicious email.</strong> Always conduct an out-of-band verification using pre-registered internal corporate records.
                        </p>

                        <div className="dsl-dial-action-box">
                            <div style={{ color: '#dfd8a3', fontSize: '0.82rem', letterSpacing: '0.12em' }}>
                                INTERNAL REPERTORY DIALER: DR. JULIAN STERLING
                            </div>
                            <button
                                className="dsl-big-dial-btn"
                                onClick={handleSimulateVerification}
                            >
                                📞 DIAL EXT. 402 (REGISTERED BOARDROOM DESK)
                            </button>

                            {verificationLog ? (
                                <div className="dsl-verify-result-box">
                                    <strong>OUT-OF-BAND TRANSCRIPT RECORDED:</strong><br />
                                    {verificationLog.msg}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.72rem', color: '#8c7e62', fontFamily: 'Courier New' }}>
                                    [ Awaiting operator connection... Click button above to initiate verification call ]
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Row */}
                    <div className="dsl-nav-action-row">
                        <button
                            className="dsl-prev-btn"
                            onClick={() => setActiveStep(1)}
                        >
                            ← BACK TO STEP 1: MESSAGE INSPECTION
                        </button>
                        <button
                            className="dsl-next-btn"
                            onClick={() => setActiveStep(3)}
                        >
                            PROCEED TO STEP 3: FINAL FORENSIC VERDICT →
                        </button>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
               STAGE 3: FINAL FORENSIC VERDICT & INDICTMENT
            ───────────────────────────────────────────────────────────── */}
            {activeStep === 3 && (
                <div className="dsl-stage-wrapper">
                    <div className="dsl-step3-card">
                        <div className="dsl-step3-title-row">
                            <h2 className="dsl-step3-title">⚖ STEP 3: FINAL FORENSIC VERDICT &amp; INDICTMENT</h2>
                            <div style={{ fontFamily: 'Courier New', fontSize: '0.72rem', color: verdict ? '#2ecc71' : '#f39c12' }}>
                                {verdict ? `VERDICT SELECTED: ${verdict === 'scam' ? 'MALICIOUS SCAM' : 'LEGITIMATE'}` : '⚠ AWAITING VERDICT SELECTION'}
                            </div>
                        </div>

                        {/* Telemetry Summary Cards */}
                        <div className="dsl-summary-cards-row">
                            <div className="dsl-telemetry-badge-card">
                                <span className="dsl-telemetry-lbl">STEP 1: ANOMALY SIGNALS IDENTIFIED</span>
                                <span className="dsl-telemetry-val" style={{ color: selectedFlags.length >= 3 ? '#ff8585' : '#dfd8a3' }}>
                                    {selectedFlags.length} of 6 Indicators Flagged
                                </span>
                            </div>
                            <div className="dsl-telemetry-badge-card">
                                <span className="dsl-telemetry-lbl">STEP 2: SECONDARY VERIFICATION STATUS</span>
                                <span className="dsl-telemetry-val" style={{ color: verificationLog ? '#2ecc71' : '#e67e22' }}>
                                    {verificationLog ? 'Channel Verified (Impersonation Confirmed)' : 'Unverified (Call Not Placed)'}
                                </span>
                            </div>
                        </div>

                        {/* Large Verdict Selection Cards */}
                        <div className="dsl-verdict-cards-grid">
                            {/* Option A: SCAM */}
                            <div
                                className={`dsl-big-verdict-option ${verdict === 'scam' ? 'selected scam' : ''}`}
                                onClick={() => setVerdict('scam')}
                            >
                                <div className="dsl-option-header scam">
                                    <span>⚠ MALICIOUS SOCIAL ENGINEERING ATTACK</span>
                                    {verdict === 'scam' && <span style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>✓ CHOSEN</span>}
                                </div>
                                <div className="dsl-option-desc">
                                    Classify as targeted Business Email Compromise (BEC) and phishing. Spoofed executive address, artificial panic, protocol suppression, and fraudulent offshore escrow routing.
                                </div>
                            </div>

                            {/* Option B: LEGITIMATE */}
                            <div
                                className={`dsl-big-verdict-option ${verdict === 'legitimate' ? 'selected legit' : ''}`}
                                onClick={() => setVerdict('legitimate')}
                            >
                                <div className="dsl-option-header legit">
                                    <span>✓ AUTHENTIC EXECUTIVE DIRECTIVE</span>
                                    {verdict === 'legitimate' && <span style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>✓ CHOSEN</span>}
                                </div>
                                <div className="dsl-option-desc">
                                    Classify as valid corporate compliance instruction requiring immediate compliance. Authorizes financial disbursement and bypasses local internal controls.
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="dsl-master-submit-btn"
                            onClick={handleSubmitEvaluation}
                            disabled={evaluating || !verdict}
                        >
                            {evaluating ? 'ANALYZING FORENSIC TELEMETRY...' : 'SUBMIT FINAL FORENSIC VERDICT & CLOSE CASE'}
                        </button>
                    </div>

                    {/* Navigation Row */}
                    <div className="dsl-nav-action-row">
                        <button
                            className="dsl-prev-btn"
                            onClick={() => setActiveStep(2)}
                        >
                            ← BACK TO STEP 2: CHANNEL VERIFICATION
                        </button>
                        <button
                            className="dsl-prev-btn"
                            onClick={() => setActiveStep(1)}
                        >
                            ← REVIEW STEP 1: MESSAGE
                        </button>
                    </div>
                </div>
            )}

            {/* Forensic Debrief Modal */}
            {evaluationResult && (
                <div className="dsl-modal-overlay">
                    <div className="dsl-debrief-modal">
                        <div className="dsl-debrief-header">
                            <div>
                                <h2 className="dsl-debrief-title">CYBER INCIDENT FORENSIC DEBRIEF</h2>
                                <div style={{ fontFamily: 'Courier New', fontSize: '0.68rem', color: '#b78f2f' }}>
                                    CASE #902 EVALUATION SUMMARY
                                </div>
                            </div>
                            <div className={`dsl-score-badge ${evaluationResult.correctVerdict ? '' : 'fail'}`}>
                                {evaluationResult.accuracyScore}% ACCURACY
                            </div>
                        </div>

                        <div>
                            <p style={{ fontFamily: 'Georgia', fontSize: '0.9rem', color: '#dfd8a3', margin: 0 }}>
                                <strong>VERDICT ASSESSMENT: </strong>
                                {evaluationResult.correctVerdict ? (
                                    <span style={{ color: '#2ecc71' }}>CORRECT. You recognized this message as a targeted Business Email Compromise (BEC) and phishing attack.</span>
                                ) : (
                                    <span style={{ color: '#e74c3c' }}>INCORRECT. You classified this malicious social engineering attempt as a legitimate message! In real life, this would have resulted in data theft or financial loss.</span>
                                )}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'rgba(46, 204, 113, 0.08)', padding: '1rem', border: '1px solid rgba(46, 204, 113, 0.25)', borderRadius: '3px' }}>
                                <div style={{ color: '#2ecc71', fontSize: '0.72rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                                    ✓ RED FLAGS YOU CAUGHT ({evaluationResult.flagsCaught.length})
                                </div>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.75rem', fontFamily: 'Courier New', color: '#cfc6b0', lineHeight: 1.5 }}>
                                    {evaluationResult.flagsCaught.map((f, i) => (
                                        <li key={i}><strong>{f.label}:</strong> {f.desc}</li>
                                    ))}
                                    {evaluationResult.flagsCaught.length === 0 && (
                                        <li>None flagged.</li>
                                    )}
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(231, 76, 60, 0.08)', padding: '1rem', border: '1px solid rgba(231, 76, 60, 0.25)', borderRadius: '3px' }}>
                                <div style={{ color: '#e74c3c', fontSize: '0.72rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                                    ▲ RED FLAGS YOU MISSED ({evaluationResult.flagsMissed.length})
                                </div>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.75rem', fontFamily: 'Courier New', color: '#cfc6b0', lineHeight: 1.5 }}>
                                    {evaluationResult.flagsMissed.map((f, i) => (
                                        <li key={i}><strong>{f.label}:</strong> {f.desc}</li>
                                    ))}
                                    {evaluationResult.flagsMissed.length === 0 && (
                                        <li>Excellent! No critical indicators were overlooked.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Real World Defense Guidelines */}
                        <div className="dsl-guidelines-box">
                            <div className="dsl-guidelines-title">🛡 HOW TO RECOGNIZE &amp; DEFEND AGAINST SIMILAR SCAMS IN REAL LIFE</div>
                            {evaluationResult.educationalTakeaways.map((tip, idx) => (
                                <div key={idx} className="dsl-guide-item">
                                    • {tip}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                className="dsl-back-btn"
                                onClick={() => {
                                    setEvaluationResult(null);
                                    setActiveStep(1);
                                }}
                            >
                                ↺ RETRY CASE LAB
                            </button>
                            <button
                                className="dsl-next-btn"
                                style={{ margin: 0, padding: '0.5rem 1.4rem' }}
                                onClick={onBack}
                            >
                                RETURN TO MAIN MENU
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
