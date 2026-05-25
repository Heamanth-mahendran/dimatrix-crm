<<<<<<< HEAD
// AiInsights.tsx - UPDATED with real AI backend integration + live dashboard refresh
import React, { useState, useEffect } from "react";
import { Lead } from "../types/lead";
import { aiApi } from "../services/api";

interface AiInsightsProps {
  leads: Lead[];
  onLeadsRefresh: () => Promise<void>; // ← NEW: triggers Dashboard to update instantly
}

const AiInsights: React.FC<AiInsightsProps> = ({ leads, onLeadsRefresh }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [followupMessage, setFollowupMessage] = useState("");
  const [followupChannel, setFollowupChannel] = useState<"whatsapp" | "email" | "closing">("whatsapp");
  const [generatingFollowup, setGeneratingFollowup] = useState(false);
  const [leadNotes, setLeadNotes] = useState("");
  const [batchScoring, setBatchScoring] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const highProbabilityLeads = leads.filter((l) => l.aiScore >= 70);
  const predictedRevenue = highProbabilityLeads.reduce((sum, l) => sum + l.dealValue, 0);

  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    try {
      const data = await aiApi.insights();
      setInsights(data);
      setBackendOnline(true);
    } catch { setBackendOnline(false); }
  };

  const handleAnalyze = async () => {
    if (!selectedLead) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await aiApi.analyze(selectedLead.id, leadNotes);
      setAnalysisResult(result.analysis);
      await onLeadsRefresh(); // ← Dashboard updates with new AI score immediately
    } catch (err: any) {
      alert("AI analysis failed: " + err.message + "\n\nMake sure the backend is running:\ncd backend && uvicorn main:app --reload");
    } finally { setAnalyzing(false); }
  };

  const handleGenerateFollowup = async () => {
    if (!selectedLead) return;
    setGeneratingFollowup(true);
    try {
      const result = await aiApi.generateFollowup(selectedLead.id, followupChannel, leadNotes);
      setFollowupMessage(result.message);
    } catch (err: any) {
      alert("Follow-up generation failed: " + err.message);
    } finally { setGeneratingFollowup(false); }
  };

  const handleBatchScore = async () => {
    setBatchScoring(true);
    try {
      const result = await aiApi.batchScore();
      setBatchResults(result.results);
      await loadInsights();
      await onLeadsRefresh(); // ← Dashboard updates with all new scores immediately
      alert(`✅ Scored ${result.results.length} leads! Dashboard updated.`);
    } catch (err: any) {
      alert("Batch scoring failed: " + err.message);
    } finally { setBatchScoring(false); }
  };

  const tagColor: Record<string, string> = { hot: "#e63946", warm: "#f39c12", cold: "#3498db" };
  const getScoreGradient = (score: number) => score >= 85 ? "linear-gradient(135deg, #2ecc71, #27ae60)" : score >= 70 ? "linear-gradient(135deg, #3498db, #2980b9)" : "linear-gradient(135deg, #f39c12, #e67e22)";

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h2 style={styles.pageTitle}>AI Insights</h2>
          <div style={styles.titleAccent} />
          <p style={styles.titleSubtext}>Powered by Ollama · Open Source AI</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ padding: "6px 14px", borderRadius: "30px", fontSize: "12px", fontWeight: 600, background: backendOnline === true ? "#e8f8f0" : backendOnline === false ? "#fff0f0" : "#f5f5f5", color: backendOnline === true ? "#27ae60" : backendOnline === false ? "#e63946" : "#888" }}>
            {backendOnline === true ? "🟢 AI Online" : backendOnline === false ? "🔴 Backend Offline" : "⚪ Connecting..."}
          </span>
          <button style={{ ...styles.batchBtn, opacity: batchScoring ? 0.7 : 1 }} onClick={handleBatchScore} disabled={batchScoring}>
            {batchScoring ? "⚙️ Scoring..." : "🚀 AI Score All Leads"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.cardsGrid}>
        {/* Hot leads card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}><span style={{ fontSize: "20px" }}>🎯</span></div>
            <h4 style={styles.cardTitle}>High Probability</h4>
            <span style={styles.cardBadge}>{insights?.hot_leads ?? highProbabilityLeads.length}</span>
          </div>
          <div style={styles.cardContent}>
            {highProbabilityLeads.slice(0, 3).map((lead) => (
              <div key={lead.id} style={{ ...styles.cardItem, cursor: "pointer" }} onClick={() => { setSelectedLead(lead); setAnalysisResult(null); setFollowupMessage(""); }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: "14px", background: getScoreGradient(lead.aiScore) }}>{lead.name.charAt(0)}</div>
                  <div><div style={{ fontWeight: 600, fontSize: "14px" }}>{lead.name}</div><div style={{ fontSize: "12px", color: "#888" }}>{lead.company}</div></div>
                </div>
                <span style={{ background: "#f0f2f5", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>{lead.aiScore}%</span>
              </div>
            ))}
            {highProbabilityLeads.length === 0 && <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>Score leads to see results</p>}
          </div>
        </div>

        {/* Revenue card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}><span style={{ fontSize: "20px" }}>💰</span></div>
            <h4 style={styles.cardTitle}>Predicted Revenue</h4>
            <span style={styles.cardBadge}>Hot Leads</span>
          </div>
          <div style={styles.cardContent}>
            <div style={{ fontSize: "40px", fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: "6px" }}>
              <span style={{ fontSize: "22px", color: "#666" }}>₹</span>{(predictedRevenue / 100000).toFixed(1)}<span style={{ fontSize: "16px", color: "#888" }}> lakh</span>
            </div>
            <div style={{ fontSize: "13px", color: "#2ecc71" }}>↑ From {insights?.hot_leads ?? highProbabilityLeads.length} hot leads</div>
            <div style={{ display: "flex", gap: "16px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f0f0f0" }}>
              <div><div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Warm leads</div><div style={{ fontWeight: 600 }}>{insights?.warm_leads ?? 0}</div></div>
              <div><div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Follow-ups</div><div style={{ fontWeight: 600 }}>{insights?.follow_up_needed ?? 0}</div></div>
=======
// AiInsights.tsx - AI Insights page
// Shows high probability leads, predicted revenue, and recommended follow-ups

import React from "react";
import { Lead } from "../types/lead";

interface AiInsightsProps {
  leads: Lead[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ leads }) => {

  // High probability leads = AI score above 70
  const highProbabilityLeads = leads.filter((l) => l.aiScore >= 70);

  // Predicted revenue = sum of deal values for high probability leads
  const predictedRevenue = highProbabilityLeads.reduce((sum, l) => sum + l.dealValue, 0);

  // Deals detected = leads in Qualified or Proposal Sent stage
  const dealsDetected = leads.filter(
    (l) => l.stage === "Qualified" || l.stage === "Proposal Sent"
  );

  // Recommended follow-ups = leads that haven't been followed up recently
  const recommendedFollowUps = leads.filter((l) => l.stage === "Follow up" || l.stage === "Contacted");

  // Function to get gradient based on lead score
  const getScoreGradient = (score: number) => {
    if (score >= 85) return "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
    if (score >= 70) return "linear-gradient(135deg, #3498db 0%, #2980b9 100%)";
    return "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)";
  };

  return (
    <div style={styles.container}>
      {/* Page Title with premium styling */}
      <div style={styles.titleSection}>
        <h2 style={styles.pageTitle}>AI Insights</h2>
        <div style={styles.titleAccent} />
        <p style={styles.titleSubtext}>Intelligent predictions & recommendations</p>
      </div>

      {/* Top row of 3 premium cards */}
      <div style={styles.cardsGrid}>

        {/* Card 1: High Probability Leads - Premium Version */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}>
              <span style={styles.cardIcon}>🎯</span>
            </div>
            <h4 style={styles.cardTitle}>High Probability Leads</h4>
            <span style={styles.cardBadge}>{highProbabilityLeads.length}</span>
          </div>
          <div style={styles.cardContent}>
            {highProbabilityLeads.slice(0, 3).map((lead, index) => (
              <div key={lead.id} style={styles.cardItem}>
                <div style={styles.cardItemLeft}>
                  <div style={{
                    ...styles.leadAvatar,
                    background: getScoreGradient(lead.aiScore)
                  }}>
                    {lead.name.charAt(0)}
                  </div>
                  <div style={styles.leadInfo}>
                    <div style={styles.cardItemName}>{lead.name}</div>
                    <div style={styles.cardItemCompany}>{lead.company}</div>
                  </div>
                </div>
                <div style={styles.scorePill}>
                  <span style={styles.scoreValue}>{lead.aiScore}%</span>
                </div>
              </div>
            ))}
            {highProbabilityLeads.length === 0 && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📊</span>
                <p style={styles.emptyText}>No high probability leads</p>
              </div>
            )}
            {highProbabilityLeads.length > 3 && (
              <div style={styles.moreIndicator}>
                +{highProbabilityLeads.length - 3} more leads
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Predicted Revenue - Premium Version */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}>
              <span style={styles.cardIcon}>💰</span>
            </div>
            <h4 style={styles.cardTitle}>Predicted Revenue</h4>
            <span style={styles.cardBadge}>This Month</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.revenueContainer}>
              <div style={styles.revenueAmount}>
                <span style={styles.currencySymbol}>₹</span>
                {(predictedRevenue / 100000).toFixed(1)}<span style={styles.revenueUnit}>lakh</span>
              </div>
              <div style={styles.revenueTrend}>
                <span style={styles.trendUp}>↑</span> +12.5% from last month
              </div>
            </div>
            <div style={styles.revenueBreakdown}>
              <div style={styles.breakdownItem}>
                <span style={styles.breakdownLabel}>Deals count</span>
                <span style={styles.breakdownValue}>{highProbabilityLeads.length}</span>
              </div>
              <div style={styles.breakdownItem}>
                <span style={styles.breakdownLabel}>Avg. value</span>
                <span style={styles.breakdownValue}>₹{(predictedRevenue / (highProbabilityLeads.length || 1) / 1000).toFixed(0)}K</span>
              </div>
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Temperature card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}><span style={{ fontSize: "20px" }}>🌡️</span></div>
            <h4 style={styles.cardTitle}>Lead Temperature</h4>
            <span style={styles.cardBadge}>AI Tagged</span>
          </div>
          <div style={styles.cardContent}>
            {[["🔥 Hot", insights?.hot_leads ?? leads.filter(l => l.aiScore >= 80).length, "#e63946"], ["🌡️ Warm", insights?.warm_leads ?? leads.filter(l => l.aiScore >= 50 && l.aiScore < 80).length, "#f39c12"], ["❄️ Cold", insights?.cold_leads ?? leads.filter(l => l.aiScore < 50).length, "#3498db"]].map(([label, count, color]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{label as string}</span>
                <span style={{ fontWeight: 700, color: color as string, fontSize: "20px" }}>{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🧠 AI Analyzer Panel */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <span style={{ fontSize: "20px" }}>🧠</span>
          <h4 style={styles.panelTitle}>AI Lead Analyzer</h4>
          <span style={{ fontSize: "13px", color: "#888", marginLeft: "auto" }}>Select lead → paste conversation → get AI score + next action</span>
        </div>
        <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
          {/* Left inputs */}
          <div style={{ flex: 1 }}>
            <label style={styles.formLabel}>Select Lead</label>
            <select style={styles.selectInput} value={selectedLead?.id || ""} onChange={(e) => { const lead = leads.find(l => l.id === e.target.value) || null; setSelectedLead(lead); setAnalysisResult(null); setFollowupMessage(""); }}>
              <option value="">-- Choose a lead --</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.company} (Score: {l.aiScore})</option>)}
            </select>
            <label style={{ ...styles.formLabel, marginTop: "14px" }}>Lead Notes / Conversation (WhatsApp chat, email, or description)</label>
            <textarea style={styles.notesInput} placeholder={'Example: "Hi, I need a website urgently. What\'s the price? Budget is around 50k."'} value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} rows={4} />
            <button style={{ ...styles.primaryBtn, opacity: analyzing || !selectedLead ? 0.6 : 1, marginTop: "12px" }} onClick={handleAnalyze} disabled={analyzing || !selectedLead}>
              {analyzing ? "🔍 AI is analyzing..." : "🧠 Analyze This Lead"}
            </button>
          </div>

          {/* Right result */}
          <div style={{ flex: 1 }}>
            {analysisResult ? (
              <div style={{ background: "#fafafa", borderRadius: "12px", padding: "18px", border: "1px solid #e8e8e8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "38px", fontWeight: 700 }}>{analysisResult.score}<span style={{ fontSize: "18px", color: "#888" }}>/100</span></div>
                    <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: (tagColor[analysisResult.tag] || "#888") + "20", color: tagColor[analysisResult.tag] || "#888" }}>{(analysisResult.tag || "warm").toUpperCase()}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Urgency</div>
                    <div style={{ fontWeight: 700, fontSize: "16px" }}>{analysisResult.urgency}</div>
                  </div>
                </div>
                {[["📝 Summary", analysisResult.summary], ["💰 Budget", analysisResult.budget], ["🎯 Need", analysisResult.need], ["💡 Reason", analysisResult.reason]].map(([label, value]) => (
                  <div key={label} style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.5 }}>{value}</div>
                  </div>
                ))}
                <div style={{ background: "#e8f4ff", borderRadius: "8px", padding: "10px 12px", marginTop: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#1a6fa8", textTransform: "uppercase", marginBottom: "4px" }}>🚀 Next Action</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a2744" }}>{analysisResult.next_action}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fafafa", borderRadius: "12px", padding: "60px 24px", border: "1px dashed #e0e0e0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <span style={{ fontSize: "48px" }}>🤖</span>
                <p style={{ color: "#aaa", marginTop: "12px", fontSize: "14px" }}>{analyzing ? "AI is thinking..." : "Select a lead and click Analyze"}</p>
=======
        {/* Card 3: Deals Detected - Premium Version */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}>
              <span style={styles.cardIcon}>🔍</span>
            </div>
            <h4 style={styles.cardTitle}>Deals Detected</h4>
            <span style={styles.cardBadge}>{dealsDetected.length}</span>
          </div>
          <div style={styles.cardContent}>
            {dealsDetected.slice(0, 3).map((lead, index) => (
              <div key={lead.id} style={styles.cardItem}>
                <div style={styles.cardItemLeft}>
                  <div style={{
                    ...styles.dealAvatar,
                    backgroundColor: index === 0 ? '#e63946' : index === 1 ? '#f39c12' : '#3498db'
                  }}>
                    {lead.name.charAt(0)}
                  </div>
                  <div style={styles.leadInfo}>
                    <div style={styles.cardItemName}>{lead.name}</div>
                    <div style={styles.cardItemCompany}>{lead.company}</div>
                  </div>
                </div>
                <div style={styles.dealValue}>
                  <span style={styles.dealValueText}>₹{(lead.dealValue / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
            {dealsDetected.length === 0 && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📋</span>
                <p style={styles.emptyText}>No deals detected</p>
              </div>
            )}
            {dealsDetected.length > 3 && (
              <div style={styles.moreIndicator}>
                +{dealsDetected.length - 3} more deals
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
              </div>
            )}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* ✍️ Follow-up Generator */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <span style={{ fontSize: "20px" }}>✍️</span>
          <h4 style={styles.panelTitle}>AI Follow-up Generator</h4>
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            {(["whatsapp", "email", "closing"] as const).map(ch => (
              <button key={ch} style={{ padding: "6px 14px", border: "none", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: followupChannel === ch ? "#1a2744" : "#f0f0f0", color: followupChannel === ch ? "white" : "#333" }} onClick={() => setFollowupChannel(ch)}>
                {ch === "whatsapp" ? "💬 WhatsApp" : ch === "email" ? "📧 Email" : "🎯 Closing"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {!selectedLead ? (
            <p style={{ color: "#aaa", fontSize: "14px" }}>Select a lead from the AI Analyzer above first</p>
          ) : (
            <>
              <p style={{ fontSize: "14px", color: "#555", marginBottom: "14px" }}>
                Generating <strong>{followupChannel}</strong> for <strong>{selectedLead.name}</strong> · {selectedLead.company} · Stage: {selectedLead.stage}
              </p>
              <button style={{ ...styles.primaryBtn, opacity: generatingFollowup ? 0.6 : 1 }} onClick={handleGenerateFollowup} disabled={generatingFollowup}>
                {generatingFollowup ? "✍️ Writing..." : `Generate ${followupChannel} message`}
              </button>
            </>
          )}
          {followupMessage && (
            <div style={{ marginTop: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "#555" }}>Generated Message:</span>
                <button style={{ background: "#f0f0f0", border: "none", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", cursor: "pointer" }} onClick={() => { navigator.clipboard.writeText(followupMessage); alert("Copied!"); }}>📋 Copy</button>
              </div>
              <div style={{ background: "#f9f9f9", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "16px", fontSize: "14px", color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{followupMessage}</div>
            </div>
          )}
        </div>
      </div>

      {/* Batch results */}
      {batchResults.length > 0 && (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f0f0f0", padding: "20px 24px" }}>
          <h4 style={{ marginBottom: "14px", fontWeight: 700 }}>✅ Batch Scoring Results</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {batchResults.map((r: any) => (
              <div key={r.id} style={{ background: "#f5f5f5", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 500 }}>
                {r.name}: <strong style={{ color: tagColor[r.aiTag] || "#333" }}>{r.aiScore}/100 ({r.aiTag})</strong>
              </div>
            ))}
          </div>
        </div>
      )}
=======
      {/* Bottom card: Recommended Follow-ups - Premium Version */}
      <div style={styles.followUpCard}>
        <div style={styles.followUpHeader}>
          <div style={styles.followUpLeft}>
            <div style={styles.followUpIconWrapper}>
              <span style={styles.followUpIcon}>⏰</span>
            </div>
            <h4 style={styles.followUpTitle}>Recommended Follow-ups</h4>
          </div>
          <span style={styles.followUpBadge}>{recommendedFollowUps.length} pending</span>
        </div>
        
        <div style={styles.followUpGrid}>
          {recommendedFollowUps.slice(0, 4).map((lead, index) => (
            <div key={lead.id} style={styles.followUpItem}>
              <div style={styles.followUpItemHeader}>
                <div style={styles.followUpAvatar}>
                  {lead.name.charAt(0)}
                </div>
                <div style={styles.followUpInfo}>
                  <div style={styles.followUpName}>{lead.name}</div>
                  <div style={styles.followUpCompany}>{lead.company}</div>
                </div>
                <div style={styles.followUpPriority(lead.stage)}>
                  {lead.stage === "Follow up" ? "Urgent" : "Due soon"}
                </div>
              </div>
              <div style={styles.followUpFooter}>
                <span style={styles.followUpStage}>{lead.stage}</span>
                <span style={styles.followUpScore}>{lead.aiScore}% match</span>
              </div>
            </div>
          ))}
          {recommendedFollowUps.length === 0 && (
            <div style={styles.emptyStateFollowUp}>
              <span style={styles.emptyIcon}>✅</span>
              <p style={styles.emptyText}>All caught up! No follow-ups needed</p>
            </div>
          )}
        </div>
        
        {recommendedFollowUps.length > 4 && (
          <div style={styles.followUpMore}>
            +{recommendedFollowUps.length - 4} more follow-ups
          </div>
        )}
      </div>
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
    </div>
  );
};

const styles: { [key: string]: any } = {
<<<<<<< HEAD
  container: { fontFamily: "'Inter', sans-serif" },
  pageTitle: { fontSize: "30px", fontWeight: 700, background: "linear-gradient(135deg, #1a2744, #2c3e50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px" },
  titleAccent: { width: "60px", height: "4px", background: "linear-gradient(90deg, #1a2744, #3498db)", borderRadius: "4px", marginBottom: "10px" },
  titleSubtext: { fontSize: "13px", color: "#888", margin: 0 },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" },
  card: { background: "white", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #f5f5f5" },
  cardIconWrapper: { width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #1a2744, #2c3e50)", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: "15px", fontWeight: 600, color: "#111", flex: 1, margin: 0 },
  cardBadge: { background: "#f0f2f5", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: "#555" },
  cardContent: { padding: "16px 20px" },
  cardItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5" },
  panel: { background: "white", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: "24px", overflow: "hidden" },
  panelHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", borderBottom: "1px solid #f5f5f5" },
  panelTitle: { fontSize: "16px", fontWeight: 700, color: "#111", margin: 0 },
  formLabel: { display: "block", fontSize: "11px", fontWeight: 700, color: "#555", marginBottom: "6px", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  selectInput: { width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#333", background: "white", boxSizing: "border-box" as const },
  notesInput: { width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", outline: "none", color: "#333", background: "#fafafa", resize: "vertical" as const, fontFamily: "inherit", boxSizing: "border-box" as const },
  primaryBtn: { background: "#1a2744", color: "white", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  batchBtn: { background: "#1a2744", color: "white", border: "none", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
=======
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "100%",
    padding: "0",
  },
  titleSection: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  titleAccent: {
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #1a2744 0%, #3498db 100%)",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  titleSubtext: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
    margin: 0,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    marginBottom: "24px",
  },
  card: {
    background: "white",
    borderRadius: "24px",
    padding: "0",
    border: "1px solid #f0f0f0",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02) inset",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 24px",
    borderBottom: "1px solid #f5f5f5",
    background: "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
  },
  cardIconWrapper: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 16px -4px rgba(26,39,68,0.2)",
  },
  cardIcon: {
    fontSize: "22px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111",
    flex: 1,
    margin: 0,
  },
  cardBadge: {
    background: "#f0f2f5",
    padding: "6px 12px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
  },
  cardContent: {
    padding: "20px 24px",
  },
  cardItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  cardItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  leadAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  dealAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  leadInfo: {
    flex: 1,
  },
  cardItemName: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111",
    marginBottom: "2px",
  },
  cardItemCompany: {
    fontSize: "12px",
    color: "#777",
  },
  scorePill: {
    background: "linear-gradient(135deg, #f0f2f5 0%, #e8ecf0 100%)",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.5)",
  },
  scoreValue: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1a2744",
  },
  dealValue: {
    background: "#e8f0fe",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  dealValueText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1a2744",
  },
  revenueContainer: {
    padding: "16px 0",
  },
  revenueAmount: {
    fontSize: "44px",
    fontWeight: "700",
    color: "#111",
    lineHeight: 1.2,
    marginBottom: "8px",
  },
  currencySymbol: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#666",
    marginRight: "4px",
  },
  revenueUnit: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#888",
    marginLeft: "4px",
  },
  revenueTrend: {
    fontSize: "13px",
    color: "#666",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  trendUp: {
    color: "#2ecc71",
    fontWeight: "700",
    fontSize: "16px",
  },
  revenueBreakdown: {
    display: "flex",
    gap: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #f0f0f0",
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: "11px",
    color: "#888",
    display: "block",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  breakdownValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111",
  },
  emptyState: {
    textAlign: "center",
    padding: "30px 0",
  },
  emptyIcon: {
    fontSize: "32px",
    opacity: 0.5,
    display: "block",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "13px",
    color: "#aaa",
    margin: 0,
  },
  moreIndicator: {
    textAlign: "center",
    padding: "10px 0 0",
    fontSize: "12px",
    color: "#888",
    fontWeight: "500",
  },
  followUpCard: {
    background: "white",
    borderRadius: "24px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
    overflow: "hidden",
    maxWidth: "100%",
  },
  followUpHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #f5f5f5",
    background: "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
  },
  followUpLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  followUpIconWrapper: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #e63946 0%, #ff6b7b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 16px -4px rgba(230,57,70,0.2)",
  },
  followUpIcon: {
    fontSize: "22px",
    color: "white",
  },
  followUpTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111",
    margin: 0,
  },
  followUpBadge: {
    background: "linear-gradient(135deg, #e63946 0%, #ff6b7b 100%)",
    color: "white",
    padding: "6px 14px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "600",
  },
  followUpGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    padding: "24px",
  },
  followUpItem: {
    background: "#fafafa",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid #f0f0f0",
    transition: "transform 0.2s ease",
  },
  followUpItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  followUpAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  followUpInfo: {
    flex: 1,
  },
  followUpName: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111",
    marginBottom: "2px",
  },
  followUpCompany: {
    fontSize: "11px",
    color: "#777",
  },
  followUpPriority: (stage: string) => ({
    background: stage === "Follow up" ? "rgba(230,57,70,0.1)" : "rgba(243,156,18,0.1)",
    color: stage === "Follow up" ? "#e63946" : "#f39c12",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "600",
    whiteSpace: "nowrap" as const,
  }),
  followUpFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px dashed #e0e0e0",
  },
  followUpStage: {
    fontSize: "11px",
    color: "#888",
  },
  followUpScore: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#2ecc71",
  },
  emptyStateFollowUp: {
    gridColumn: "span 4",
    textAlign: "center",
    padding: "40px 0",
  },
  followUpMore: {
    textAlign: "center",
    padding: "16px 24px 24px",
    fontSize: "13px",
    color: "#888",
    fontWeight: "500",
    borderTop: "1px solid #f5f5f5",
  },
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
};

export default AiInsights;