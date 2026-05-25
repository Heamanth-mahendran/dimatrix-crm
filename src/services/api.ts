// src/services/api.ts
const BASE_URL = "http://localhost:8000";

export interface AIAnalysis {
  score: number;
  summary: string;
  budget: string;
  need: string;
  urgency: string;
  tag: "hot" | "warm" | "cold";
  reason: string;
  next_action: string;
}

export interface AIInsights {
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  predicted_revenue: number;
  follow_up_needed: number;
  top_leads: any[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiCall(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Field Mapper ─────────────────────────────────────────────────────────────
// Backend returns snake_case, frontend needs camelCase

function mapLead(l: any) {
  return {
    id:           l.id,
    name:         l.name          ?? "",
    company:      l.company       ?? "",
    email:        l.email         ?? "",
    phone:        l.phone         ?? "",
    source:       l.source        ?? "",
    campaign:     l.campaign      ?? "",
    stage:        l.stage         ?? "New leads",
    priority:     l.priority      ?? "low",
    dealValue:    l.dealValue     ?? l.deal_value     ?? 0,
    notes:        l.notes         ?? "",
    createdDate:  l.createdDate   ?? l.created_date   ?? "",
    lastFollowUp: l.lastFollowUp  ?? l.last_follow_up ?? "",
    // ── AI fields — try camelCase first, fall back to snake_case ──
    aiScore:      l.aiScore       ?? l.ai_score       ?? 0,
    aiTag:        l.aiTag         ?? l.ai_tag         ?? "",
    aiSummary:    l.aiSummary     ?? l.ai_summary     ?? "",
    aiBudget:     l.aiBudget      ?? l.ai_budget      ?? "",
    aiNeed:       l.aiNeed        ?? l.ai_need        ?? "",
    aiUrgency:    l.aiUrgency     ?? l.ai_urgency     ?? "",
    aiReason:     l.aiReason      ?? l.ai_reason      ?? "",
    aiNextAction: l.aiNextAction  ?? l.ai_next_action ?? "",
  };
}

// ─── Leads CRUD ───────────────────────────────────────────────────────────────

export const leadsApi = {
  /** Get all leads from backend database */
  getAll: () =>
    apiCall("/leads").then((r) =>
      (r.leads ?? []).map(mapLead)
    ),

  /** Get a single lead */
  getOne: (id: string) =>
    apiCall(`/leads/${id}`).then(mapLead),

  /** Create a new lead */
  create: (lead: any) =>
    apiCall("/leads", { method: "POST", body: JSON.stringify(lead) }),

  /** Update an existing lead */
  update: (id: string, lead: any) =>
    apiCall(`/leads/${id}`, { method: "PUT", body: JSON.stringify(lead) }),

  /** Delete a lead */
  delete: (id: string) =>
    apiCall(`/leads/${id}`, { method: "DELETE" }),

  /** Move lead to a new pipeline stage */
  updateStage: (id: string, stage: string) =>
    apiCall(`/leads/${id}/stage`, {
      method: "PUT",
      body: JSON.stringify({ stage }),
    }),
};

// ─── AI Features ──────────────────────────────────────────────────────────────

export const aiApi = {
  /** 🧠 Analyze a lead with AI */
  analyze: (
    leadId: string,
    notes: string = ""
  ): Promise<{ analysis: AIAnalysis }> =>
    apiCall("/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ lead_id: leadId, notes }),
    }),

  /** 📝 Generate a follow-up message */
  generateFollowup: (
    leadId: string,
    channel: "whatsapp" | "email" | "closing",
    context: string = ""
  ): Promise<{ message: string }> =>
    apiCall("/ai/followup", {
      method: "POST",
      body: JSON.stringify({ lead_id: leadId, channel, context }),
    }),

  /** 🎯 Get the next best action for a lead */
  nextAction: (leadId: string): Promise<{ next_action: string }> =>
    apiCall(`/ai/next-action/${leadId}`, { method: "POST" }),

  /** 🚀 Batch score all leads at once */
  batchScore: () =>
    apiCall("/ai/batch-score", { method: "POST" }),

  /** 📊 Get AI insights for the dashboard */
  insights: (): Promise<AIInsights> =>
    apiCall("/ai/insights"),
};

// ─── Automation ───────────────────────────────────────────────────────────────

export const automationApi = {
  /** Get leads that need a follow-up */
  pendingFollowups: () =>
    apiCall("/automation/pending-followups"),

  /** Mark a follow-up as sent */
  markSent: (leadId: string) =>
    apiCall(`/automation/mark-sent/${leadId}`, { method: "POST" }),

  /** Manually trigger the automation check */
  triggerCheck: () =>
    apiCall("/automation/trigger-check", { method: "POST" }),
};

// ─── Health Check ─────────────────────────────────────────────────────────────

export const checkBackend = async (): Promise<boolean> => {
  try {
    await apiCall("/health");
    return true;
  } catch {
    return false;
  }
};