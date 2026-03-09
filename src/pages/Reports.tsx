// Reports.tsx - Reports page
// Shows all leads and lets user download them as CSV

import React, { useState } from "react";
import { Lead } from "../types/lead";

interface ReportsProps {
  leads: Lead[];
}

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
      </div>
    </div>
  );
};

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
  },
};

export default Reports;