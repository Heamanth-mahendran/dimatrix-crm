<<<<<<< HEAD
// Contacts.tsx — Premium CRM Contacts page
// Two views: card grid + list table, matching Leads.tsx design system

import React, { useState, useMemo } from "react";
import { Lead } from "../types/lead";

interface ContactsProps {
  leads: Lead[];
  onNavigate: (page: string) => void;
}

type ViewMode = "list" | "grid";

// ── Shared config ──────────────────────────────────────────────────────────────
const STAGE_CONFIG: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  "New leads":     { dot: "#d97706", bg: "#fef9ee", text: "#9a5308",  border: "#fde68a" },
  "Contacted":     { dot: "#2563eb", bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  "Qualified":     { dot: "#16a34a", bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  "Proposal Sent": { dot: "#7c3aed", bg: "#faf5ff", text: "#6b21a8",  border: "#e9d5ff" },
  "Follow up":     { dot: "#ea580c", bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  "Won":           { dot: "#16a34a", bg: "#f0fdf4", text: "#166534",  border: "#4ade80" },
  "Lost":          { dot: "#64748b", bg: "#f8fafc", text: "#475569",  border: "#cbd5e1" },
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

function formatDeal(value: number) {
  return "₹" + new Intl.NumberFormat("en-IN").format(value);
}

function getScoreColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

// ── Reusable sub-components ────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 30 }) => {
  const { bg, text } = getAvatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size === 40 ? 13 : 11, fontWeight: 700, flexShrink: 0,
      letterSpacing: "0.03em",
    }}>
      {getInitials(name)}
    </div>
  );
};

const StageBadge: React.FC<{ stage: string }> = ({ stage }) => {
  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG["New leads"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 4, fontSize: 11.5, fontWeight: 600,
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e8eaee", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}%</span>
    </div>
  );
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconSearch  = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><path d="M11 11l2.5 2.5"/></svg>;
const IconPlus    = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h12M8 2v12"/></svg>;
const IconEdit    = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-8 8H3V10l8-8z"/></svg>;
const IconUser    = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"/></svg>;
const IconDots    = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3.5" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="12.5" r="1.2"/></svg>;
const IconGrid    = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>;
const IconList    = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="2" rx="1"/><rect x="1" y="6" width="12" height="2" rx="1"/><rect x="1" y="10" width="12" height="2" rx="1"/></svg>;

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{ textAlign: "center", padding: "56px 20px" }}>
    <div style={{
      width: 40, height: 40, borderRadius: "50%", background: "#f7f8fa",
      border: "1px solid #e8eaee", display: "flex", alignItems: "center",
      justifyContent: "center", margin: "0 auto 14px", color: "#9ea3b0",
    }}>
      <IconUser />
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1d23", marginBottom: 4 }}>No contacts found</div>
    <div style={{ fontSize: 13, color: "#9ea3b0" }}>Try adjusting your search or filter criteria</div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Contacts: React.FC<ContactsProps> = ({ leads, onNavigate }) => {
  const [searchText, setSearchText] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filtered = useMemo(() =>
    leads.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchText.toLowerCase());
      const matchSource = !sourceFilter || c.source === sourceFilter;
      const matchStage  = !stageFilter  || c.stage  === stageFilter;
      return matchSearch && matchSource && matchStage;
    }),
    [leads, searchText, sourceFilter, stageFilter]
  );

  return (
    <div style={s.root}>
      {/* ── Topbar ── */}
      <div style={s.topbar}>
        <div>
          <div style={s.pageTitle}>Contacts</div>
          <div style={s.pageSub}>Manage your customer relationships</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={s.btnSecondary}>Export</button>
          <button style={s.btnPrimary} onClick={() => onNavigate("Add Lead")}>
            <IconPlus />
            Add contact
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}><IconSearch /></span>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={s.searchInput}
          />
        </div>

        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={s.select}>
          <option value="">All sources</option>
          {["Meta ads", "Google ads", "Referral", "Cold call", "Website", "Other"].map((o) =>
            <option key={o}>{o}</option>
          )}
        </select>

        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={s.select}>
          <option value="">All stages</option>
          {Object.keys(STAGE_CONFIG).map((o) => <option key={o}>{o}</option>)}
        </select>

        <span style={s.countTag}>
          {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
        </span>

        {/* View toggle */}
        <div style={s.viewToggle}>
          {(["grid", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                ...s.vtBtn,
                background: viewMode === v ? "#0f1117" : "transparent",
                color: viewMode === v ? "#fff" : "#9ea3b0",
              }}
              title={v === "grid" ? "Card view" : "List view"}
            >
              {v === "grid" ? <IconGrid /> : <IconList />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Card grid view ── */}
      {viewMode === "grid" && (
        <>
          {filtered.length === 0 ? <EmptyState /> : (
            <div style={s.cardGrid}>
              {filtered.map((c) => {
                const isHov = hoveredCard === c.id;
                return (
                  <div
                    key={c.id}
                    style={{
                      ...s.contactCard,
                      borderColor: isHov ? "#b0b7c3" : "#e8eaee",
                      boxShadow: isHov ? "0 2px 12px rgba(0,0,0,.07)" : "0 1px 2px rgba(0,0,0,.03)",
                    }}
                    onMouseEnter={() => setHoveredCard(c.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <Avatar name={c.name} size={40} />
                      <button style={{ ...s.cardMenuBtn, opacity: isHov ? 1 : 0 }}>
                        <IconDots />
                      </button>
                    </div>
                    <div style={s.cardName}>{c.name}</div>
                    <div style={s.cardCompany}>{c.company}</div>

                    <div style={{ height: 1, background: "#ebedf0", margin: "12px 0" }} />

                    <div style={s.cardRow}>
                      <span style={{ color: "#1447cc", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", fontWeight: 500 }}>{c.email}</span>
                    </div>
                    <div style={s.cardRow}>
                      <span style={{ fontSize: 12, color: "#4b5264", fontWeight: 500 }}>{c.phone}</span>
                    </div>
                    <div style={s.cardRow}>
                      <span style={{ ...s.sourceChip }}>{c.source}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #ebedf0" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f1117" }}>{formatDeal(c.dealValue)}</span>
                      <StageBadge stage={c.stage} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {filtered.length > 0 && <div style={s.pagination}>
            <span style={s.pagInfo}>Showing {Math.min(filtered.length, 12)} of {filtered.length}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "2", "›"].map((p, i) => (
                <button key={i} style={{ ...s.pagBtn, ...(p === "1" ? s.pagBtnActive : {}) }}>{p}</button>
              ))}
            </div>
          </div>}
        </>
      )}

      {/* ── List / table view ── */}
      {viewMode === "list" && (
        <div style={s.tableCard}>
          <table style={s.table}>
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "4%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "2px solid #e8eaee", background: "#f9fafb" }}>
                {["Contact", "Company", "Phone", "Source", "Deal Value", "Stage", "AI Score", "Created", ""].map((h, i) => (
                  <th key={i} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><EmptyState /></td></tr>
              ) : filtered.map((c) => {
                const isHov = hoveredRow === c.id;
                return (
                  <tr
                    key={c.id}
                    style={{ ...s.tr, background: isHov ? "#f4f6fa" : "transparent" }}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Contact */}
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar name={c.name} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "#0f1117", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                          <div style={{ color: "#1447cc", fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Company */}
                    <td style={{ ...s.td, color: "#2d3142", fontWeight: 500 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.company}</div>
                    </td>
                    {/* Phone */}
                    <td style={{ ...s.td, color: "#4b5264", fontSize: 12.5, fontWeight: 500 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.phone}</div>
                    </td>
                    {/* Source */}
                    <td style={s.td}><span style={s.sourceChip}>{c.source}</span></td>
                    {/* Deal Value */}
                    <td style={s.td}><span style={{ fontWeight: 700, color: "#0f1117", fontSize: 13 }}>{formatDeal(c.dealValue)}</span></td>
                    {/* Stage */}
                    <td style={s.td}><StageBadge stage={c.stage} /></td>
                    {/* AI Score */}
                    <td style={s.td}><ScoreBar score={c.aiScore} /></td>
                    {/* Created */}
                    <td style={{ ...s.td, color: "#6b7280", fontSize: 12, fontWeight: 500 }}>{c.createdDate}</td>
                    {/* Actions */}
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 2, opacity: isHov ? 1 : 0, transition: "opacity .15s" }}>
                        <button style={s.actBtn} title="View profile"><IconUser /></button>
                        <button style={s.actBtn} title="Edit"><IconEdit /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div style={s.pagination}>
              <span style={s.pagInfo}>Showing {Math.min(filtered.length, 10)} of {filtered.length} contacts</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["‹", "1", "2", "›"].map((p, i) => (
                  <button key={i} style={{ ...s.pagBtn, ...(p === "1" ? s.pagBtnActive : {}) }}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
=======
// Contacts.tsx - Contacts page
// Shows leads as contacts (same data, different view)
// In a real app, contacts would be a separate list

import React, { useState } from "react";
import { Lead } from "../types/lead";

interface ContactsProps {
  leads: Lead[]; // We reuse leads data as contacts for now
}

const Contacts: React.FC<ContactsProps> = ({ leads }) => {
  const [searchText, setSearchText] = useState("");

  // Filter contacts by name search
  const filteredContacts = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Filter bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search the lead name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={styles.searchInput}
        />
        <button style={styles.filterBtn}>Filters</button>
        <button style={styles.addBtn}>Add new Contact</button>
      </div>

      {/* Contacts Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone number</th>
              <th style={styles.th}>Company name</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Deal Value</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>AI Score</th>
              <th style={styles.th}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.emptyMsg}>
                  No contacts found.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} style={styles.tableRow}>
                  <td style={styles.td}>{contact.name}</td>
                  <td style={styles.td}>{contact.email}</td>
                  <td style={styles.td}>{contact.phone}</td>
                  <td style={styles.td}>{contact.company}</td>
                  <td style={styles.td}>{contact.source}</td>
                  <td style={styles.td}>{contact.dealValue.toLocaleString()}</td>
                  {/* Status badge in red (like in Figma) */}
                  <td style={styles.td}>
                    <span style={styles.statusBadge}>{contact.stage}</span>
                  </td>
                  {/* AI Score in green */}
                  <td style={styles.td}>
                    <span style={styles.aiScore}>{contact.aiScore}%</span>
                  </td>
                  <td style={styles.td}>{contact.createdDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
    </div>
  );
};

<<<<<<< HEAD
// ── Styles ─────────────────────────────────────────────────────────────────────
const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const s: Record<string, React.CSSProperties> = {
  root:        { fontFamily: FONT, color: "#0f1117", fontSize: 14, lineHeight: "1.5", width: "100%", boxSizing: "border-box" },
  topbar:      { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 },
  pageTitle:   { fontSize: 19, fontWeight: 700, letterSpacing: -0.4, color: "#0f1117" },
  pageSub:     { fontSize: 13, color: "#6b7280", marginTop: 2, fontWeight: 400 },
  btnSecondary:{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 13, fontWeight: 500, borderRadius: 6, cursor: "pointer", border: "1px solid #d1d5dd", background: "#fff", color: "#3d4049", fontFamily: FONT },
  btnPrimary:  { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "1px solid #0f1117", background: "#0f1117", color: "#fff", fontFamily: FONT },
  toolbar:     { display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" as const },
  searchWrap:  { position: "relative" as const, flex: 1, maxWidth: 260, minWidth: 160 },
  searchIcon:  { position: "absolute" as const, left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ea3b0", display: "flex", alignItems: "center" },
  searchInput: { width: "100%", padding: "7px 10px 7px 32px", border: "1px solid #d1d5dd", borderRadius: 6, fontSize: 13, background: "#fff", color: "#0f1117", outline: "none", fontFamily: FONT, boxSizing: "border-box" as const, fontWeight: 400 },
  select:      { padding: "7px 10px", border: "1px solid #d1d5dd", borderRadius: 6, fontSize: 13, background: "#fff", color: "#2d3142", cursor: "pointer", outline: "none", fontFamily: FONT, fontWeight: 500 },
  countTag:    { fontSize: 12, color: "#4b5264", background: "#f3f4f6", border: "1px solid #e3e6ea", padding: "5px 10px", borderRadius: 6, marginLeft: "auto", fontWeight: 600 },
  viewToggle:  { display: "flex", border: "1px solid #d1d5dd", borderRadius: 6, overflow: "hidden" },
  vtBtn:       { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none", transition: "all .12s", fontFamily: FONT },
  // Card grid
  cardGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 },
  contactCard: { background: "#fff", border: "1px solid #e8eaee", borderRadius: 10, padding: "18px 16px", transition: "border-color .15s, box-shadow .15s", cursor: "pointer", position: "relative" as const },
  cardMenuBtn: { width: 26, height: 26, borderRadius: 5, border: "1px solid #e8eaee", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "opacity .12s" },
  cardName:    { fontSize: 14, fontWeight: 700, color: "#0f1117", marginBottom: 2, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  cardCompany: { fontSize: 12, color: "#4b5264", fontWeight: 500, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis", marginBottom: 0 },
  cardRow:     { marginBottom: 5, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  sourceChip:  { fontSize: 11.5, background: "#f3f4f6", border: "1px solid #e3e6ea", borderRadius: 4, padding: "2px 7px", color: "#4b5264", whiteSpace: "nowrap" as const, fontWeight: 600 },
  // Table
  tableCard:   { background: "#fff", border: "1px solid #e8eaee", borderRadius: 10, overflow: "hidden", width: "100%" },
  table:       { width: "100%", borderCollapse: "collapse" as const, fontSize: 13, tableLayout: "fixed" as const },
  th:          { padding: "10px 12px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#6b7280", whiteSpace: "nowrap" as const, fontFamily: FONT, overflow: "hidden" },
  tr:          { borderBottom: "1px solid #f0f2f5", transition: "background .1s" },
  td:          { padding: "11px 12px", color: "#2d3142", verticalAlign: "middle" as const, fontFamily: FONT, overflow: "hidden" },
  actBtn:      { width: 27, height: 27, borderRadius: 5, border: "1px solid #e3e6ea", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "background .12s" },
  pagination:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #e8eaee", fontSize: 13, background: "#fafbfc" },
  pagInfo:     { color: "#6b7280", fontWeight: 500 },
  pagBtn:      { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "1px solid #d1d5dd", background: "#fff", fontSize: 12, cursor: "pointer", color: "#3d4049", fontFamily: FONT, fontWeight: 500 },
  pagBtnActive:{ background: "#0f1117", color: "#fff", borderColor: "#0f1117" },
=======
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", // ← Added Poppins font
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    padding: "16px 24px",
    borderRadius: "12px",
    marginBottom: "24px",
    fontFamily: "inherit", // ← Added
  },
  searchInput: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#444",
    color: "white",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit", // ← Added
  },
  filterBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#444",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "inherit", // ← Added
  },
  addBtn: {
    backgroundColor: "white",
    color: "#111",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
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
    fontFamily: "inherit"
  },
  tableRow: {
    borderBottom: "1px solid #f5f5f5",
    fontFamily: "inherit"
  },
  td: {
    padding: "14px 16px",
    color: "#444",
    fontFamily: "inherit"
  },
  statusBadge: {
    color: "#e63946",
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "inherit"
  },
  aiScore: {
    color: "#2ecc71",
    fontWeight: "700",
    fontFamily: "inherit"
  },
  emptyMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
    fontFamily:"inherit"
  },
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
};

export default Contacts;