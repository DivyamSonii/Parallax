import React, { useState, useEffect } from 'react';
import './InvestigationReportModal.css';
import { generatePerformanceReportFromAgent } from '../agentService';

export default function InvestigationReportModal({ isOpen, onClose, gameplayData = {} }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        const fetchReport = async () => {
            setLoading(true);
            const evidenceFound = gameplayData.evidenceFound || [];
            const suspectsQuestioned = gameplayData.suspectsQuestioned || [];
            const presentedEvidenceCount = gameplayData.presentedEvidenceCount || 0;
            const contradictionsUncovered = gameplayData.contradictionsUncovered || 1;
            const hintsUsed = gameplayData.hintsUsed || 0;
            const accusation = gameplayData.accusation || '';
            const theoriesConstructed = gameplayData.theoriesConstructed || 1;

            // Attempt agent/backend call
            const backendReport = await generatePerformanceReportFromAgent({
                evidenceFound,
                suspectsQuestioned,
                presentedEvidenceCount,
                contradictionsUncovered,
                hintsUsed,
                accusation,
                theoriesConstructed
            });

            if (!isMounted) return;

            if (backendReport && backendReport.overallScore !== undefined) {
                setReport(backendReport);
            } else {
                // Client-side fallback computation
                const obs = Math.min(100, Math.round((evidenceFound.length / 6.0) * 100));
                const verif = Math.min(100, Math.round((presentedEvidenceCount / Math.max(1, evidenceFound.length * 1.5)) * 100));
                const contra = Math.min(100, Math.round((contradictionsUncovered / 3.0) * 100));
                const isAccusedKye = ['kye', 'kye_harlan'].includes(accusation.toLowerCase());
                const logic = Math.min(100, (theoriesConstructed * 20) + (isAccusedKye ? 30 : 10));
                const penalty = hintsUsed * 5;
                const overall = Math.max(0, Math.min(100, Math.round((obs * 0.3) + (verif * 0.25) + (logic * 0.25) + (contra * 0.2) - penalty)));

                let rank = "C (Constable Detective)";
                if (overall >= 90) rank = "S (Master Inquisitor)";
                else if (overall >= 78) rank = "A (Senior Detective)";
                else if (overall >= 65) rank = "B (Forensic Investigator)";
                else if (overall < 50) rank = "D (Amateur Sleuth)";

                const decisions = [];
                if (evidenceFound.length >= 4) decisions.push("Thoroughly scoured the sanctuary and coroner records for physical evidence.");
                if (presentedEvidenceCount >= 2) decisions.push("Cross-examined suspects by placing concrete physical exhibits on the table.");
                if (contradictionsUncovered >= 2) decisions.push("Identified conflicting statements regarding the 19Hz frequency and Perique tea.");
                if (isAccusedKye) decisions.push("Correctly identified Kye Harlan as the criminal orchestrator.");
                if (decisions.length === 0) decisions.push("Commenced structured inquiry into Eliza's mysterious demise.");

                const missed = [];
                if (evidenceFound.length < 5) missed.push("Overlooked key forensic items (such as the SD card or locked diary).");
                if (presentedEvidenceCount < 2) missed.push("Relied heavily on verbal questioning without corroborating against physical exhibits.");
                if (hintsUsed > 3) missed.push(`Used ${hintsUsed} hints, suggesting difficulty synthesizing disparate clues independently.`);
                if (missed.length === 0) missed.push("No major forensic blindspots recorded in this case dossier.");

                const takeaways = [
                    "Avoid Confirmation Bias: Interrogate whether an alibi is supported by independent physical telemetry (such as tape timecodes or purchase orders).",
                    "Corroborate Multi-Factor Causation: In complex cases, individual anomalies (tea alkaloids, closed vents) may seem innocent until combined with an active acoustic weapon.",
                    "Differentiate Opportunity from Malice: Carl and Eliot made catastrophic mistakes, but only Kye acted with premeditated criminal exploitation."
                ];

                setReport({
                    overallScore: overall,
                    rank,
                    metrics: {
                        observation: obs,
                        verification: verif,
                        logicalReasoning: logic,
                        contradictionDetection: contra
                    },
                    hintsUsed,
                    keyDecisions: decisions,
                    missedClues: missed,
                    criticalThinkingTakeaways: takeaways
                });
            }
            setLoading(false);
        };

        fetchReport();

        return () => {
            isMounted = false;
        };
    }, [isOpen, gameplayData]);

    if (!isOpen) return null;

    const rankLetter = report ? report.rank.charAt(0) : '?';

    return (
        <div className="ipr-overlay" onClick={onClose}>
            <div className="ipr-modal" onClick={e => e.stopPropagation()}>
                <div className="ipr-header">
                    <div>
                        <h2 className="ipr-header-title">INVESTIGATION PERFORMANCE DOSSIER</h2>
                        <div className="ipr-header-subtitle">CRITICAL REASONING &amp; EVIDENCE EVALUATION METRICS</div>
                    </div>
                    <button className="ipr-dismiss-btn" onClick={onClose} style={{ padding: '0.3rem 0.8rem' }}>✕ CLOSE</button>
                </div>

                <div className="ipr-body">
                    {loading && !report ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#b78f2f' }}>
                            COMPILING FORENSIC EVALUATION DOSSIER...
                        </div>
                    ) : report ? (
                        <>
                            {/* Summary Banner */}
                            <div className="ipr-summary-banner">
                                <div className="ipr-rank-badge-wrap">
                                    <div className="ipr-seal">{rankLetter}</div>
                                    <div>
                                        <div className="ipr-rank-label">CLASSIFICATION GRADE</div>
                                        <div className="ipr-rank-title">{report.rank}</div>
                                    </div>
                                </div>
                                <div className="ipr-overall-score">
                                    <div className="ipr-score-val">{report.overallScore}<span style={{ fontSize: '1rem', color: '#8c7e62' }}>/100</span></div>
                                    <div className="ipr-score-lbl">OVERALL PROFICIENCY</div>
                                </div>
                            </div>

                            {/* 4 Core Competency Bars */}
                            <div className="ipr-metrics-grid">
                                <div className="ipr-metric-card">
                                    <div className="ipr-metric-header">
                                        <span>OBSERVATION &amp; DISCOVERY</span>
                                        <span style={{ color: '#dfd8a3', fontFamily: 'monospace' }}>{report.metrics.observation}%</span>
                                    </div>
                                    <div className="ipr-bar-track">
                                        <div className="ipr-bar-fill" style={{ width: `${report.metrics.observation}%` }} />
                                    </div>
                                </div>

                                <div className="ipr-metric-card">
                                    <div className="ipr-metric-header">
                                        <span>EVIDENCE VERIFICATION</span>
                                        <span style={{ color: '#dfd8a3', fontFamily: 'monospace' }}>{report.metrics.verification}%</span>
                                    </div>
                                    <div className="ipr-bar-track">
                                        <div className="ipr-bar-fill" style={{ width: `${report.metrics.verification}%` }} />
                                    </div>
                                </div>

                                <div className="ipr-metric-card">
                                    <div className="ipr-metric-header">
                                        <span>LOGICAL REASONING</span>
                                        <span style={{ color: '#dfd8a3', fontFamily: 'monospace' }}>{report.metrics.logicalReasoning}%</span>
                                    </div>
                                    <div className="ipr-bar-track">
                                        <div className="ipr-bar-fill" style={{ width: `${report.metrics.logicalReasoning}%` }} />
                                    </div>
                                </div>

                                <div className="ipr-metric-card">
                                    <div className="ipr-metric-header">
                                        <span>CONTRADICTION DETECTION</span>
                                        <span style={{ color: '#dfd8a3', fontFamily: 'monospace' }}>{report.metrics.contradictionDetection}%</span>
                                    </div>
                                    <div className="ipr-bar-track">
                                        <div className="ipr-bar-fill" style={{ width: `${report.metrics.contradictionDetection}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Decisions & Blindspots list */}
                            <div className="ipr-split-section">
                                <div className="ipr-list-box">
                                    <div className="ipr-box-title success">✓ STRONGEST INVESTIGATIVE DECISIONS</div>
                                    <ul className="ipr-bullets">
                                        {report.keyDecisions.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="ipr-list-box">
                                    <div className="ipr-box-title warning">▲ BLINDSPOTS &amp; MISSED SIGNALS</div>
                                    <ul className="ipr-bullets">
                                        {report.missedClues.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Real-world critical thinking takeaways */}
                            <div className="ipr-takeaways">
                                <div className="ipr-takeaways-title">🧠 CRITICAL THINKING &amp; REAL-WORLD COGNITIVE TAKEAWAYS</div>
                                {report.criticalThinkingTakeaways.map((takeaway, idx) => (
                                    <p key={idx} className="ipr-takeaways-prose">
                                        <strong>{takeaway.split(':')[0]}:</strong>{takeaway.split(':')[1] || ''}
                                    </p>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>

                <div className="ipr-footer">
                    <button className="ipr-dismiss-btn" onClick={onClose}>
                        FILE IN POLICE ARCHIVES
                    </button>
                </div>
            </div>
        </div>
    );
}
