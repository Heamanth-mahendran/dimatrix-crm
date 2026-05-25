import React, { useState, useEffect } from "react";
import { Lead } from "../types/lead";

interface DashboardProps {
  leads: Lead[];
  onNavigate: (page: string) => void;
  onRefresh: () => Promise<void>; // ← new
}

const stageDotColor: Record<string, string> = {
  "New leads":     "#6366f1",
  "Contacted":     "#0ea5e9",
  "Qualified":     "#f59e0b",
  "Proposal Sent": "#8b5cf6",
  "Follow up":     "#f97316",
  "Won":           "#22c55e",
  "Lost":          "#ef4444",
};

const priorityStyle: Record<string, { bg: string; color: string }> = {
  High:   { bg: "#fef2f2", color: "#dc2626" },
  medium: { bg: "#fffbeb", color: "#d97706" },
  low:    { bg: "#f0fdf4", color: "#16a34a" },
};

const avatarBg = [
  "#1e3a5f", "#2d5a9e", "#1a4d7a", "#0f3460",
  "#1e3a5f", "#2d5a9e", "#1a4d7a", "#0f3460",
];

const fmt = (n: number) =>
  n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L`
  : n >= 1000  ? `₹${Math.round(n / 1000)}k`
  : `₹${n}`;

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart: React.FC<{
  newLeads: number;
  converted: number;
  lost: number;
}> = ({ newLeads, converted, lost }) => {
  const total = newLeads + converted + lost || 1;
  const r = 44, cx = 60, cy = 60, stroke = 13;
  const circ = 2 * Math.PI * r;
  const nDash = circ * (newLeads  / total);
  const cDash = circ * (converted / total);
  const lDash = circ * (lost      / total);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <svg width={120} height={120} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth={stroke}
          strokeDasharray={`${nDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={stroke}
          strokeDasharray={`${cDash} ${circ}`} strokeDashoffset={-nDash} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={stroke}
          strokeDasharray={`${lDash} ${circ}`} strokeDashoffset={-(nDash + cDash)} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="17" fontWeight="800"
          fill="#111827" fontFamily="'DM Mono',monospace">
          {total}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8.5" fill="#9ca3af" fontWeight="600">
          Total Leads
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(
          [
            ["New Leads", newLeads,  "#6366f1"],
            ["Converted", converted, "#22c55e"],
            ["Lost",      lost,      "#ef4444"],
          ] as [string, number, string][]
        ).map(([label, val, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827",
                fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, marginTop: 1 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const BarChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const stages = ["New leads", "Contacted", "Qualified", "Proposal Sent", "Follow up"];
  const values = stages.map(s =>
    leads.filter(l => l.stage === s).reduce((acc, l) => acc + l.dealValue, 0)
  );
  const maxVal = Math.max(...values, 1);
  const labels = ["New", "Contacted", "Qualified", "Proposal", "Follow up"];
  const colors = ["#6366f1", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f97316"];

  return (
    <div style={{ position: "relative", height: 150 }}>
      {[100, 75, 50, 25, 0].map((pct, i) => (
        <div key={i} style={{
          position: "absolute", left: 32, right: 0,
          top: `${(100 - pct) * 1.1}%`,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <div style={{
            position: "absolute", left: -30, fontSize: 8, color: "#9ca3af",
            fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap",
          }}>
            {pct === 0 ? "0" : fmt(Math.round((maxVal * pct) / 100))}
          </div>
          <div style={{ width: "100%", height: 1, background: "#f1f5f9" }} />
        </div>
      ))}
      <div style={{
        position: "absolute", left: 32, right: 0, bottom: 20, top: 0,
        display: "flex", alignItems: "flex-end", justifyContent: "space-around",
      }}>
        {values.map((val, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4, flex: 1,
          }}>
            <div style={{
              width: "55%", maxWidth: 24,
              height: `${(val / maxVal) * 100}%`, minHeight: 4,
              background: colors[i], borderRadius: "4px 4px 0 0",
              transition: "height 0.6s ease",
            }} />
            <div style={{
              fontSize: 8, color: "#9ca3af", whiteSpace: "nowrap",
              textOverflow: "ellipsis", overflow: "hidden",
              maxWidth: 52, textAlign: "center",
            }}>{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Area Chart ────────────────────────────────────────────────────────────────
const AreaChart: React.FC<{ leads: Lead[]; hotLeads: Lead[] }> = ({ leads, hotLeads }) => {
  const sourceLeads = hotLeads.length >= 2
    ? hotLeads
    : leads.filter(l => l.stage !== "Lost");
  const sorted  = [...sourceLeads].sort((a, b) => a.dealValue - b.dealValue);
  const rawPts  = sorted.length >= 2 ? sorted : [
    { dealValue: 0 }, { dealValue: 10000 },
    { dealValue: 50000 }, { dealValue: 80000 }, { dealValue: 120000 },
  ] as any[];

  const W = 280, H = 110;
  const maxV = Math.max(...rawPts.map((p: any) => p.dealValue), 1);
  const step  = W / Math.max(rawPts.length - 1, 1);
  const pts   = rawPts.map((p: any, i: number) =>
    [i * step, H - (p.dealValue / maxV) * H] as [number, number]
  );

  const pathD = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    return `${acc} C${px + step / 3},${py} ${x - step / 3},${y} ${x},${y}`;
  }, "");

  const areaD  = pathD + ` L${W},${H} L0,${H} Z`;
  const maxDeal = rawPts.reduce(
    (m: any, p: any) => p.dealValue > m.dealValue ? p : m, rawPts[0]
  );
  const peakIdx = rawPts.findIndex((p: any) => p.dealValue === maxDeal?.dealValue);
  const peakX   = peakIdx >= 0 ? peakIdx * step : W * 0.7;
  const peakY   = maxDeal ? H - (maxDeal.dealValue / maxV) * H : H * 0.3;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#revGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      {maxDeal?.dealValue > 0 && (
        <>
          <rect x={Math.min(peakX - 26, W - 58)} y={peakY - 24}
            width={58} height={18} rx={5} fill="#f59e0b" />
          <text x={Math.min(peakX - 26, W - 58) + 29} y={peakY - 11}
            textAnchor="middle" fontSize="8" fill="white"
            fontFamily="'DM Mono',monospace" fontWeight="700">
            {fmt(maxDeal.dealValue)}
          </text>
          <circle cx={peakX} cy={peakY} r={3} fill="#6366f1" />
        </>
      )}
      {rawPts.slice(0, 5).map((_: any, i: number) => (
        <text key={i}
          x={i * (W / Math.min(rawPts.length - 1, 4))}
          y={H + 15} textAnchor="middle" fontSize="8" fill="#9ca3af">
          {`Deal ${i + 1}`}
        </text>
      ))}
    </svg>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC<DashboardProps> = ({ leads, onNavigate, onRefresh }) => {
  const [tableFilter, setTableFilter] = useState<"All" | "Won" | "Active" | "Lost">("All");
  const [refreshing, setRefreshing] = useState(false);

  // ← Fetch fresh AI-scored data every time Dashboard mounts
  useEffect(() => {
    onRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // ── computed stats ──────────────────────────────────────────────────────────
  const newLeadsCount = leads.filter(l => l.stage === "New leads").length;
  const wonLeads      = leads.filter(l => l.stage === "Won");
  const lostLeads     = leads.filter(l => l.stage === "Lost");
  const hotLeads = leads.filter(l => l.aiTag === "hot" || l.aiScore >= 80);
  const activeDeals   = leads.filter(l =>
    ["Qualified", "Proposal Sent"].includes(l.stage)
  ).length;
  const followUpCount = leads.filter(l => l.stage === "Follow up").length;

  const wonRevenue       = wonLeads.reduce((s, l) => s + l.dealValue, 0);
  const predictedRevenue = hotLeads.reduce((s, l) => s + l.dealValue, 0);
  const pipelineRevenue  = leads
    .filter(l => l.stage !== "Lost")
    .reduce((s, l) => s + l.dealValue, 0);
  const displayRevenue   = wonRevenue > 0 ? wonRevenue : predictedRevenue;
  const isWonRevenue     = wonRevenue > 0;

  const conversionRate = leads.length > 0
    ? Math.round((wonLeads.length / leads.length) * 100)
    : 0;

  const topAI = [...leads].sort((a, b) => b.aiScore - a.aiScore).slice(0, 4);

  const filteredLeads =
    tableFilter === "Won"    ? leads.filter(l => l.stage === "Won")
    : tableFilter === "Active" ? leads.filter(l =>
        ["Qualified", "Proposal Sent", "Follow up"].includes(l.stage))
    : tableFilter === "Lost"   ? leads.filter(l => l.stage === "Lost")
    : leads;

  const stats = [
    { label: "Total Leads",  value: leads.length,        icon: "👥", color: "#6366f1",
      sub: `↑ ${newLeadsCount} new this week` },
    { label: "Pipeline",     value: fmt(pipelineRevenue), icon: "📋", color: "#22c55e",
      sub: `${leads.filter(l => l.stage !== "Lost" && l.stage !== "Won").length} active leads` },
    { label: "Active Deals", value: activeDeals,          icon: "🚀", color: "#f59e0b",
      sub: `↑ ${conversionRate}% win rate` },
    { label: "Follow-ups",   value: followUpCount,        icon: "🔔", color: "#0ea5e9",
      sub: "Pending actions" },
  ];

  const revenueTitle    = isWonRevenue ? "Revenue (Won Deals)" : "Predicted Revenue";
  const revenueSubtitle = isWonRevenue
  ? `↑ ${conversionRate}% conversion rate`
  : `↑ From ${hotLeads.length} high-probability lead${hotLeads.length !== 1 ? "s" : ""}`;

  const revenueBreakdownLeads = wonLeads.length > 0 ? wonLeads : hotLeads;

  return (
    <div style={{
      fontFamily: "'Sora','DM Sans',-apple-system,sans-serif",
      color: "#111827", padding: "24px 28px",
      background: "#f8fafc", minHeight: "100vh",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827",
            letterSpacing: "-0.5px", margin: "0 0 3px" }}>
            {getGreeting()}, Heamanth 👋
          </h2>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: 0, fontWeight: 500 }}>
            Here's what's happening with your sales today.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: "#fff", border: "1px solid #e8eaed",
            padding: "7px 12px", borderRadius: 8, fontSize: 11,
            fontWeight: 600, color: "#374151",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}>
            📅 {new Date().toLocaleDateString("en-US",
              { month: "short", day: "numeric", year: "numeric" })}
          </div>
          {/* ← Manual refresh button shows live sync status */}
          <button
            onClick={handleManualRefresh}
            style={{
              background: "#f0fdf4", color: "#16a34a",
              border: "1px solid #bbf7d0", padding: "7px 14px",
              borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {refreshing ? "⟳ Syncing..." : "⟳ Sync AI Data"}
          </button>
          <button
            onClick={() => onNavigate("Add Lead")}
            style={{
              background: "#1e3a5f", color: "#fff", border: "none",
              padding: "8px 16px", borderRadius: 8, fontSize: 12,
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* ── AI Data Banner (shows when hot leads exist) ── */}
      {hotLeads.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg,#1e3a5f,#2d5a9e)",
          borderRadius: 12, padding: "12px 18px", marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                {hotLeads.length} Hot Lead{hotLeads.length !== 1 ? "s" : ""} — AI Scored
              </div>
              <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 2 }}>
                Predicted revenue: {fmt(predictedRevenue)} ·{" "}
                Top: {hotLeads[0]?.name} ({hotLeads[0]?.aiScore}/100)
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("Ai insights")}
            style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)", padding: "6px 14px",
              borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            View AI Insights →
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "#fff", border: "1px solid #e8eaed",
            borderRadius: 14, padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            position: "relative", overflow: "hidden", cursor: "default",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: 3, background: s.color, borderRadius: "14px 14px 0 0",
            }} />
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${s.color}18`,
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16,
              }}>{s.icon}</div>
              <span style={{
                fontSize: 9, fontWeight: 700, color: s.color,
                background: `${s.color}15`, padding: "2px 7px",
                borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.5px",
              }}>Live</span>
            </div>
            <div style={{
              fontSize: 26, fontWeight: 800, color: "#111827",
              letterSpacing: "-1px", fontFamily: "'DM Mono',monospace", lineHeight: 1,
            }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginTop: 3 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 9, fontWeight: 500, color: "#22c55e", marginTop: 3 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14, marginBottom: 22 }}>

        {/* Donut */}
        <div style={{ background: "#fff", border: "1px solid #e8eaed",
          borderRadius: 14, padding: "18px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
              Lead Overview
            </span>
            <span style={{ fontSize: 18, color: "#9ca3af" }}>⋮</span>
          </div>
          <DonutChart
            newLeads={newLeadsCount}
            converted={wonLeads.length}
            lost={lostLeads.length}
          />
        </div>

        {/* Bar Chart */}
        <div style={{ background: "#fff", border: "1px solid #e8eaed",
          borderRadius: 14, padding: "18px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
              Deal Value by Stage
            </span>
            <span style={{ fontSize: 18, color: "#9ca3af" }}>⋮</span>
          </div>
          <BarChart leads={leads} />
        </div>

        {/* Revenue Card */}
        <div style={{ background: "#fff", border: "1px solid #e8eaed",
          borderRadius: 14, padding: "18px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
              {revenueTitle}
            </span>
            <span style={{ fontSize: 18, color: "#9ca3af" }}>⋮</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 22, fontWeight: 800, color: "#111827",
              fontFamily: "'DM Mono',monospace", letterSpacing: "-0.8px",
            }}>
              {fmt(displayRevenue)}
            </div>
            <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginTop: 2 }}>
              {revenueSubtitle}
            </div>
          </div>
          <AreaChart leads={leads} hotLeads={hotLeads} />
        </div>
      </div>

      {/* ── Bottom: Pipeline Table + AI Scores ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>

        {/* Pipeline Table */}
        <div style={{ background: "#fff", border: "1px solid #e8eaed",
          borderRadius: 14, padding: "18px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
              Lead Pipeline
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {(["All", "Won", "Active", "Lost"] as const).map(f => (
                <button key={f} onClick={() => setTableFilter(f)} style={{
                  fontSize: 9, fontWeight: 700, padding: "3px 9px",
                  borderRadius: 6, border: "1px solid #e8eaed",
                  background: tableFilter === f ? "#eef2ff" : "#fff",
                  color: tableFilter === f ? "#4f46e5" : "#9ca3af",
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                }}>{f}</button>
              ))}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                {["#", "Lead Name", "Company", "Deal Value", "Stage", "Priority", "AI Score"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: 9, fontWeight: 700,
                    color: "#9ca3af", textTransform: "uppercase",
                    letterSpacing: "0.5px", padding: "6px 8px",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.slice(0, 8).map((lead, i) => {
                const p = priorityStyle[lead.priority] ?? priorityStyle["low"];
                const tagColor =
                  lead.aiTag === "hot"  ? "#ef4444"
                  : lead.aiTag === "warm" ? "#f59e0b"
                  : lead.aiTag === "cold" ? "#3b82f6"
                  : "#9ca3af";
                return (
                  <tr key={lead.id}
                    style={{
                      borderBottom: "1px solid #f8f9fa",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget as HTMLTableRowElement).style.background = "#f8f9ff"}
                    onMouseLeave={e =>
                      (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "8px", fontSize: 10, color: "#9ca3af",
                      fontFamily: "'DM Mono',monospace" }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: avatarBg[i % 8], color: "white",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 9,
                          fontWeight: 700, flexShrink: 0,
                        }}>
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>
                          {lead.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "8px", fontSize: 10, color: "#6b7280", fontWeight: 500 }}>
                      {lead.company}
                    </td>
                    <td style={{ padding: "8px", fontSize: 11, fontWeight: 700,
                      color: "#111827", fontFamily: "'DM Mono',monospace" }}>
                      {fmt(lead.dealValue)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: stageDotColor[lead.stage] || "#9ca3af", flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>
                          {lead.stage}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px",
                        borderRadius: 5, background: p.bg, color: p.color,
                        textTransform: "uppercase", letterSpacing: "0.3px",
                      }}>
                        {lead.priority}
                      </span>
                    </td>
                    {/* ← New AI Score column */}
                    <td style={{ padding: "8px" }}>
                      {lead.aiScore > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{
                            width: 28, height: 4, background: "#e8eaed",
                            borderRadius: 99, overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%", width: `${lead.aiScore}%`,
                              background: tagColor, borderRadius: 99,
                            }} />
                          </div>
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: tagColor,
                            fontFamily: "'DM Mono',monospace",
                          }}>{lead.aiScore}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 9, color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* AI Lead Scores */}
          <div style={{ background: "#fff", border: "1px solid #e8eaed",
            borderRadius: 14, padding: "18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                AI Lead Scores
              </span>
              <span style={{
                background: "#eef2ff", color: "#4f46e5",
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              }}>Top 4</span>
            </div>
            {topAI.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topAI.map((lead, i) => {
                  const pct     = lead.aiScore;
                  const quality = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : "Fair";
                  const qColor  = pct >= 80 ? "#22c55e"   : pct >= 65 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={lead.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 9,
                      background: "#fafbfc", border: "1px solid #f1f5f9",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: avatarBg[i], color: "white",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 10,
                        fontWeight: 700, flexShrink: 0,
                      }}>
                        {lead.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: "#111827",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{lead.name}</div>
                        <div style={{ fontSize: 9, color: "#9ca3af",
                          fontWeight: 500, marginBottom: 4 }}>{lead.company}</div>
                        <div style={{
                          width: "100%", height: 3, background: "#e8eaed",
                          borderRadius: 99, overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: "linear-gradient(90deg,#6366f1,#1e3a5f)",
                            borderRadius: 99, transition: "width 0.6s ease",
                          }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 800, color: "#1e3a5f",
                          fontFamily: "'DM Mono',monospace",
                        }}>{pct}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: qColor }}>
                          {quality}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "20px 0",
              }}>
                No AI scores yet — go to AI Insights and run scoring
              </div>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div style={{
            background: "#fff", border: "1px solid #e8eaed",
            borderRadius: 14, padding: "18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flex: 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                Revenue Breakdown
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: isWonRevenue ? "#f0fdf4" : "#fff7ed",
                color: isWonRevenue ? "#16a34a" : "#ea580c",
              }}>
                {isWonRevenue ? "Closed" : "Predicted"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr",
              gap: 4, marginBottom: 6 }}>
              {["Lead", "Value"].map(h => (
                <div key={h} style={{
                  fontSize: 8, fontWeight: 700, color: "#9ca3af",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                }}>{h}</div>
              ))}
            </div>
            {revenueBreakdownLeads.slice(0, 5).map(lead => (
              <div key={lead.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr",
                gap: 4, padding: "7px 0",
                borderBottom: "1px solid #f8f9fa", alignItems: "center",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#111827",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{lead.name}</div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: isWonRevenue ? "#22c55e" : "#f59e0b",
                  fontFamily: "'DM Mono',monospace",
                }}>{fmt(lead.dealValue)}</div>
              </div>
            ))}
            {revenueBreakdownLeads.length === 0 && (
              <div style={{
                fontSize: 11, color: "#9ca3af",
                textAlign: "center", padding: "16px 0",
              }}>
                No scored leads yet — run AI scoring first
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e8eaed; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Dashboard;