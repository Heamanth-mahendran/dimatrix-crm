<<<<<<< HEAD
// Automation.tsx - Manual trigger + WhatsApp deep link + Log Reply + live refresh
import React, { useState, useEffect } from "react";
import { Lead } from "../types/lead";
import { automationApi, aiApi } from "../services/api";

interface AutomationProps {
  leads: Lead[];
  onLeadsRefresh: () => Promise<void>; // triggers App to re-fetch → Dashboard updates
}

const Automation: React.FC<AutomationProps> = ({ leads, onLeadsRefresh }) => {
  const [pendingFollowups, setPendingFollowups] = useState<any[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<Record<string, string>>({});
  const [whatsappUrls, setWhatsappUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // ── Log Reply State ──────────────────────────────────────────────────────
  const [replyModal, setReplyModal] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [updatedScores, setUpdatedScores] = useState<Record<string, { score: number; tag: string; prev: number }>>({});

  useEffect(() => { loadPendingFollowups(); }, []);

  const loadPendingFollowups = async () => {
    setLoading(true);
    try {
      const data = await automationApi.pendingFollowups();
      setPendingFollowups(data.pending);
      setBackendOnline(true);
    } catch {
      setPendingFollowups(
        leads.map(l => ({ ...l, days_since_contact: 2, urgency: "medium" }))
      );
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    setTriggerLoading(true);
    setTriggerResult(null);
    try {
      const res = await fetch("http://localhost:8000/automation/trigger-check", { method: "POST" });
      const data = await res.json();
      setTriggerResult(data.message || `✅ Check complete. ${data.details?.triggered ?? 0} leads need follow-up.`);
      await loadPendingFollowups();
    } catch {
      setTriggerResult("⚠️ Could not reach backend. Is it running?");
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleGenerateMessage = async (lead: any) => {
    setGeneratingId(lead.id);
    try {
      const result = await aiApi.generateFollowup(lead.id, "whatsapp", "No reply for 2+ days") as any;
      setGeneratedMessages(prev => ({ ...prev, [lead.id]: result.message }));
      if (result.whatsapp_url) {
        setWhatsappUrls(prev => ({ ...prev, [lead.id]: result.whatsapp_url as string }));
      }
    } catch {
      const fallback = `Hey ${lead.name.split(" ")[0]}! 👋 Just checking in — are you still looking to move forward? I'd love to help ${lead.company}. Drop me a message when you're free!`;
      setGeneratedMessages(prev => ({ ...prev, [lead.id]: fallback }));
      if (lead.phone) {
        const cleaned = lead.phone.replace(/\D/g, "").replace(/^0/, "91");
        const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(fallback)}`;
        setWhatsappUrls(prev => ({ ...prev, [lead.id]: url }));
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSendNow = async (lead: any) => {
    const waUrl = whatsappUrls[lead.id];
    if (waUrl) {
      window.open(waUrl, "_blank");
    } else if (lead.phone) {
      const cleaned = lead.phone.replace(/\D/g, "").replace(/^0/, "91");
      window.open(`https://wa.me/${cleaned}`, "_blank");
    } else {
      alert(`No phone number found for ${lead.name}.`);
      return;
    }
    try {
      await automationApi.markSent(lead.id);
    } catch { /* ignore if backend offline */ }
    setSentIds(prev => new Set(prev).add(lead.id));
  };

  // ── Log Reply Handler ────────────────────────────────────────────────────
  const handleLogReply = async () => {
    if (!replyText.trim() || !replyModal) return;
    setReplyLoading(true);
    try {
      await fetch(`http://localhost:8000/leads/${replyModal.id}/log-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_text: replyText }),
      });

      const prevScore = replyModal.aiScore ?? 50;

      setReplySuccess(true);
      setReplyText("");

      // Poll for updated score after AI re-scores in background (~8s)
      setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:8000/leads/${replyModal.id}`);
          const updated = await res.json();
          if (updated.aiScore && updated.aiScore !== prevScore) {
            setUpdatedScores(prev => ({
              ...prev,
              [replyModal.id]: {
                score: updated.aiScore,
                tag: updated.aiTag ?? "warm",
                prev: prevScore,
              },
            }));
          }
        } catch { /* silent */ }

        setReplyModal(null);
        setReplySuccess(false);
        await loadPendingFollowups();
        await onLeadsRefresh(); // ← re-fetches all leads in App → Dashboard re-renders with live data
      }, 2500);

    } catch (err) {
      console.error("Log reply failed:", err);
      alert("Failed to log reply. Is the backend running?");
    } finally {
      setReplyLoading(false);
    }
  };

  const displayLeads = backendOnline
    ? pendingFollowups
    : leads.map(l => ({
        ...l,
        days_since_contact: 2,
        urgency: l.priority === "High" ? "high" : "medium",
      }));

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111", margin: 0 }}>
            Smart Follow-up Automation
          </h2>
          <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
            AI generates personalized messages · Click <strong>Run Check</strong> to find leads that need follow-up
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{
            padding: "6px 14px", borderRadius: "30px", fontSize: "12px", fontWeight: 600,
            background: backendOnline ? "#e8f8f0" : "#fff0f0",
            color: backendOnline ? "#27ae60" : "#e63946"
          }}>
            {backendOnline ? "🟢 Backend Online" : "⚠️ Backend Offline"}
          </span>

          <button
            onClick={handleManualTrigger}
            disabled={triggerLoading}
            style={{
              background: triggerLoading ? "#ccc" : "#27ae60",
              color: "white", border: "none", borderRadius: "8px",
              padding: "8px 16px", fontSize: "13px", fontWeight: 600,
              cursor: triggerLoading ? "not-allowed" : "pointer",
            }}
          >
            {triggerLoading ? "⏳ Checking..." : "▶ Run Check"}
          </button>

          <button
            onClick={loadPendingFollowups}
            style={{
              background: "#1a2744", color: "white", border: "none",
              borderRadius: "8px", padding: "8px 16px", fontSize: "13px",
              fontWeight: 600, cursor: "pointer"
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Trigger Result Toast ── */}
      {triggerResult && (
        <div style={{
          background: triggerResult.startsWith("⚠️") ? "#fff0f0" : "#e8f8f0",
          border: `1px solid ${triggerResult.startsWith("⚠️") ? "#fbb" : "#a3e4c1"}`,
          borderRadius: "10px", padding: "10px 18px", marginBottom: "16px",
          fontSize: "13px", fontWeight: 600,
          color: triggerResult.startsWith("⚠️") ? "#e63946" : "#27ae60",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span>{triggerResult}</span>
          <button onClick={() => setTriggerResult(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#aaa" }}>✕</button>
        </div>
      )}

      {/* ── Rules Info Bar ── */}
      <div style={{
        background: "#f0f4ff", borderRadius: "12px", padding: "14px 20px",
        marginBottom: "24px", display: "flex", gap: "24px", flexWrap: "wrap" as const
      }}>
        {[
          ["📵 No reply 24h", "→ Manual follow-up trigger"],
          ["🔥 Hot lead", "→ Instant WhatsApp notify"],
          ["❄️ Cold lead", "→ Nurture sequence"],
        ].map(([rule, action]) => (
          <div key={rule} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a2744" }}>{rule}</span>
            <span style={{ fontSize: "12px", color: "#666" }}>{action}</span>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
          Loading automation data...
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", overflow: "auto", border: "1px solid #e5e5e5" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                {["Name", "Company", "Source", "Deal Value", "AI Score", "Status", "AI Message", "Action"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left" as const, fontWeight: 600, color: "#333", whiteSpace: "nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" as const, padding: "40px", color: "#aaa" }}>
                    🎉 All caught up! No follow-ups needed.
                  </td>
                </tr>
              ) : (
                displayLeads.map((lead: any) => {
                  const alreadySent   = sentIds.has(lead.id);
                  const generatedMsg  = generatedMessages[lead.id];
                  const hasWhatsApp   = !!whatsappUrls[lead.id];
                  const scoreUpdate   = updatedScores[lead.id];
                  const displayScore  = scoreUpdate ? scoreUpdate.score : (lead.aiScore ?? 50);
                  const displayTag    = scoreUpdate ? scoreUpdate.tag   : (lead.aiTag ?? "warm");

                  return (
                    <tr key={lead.id} style={{ borderBottom: "1px solid #f5f5f5" }}>

                      {/* Name + urgency */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                        <div style={{ fontSize: "11px", color: lead.urgency === "high" ? "#e63946" : "#f39c12", fontWeight: 600 }}>
                          {lead.urgency === "high" ? "🔴 High urgency" : "🟡 Medium"}
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px", color: "#444" }}>{lead.company}</td>
                      <td style={{ padding: "14px 16px", color: "#444" }}>{lead.source}</td>
                      <td style={{ padding: "14px 16px", color: "#444" }}>₹{lead.dealValue?.toLocaleString()}</td>

                      {/* AI Score + tag */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          color: displayScore >= 80 ? "#27ae60" : displayScore >= 50 ? "#f39c12" : "#e63946",
                          fontWeight: 700,
                          transition: "color 0.5s"
                        }}>
                          {displayScore}%
                        </span>
                        {scoreUpdate && (
                          <span style={{ fontSize: "10px", color: scoreUpdate.score > scoreUpdate.prev ? "#27ae60" : "#e63946", marginLeft: "4px" }}>
                            {scoreUpdate.score > scoreUpdate.prev
                              ? `▲ +${(scoreUpdate.score - scoreUpdate.prev).toFixed(0)}`
                              : `▼ ${(scoreUpdate.score - scoreUpdate.prev).toFixed(0)}`}
                          </span>
                        )}
                        {displayTag && (
                          <span style={{
                            marginLeft: "6px", fontSize: "11px", padding: "2px 8px",
                            borderRadius: "20px", fontWeight: 600,
                            background: displayTag === "hot" ? "#fff0f0" : displayTag === "warm" ? "#fff8e8" : "#e8f4ff",
                            color: displayTag === "hot" ? "#e63946" : displayTag === "warm" ? "#f39c12" : "#3498db",
                          }}>{displayTag}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontWeight: 600, color: alreadySent ? "#2ecc71" : "#e63946", fontSize: "13px" }}>
                          {alreadySent ? "✅ Follow-up sent" : `⏰ No reply for ${lead.days_since_contact ?? 2}d`}
                        </span>
                      </td>

                      {/* AI Message */}
                      <td style={{ padding: "14px 16px", maxWidth: "220px" }}>
                        {generatedMsg ? (
                          <div style={{
                            fontSize: "12px", color: "#555", background: "#f5f5f5",
                            borderRadius: "8px", padding: "8px", lineHeight: 1.5,
                            maxHeight: "80px", overflow: "auto"
                          }}>
                            {generatedMsg}
                            {hasWhatsApp && (
                              <div style={{ marginTop: "6px" }}>
                                <span style={{ fontSize: "10px", color: "#25D366", fontWeight: 700 }}>📲 WhatsApp ready</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateMessage(lead)}
                            disabled={generatingId === lead.id}
                            style={{
                              background: "none", border: "1px solid #1a2744", borderRadius: "6px",
                              padding: "5px 12px", fontSize: "12px", fontWeight: 600,
                              color: "#1a2744", cursor: "pointer",
                              opacity: generatingId === lead.id ? 0.6 : 1
                            }}
                          >
                            {generatingId === lead.id ? "✍️ Writing..." : "✍️ Generate AI Message"}
                          </button>
                        )}
                      </td>

                      {/* Actions: Send Now + Log Reply */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px" }}>
                          <button
                            style={{
                              background: alreadySent ? "#f0f0f0" : hasWhatsApp ? "#25D366" : "#1a2744",
                              color: alreadySent ? "#888" : "white",
                              border: "none", borderRadius: "8px",
                              padding: "7px 14px", fontSize: "12px", fontWeight: 600,
                              cursor: alreadySent ? "not-allowed" : "pointer",
                              opacity: alreadySent ? 0.6 : 1,
                              whiteSpace: "nowrap" as const
                            }}
                            onClick={() => !alreadySent && handleSendNow(lead)}
                            disabled={alreadySent}
                            title={hasWhatsApp ? "Opens WhatsApp with AI message pre-filled" : "Opens WhatsApp chat"}
                          >
                            {alreadySent ? "Sent ✓" : hasWhatsApp ? "📲 Send on WhatsApp" : "Send Now"}
                          </button>

                          <button
                            onClick={() => { setReplyModal(lead); setReplyText(""); setReplySuccess(false); }}
                            style={{
                              background: "none",
                              border: "1px solid #27ae60",
                              borderRadius: "8px",
                              padding: "7px 14px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#27ae60",
                              cursor: "pointer",
                              whiteSpace: "nowrap" as const
                            }}
                          >
                            💬 Log Reply
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Log Reply Modal ── */}
      {replyModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "28px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1a2744" }}>
                💬 Log Client Reply
              </h3>
              <button
                onClick={() => setReplyModal(null)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa", lineHeight: 1 }}
              >✕</button>
            </div>

            <div style={{
              background: "#f5f7ff", borderRadius: "10px",
              padding: "10px 14px", marginBottom: "16px",
              fontSize: "13px", color: "#555"
            }}>
              <span style={{ fontWeight: 700, color: "#1a2744" }}>{replyModal.name}</span>
              {" · "}{replyModal.company}
              <br />
              <span style={{ fontSize: "11px", color: "#888" }}>
                Current score: <strong>{replyModal.aiScore ?? 50}%</strong> · AI will re-score after logging
              </span>
            </div>

            <textarea
              style={{
                width: "100%", boxSizing: "border-box" as const,
                background: "#f9f9f9", border: "1px solid #ddd",
                borderRadius: "10px", padding: "12px",
                fontSize: "13px", color: "#333",
                resize: "vertical" as const, minHeight: "110px",
                outline: "none", lineHeight: 1.6,
                fontFamily: "'Poppins', sans-serif",
              }}
              placeholder="Paste the client's WhatsApp / email reply here..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />

            {replySuccess && (
              <div style={{
                marginTop: "12px", padding: "10px 14px",
                background: "#e8f8f0", border: "1px solid #a3e4c1",
                borderRadius: "10px", fontSize: "13px",
                fontWeight: 600, color: "#27ae60"
              }}>
                ✅ Reply logged! AI is re-scoring <strong>{replyModal.name}</strong>...
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                onClick={() => setReplyModal(null)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  border: "1px solid #ddd", background: "none",
                  color: "#666", fontSize: "13px", cursor: "pointer", fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogReply}
                disabled={replyLoading || !replyText.trim()}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  border: "none",
                  background: replyLoading || !replyText.trim() ? "#ccc" : "#1a2744",
                  color: "white", fontSize: "13px", fontWeight: 700,
                  cursor: replyLoading || !replyText.trim() ? "not-allowed" : "pointer",
                }}
              >
                {replyLoading ? "Logging..." : "Log & Re-score 🤖"}
              </button>
            </div>
          </div>
        </div>
      )}

=======
// Automation.tsx - Automation page
// Shows leads that need a follow-up email sent automatically
// "Send now" button simulates sending a follow-up

import React, { useState } from "react";
import { Lead } from "../types/lead";

interface AutomationProps {
  leads: Lead[];
}

const Automation: React.FC<AutomationProps> = ({ leads }) => {

  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const handleSendNow = (id: string) => {
    
    setSentIds(prevSentIds => new Set(prevSentIds).add(id));
    alert("Follow-up email sent!");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Send Followup Automatically</h2>

      {/* Table of leads that need follow-up */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Company name</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Deal Value</th>
              <th style={styles.th}>AI Score</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyMsg}>No leads to automate.</td>
              </tr>
            ) : (
              leads.map((lead) => {
                const alreadySent = sentIds.has(lead.id); // Check if already sent

                return (
                  <tr key={lead.id} style={styles.tableRow}>
                    <td style={styles.td}>{lead.name}</td>
                    <td style={styles.td}>{lead.company}</td>
                    <td style={styles.td}>{lead.source}</td>
                    <td style={styles.td}>{lead.dealValue.toLocaleString()}</td>
                    {/* AI Score in green */}
                    <td style={styles.td}>
                      <span style={styles.aiScore}>{lead.aiScore}%</span>
                    </td>
                    {/* Status message */}
                    <td style={styles.td}>
                      <span style={styles.statusText}>
                        {alreadySent ? "Follow-up sent ✓" : "didn't send follow up for 2 days"}
                      </span>
                    </td>
                    {/* Send now button - disabled after clicking */}
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.sendBtn,
                          // If already sent, make button look disabled
                          opacity: alreadySent ? 0.5 : 1,
                          cursor: alreadySent ? "not-allowed" : "pointer",
                        }}
                        onClick={() => !alreadySent && handleSendNow(lead.id)}
                        disabled={alreadySent}
                      >
                        {alreadySent ? "Sent" : "Send now"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
    </div>
  );
};

<<<<<<< HEAD
=======
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", // ← Added Poppins font
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "28px",
    color: "#111",
    fontFamily: "inherit", // ← Added
  },
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "auto",
    border: "1px solid #e5e5e5",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  headerRow: {
    borderBottom: "2px solid #f0f0f0",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#333",
    whiteSpace: "nowrap",
    fontFamily: "inherit", // ← Added
  },
  tableRow: {
    borderBottom: "1px solid #f5f5f5",
  },
  td: {
    padding: "14px 16px",
    color: "#444",
    verticalAlign: "middle",
    fontFamily: "inherit", // ← Added
  },
  aiScore: {
    color: "#2ecc71",
    fontWeight: "700",
    fontFamily: "inherit", // ← Added
  },
  statusText: {
    fontWeight: "600",
    color: "#333",
    fontSize: "13px",
    fontFamily: "inherit", // ← Added
  },
  sendBtn: {
    backgroundColor: "#1a2744",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit", // ← Added
  },
  emptyMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
    fontFamily: "inherit", // ← Added
  },
};

>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
export default Automation;