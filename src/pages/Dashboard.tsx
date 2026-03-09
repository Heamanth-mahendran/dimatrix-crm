// Dashboard.tsx - The main dashboard page
// Shows stats cards, sales pipeline, and AI lead scores

import React from "react";
import { Lead, LeadStage } from "../types/lead";

interface DashboardProps {
  leads: Lead[];                         // All leads from localStorage
  onNavigate: (page: string) => void;    // To navigate when clicking "Add new lead"
}

// The 7 stages in our sales pipeline
const pipelineStages: LeadStage[] = [
  "New leads",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Follow up",
  "Won",
  "Lost",
];

// Color for each priority label
const priorityColor: Record<string, string> = {
  High: "#e63946",
  medium: "#e67e22",
  low: "#2ecc71",
};

const Dashboard: React.FC<DashboardProps> = ({ leads, onNavigate }) => {

  // Calculate stats from the leads array
  const newLeadsCount = leads.filter((l) => l.stage === "New leads").length;
  const activeDeals = leads.filter((l) => l.stage === "Qualified" || l.stage === "Proposal Sent").length;
  const totalRevenue = leads.filter((l) => l.stage === "Won").reduce((sum, l) => sum + l.dealValue, 0);
  const wonLeads = leads.filter((l) => l.stage === "Won").length;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;
  const followUpCount = leads.filter((l) => l.stage === "Follow up").length;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div style={styles.container}>
      {/* Greeting */}
      <div style={styles.headerCompact}>
        <h2 style={styles.greeting}>{getGreeting()}, Heamanth</h2>
        <p style={styles.subText}>Here's what's happening with your sales today.</p>
      </div>

      {/* Stats Cards - Row 1 */}
      <div style={styles.statsGrid}>
        <StatCard title="New leads" value={`${newLeadsCount}+`} />
        <StatCard title="Active deals" value={activeDeals} />
        <StatCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard title="Conversion" value={`${conversionRate}%`} />
        <StatCard title="Total leads" value={leads.length} />
        <StatCard title="Follow-up" value={followUpCount} />
      </div>

      {/* Sales Pipeline Section - No scroll, row by row */}
      <div style={styles.pipelineWrapper}>
        <h3 style={styles.sectionTitleCompact}>Pipeline</h3>
        <div style={styles.pipelineRows}>
          {/* First row of pipeline stages */}
          <div style={styles.pipelineRow}>
            {pipelineStages.slice(0, 4).map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              return (
                <div key={stage} style={styles.pipelineColumnCompact}>
                  <div style={styles.stageHeader}>
                    <h4 style={styles.stageNameCompact}>{stage}</h4>
                    <span style={styles.stageCountCompact}>{stageLeads.length}</span>
                  </div>
                  <div style={styles.leadCardContainer}>
                    {stageLeads.slice(0, 1).map((lead) => (
                      <div key={lead.id} style={styles.leadCardCompact}>
                        <div style={styles.leadNameCompact}>{lead.name}</div>
                        <div style={styles.leadCompanyCompact}>{lead.company}</div>
                        <div style={styles.leadFooter}>
                          <span style={styles.leadValueCompact}>${lead.dealValue.toLocaleString()}</span>
                          <span style={{ ...styles.priorityLabelCompact, backgroundColor: priorityColor[lead.priority] + '20', color: priorityColor[lead.priority] }}>
                            {lead.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length > 1 && (
                      <div style={styles.moreIndicator}>+{stageLeads.length - 1} more</div>
                    )}
                  </div>
                  <button style={styles.addLeadBtnCompact} onClick={() => onNavigate("Add Lead")}>
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Second row of pipeline stages */}
          <div style={styles.pipelineRow}>
            {pipelineStages.slice(4, 7).map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              return (
                <div key={stage} style={styles.pipelineColumnCompact}>
                  <div style={styles.stageHeader}>
                    <h4 style={styles.stageNameCompact}>{stage}</h4>
                    <span style={styles.stageCountCompact}>{stageLeads.length}</span>
                  </div>
                  <div style={styles.leadCardContainer}>
                    {stageLeads.slice(0, 1).map((lead) => (
                      <div key={lead.id} style={styles.leadCardCompact}>
                        <div style={styles.leadNameCompact}>{lead.name}</div>
                        <div style={styles.leadCompanyCompact}>{lead.company}</div>
                        <div style={styles.leadFooter}>
                          <span style={styles.leadValueCompact}>${lead.dealValue.toLocaleString()}</span>
                          <span style={{ ...styles.priorityLabelCompact, backgroundColor: priorityColor[lead.priority] + '20', color: priorityColor[lead.priority] }}>
                            {lead.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length > 1 && (
                      <div style={styles.moreIndicator}>+{stageLeads.length - 1} more</div>
                    )}
                  </div>
                  <button style={styles.addLeadBtnCompact} onClick={() => onNavigate("Add Lead")}>
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Lead Scores Section - No scroll */}
      <div style={styles.aiWrapper}>
        <h3 style={styles.sectionTitleCompact}>AI Scores</h3>
        <div style={styles.aiScoreGrid}>
          {[...leads]
            .sort((a, b) => b.aiScore - a.aiScore)
            .slice(0, 4)
            .map((lead, index) => (
              <div key={lead.id} style={styles.aiScoreCardCompact}>
                <div style={styles.aiCardHeader}>
                  <div style={{
                    ...styles.aiAvatarCompact,
                    background: `linear-gradient(135deg, ${getAvatarColor(index)}, ${getAvatarColor(index + 1)})`
                  }}>
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={styles.aiLeadInfoCompact}>
                    <div style={styles.aiLeadNameCompact}>{lead.name}</div>
                    <div style={styles.aiLeadCompanyCompact}>{lead.company}</div>
                  </div>
                  <span style={styles.scoreBadgeCompact}>{lead.aiScore}</span>
                </div>
                <div style={styles.progressBarContainerCompact}>
                  <div style={{ ...styles.progressBar, width: `${lead.aiScore}%` }} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Helper function for avatar gradient colors
const getAvatarColor = (index: number) => {
  const colors = ['#1a2744', '#2c3e50', '#34495e', '#2c3e50'];
  return colors[index % colors.length];
};

// Reusable StatCard component
const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div style={styles.statCardCompact}>
    <div style={styles.statTitleCompact}>{title}</div>
    <div style={styles.statValueCompact}>{value}</div>
  </div>
);

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "100%",
    overflow: "hidden",
    padding: "0 16px",
  },
  headerCompact: {
    marginBottom: "16px",
  },
  greeting: {
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #111 0%, #333 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  subText: {
    color: "#666",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "8px",
    marginBottom: "24px",
  },
  statCardCompact: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #f0f0f0",
    padding: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    transition: "transform 0.2s ease",
    cursor: "pointer",
  },
  statTitleCompact: {
    fontSize: "11px",
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    marginBottom: "4px",
    whiteSpace: "nowrap",
  },
  statValueCompact: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111",
    lineHeight: 1.2,
  },
  pipelineWrapper: {
    marginBottom: "24px",
  },
  pipelineRows: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  pipelineRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  sectionTitleCompact: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#111",
    letterSpacing: "-0.01em",
  },
  pipelineColumnCompact: {
    backgroundColor: "white",
    borderRadius: "14px",
    border: "1px solid #f0f0f0",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  stageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
  },
  stageNameCompact: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  stageCountCompact: {
    backgroundColor: "#f5f5f5",
    padding: "2px 6px",
    borderRadius: "16px",
    fontSize: "10px",
    fontWeight: "600",
    color: "#666",
  },
  leadCardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minHeight: "90px",
  },
  leadCardCompact: {
    border: "1px solid #f5f5f5",
    borderRadius: "10px",
    padding: "8px",
    backgroundColor: "#fafafa",
    transition: "transform 0.2s ease",
    cursor: "pointer",
  },
  leadNameCompact: {
    fontWeight: "700",
    fontSize: "12px",
    color: "#111",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  leadCompanyCompact: {
    fontSize: "10px",
    color: "#888",
    fontWeight: "500",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  leadFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leadValueCompact: {
    fontWeight: "700",
    fontSize: "11px",
    color: "#111",
  },
  priorityLabelCompact: {
    fontSize: "9px",
    fontWeight: "600",
    padding: "2px 4px",
    borderRadius: "16px",
  },
  moreIndicator: {
    fontSize: "10px",
    color: "#888",
    textAlign: "center",
    padding: "2px",
    backgroundColor: "#f5f5f5",
    borderRadius: "6px",
  },
  addLeadBtnCompact: {
    backgroundColor: "#1a2744",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    marginTop: "2px",
    width: "100%",
    transition: "background-color 0.2s ease",
  },
  aiWrapper: {
    marginBottom: "20px",
  },
  aiScoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  aiScoreCardCompact: {
    backgroundColor: "white",
    borderRadius: "14px",
    border: "1px solid #f0f0f0",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "transform 0.2s ease",
    cursor: "pointer",
  },
  aiCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  aiAvatarCompact: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  aiLeadInfoCompact: {
    flex: 1,
    minWidth: 0,
  },
  aiLeadNameCompact: {
    fontWeight: "700",
    fontSize: "12px",
    color: "#111",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  aiLeadCompanyCompact: {
    fontSize: "10px",
    color: "#888",
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  progressBarContainerCompact: {
    width: "100%",
    height: "5px",
    backgroundColor: "#f0f0f0",
    borderRadius: "16px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#1a2744",
    borderRadius: "16px",
    transition: "width 0.3s ease",
  },
  scoreBadgeCompact: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#1a2744",
    backgroundColor: "#1a274420",
    padding: "2px 6px",
    borderRadius: "14px",
    minWidth: "30px",
    textAlign: "center" as const,
    flexShrink: 0,
  },
};

export default Dashboard;