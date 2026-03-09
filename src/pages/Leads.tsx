// Leads.tsx - The Leads list page
// Shows all leads in a table with search, filter, and action buttons

import React, { useState } from "react";
import { Lead, LeadSource, LeadStage } from "../types/lead";
import { deleteLead } from "../utils/storage";

interface LeadsProps {
  leads: Lead[];                        // All leads from localStorage
  onLeadsChange: (leads: Lead[]) => void; // Called when leads are updated
  onNavigate: (page: string) => void;   // For navigating to Add Lead
  onEditLead: (lead: Lead) => void;     // Called when Edit button is clicked
}

// Stage badge colors
const stageColor: Record<string, string> = {
  "New leads": "#e63946",
  Contacted: "#e67e22",
  Qualified: "#3498db",
  "Proposal Sent": "#9b59b6",
  "Follow up": "#f39c12",
  Won: "#2ecc71",
  Lost: "#95a5a6",
};

const Leads: React.FC<LeadsProps> = ({ leads, onLeadsChange, onNavigate, onEditLead }) => {
  const [searchText, setSearchText] = useState(""); // Search input value
  const [sourceFilter, setSourceFilter] = useState(""); // Source dropdown filter
  const [stageFilter, setStageFilter] = useState(""); // Stage dropdown filter

  // Handle deleting a lead
  const handleDelete = (id: string) => {
    
    // Ask user to confirm before deleting

    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead(id); // Remove from localStorage
      // Update the leads list by filtering out the deleted one
      onLeadsChange(leads.filter((l) => l.id !== id));
    }
  };

  // Filter leads based on search text, source, and stage
  const filteredLeads = leads.filter((lead) => {
    // Check if name matches search text (case-insensitive)
    const matchesSearch = lead.name.toLowerCase().includes(searchText.toLowerCase());
    // Check if source matches the selected filter (empty means show all)
    const matchesSource = sourceFilter === "" || lead.source === sourceFilter;
    // Check if stage matches the selected filter
    const matchesStage = stageFilter === "" || lead.stage === stageFilter;

    // Lead must match ALL three conditions
    return matchesSearch && matchesSource && matchesStage;
  });

  return (
    <div style={styles.container}> {/* ← Changed from just <div> to <div style={styles.container}> */}
      {/* Filter bar at the top */}
      <div style={styles.filterBar}>
        {/* Search by name */}
        <input
          type="text"
          placeholder="Search the lead name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={styles.searchInput}
        />

        {/* Source dropdown filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">Source</option>
          <option value="Meta ads">Meta ads</option>
          <option value="Google ads">Google ads</option>
          <option value="Referral">Referral</option>
          <option value="Cold call">Cold call</option>
          <option value="Website">Website</option>
          <option value="Other">Other</option>
        </select>

        {/* Stage dropdown filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">Stage</option>
          <option value="New leads">New leads</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Follow up">Follow up</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        {/* Add new lead button */}
        <button style={styles.addBtn} onClick={() => onNavigate("Add Lead")}>
          Add new lead
        </button>
      </div>

      {/* Leads Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone number</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Campaign</th>
              <th style={styles.th}>Deal Value</th>
              <th style={styles.th}>Stage</th>
              <th style={styles.th}>AI Score</th>
              <th style={styles.th}>Created Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              // Show this if no leads match the filter
              <tr>
                <td colSpan={10} style={styles.emptyMsg}>
                  No leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} style={styles.tableRow}>
                  <td style={styles.td}>{lead.name}</td>
                  <td style={styles.td}>{lead.email}</td>
                  <td style={styles.td}>{lead.phone}</td>
                  <td style={styles.td}>{lead.source}</td>
                  <td style={styles.td}>{lead.campaign}</td>
                  <td style={styles.td}>{lead.dealValue.toLocaleString()}</td>
                  {/* Stage badge with color */}
                  <td style={styles.td}>
                    <span style={{ ...styles.stageBadge, color: stageColor[lead.stage] }}>
                      {lead.stage}
                    </span>
                  </td>
                  {/* AI Score in green */}
                  <td style={styles.td}>
                    <span style={styles.aiScore}>{lead.aiScore}%</span>
                  </td>
                  <td style={styles.td}>{lead.createdDate}</td>
                  {/* Action buttons */}
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      {/* Edit button */}
                      <button
                        style={styles.editBtn}
                        onClick={() => onEditLead(lead)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {/* Delete button */}
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(lead.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
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
  container: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", // ← Added this
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    padding: "16px 24px",
    borderRadius: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#444",
    color: "white",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit", // ← Added this to use Poppins in input
  },
  filterSelect: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#444",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit", // ← Added this to use Poppins in select
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
    marginLeft: "auto",
    fontFamily: "inherit", // ← Added this to use Poppins in button
  },
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "auto",
    border: "1px solid #e5e5e5",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",   // Remove gaps between cells
    fontSize: "14px",
  },
  tableHeaderRow: {
    borderBottom: "2px solid #f0f0f0",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#333",
    whiteSpace: "nowrap",         // Prevent header text from wrapping
    fontFamily: "inherit", // ← Added this to use Poppins in table headers
  },
  tableRow: {
    borderBottom: "1px solid #f5f5f5",
  },
  td: {
    padding: "14px 16px",
    color: "#444",
    verticalAlign: "middle",
    fontFamily: "inherit", // ← Added this to use Poppins in table cells
  },
  stageBadge: {
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "inherit", // ← Added this
  },
  aiScore: {
    color: "#2ecc71",             // Green color for AI score
    fontWeight: "700",
    fontFamily: "inherit", // ← Added this
  },
  actionBtns: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    fontFamily: "inherit", // ← Added this
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    fontFamily: "inherit", // ← Added this
  },
  emptyMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
    fontSize: "15px",
    fontFamily: "inherit", // ← Added this
  },
};

export default Leads;