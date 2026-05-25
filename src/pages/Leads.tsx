// Leads.tsx — Premium CRM Leads table (no horizontal scroll)
import React, { useState, useMemo } from "react";
import { Lead } from "../types/lead";
import { deleteLead } from "../utils/storage";

interface LeadsProps {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
  onNavigate: (page: string) => void;
  onEditLead: (lead: Lead) => void;
}

const STAGE_CONFIG: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  "New leads":     { dot: "#d97706", bg: "#fef9ee", text: "#9a5308", border: "#fde68a" },
  "Contacted":     { dot: "#2563eb", bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  "Qualified":     { dot: "#16a34a", bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  "Proposal Sent": { dot: "#7c3aed", bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
  "Follow up":     { dot: "#ea580c", bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  "Won":           { dot: "#16a34a", bg: "#f0fdf4", text: "#166534", border: "#4ade80" },
  "Lost":          { dot: "#64748b", bg: "#f8fafc", text: "#475569", border: "#cbd5e1" },
};

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#f3e8ff", text: "#7c3aed" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#cffafe", text: "#164e63" },
  { bg: "#e0f2fe", text: "#0369a1" },
  { bg: "#d1fae5", text: "#065f46" },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatDealValue(value: number) {
  return "₹" + new Intl.NumberFormat("en-IN").format(value);
}

function getScoreColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

const StageBadge: React.FC<{ stage: string }> = ({ stage }) => {
  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG["New leads"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 500,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {stage}
    </span>
  );
};

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const color = getScoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e8eaee", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 11.5, color, minWidth: 28 }}>{score}%</span>
    </div>
  );
};

const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const { bg, text } = getAvatarColor(name);
  return (
    <div style={{
      width: 26, height: 26, borderRadius: "50%", background: bg, color: text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 600, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
};

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 2l3 3-8 8H3V10l8-8z" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 10a1 1 0 001 1h6a1 1 0 001-1l1-10" />
  </svg>
);
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l2.5 2.5" />
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 8h12M8 2v12" />
  </svg>
);

const Leads: React.FC<LeadsProps> = ({ leads, onLeadsChange, onNavigate, onEditLead }) => {
  const [searchText, setSearchText] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this lead? This action cannot be undone.")) {
      deleteLead(id);
      onLeadsChange(leads.filter((l) => l.id !== id));
    }
  };

  const filteredLeads = useMemo(() =>
    leads.filter((lead) => {
      const matchesSearch = lead.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesSource = !sourceFilter || lead.source === sourceFilter;
      const matchesStage = !stageFilter || lead.stage === stageFilter;
      return matchesSearch && matchesSource && matchesStage;
    }),
    [leads, searchText, sourceFilter, stageFilter]
  );

  return (
    <div style={s.root}>
      {/* Top bar */}
      <div style={s.topbar}>
        <div>
          <div style={s.pageTitle}>Leads</div>
          <div style={s.pageSub}>Track and manage your sales pipeline</div>
        </div>
        <div style={s.topbarRight}>
          <button style={s.btnSecondary}>Import</button>
          <button style={s.btnPrimary} onClick={() => onNavigate("Add Lead")}>
            <IconPlus /> Add lead
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}><IconSearch /></span>
          <input
            type="text" placeholder="Search leads..."
            value={searchText} onChange={(e) => setSearchText(e.target.value)}
            style={s.searchInput}
          />
        </div>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={s.filterSelect}>
          <option value="">All sources</option>
          {["Meta ads", "Google ads", "Referral", "Cold call", "Website", "Other"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={s.filterSelect}>
          <option value="">All stages</option>
          {Object.keys(STAGE_CONFIG).map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <div style={s.countTag}>{filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Table card — NO minWidth, columns condensed */}
      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr style={s.theadRow}>
              <th style={s.th}>Lead</th>
              <th style={s.th}>Contact</th>
              <th style={s.th}>Source</th>
              <th style={s.th}>Deal Value</th>
              <th style={s.th}>Stage</th>
              <th style={s.th}>AI Score</th>
              <th style={s.th}>Created</th>
              <th style={{ ...s.th, width: 64 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} style={s.emptyCell}>
                  <div style={s.emptyWrap}>
                    <div style={s.emptyIcon}>⌕</div>
                    <div style={s.emptyText}>No leads match your filters</div>
                    <div style={s.emptySub}>Try adjusting your search or filter criteria</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isHovered = hoveredRow === lead.id;
                return (
                  <tr
                    key={lead.id}
                    style={{ ...s.tr, background: isHovered ? "#f9fafb" : "transparent" }}
                    onMouseEnter={() => setHoveredRow(lead.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Avatar name={lead.name} />
                        <span style={{ fontWeight: 500, color: "#0f1117", fontSize: 13 }}>{lead.name}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: 12, color: "#1447cc" }}>{lead.email}</div>
                      <div style={{ fontSize: 11, color: "#9ea3b0" }}>{lead.phone}</div>
                    </td>
                    <td style={s.td}>
                      <span style={s.sourceChip}>{lead.source}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#0f1117" }}>{formatDealValue(lead.dealValue)}</span>
                    </td>
                    <td style={s.td}><StageBadge stage={lead.stage} /></td>
                    <td style={s.td}><ScoreBar score={lead.aiScore} /></td>
                    <td style={{ ...s.td, color: "#9ea3b0", fontSize: 12 }}>{lead.createdDate}</td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 2, opacity: isHovered ? 1 : 0, transition: "opacity .15s" }}>
                        <button
                          style={{
                            ...s.actBtn,
                            background: hoveredAction === `edit-${lead.id}` ? "#f1f5f9" : "transparent",
                            color: hoveredAction === `edit-${lead.id}` ? "#0f172a" : "#6b7280",
                          }}
                          title="Edit"
                          onClick={() => onEditLead(lead)}
                          onMouseEnter={() => setHoveredAction(`edit-${lead.id}`)}
                          onMouseLeave={() => setHoveredAction(null)}
                        ><IconEdit /></button>
                        <button
                          style={{
                            ...s.actBtn,
                            background: hoveredAction === `del-${lead.id}` ? "#fef2f2" : "transparent",
                            color: hoveredAction === `del-${lead.id}` ? "#dc2626" : "#6b7280",
                          }}
                          title="Delete"
                          onClick={() => handleDelete(lead.id)}
                          onMouseEnter={() => setHoveredAction(`del-${lead.id}`)}
                          onMouseLeave={() => setHoveredAction(null)}
                        ><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={s.pagination}>
          <span style={s.pagInfo}>Showing {Math.min(filteredLeads.length, 10)} of {filteredLeads.length} leads</span>
          <div style={s.pagBtns}>
            {["‹", "1", "2", "›"].map((p, i) => (
              <button key={i} style={{ ...s.pagBtn, ...(p === "1" ? s.pagBtnActive : {}) }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const s: Record<string, React.CSSProperties> = {
  root: { fontFamily: FONT, color: "#0f1117", fontSize: 14, lineHeight: "1.5" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  pageTitle: { fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px", color: "#0f1117" },
  pageSub: { fontSize: 13, color: "#6b6f7b", marginTop: 2 },
  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", fontSize: 13, fontWeight: 500, borderRadius: 6, cursor: "pointer", border: "1px solid #d1d5dd", background: "#fff", color: "#3d4049", fontFamily: FONT },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", fontSize: 13, fontWeight: 500, borderRadius: 6, cursor: "pointer", border: "1px solid #0f1117", background: "#0f1117", color: "#fff", fontFamily: FONT },
  toolbar: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" as const },
  searchWrap: { position: "relative" as const, flex: 1, maxWidth: 240, minWidth: 160 },
  searchIcon: { position: "absolute" as const, left: 9, top: "50%", transform: "translateY(-50%)", color: "#9ea3b0", display: "flex", alignItems: "center" },
  searchInput: { width: "100%", padding: "7px 9px 7px 30px", border: "1px solid #d1d5dd", borderRadius: 6, fontSize: 13, background: "#fff", color: "#0f1117", outline: "none", fontFamily: FONT, boxSizing: "border-box" as const },
  filterSelect: { padding: "7px 9px", border: "1px solid #d1d5dd", borderRadius: 6, fontSize: 13, background: "#fff", color: "#3d4049", cursor: "pointer", outline: "none", fontFamily: FONT, minWidth: 110 },
  countTag: { fontSize: 12, color: "#6b6f7b", background: "#f7f8fa", border: "1px solid #e8eaee", padding: "4px 9px", borderRadius: 6, marginLeft: "auto" },
  tableCard: { background: "#fff", border: "1px solid #e8eaee", borderRadius: 10, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13, tableLayout: "fixed" as const },
  theadRow: { borderBottom: "1px solid #e8eaee" },
  th: { padding: "9px 12px", textAlign: "left" as const, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "#9ea3b0", whiteSpace: "nowrap" as const, fontFamily: FONT },
  tr: { borderBottom: "1px solid #f1f3f7", transition: "background .12s" },
  td: { padding: "10px 12px", color: "#3d4049", verticalAlign: "middle" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, fontFamily: FONT },
  sourceChip: { display: "inline-flex", alignItems: "center", fontSize: 11.5, background: "#f7f8fa", border: "1px solid #e8eaee", borderRadius: 4, padding: "2px 6px", color: "#6b6f7b" },
  actBtn: { width: 26, height: 26, borderRadius: 5, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .12s, color .12s", fontFamily: FONT },
  emptyCell: { textAlign: "center" as const },
  emptyWrap: { padding: "48px 16px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 5 },
  emptyIcon: { fontSize: 26, color: "#d1d5dd", marginBottom: 4 },
  emptyText: { fontSize: 14, fontWeight: 500, color: "#3d4049" },
  emptySub: { fontSize: 13, color: "#9ea3b0" },
  pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderTop: "1px solid #e8eaee", fontSize: 13 },
  pagInfo: { color: "#6b6f7b" },
  pagBtns: { display: "flex", alignItems: "center", gap: 4 },
  pagBtn: { width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "1px solid #d1d5dd", background: "#fff", fontSize: 12, cursor: "pointer", color: "#3d4049", fontFamily: FONT },
  pagBtnActive: { background: "#0f1117", color: "#fff", borderColor: "#0f1117" },
};

export default Leads;