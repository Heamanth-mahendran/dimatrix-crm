<<<<<<< HEAD
import React, { useState, useMemo } from "react";
=======
// Reports.tsx - Reports page
// Shows all leads and lets user download them as CSV

import React, { useState } from "react";
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
import { Lead } from "../types/lead";

interface ReportsProps {
  leads: Lead[];
}

<<<<<<< HEAD
const STAGE_TABS = ["All Leads", "New leads", "Qualified", "Negotiation", "Won", "Lost"];

const Reports: React.FC<ReportsProps> = ({ leads }) => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All Leads");
  const [sortKey, setSortKey] = useState<keyof Lead>("dealValue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const sources = ["All Sources", ...Array.from(new Set(leads.map((l) => l.source)))];

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchSearch =
          lead.name.toLowerCase().includes(searchText.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchText.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchText.toLowerCase());
        const matchTab =
          activeTab === "All Leads" ||
          lead.stage.toLowerCase() === activeTab.toLowerCase();
        const matchSource =
          sourceFilter === "All Sources" || lead.source === sourceFilter;
        return matchSearch && matchTab && matchSource;
      })
      .sort((a, b) => {
        const av = a[sortKey] as string | number;
        const bv = b[sortKey] as string | number;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [leads, searchText, activeTab, sourceFilter, sortKey, sortDir]);

  const totalDealValue = filteredLeads.reduce((s, l) => s + l.dealValue, 0);
  const avgScore = filteredLeads.length
    ? Math.round(filteredLeads.reduce((s, l) => s + l.aiScore, 0) / filteredLeads.length)
    : 0;
  const lostCount = leads.filter((l) => l.stage.toLowerCase() === "lost").length;

  const handleSort = (key: keyof Lead) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredLeads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
  };

 const handleDownload = (format: "csv" | "pdf") => {
  // Determine which leads to export
  const leadsToExport = selectedIds.size > 0 
    ? filteredLeads.filter(lead => selectedIds.has(lead.id))
    : filteredLeads;
  
  if (format === "csv") {
    const headers = ["Name", "Email", "Phone", "Company", "Source", "Deal Value", "Status", "AI Score", "Created Date"];
    const rows = leadsToExport.map((l) => [
      l.name, l.email, l.phone, l.company, l.source,
      l.dealValue, l.stage, l.aiScore, l.createdDate,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = selectedIds.size > 0 
      ? `selected_leads_${new Date().toISOString().slice(0,19)}.csv` 
      : "leads_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  } else {
    window.print();
  }
};

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors: [string, string][] = [
    ["#dbeafe", "#1d4ed8"], ["#e0e7ff", "#4338ca"], ["#d1fae5", "#065f46"],
    ["#fef3c7", "#92400e"], ["#fce7f3", "#9d174d"], ["#f3e8ff", "#6b21a8"],
    ["#fee2e2", "#991b1b"], ["#e0f2fe", "#0369a1"],
  ];

  const getAvatarColor = (name: string): [string, string] =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  const getStageStyle = (stage: string): { className: string; dotColor: string } => {
    const s = stage.toLowerCase();
    if (s.includes("new")) return { className: "stage-new", dotColor: "#3b82f6" };
    if (s.includes("qualified")) return { className: "stage-qualified", dotColor: "#10b981" };
    if (s.includes("won")) return { className: "stage-won", dotColor: "#22c55e" };
    if (s.includes("lost")) return { className: "stage-lost", dotColor: "#ef4444" };
    if (s.includes("negotiation")) return { className: "stage-negotiation", dotColor: "#f59e0b" };
    return { className: "stage-new", dotColor: "#3b82f6" };
  };

  const getScoreStyle = (score: number) => {
    if (score >= 70) return { fill: "#10b981", text: "#059669", cls: "high" };
    if (score >= 45) return { fill: "#f59e0b", text: "#d97706", cls: "mid" };
    return { fill: "#ef4444", text: "#dc2626", cls: "low" };
  };

  const getSourceStyle = (source: string): React.CSSProperties => {
    const s = source.toLowerCase();
    if (s.includes("meta") || s.includes("ads"))
      return { background: "#eff6ff", color: "#1d4ed8" };
    if (s.includes("website"))
      return { background: "#f0fdf4", color: "#15803d" };
    if (s.includes("email"))
      return { background: "#fdf4ff", color: "#7e22ce" };
    return { background: "#fff7ed", color: "#c2410c" };
  };

  const sortArrow = (key: keyof Lead) => {
    if (sortKey !== key) return <span style={styles.sortIcon}>↕</span>;
    return <span style={{ ...styles.sortIcon, color: "#1a73e8", opacity: 1 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div style={styles.page}>
      {/* ── PAGE HEADER ── */}

      <div style={styles.pageHeader}>
        <div style={styles.pageHeaderTop}>
          <div>
            <h1 style={styles.pageTitle}>Reports</h1>
            <p style={styles.pageSubtitle}>Track, analyze, and export lead performance data</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.btnGhost}>
              <ClockIcon /> Schedule
            </button>
            <button style={styles.btnPrimary} onClick={() => handleDownload("csv")}>
              <DownloadIcon /> Export CSV
            </button>
          </div>
        </div>

        {/* Stage tabs */}
        <div style={styles.stageTabs}>
          {STAGE_TABS.map((tab) => (
            <button
              key={tab}
              style={{ ...styles.stageTab, ...(activeTab === tab ? styles.stageTabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <div style={styles.summaryRow}>
        <MetricCard label="Total Leads" value={String(filteredLeads.length)} badge="+3" badgeUp color="#1a73e8" />
        <MetricCard label="Total Deal Value" value={`₹${(totalDealValue / 100000).toFixed(1)}L`} badge="+12%" badgeUp color="#059669" />
        <MetricCard label="Avg. AI Score" value={`${avgScore}%`} badge="+2pts" badgeUp color="#d97706" />
        <MetricCard label="Lost Leads" value={String(lostCount)} badge="+1" badgeUp={false} color="#dc2626" />
      </div>

      {/* ── TOOLBAR ── */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <SearchIcon style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by name, email, company..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <select
          style={styles.filterChip}
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          {sources.map((s) => <option key={s}>{s}</option>)}
        </select>

        <div style={styles.divider} />

        <button style={styles.btnSuccess} onClick={() => handleDownload("csv")}>
          <DownloadIcon /> CSV
        </button>
        <button style={styles.btnGhostSm} onClick={() => handleDownload("pdf")}>
          <DownloadIcon /> PDF
        </button>
      </div>

      {/* ── TABLE ── */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>

          <div style={styles.tableMeta}>
            <span style={styles.tableMetaLeft}>
              Showing <strong>{filteredLeads.length}</strong> leads
              {selectedIds.size > 0 && <span style={styles.selectedBadge}>{selectedIds.size} selected</span>}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={{ ...styles.th, width: 36 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleAll}
                      style={styles.checkbox}
                    />
                  </th>
                  <th style={styles.th} onClick={() => handleSort("name")}>Contact {sortArrow("name")}</th>
                  <th style={styles.th} onClick={() => handleSort("company")}>Company {sortArrow("company")}</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th} onClick={() => handleSort("dealValue")}>Deal Value {sortArrow("dealValue")}</th>
                  <th style={styles.th} onClick={() => handleSort("stage")}>Stage {sortArrow("stage")}</th>
                  <th style={styles.th} onClick={() => handleSort("aiScore")}>AI Score {sortArrow("aiScore")}</th>
                  <th style={styles.th} onClick={() => handleSort("createdDate")}>Created {sortArrow("createdDate")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.emptyCell}>
                      <div style={styles.emptyState}>
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>No leads found</p>
                        <p style={{ fontSize: 13, color: "#9ca3af" }}>Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const [bgColor, textColor] = getAvatarColor(lead.name);
                    const stage = getStageStyle(lead.stage);
                    const score = getScoreStyle(lead.aiScore);
                    const isSelected = selectedIds.has(lead.id);

                    return (
                      <tr
                        key={lead.id}
                        style={{ ...styles.tr, ...(isSelected ? styles.trSelected : {}) }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "#fafbff"; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
                      >
                        <td style={styles.td}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(lead.id)}
                            style={styles.checkbox}
                          />
                        </td>

                        {/* Contact */}
                        <td style={styles.td}>
                          <div style={styles.nameCellWrap}>
                            <div style={{ ...styles.avatar, background: bgColor, color: textColor }}>
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <div style={styles.leadName}>{lead.name}</div>
                              <div style={styles.leadEmail}>{lead.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td style={styles.td}>
                          <span style={styles.companyText}>{lead.company}</span>
                        </td>

                        {/* Source */}
                        <td style={styles.td}>
                          <span style={{ ...styles.sourceBadge, ...getSourceStyle(lead.source) }}>
                            {lead.source}
                          </span>
                        </td>

                        {/* Deal Value */}
                        <td style={styles.td}>
                          <span style={styles.dealValue}>₹{lead.dealValue.toLocaleString()}</span>
                        </td>

                        {/* Stage */}
                        <td style={styles.td}>
                          <span style={{ ...styles.stagePill, ...stageStyles[stage.className] }}>
                            <span style={{ ...styles.dot, background: stage.dotColor }} />
                            {lead.stage}
                          </span>
                        </td>

                        {/* AI Score */}
                        <td style={styles.td}>
                          <div style={styles.scoreBar}>
                            <div style={styles.scoreTrack}>
                              <div style={{ ...styles.scoreFill, width: `${lead.aiScore}%`, background: score.fill }} />
                            </div>
                            <span style={{ ...styles.scoreText, color: score.text }}>{lead.aiScore}%</span>
                          </div>
                        </td>

                        {/* Created */}
                        <td style={styles.td}>
                          <span style={styles.dateText}>{lead.createdDate}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.pagination}>
            <span style={styles.paginationInfo}>{filteredLeads.length} total records</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "2", "›"].map((p, i) => (
                <button key={i} style={{ ...styles.pgBtn, ...(p === "1" ? styles.pgBtnActive : {}) }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

        </div>
=======
const Reports: React.FC<ReportsProps> = ({ leads }) => {
  const [searchText, setSearchText] = useState("");

  // Filter leads by name
  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Download leads as a CSV file
  const handleDownload = () => {
    // CSV header row
    const headers = ["Name", "Email", "Phone", "Company", "Source", "Deal Value", "Status", "AI Score", "Created Date"];

    // Convert each lead to a CSV row
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.source,
      lead.dealValue,
      lead.stage,
      lead.aiScore,
      lead.createdDate,
    ]);

    // Join everything into a single CSV string
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    // Create a downloadable file link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads_report.csv"; // File name
    link.click(); // Trigger download
    URL.revokeObjectURL(url); // Clean up memory
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Reports</h2>
      <p style={styles.subText}>Download the leads in pdf, xsl</p>

      {/* Filter + Download bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search the lead name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={styles.searchInput}
        />
        <button style={styles.filterBtn}>Filters</button>
        <button style={styles.downloadBtn} onClick={handleDownload}>
          download
        </button>
      </div>

      {/* Reports Table */}
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
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.emptyMsg}>No leads found.</td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} style={styles.tableRow}>
                  <td style={styles.td}>{lead.name}</td>
                  <td style={styles.td}>{lead.email}</td>
                  <td style={styles.td}>{lead.phone}</td>
                  <td style={styles.td}>{lead.company}</td>
                  <td style={styles.td}>{lead.source}</td>
                  <td style={styles.td}>{lead.dealValue.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={styles.stageBadge}>{lead.stage}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.aiScore}>{lead.aiScore}%</span>
                  </td>
                  <td style={styles.td}>{lead.createdDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
      </div>
    </div>
  );
};

<<<<<<< HEAD
// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  badge: string;
  badgeUp: boolean;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, badge, badgeUp, color }) => (
  <div style={{ ...styles.metricCard, borderTopColor: color }}>
    <div style={styles.metricLabel}>{label}</div>
    <div style={styles.metricValue}>{value}</div>
    <div style={styles.metricSub}>
      <span style={{ ...styles.metricBadge, ...(badgeUp ? styles.badgeUp : styles.badgeDown) }}>
        {badgeUp ? "↑" : "↑"} {badge}
      </span>
      <span>vs last month</span>
    </div>
  </div>
);

// ─── ICON COMPONENTS ─────────────────────────────────────────────────────────

const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
    <path d="M8 2v8M5 7l3 3 3-3M2 12h12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1" />
  </svg>
);

const SearchIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
    <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L14 14" />
  </svg>
);

// ─── STAGE PILL STYLES ────────────────────────────────────────────────────────

const stageStyles: Record<string, React.CSSProperties> = {
  "stage-new": { background: "#eff6ff", color: "#1d4ed8" },
  "stage-qualified": { background: "#ecfdf5", color: "#065f46" },
  "stage-lost": { background: "#fef2f2", color: "#991b1b" },
  "stage-won": { background: "#f0fdf4", color: "#14532d" },
  "stage-negotiation": { background: "#fffbeb", color: "#92400e" },
};

// ─── STYLES ───────────────────────────────────────────────────────────────────

const FONT = "'Plus Jakarta Sans', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: FONT,
    background: "#f4f5f7",
    minHeight: "100vh",
    color: "#1a1d23",
  },
  pageHeader: {
  background: "#fff",
  borderBottom: "1px solid #e8eaed",
  padding: "20px 28px 0",   // already fine
  marginTop: 0,             // ADD THIS
 },
  pageHeaderTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1d23",
    letterSpacing: "-0.3px",
    margin: 0,
    fontFamily: FONT,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
    fontFamily: FONT,
  },
  headerActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: "transparent",
    border: "1px solid #dde1e7",
    color: "#374151",
    fontFamily: FONT,
  },
  btnGhostSm: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    background: "transparent",
    border: "1px solid #dde1e7",
    color: "#374151",
    fontFamily: FONT,
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: "#1a73e8",
    border: "none",
    color: "#fff",
    fontFamily: FONT,
  },
  btnSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    background: "#059669",
    border: "none",
    color: "#fff",
    fontFamily: FONT,
  },
  stageTabs: {
    display: "flex",
    gap: 0,
  },
  stageTab: {
    padding: "0 20px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: "#6b7280",
    cursor: "pointer",
    border: "none",
    borderBottom: "2px solid transparent",
    background: "transparent",
    fontFamily: FONT,
    whiteSpace: "nowrap",
  },
  stageTabActive: {
    color: "#1a73e8",
    borderBottomColor: "#1a73e8",
    fontWeight: 600,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    padding: "20px 28px",
  },
  metricCard: {
    background: "#fff",
    borderRadius: 10,
    padding: "16px 18px",
    border: "1px solid #e8eaed",
    borderTop: "3px solid #1a73e8",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: "#9ca3af",
    marginBottom: 6,
    fontFamily: FONT,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.5px",
    lineHeight: 1,
    fontFamily: FONT,
  },
  metricSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: FONT,
  },
  metricBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 4,
  },
  badgeUp: { background: "#d1fae5", color: "#065f46" },
  badgeDown: { background: "#fee2e2", color: "#991b1b" },
  toolbar: {
    padding: "0 28px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  searchWrap: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    color: "#9ca3af",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "9px 12px 9px 36px",
    border: "1px solid #dde1e7",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: FONT,
    background: "#fff",
    color: "#1a1d23",
    outline: "none",
  },
  filterChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 12px",
    border: "1px solid #dde1e7",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    color: "#374151",
    background: "#fff",
    cursor: "pointer",
    fontFamily: FONT,
  },
  divider: {
    width: 1,
    height: 28,
    background: "#e8eaed",
  },
  tableSection: {
    padding: "0 28px 28px",
  },
  tableContainer: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #e8eaed",
    overflow: "hidden",
  },
  tableMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid #f3f4f6",
  },
  tableMetaLeft: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
    fontFamily: FONT,
  },
  selectedBadge: {
    marginLeft: 10,
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "2px 8px",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
=======
const styles: { [key: string]: React.CSSProperties } = {
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#111",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  subText: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "24px",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    padding: "16px 24px",
    borderRadius: "12px",
    marginBottom: "24px",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  filterBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#555",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  downloadBtn: {
    backgroundColor: "white",
    color: "#111",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "auto",
    border: "1px solid #e5e5e5",
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
<<<<<<< HEAD
    fontSize: 13,
  },
  theadRow: {
    borderBottom: "1px solid #f0f1f3",
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#9ca3af",
    background: "#fafbfc",
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: "pointer",
    fontFamily: FONT,
  },
  sortIcon: {
    marginLeft: 4,
    opacity: 0.4,
    fontSize: 9,
  },
  tr: {
    borderBottom: "1px solid #f6f7f8",
    transition: "background 0.1s",
  },
  trSelected: {
    background: "#eff6ff",
  },
  td: {
    padding: "12px 14px",
    color: "#374151",
    verticalAlign: "middle",
    fontFamily: FONT,
  },
  checkbox: {
    width: 14,
    height: 14,
    cursor: "pointer",
    accentColor: "#1a73e8",
  },
  nameCellWrap: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: FONT,
  },
  leadName: {
    fontWeight: 600,
    color: "#111827",
    fontSize: 13,
    fontFamily: FONT,
  },
  leadEmail: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 1,
    fontFamily: FONT,
  },
  companyText: {
    color: "#374151",
    fontFamily: FONT,
  },
  sourceBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: FONT,
  },
  dealValue: {
    fontWeight: 600,
    color: "#111827",
    fontSize: 13,
    fontFamily: FONT,
  },
  stagePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    fontFamily: FONT,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    flexShrink: 0,
  },
  scoreBar: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  scoreTrack: {
    width: 48,
    height: 4,
    background: "#f0f1f3",
    borderRadius: 2,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 2,
  },
  scoreText: {
    fontWeight: 600,
    fontSize: 12,
    fontFamily: FONT,
  },
  dateText: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: FONT,
  },
  emptyCell: {
    padding: 0,
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    color: "#6b7280",
    fontFamily: FONT,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderTop: "1px solid #f0f1f3",
  },
  paginationInfo: {
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: FONT,
  },
  pgBtn: {
    width: 28,
    height: 28,
    border: "1px solid #e8eaed",
    borderRadius: 6,
    background: "transparent",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    fontFamily: FONT,
  },
  pgBtnActive: {
    background: "#1a73e8",
    color: "#fff",
    borderColor: "#1a73e8",
=======
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
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  tableRow: {
    borderBottom: "1px solid #f5f5f5",
  },
  td: {
    padding: "14px 16px",
    color: "#444",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  stageBadge: {
    color: "#e63946",
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  aiScore: {
    color: "#2ecc71",
    fontWeight: "700",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  emptyMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
  },
};

export default Reports;