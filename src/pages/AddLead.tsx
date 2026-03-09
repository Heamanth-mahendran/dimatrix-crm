// AddLead.tsx - Form to Add a new lead OR Edit an existing lead
// If editLead prop is passed, the form fills with existing data (edit mode)
// If no editLead, the form is empty (add mode)

import React, { useState } from "react";
import { Lead, LeadSource, LeadStage, LeadPriority } from "../types/lead";
import { addLead, updateLead, generateId } from "../utils/storage";

interface AddLeadProps {
  editLead?: Lead | null;                 // If editing, this has the lead data
  onSave: (lead: Lead) => void;           // Called after saving
  onCancel: () => void;                   // Called when user clicks Cancel
}

const AddLead: React.FC<AddLeadProps> = ({ editLead, onSave, onCancel }) => {

  // Form state - if editLead exists, pre-fill the form with its values
  const [name, setName] = useState(editLead?.name || "");
  const [email, setEmail] = useState(editLead?.email || "");
  const [phone, setPhone] = useState(editLead?.phone || "");
  const [company, setCompany] = useState(editLead?.company || "");
  const [source, setSource] = useState<LeadSource>(editLead?.source || "Meta ads");
  const [campaign, setCampaign] = useState(editLead?.campaign || "");
  const [dealValue, setDealValue] = useState(editLead?.dealValue?.toString() || "");
  const [stage, setStage] = useState<LeadStage>(editLead?.stage || "New leads");
  const [priority, setPriority] = useState<LeadPriority>(editLead?.priority || "medium");
  const [aiScore, setAiScore] = useState(editLead?.aiScore?.toString() || "50");

  const [error, setError] = useState(""); // Error message to show user

  // Called when user submits the form
  const handleSubmit = () => {
    // Simple validation - check required fields are not empty
    if (!name || !email || !phone || !company || !dealValue) {
      setError("Please fill in all required fields.");
      return; // Stop here, don't save
    }

    // Build the lead object
    const lead: Lead = {
      id: editLead?.id || generateId(), // Use existing ID if editing, or generate new one
      name,
      email,
      phone,
      company,
      source,
      campaign,
      dealValue: Number(dealValue),  // Convert string to number
      stage,
      priority,
      aiScore: Number(aiScore),
      createdDate: editLead?.createdDate || new Date().toLocaleDateString("en-IN"),
    };

    if (editLead) {
      updateLead(lead); // Update existing lead in localStorage
    } else {
      addLead(lead);    // Add new lead to localStorage
    }

    onSave(lead); // Tell parent the save is done
  };

  return (
    <div>
      <h2 style={styles.title}>
        {editLead ? "Edit Lead" : "Add New Lead"}
      </h2>

      {/* Show error message if validation fails */}
      {error && <div style={styles.errorMsg}>{error}</div>}

      <div style={styles.formCard}>
        <div style={styles.formGrid}>

          {/* Name field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Name *</label>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* Email field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Phone field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              style={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>

          {/* Company field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Company *</label>
            <input
              style={styles.input}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>

          {/* Source dropdown */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Source</label>
            <select
              style={styles.input}
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
            >
              <option>Meta ads</option>
              <option>Google ads</option>
              <option>Referral</option>
              <option>Cold call</option>
              <option>Website</option>
              <option>Other</option>
            </select>
          </div>

          {/* Campaign field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Campaign</label>
            <input
              style={styles.input}
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Campaign name"
            />
          </div>

          {/* Deal Value field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Deal Value (₹) *</label>
            <input
              style={styles.input}
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="e.g. 42000"
            />
          </div>

          {/* Stage dropdown */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Stage</label>
            <select
              style={styles.input}
              value={stage}
              onChange={(e) => setStage(e.target.value as LeadStage)}
            >
              <option>New leads</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Proposal Sent</option>
              <option>Follow up</option>
              <option>Won</option>
              <option>Lost</option>
            </select>
          </div>

          {/* Priority dropdown */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Priority</label>
            <select
              style={styles.input}
              value={priority}
              onChange={(e) => setPriority(e.target.value as LeadPriority)}
            >
              <option value="High">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* AI Score field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>AI Score (0-100)</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              max="100"
              value={aiScore}
              onChange={(e) => setAiScore(e.target.value)}
              placeholder="e.g. 75"
            />
          </div>
        </div>

        {/* Form action buttons */}
        <div style={styles.buttonRow}>
          {/* Cancel button - goes back without saving */}
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          {/* Save button */}
          <button style={styles.saveBtn} onClick={handleSubmit}>
            {editLead ? "Update Lead" : "Save Lead"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#111",
  },
  errorMsg: {
    backgroundColor: "#fff0f0",
    color: "#e63946",
    border: "1px solid #e63946",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
    padding: "32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",  // Two columns
    gap: "20px",
    marginBottom: "28px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    color: "#333",
    backgroundColor: "white",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelBtn: {
    padding: "10px 28px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "#333",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  saveBtn: {
    padding: "10px 28px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1a2744",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AddLead;
