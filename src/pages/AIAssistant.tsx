// AIAssistant.tsx
// Slide-in AI Assistant panel with lead search, snapshots, and multi-turn chat

import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: string;
  dealValue: number;
  aiScore?: number;
  aiTag?: string;
  aiSummary?: string;
  aiNextAction?: string;
  aiUrgency?: string;
  aiReason?: string;
  aiBudget?: string;
  aiNeed?: string;
}

interface Snapshot {
  win_probability: number;
  score: number;
  tag: string;
  urgency: string;
  summary: string;
  next_action: string;
  reason: string;
  budget_insight: string;
  need: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const API = "http://127.0.0.1:8000";

// ─── Suggested Prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "Who are my hottest leads right now?",
  "Which leads haven't been followed up in 3+ days?",
  "What's my predicted revenue this month?",
  "Prioritize my pipeline for today",
];

// ─── Main Component ───────────────────────────────────────────────────────────

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [focusedLead, setFocusedLead] = useState<Lead | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your AI Sales Assistant 🤖\n\nI know your entire pipeline. Search for a lead above, or ask me anything — deal predictions, next actions, follow-up priorities, you name it.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    { role: string; content: string }[]
  >([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Debounced lead search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/leads/search/${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.leads || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, [searchQuery]);

  // Load lead snapshot
  const loadSnapshot = useCallback(async (lead: Lead) => {
    setFocusedLead(lead);
    setSearchResults([]);
    setSearchQuery(lead.name);
    setSnapshotLoading(true);
    setSnapshot(null);
    try {
      const res = await fetch(`${API}/ai/assistant/lead-snapshot/${lead.id}`);
      const data = await res.json();
      setSnapshot(data.snapshot);
    } catch {
      setSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  // Send chat message
  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text || inputText).trim();
      if (!content || chatLoading) return;

      setInputText("");
      const userMsg: ChatMessage = {
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setChatLoading(true);

      try {
        const res = await fetch(`${API}/ai/assistant/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            conversation_history: conversationHistory,
            focused_lead_id: focusedLead?.id || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const aiMsg: ChatMessage = {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setConversationHistory(data.conversation_history);
        } else {
          throw new Error(data.detail || "AI error");
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "⚠️ Couldn't reach the AI. Make sure Ollama is running with gemma2:2b loaded.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [inputText, chatLoading, conversationHistory, focusedLead]
  );

  const clearFocusedLead = () => {
    setFocusedLead(null);
    setSnapshot(null);
    setSearchQuery("");
  };

  const tagColor = (tag?: string) => {
    if (tag === "hot") return "#ef4444";
    if (tag === "warm") return "#f97316";
    return "#3b82f6";
  };

  const tagBg = (tag?: string) => {
    if (tag === "hot") return "#fef2f2";
    if (tag === "warm") return "#fff7ed";
    return "#eff6ff";
  };

  const tagEmoji = (tag?: string) => {
    if (tag === "hot") return "🔥";
    if (tag === "warm") return "🌡️";
    return "❄️";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "480px",
          height: "100vh",
          backgroundColor: "#0f1117",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #1e2130",
            background: "linear-gradient(135deg, #0f1117 0%, #141824 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                }}
              >
                🤖
              </div>
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "16px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  AI Sales Assistant
                </div>
                <div
                  style={{
                    color: "#4ade80",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      display: "inline-block",
                    }}
                  />
                  Ollama gemma2:2b · Live
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#1e2130",
                border: "none",
                color: "#94a3b8",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#475569",
                fontSize: "14px",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search leads by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "#1a1f2e",
                border: "1px solid #262d3d",
                borderRadius: "10px",
                color: "#e2e8f0",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {focusedLead && (
              <button
                onClick={clearFocusedLead}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#374151",
                  border: "none",
                  color: "#9ca3af",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                clear
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {(searchResults.length > 0 || searchLoading) && (
            <div
              style={{
                position: "absolute",
                top: "140px",
                left: "24px",
                right: "24px",
                background: "#1a1f2e",
                border: "1px solid #262d3d",
                borderRadius: "10px",
                zIndex: 10,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {searchLoading ? (
                <div
                  style={{
                    padding: "14px 16px",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Searching...
                </div>
              ) : (
                searchResults.slice(0, 6).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => loadSnapshot(lead)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #1e2130",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        "#232837")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        "transparent")
                    }
                  >
                    <div>
                      <div
                        style={{
                          color: "#e2e8f0",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        {lead.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>
                        {lead.company} · {lead.stage}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          background: tagBg(lead.aiTag),
                          color: tagColor(lead.aiTag),
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {tagEmoji(lead.aiTag)} {lead.aiScore ?? "?"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Lead Snapshot Card */}
        {(focusedLead || snapshotLoading) && (
          <div
            style={{
              margin: "16px 16px 0",
              background: "#141824",
              border: "1px solid #262d3d",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Lead Header */}
            <div
              style={{
                padding: "14px 16px",
                background: "linear-gradient(135deg, #1a1f2e, #1e2436)",
                borderBottom: "1px solid #262d3d",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#f1f5f9",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {focusedLead?.name}
                </div>
                <div style={{ color: "#64748b", fontSize: "12px" }}>
                  {focusedLead?.company} ·{" "}
                  <span style={{ color: "#94a3b8" }}>
                    ₹{focusedLead?.dealValue?.toLocaleString()}
                  </span>
                </div>
              </div>
              {snapshot && (
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: tagColor(snapshot.tag),
                      fontSize: "22px",
                      fontWeight: 800,
                    }}
                  >
                    {snapshot.score}
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>/100</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {tagEmoji(snapshot.tag)} {snapshot.tag?.toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {snapshotLoading ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                <div style={{ marginBottom: "8px", fontSize: "20px" }}>⏳</div>
                Loading AI snapshot...
              </div>
            ) : snapshot ? (
              <div style={{ padding: "14px 16px" }}>
                {/* Win Probability Bar */}
                <div style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      color: "#64748b",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Win Probability</span>
                    <span
                      style={{
                        color:
                          snapshot.win_probability > 60 ? "#4ade80" : "#f97316",
                        fontWeight: 700,
                      }}
                    >
                      {snapshot.win_probability}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#1e2130",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${snapshot.win_probability}%`,
                        background:
                          snapshot.win_probability > 60
                            ? "linear-gradient(90deg, #4ade80, #22c55e)"
                            : "linear-gradient(90deg, #f97316, #ef4444)",
                        borderRadius: "3px",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div
                  style={{
                    background: "#1a1f2e",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "10px",
                    fontSize: "12px",
                    color: "#cbd5e1",
                    lineHeight: "1.5",
                  }}
                >
                  📋 {snapshot.summary}
                </div>

                {/* Next Action */}
                <div
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#a5b4fc",
                    lineHeight: "1.5",
                  }}
                >
                  ⚡ <strong>Next:</strong> {snapshot.next_action}
                </div>

                {/* Ask about this lead button */}
                <button
                  onClick={() =>
                    sendMessage(
                      `Give me a full analysis of ${focusedLead?.name} from ${focusedLead?.company} and predict whether we'll win this deal.`
                    )
                  }
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "9px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.3px",
                  }}
                >
                  🔍 Deep-dive analysis →
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Suggested prompts (shown only when no messages beyond the greeting) */}
          {messages.length === 1 && !focusedLead && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{ fontSize: "11px", color: "#475569", marginBottom: "4px" }}
              >
                Try asking:
              </div>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    background: "#1a1f2e",
                    border: "1px solid #262d3d",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    color: "#94a3b8",
                    fontSize: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#232837";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#1a1f2e";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#94a3b8";
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "12px 14px",
                  borderRadius:
                    msg.role === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                      : "#1a1f2e",
                  color: msg.role === "user" ? "#fff" : "#cbd5e1",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  border:
                    msg.role === "assistant" ? "1px solid #262d3d" : "none",
                  boxShadow:
                    msg.role === "user"
                      ? "0 4px 12px rgba(99,102,241,0.3)"
                      : "none",
                }}
              >
                {msg.content}
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.4,
                    marginTop: "6px",
                    textAlign: "right",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "#1a1f2e",
                  border: "1px solid #262d3d",
                  borderRadius: "14px 14px 14px 4px",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#6366f1",
                      display: "inline-block",
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #1e2130",
            background: "#0f1117",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              background: "#1a1f2e",
              border: "1px solid #262d3d",
              borderRadius: "12px",
              padding: "8px 8px 8px 14px",
              transition: "border-color 0.2s",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={
                focusedLead
                  ? `Ask about ${focusedLead.name}...`
                  : "Ask anything about your pipeline..."
              }
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#e2e8f0",
                fontSize: "13px",
                outline: "none",
                padding: "4px 0",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={chatLoading || !inputText.trim()}
              style={{
                background:
                  chatLoading || !inputText.trim()
                    ? "#262d3d"
                    : "linear-gradient(135deg, #6366f1, #7c3aed)",
                border: "none",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                cursor: chatLoading || !inputText.trim() ? "not-allowed" : "pointer",
                color:
                  chatLoading || !inputText.trim() ? "#475569" : "white",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#2d3748",
              fontSize: "11px",
              marginTop: "8px",
            }}
          >
            Powered by Ollama · gemma2:2b · Local & Private
          </div>
        </div>
      </div>

      {/* CSS for dot animation */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;