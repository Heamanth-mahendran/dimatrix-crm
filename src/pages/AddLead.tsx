<<<<<<< HEAD
// AddLead.tsx — Premium stepped form, corporate-grade design
// Matches the visual system from Leads.tsx

import React, { useState } from "react";
import { Lead, LeadSource, LeadStage, LeadPriority } from "../types/lead";
import { leadsApi } from "../services/api";

interface AddLeadProps {
  editLead?: Lead | null;
  onSave: (lead: Lead) => void;
  onCancel: () => void;
}

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { label: "Contact info",  desc: "Name, email, phone" },
  { label: "Lead details",  desc: "Source, campaign, value" },
  { label: "Qualification", desc: "Stage, priority, score" },
];

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 6l3 3 5-5" />
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 7h8M8 4l3 3-3 3" />
  </svg>
);
const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 7l4 4L12 3" />
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v4M8 11v.5" />
  </svg>
);

// ── Field component ────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <div style={s.field}>
    <label style={s.label}>
      {label}
      {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <span style={s.hint}>{hint}</span>}
  </div>
);

// ── Section heading ────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
  <div style={s.sectionLabel}>
    <span>{children}</span>
    <span style={s.sectionLine} />
  </div>
);

// ── Priority card ──────────────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: "high",   label: "High",   desc: "Urgent, time-sensitive", dot: "#dc2626", selBg: "#fef2f2", selBorder: "#dc2626" },
  { value: "medium", label: "Medium", desc: "Standard follow-up",     dot: "#d97706", selBg: "#fffbeb", selBorder: "#d97706" },
  { value: "low",    label: "Low",    desc: "No immediate action",    dot: "#16a34a", selBg: "#f0fdf4", selBorder: "#16a34a" },
];

// ── Main component ─────────────────────────────────────────────────────────────
const AddLead: React.FC<AddLeadProps> = ({ editLead, onSave, onCancel }) => {
  const [step, setStep] = useState(editLead ? 0 : 0);

  // Step 0
  const [name,    setName]    = useState(editLead?.name    || "");
  const [email,   setEmail]   = useState(editLead?.email   || "");
  const [phone,   setPhone]   = useState(editLead?.phone   || "");
  const [company, setCompany] = useState(editLead?.company || "");

  // Step 1
  const [source,    setSource]    = useState<LeadSource>(editLead?.source    || "Meta ads");
  const [campaign,  setCampaign]  = useState(editLead?.campaign  || "");
  const [dealValue, setDealValue] = useState(editLead?.dealValue?.toString() || "");
  const [stage,     setStage]     = useState<LeadStage>(editLead?.stage || "New leads");

  // Step 2
  const [priority, setPriority] = useState<LeadPriority>(editLead?.priority || "medium");
  const [aiScore,  setAiScore]  = useState(editLead?.aiScore ?? 50);

  const [error,  setError]  = useState("");
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    setError("");
    if (step === 0) {
      if (!name.trim() || !email.trim() || !phone.trim() || !company.trim()) {
        setError("Please fill in all required fields.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 1) {
      if (!dealValue || Number(dealValue) <= 0) {
        setError("Please enter a valid deal value.");
        return false;
      }
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    if (step < 2) { setStep(step + 1); return; }

    const leadData = { name, email, phone, company, source, campaign,
      dealValue: Number(dealValue), stage, priority, aiScore };

    try {
      setSaving(true);
      const saved = editLead
        ? await leadsApi.update(editLead.id, leadData)
        : await leadsApi.create(leadData);
      onSave(saved);
    } catch {
      setError("Failed to save lead. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const scoreColor = aiScore >= 80 ? { bg: "#f0fdf4", text: "#166534" }
                   : aiScore >= 60 ? { bg: "#fffbeb", text: "#92400e" }
                   :                 { bg: "#fef2f2", text: "#991b1b" };

  const inputStyle = (hasError = false): React.CSSProperties => ({
    ...s.input,
    ...(hasError ? { borderColor: "#fca5a5" } : {}),
  });

  return (
    <div style={s.shell}>
      
      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.sidebarTitle}>{editLead ? "Edit lead" : "Add new lead"}</div>
          <div style={s.sidebarSub}>Step {step + 1} of {STEPS.length}</div>
        </div>

        {STEPS.map((st, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  ...s.stepRow,
                  background: state === "active" ? "#eff3ff" : "transparent",
                  cursor: i <= step ? "pointer" : "default",
                }}
                onClick={() => i <= step && setStep(i)}
              >
                <div style={{
                  ...s.stepNum,
                  background: state === "done" ? "#0f1117" : state === "active" ? "#1a6ef5" : "#e8eaee",
                  color:      state === "pending" ? "#9ea3b0" : "#fff",
                }}>
                  {state === "done" ? <IconCheck /> : i + 1}
                </div>
                <div>
                  <div style={{
                    ...s.stepLabel,
                    color: state === "active" ? "#1447cc" : state === "pending" ? "#9ea3b0" : "#3d4049",
                  }}>
                    {st.label}
                  </div>
                  <div style={s.stepDesc}>{st.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && <div style={s.stepConnector} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Form area ── */}
      <div style={s.formArea}>
        <div style={s.formTopbar}>
          <div style={s.formHeading}>{STEPS[step].label}</div>
          <span style={s.formBadge}>Step {step + 1} of {STEPS.length}</span>
        </div>

        {/* Error banner */}
        {error && (
          <div style={s.errorBanner}>
            <IconAlert />
            {error}
          </div>
        )}

        {/* ── Step 0: Contact ── */}
        {step === 0 && (
          <>
            <div style={s.section}>
              <SectionLabel>Personal information</SectionLabel>
              <div style={s.grid2}>
                <Field label="Full name" required>
                  <input style={inputStyle(!name && !!error)} value={name}
                    onChange={e => setName(e.target.value)} placeholder="e.g. Arjun Mehta" />
                </Field>
                <Field label="Company" required>
                  <input style={inputStyle(!company && !!error)} value={company}
                    onChange={e => setCompany(e.target.value)} placeholder="e.g. Tata Digital" />
                </Field>
              </div>
            </div>
            <div style={s.section}>
              <SectionLabel>Contact details</SectionLabel>
              <div style={s.grid2}>
                <Field label="Email address" required>
                  <input style={inputStyle(!email && !!error)} type="email" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
                </Field>
                <Field label="Phone number" required>
                  <input style={inputStyle(!phone && !!error)} type="tel" value={phone}
                    onChange={e => setPhone(e.target.value)} placeholder="+91 98400 00000" />
                </Field>
              </div>
            </div>
          </>
        )}

        {/* ── Step 1: Lead details ── */}
        {step === 1 && (
          <>
            <div style={s.section}>
              <SectionLabel>Acquisition</SectionLabel>
              <div style={s.grid2}>
                <Field label="Lead source">
                  <select style={s.input} value={source} onChange={e => setSource(e.target.value as LeadSource)}>
                    {["Meta ads","Google ads","Referral","Cold call","Website","Other"].map(o =>
                      <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Campaign name">
                  <input style={s.input} value={campaign}
                    onChange={e => setCampaign(e.target.value)} placeholder="e.g. Summer Growth Q2" />
                </Field>
              </div>
            </div>
            <div style={s.section}>
              <SectionLabel>Deal information</SectionLabel>
              <div style={s.grid2}>
                <Field label="Deal value (₹)" required hint="Enter amount in Indian Rupees">
                  <input style={inputStyle(!dealValue && !!error)} type="number" value={dealValue}
                    onChange={e => setDealValue(e.target.value)} placeholder="e.g. 480000" />
                </Field>
                <Field label="Pipeline stage">
                  <select style={s.input} value={stage} onChange={e => setStage(e.target.value as LeadStage)}>
                    {["New leads","Contacted","Qualified","Proposal Sent","Follow up","Won","Lost"].map(o =>
                      <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Qualification ── */}
        {step === 2 && (
          <>
            <div style={s.section}>
              <SectionLabel>Priority level</SectionLabel>
              <div style={s.priorityGrid}>
                {PRIORITY_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    style={{
                      ...s.priorityCard,
                      ...(priority === opt.value
                        ? { background: opt.selBg, borderColor: opt.selBorder }
                        : {}),
                    }}
                    onClick={() => setPriority(opt.value as LeadPriority)}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: opt.dot, marginBottom: 6 }} />
                    <div style={s.priorityName}>{opt.label}</div>
                    <div style={s.priorityDesc}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.section}>
              <SectionLabel>AI qualification score</SectionLabel>
              <Field label="Score (0 – 100)" hint="Higher scores indicate stronger conversion likelihood">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="range" min={0} max={100} step={1} value={aiScore}
                    onChange={e => setAiScore(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "#1a6ef5" }}
                  />
                  <span style={{
                    minWidth: 42, textAlign: "center", fontSize: 12, fontWeight: 600,
                    padding: "3px 8px", borderRadius: 4,
                    background: scoreColor.bg, color: scoreColor.text,
                  }}>
                    {aiScore}
                  </span>
                </div>
              </Field>
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div style={s.footer}>
          <div style={s.footerHint}>
            {step === 2
              ? "Review before saving"
              : <span>Fields marked <span style={{ color: "#dc2626" }}>*</span> are required</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btnCancel} onClick={onCancel}>Cancel</button>
            <button
              style={{ ...s.btnSave, opacity: saving ? 0.65 : 1, cursor: saving ? "not-allowed" : "pointer" }}
              onClick={handleContinue}
              disabled={saving}
            >
              {saving ? "Saving..." : step < 2 ? "Continue" : "Save lead"}
              {!saving && (step < 2 ? <IconArrow /> : <IconSave />)}
            </button>
          </div>
=======
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
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
// ── Styles ────────────────────────────────────────────────────────────────────
const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const s: Record<string, React.CSSProperties> = {
  shell: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    minHeight: 600,
    background: "#fff",
    border: "1px solid #e8eaee",
    borderRadius: 10,
    overflow: "hidden",
    fontFamily: FONT,
  },
  sidebar: {
    background: "#fafafa",
    borderRight: "1px solid #e8eaee",
    padding: "28px 0",
  },
  sidebarHeader: {
    padding: "0 20px 20px",
    borderBottom: "1px solid #e8eaee",
    marginBottom: 8,
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f1117",
    letterSpacing: -0.1,
  },
  sidebarSub: {
    fontSize: 11.5,
    color: "#9ea3b0",
    marginTop: 2,
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 20px",
    transition: "background .12s",
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    marginTop: 1,
  },
  stepLabel: {
    fontSize: 12.5,
    fontWeight: 500,
    lineHeight: "1.3",
  },
  stepDesc: {
    fontSize: 11,
    color: "#9ea3b0",
    marginTop: 2,
  },
  stepConnector: {
    width: 1,
    height: 12,
    background: "#e8eaee",
    margin: "0 20px 0 30px",
  },
  formArea: {
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
  },
  formTopbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 18,
    borderBottom: "1px solid #e8eaee",
  },
  formHeading: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f1117",
    letterSpacing: -0.2,
  },
  formBadge: {
    fontSize: 11,
    background: "#eff3ff",
    color: "#1447cc",
    border: "1px solid #c7d7fd",
    borderRadius: 4,
    padding: "3px 8px",
    fontWeight: 500,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    padding: "10px 14px",
    fontSize: 13,
    color: "#b91c1c",
    marginBottom: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#9ea3b0",
    marginBottom: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: "#e8eaee",
    display: "block",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#3d4049",
    fontFamily: FONT,
  },
  input: {
    height: 36,
    padding: "0 11px",
    border: "1px solid #d1d5dd",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: FONT,
    color: "#0f1117",
    background: "#fff",
    outline: "none",
    width: "100%",
  },
  hint: {
    fontSize: 11,
    color: "#9ea3b0",
    fontFamily: FONT,
  },
  priorityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  },
  priorityCard: {
    border: "1px solid #d1d5dd",
    borderRadius: 6,
    padding: "10px 12px",
    cursor: "pointer",
    transition: "all .15s",
    background: "#fff",
  },
  priorityName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0f1117",
    fontFamily: FONT,
  },
  priorityDesc: {
    fontSize: 11,
    color: "#9ea3b0",
    marginTop: 1,
    fontFamily: FONT,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTop: "1px solid #e8eaee",
    marginTop: "auto",
  },
  footerHint: {
    fontSize: 12,
    color: "#9ea3b0",
    fontFamily: FONT,
  },
  btnCancel: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    border: "1px solid #d1d5dd",
    background: "#fff",
    color: "#3d4049",
    cursor: "pointer",
    fontFamily: FONT,
  },
  btnSave: {
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    border: "1px solid #0f1117",
    background: "#0f1117",
    color: "#fff",
    fontFamily: FONT,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
};

export default AddLead;
=======
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
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
