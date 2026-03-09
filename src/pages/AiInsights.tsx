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
            </div>
          </div>
        </div>

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
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

const styles: { [key: string]: any } = {
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
};

export default AiInsights;