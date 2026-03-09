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
    </div>
  );
};

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
};

export default Contacts;