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
    </div>
  );
};

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

export default Automation;