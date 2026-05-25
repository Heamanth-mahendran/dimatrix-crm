# main.py - Dimatrix CRM Backend
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import asyncio
import urllib.parse
from datetime import datetime, timedelta

from database import (
    init_db,
    # leads
    get_all_leads, save_lead, update_lead, delete_lead_db, get_lead_by_id,
    # tasks
    get_all_tasks, get_tasks_by_lead, get_task_by_id,
    save_task, update_task, delete_task_db,
    # followup logs
    log_followup, get_followup_logs, get_followup_log_count,
    # automation rules
    get_automation_rules, get_automation_rule_by_id,
    save_automation_rule, update_automation_rule, delete_automation_rule_db,
    # auth
    get_user_by_email, create_user, get_all_users, toggle_user_active,
)
from ai_service import (
    analyze_lead, generate_followup, generate_next_action,
    batch_score_leads, analyze_reply, ai_assistant_chat
)

app = FastAPI(title="Dimatrix CRM API", version="1.0.0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class Lead(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: str
    company: str
    source: str
    campaign: str
    dealValue: float
    stage: str
    priority: str
    aiScore: Optional[float] = 50
    createdDate: Optional[str] = None
    lastFollowUp: Optional[str] = None
    aiSummary: Optional[str] = None
    aiBudget: Optional[str] = None
    aiNeed: Optional[str] = None
    aiUrgency: Optional[str] = None
    aiTag: Optional[str] = None
    aiReason: Optional[str] = None
    aiNextAction: Optional[str] = None
    notes: Optional[str] = None

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    lead_id: Optional[str] = None
    lead_name: Optional[str] = ""
    assigned_to: Optional[str] = "Me"
    due_date: Optional[str] = ""
    priority: Optional[str] = "medium"
    status: Optional[str] = "pending"

class AnalyzeRequest(BaseModel):
    lead_id: str
    notes: Optional[str] = ""

class FollowUpRequest(BaseModel):
    lead_id: str
    channel: str = "whatsapp"
    context: Optional[str] = ""

class AutomationRuleIn(BaseModel):
    name: str
    condition_type: str
    condition_value: str
    action_type: str
    is_active: Optional[bool] = True

class LogReplyRequest(BaseModel):
    reply_text: str
    auto_update_stage: Optional[bool] = True

# ── AI Assistant Chat Models ──────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class AssistantChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    # Optional: if the user searched for a specific lead, pass its ID
    # so the assistant can give focused context about that lead
    focused_lead_id: Optional[str] = None

# ─── Date Helpers ─────────────────────────────────────────────────────────────

def safe_parse_date(date_str) -> Optional[datetime]:
    if not date_str:
        return None
    INVALID = {"string", "never", "unknown", "none", "null", ""}
    if str(date_str).strip().lower() in INVALID:
        return None
    for fmt in ("%d-%m-%Y", "%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(str(date_str).strip(), fmt)
        except ValueError:
            continue
    return None

def days_since(date_str) -> int:
    parsed = safe_parse_date(date_str)
    return (datetime.now() - parsed).days if parsed else 0

def build_whatsapp_url(phone: str, message: str) -> str:
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    if cleaned.startswith("0"):
        cleaned = "91" + cleaned[1:]
    elif cleaned.startswith("+"):
        cleaned = cleaned[1:]
    return f"https://wa.me/{cleaned}?text={urllib.parse.quote(message)}"

# ─── Startup / Shutdown ───────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    init_db()
    print("✅ Dimatrix CRM Backend started")
    print("📊 Database initialized (leads + tasks + followup_logs + automation_rules)")
    print("🤖 AI Engine: Ollama gemma2:2b")
    print("💬 AI Assistant: Enabled with full pipeline context")
    print("⚡ Automation: Manual trigger only")

@app.on_event("shutdown")
async def shutdown():
    pass

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "running", "app": "Dimatrix CRM", "version": "1.0.0", "ai": "gemma2:2b"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ═══════════════════════════════════════════════════════════════════════════════
# LEADS CRUD
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/leads")
def get_leads():
    leads = get_all_leads()
    return {"leads": leads, "count": len(leads)}

@app.get("/leads/{lead_id}")
def get_lead(lead_id: str):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.post("/leads")
async def create_lead(lead: Lead, background_tasks: BackgroundTasks):
    if not lead.id:
        lead.id = str(uuid.uuid4())
    if not lead.createdDate:
        lead.createdDate = datetime.now().strftime("%d-%m-%Y")
    saved = save_lead(lead.dict())
    background_tasks.add_task(auto_score_lead, lead.id, lead.notes or "")
    return {"success": True, "lead": saved, "message": "Lead saved. AI scoring in progress..."}

@app.put("/leads/{lead_id}")
async def update_lead_endpoint(lead_id: str, lead: Lead, background_tasks: BackgroundTasks):
    if not get_lead_by_id(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.id = lead_id
    updated = update_lead(lead.dict())
    if lead.notes:
        background_tasks.add_task(auto_score_lead, lead_id, lead.notes)
    return {"success": True, "lead": updated}

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: str):
    if not get_lead_by_id(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
    delete_lead_db(lead_id)
    return {"success": True, "message": f"Lead {lead_id} deleted"}

@app.put("/leads/{lead_id}/stage")
async def update_stage(lead_id: str, body: dict):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    valid_stages = ["New leads", "Contacted", "Qualified", "Proposal Sent", "Follow up", "Won", "Lost"]
    new_stage = body.get("stage")
    if new_stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Use: {valid_stages}")
    lead["stage"] = new_stage
    update_lead(lead)
    return {"success": True, "lead_id": lead_id, "new_stage": new_stage}

# ─── Lead Search ──────────────────────────────────────────────────────────────

@app.get("/leads/search/{query}")
def search_leads(query: str):
    """
    Search leads by name, company, email, or phone.
    Used by the AI Assistant to find leads when user types in the search bar.
    Returns matching leads with their full AI data.
    """
    leads = get_all_leads()
    q = query.lower().strip()
    matches = [
        lead for lead in leads
        if q in (lead.get("name") or "").lower()
        or q in (lead.get("company") or "").lower()
        or q in (lead.get("email") or "").lower()
        or q in (lead.get("phone") or "")
    ]
    return {"leads": matches, "count": len(matches), "query": query}


# ═══════════════════════════════════════════════════════════════════════════════
# AI ASSISTANT CHAT  ← NEW
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/ai/assistant/chat")
async def assistant_chat(request: AssistantChatRequest):
    """
    AI Assistant chat endpoint.
    - Loads all leads as context so AI knows the full pipeline
    - Optionally focuses on a specific lead if focused_lead_id is provided
    - Maintains multi-turn conversation via conversation_history
    - Returns the AI's response + the updated conversation history
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Load all leads for context
    leads = get_all_leads()

    # Find focused lead if requested
    focused_lead = None
    if request.focused_lead_id:
        focused_lead = get_lead_by_id(request.focused_lead_id)

    # Build conversation history as plain dicts
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in request.conversation_history
    ]

    print(f"💬 AI Assistant query: '{request.message[:80]}' | leads_context={len(leads)} | focused={focused_lead.get('name') if focused_lead else 'None'}")

    try:
        response_text = await ai_assistant_chat(
            user_message=request.message,
            leads=leads,
            conversation_history=history,
            searched_lead=focused_lead,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI Assistant failed: {str(e)}. Is Ollama running with gemma2:2b?"
        )

    # Build updated history to return to frontend
    updated_history = history + [
        {"role": "user",      "content": request.message},
        {"role": "assistant", "content": response_text},
    ]

    return {
        "success":              True,
        "response":             response_text,
        "conversation_history": updated_history,
        "focused_lead":         focused_lead,
    }


@app.get("/ai/assistant/lead-snapshot/{lead_id}")
async def lead_snapshot(lead_id: str):
    """
    Get a quick AI-generated snapshot for a lead to show in the
    AI Assistant when a user clicks on a lead from search results.
    Uses existing AI data — no new Ollama call needed.
    """
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    score = lead.get("aiScore", 0)
    tag = lead.get("aiTag", "unknown")

    # Win probability heuristic based on score + stage
    stage_weights = {
        "New leads": 0.5, "Contacted": 0.65, "Qualified": 0.75,
        "Proposal Sent": 0.85, "Follow up": 0.7, "Won": 1.0, "Lost": 0.0
    }
    stage_w = stage_weights.get(lead.get("stage", "New leads"), 0.6)
    win_prob = round((score / 100) * stage_w * 100, 1)

    return {
        "lead": lead,
        "snapshot": {
            "win_probability":  win_prob,
            "score":            score,
            "tag":              tag,
            "urgency":          lead.get("aiUrgency", "medium"),
            "summary":          lead.get("aiSummary", "No AI analysis yet — run Analyze Lead first."),
            "next_action":      lead.get("aiNextAction", "Analyze this lead to get AI recommendations."),
            "reason":           lead.get("aiReason", ""),
            "budget_insight":   lead.get("aiBudget", ""),
            "need":             lead.get("aiNeed", ""),
        }
    }


# ═══════════════════════════════════════════════════════════════════════════════
# LOG CLIENT REPLY
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/leads/{lead_id}/log-reply")
async def log_client_reply(
    lead_id: str,
    request: LogReplyRequest,
    background_tasks: BackgroundTasks,
):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    reply_text = request.reply_text.strip()
    if not reply_text:
        raise HTTPException(status_code=400, detail="reply_text cannot be empty")

    timestamp   = datetime.now().strftime("%d-%m-%Y %H:%M")
    reply_entry = f"\n[Client reply {timestamp}]: {reply_text}"
    existing_notes = lead.get("notes") or ""
    lead["notes"] = (existing_notes + reply_entry).strip()
    lead["lastFollowUp"] = datetime.now().strftime("%d-%m-%Y")

    update_lead(lead)
    print(f"💬 Reply logged for {lead['name']} — queuing AI re-score...")

    try:
        log_followup(
            lead_id=lead_id,
            lead_name=lead.get("name", ""),
            channel="reply",
            message=reply_text,
            whatsapp_url=None,
        )
    except Exception as e:
        print(f"⚠️ followup_log insert failed: {e}")

    background_tasks.add_task(
        _rescore_after_reply,
        lead_id,
        reply_text,
        request.auto_update_stage,
    )

    return {
        "success":  True,
        "message":  f"Reply logged for {lead['name']}. AI is re-scoring in the background.",
        "lead_id":  lead_id,
        "hint":     "Poll GET /leads/{lead_id} after ~8s to get the updated score.",
    }


async def _rescore_after_reply(lead_id: str, reply_text: str, auto_update_stage: bool):
    await asyncio.sleep(3)

    lead = get_lead_by_id(lead_id)
    if not lead:
        print(f"❌ Re-score skipped — lead {lead_id} not found")
        return

    try:
        result = await analyze_reply(lead, reply_text)

        prev_score = result["prev_score"]
        new_score  = result["score"]
        direction  = "▲" if new_score > prev_score else ("▼" if new_score < prev_score else "→")

        lead.update({
            "aiScore":      new_score,
            "aiTag":        result["tag"],
            "aiUrgency":    result["urgency"],
            "aiNextAction": result["next_action"],
            "aiReason":     result["reason"],
            "aiSummary":    result["summary"],
        })

        if auto_update_stage and result.get("status_suggestion"):
            suggested = result["status_suggestion"]
            current   = lead.get("stage", "")
            stage_order = ["New leads", "Contacted", "Qualified", "Proposal Sent", "Follow up", "Won", "Lost"]
            try:
                if stage_order.index(suggested) > stage_order.index(current):
                    lead["stage"] = suggested
                    print(f"📈 Stage auto-updated: {current} → {suggested} for {lead['name']}")
            except ValueError:
                pass

        update_lead(lead)
        print(
            f"✅ Re-scored {lead['name']} after reply: "
            f"{prev_score} {direction} {new_score} ({result['tag']}) | "
            f"sentiment={result['sentiment']} intent={result['intent']}"
        )

    except Exception as e:
        print(f"❌ Re-score failed for {lead_id}: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# TASKS CRUD
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/tasks")
def get_tasks(lead_id: Optional[str] = None):
    if lead_id:
        tasks = get_tasks_by_lead(lead_id)
    else:
        tasks = get_all_tasks()
    return {"tasks": tasks, "count": len(tasks)}

@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    task = get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/tasks")
def create_task(task: Task):
    if not task.id:
        task.id = str(uuid.uuid4())
    if task.lead_id and not task.lead_name:
        lead = get_lead_by_id(task.lead_id)
        if lead:
            task.lead_name = lead.get("name", "")
    saved = save_task(task.dict())
    print(f"📋 Task created: '{task.title}' (id={task.id})")
    return {"success": True, "task": saved}

@app.put("/tasks/{task_id}")
def update_task_endpoint(task_id: str, task: Task):
    if not get_task_by_id(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    task.id = task_id
    updated = update_task(task.dict())
    return {"success": True, "task": updated}

@app.patch("/tasks/{task_id}/status")
def update_task_status(task_id: str, body: dict):
    task = get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    valid_statuses = ["pending", "in_progress", "done"]
    new_status = body.get("status")
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use: {valid_statuses}")
    task["status"] = new_status
    updated = update_task(task)
    print(f"📋 Task '{task['title']}' → {new_status}")
    return {"success": True, "task": updated}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    if not get_task_by_id(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    delete_task_db(task_id)
    return {"success": True, "message": f"Task {task_id} deleted"}

# ═══════════════════════════════════════════════════════════════════════════════
# AI ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/ai/analyze")
async def ai_analyze(request: AnalyzeRequest):
    lead = get_lead_by_id(request.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    print(f"🔍 Analyzing lead: {lead['name']}")
    try:
        result = await analyze_lead(lead, request.notes)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI failed: {str(e)}. Is Ollama running with gemma2:2b?")

    lead.update({
        "aiScore":     result["score"],
        "aiSummary":   result["summary"],
        "aiBudget":    result["budget"],
        "aiNeed":      result["need"],
        "aiUrgency":   result["urgency"],
        "aiTag":       result["tag"],
        "aiReason":    result["reason"],
        "aiNextAction":result["next_action"],
        "notes":       request.notes if request.notes else lead.get("notes", "")
    })
    update_lead(lead)
    return {"success": True, "lead_id": request.lead_id, "analysis": result}


@app.post("/ai/followup")
async def ai_generate_followup(request: FollowUpRequest):
    lead = get_lead_by_id(request.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    print(f"✍️ Generating {request.channel} follow-up for: {lead['name']}")
    try:
        message = await generate_followup(lead, request.channel, request.context)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Follow-up failed: {str(e)}")

    whatsapp_url = None
    if request.channel == "whatsapp":
        phone = lead.get("phone", "")
        if phone:
            whatsapp_url = build_whatsapp_url(phone, message)
            print(f"📲 WhatsApp URL generated for {lead['name']}")

    log_followup(
        lead_id=request.lead_id,
        lead_name=lead.get("name", ""),
        channel=request.channel,
        message=message,
        whatsapp_url=whatsapp_url,
    )
    print(f"💾 Follow-up logged to DB for {lead['name']} via {request.channel}")

    return {
        "success":      True,
        "lead_id":      request.lead_id,
        "channel":      request.channel,
        "message":      message,
        "whatsapp_url": whatsapp_url,
    }


@app.post("/ai/next-action/{lead_id}")
async def ai_next_action(lead_id: str):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    try:
        action = await generate_next_action(lead)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Next action failed: {str(e)}")
    lead["aiNextAction"] = action
    update_lead(lead)
    return {"success": True, "lead_id": lead_id, "next_action": action}


@app.post("/ai/batch-score")
async def ai_batch_score():
    leads = get_all_leads()
    if not leads:
        return {"success": True, "message": "No leads to score", "results": []}
    print(f"🔄 Batch scoring {len(leads)} leads...")
    results = await batch_score_leads(leads)
    for l in results:
        update_lead(l)
    return {
        "success": True,
        "message": f"Scored {len(results)} leads",
        "results": [{"id": l["id"], "name": l["name"], "aiScore": l.get("aiScore"), "aiTag": l.get("aiTag")} for l in results]
    }


@app.get("/ai/insights")
async def ai_insights():
    leads = get_all_leads()
    hot  = [l for l in leads if l.get("aiTag") == "hot"  or l.get("aiScore", 0) >= 80]
    warm = [l for l in leads if l.get("aiTag") == "warm" or 50 <= l.get("aiScore", 0) < 80]
    cold = [l for l in leads if l.get("aiTag") == "cold" or l.get("aiScore", 0) < 50]
    follow_up_needed = [l for l in leads if l["stage"] in ["Follow up", "Contacted"] and not l.get("lastFollowUp")]
    return {
        "hot_leads":        len(hot),
        "warm_leads":       len(warm),
        "cold_leads":       len(cold),
        "predicted_revenue":sum(l["dealValue"] for l in hot),
        "follow_up_needed": len(follow_up_needed),
        "top_leads":        sorted(hot, key=lambda x: x.get("aiScore", 0), reverse=True)[:5]
    }

# ═══════════════════════════════════════════════════════════════════════════════
# FOLLOW-UP LOGS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/followup-logs")
def get_logs(lead_id: Optional[str] = None):
    logs = get_followup_logs(lead_id)
    return {"logs": logs, "count": len(logs)}

@app.get("/followup-logs/lead/{lead_id}")
def get_logs_for_lead(lead_id: str):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    logs = get_followup_logs(lead_id)
    return {
        "lead_id":   lead_id,
        "lead_name": lead.get("name"),
        "logs":      logs,
        "count":     len(logs)
    }

# ═══════════════════════════════════════════════════════════════════════════════
# AUTOMATION
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/automation/pending-followups")
def get_pending_followups():
    leads = get_all_leads()
    pending = []
    for lead in leads:
        if lead["stage"] in ["Won", "Lost"]:
            continue
        last_fu  = lead.get("lastFollowUp")
        fu_date  = safe_parse_date(last_fu)
        ref_date = fu_date or safe_parse_date(lead.get("createdDate"))
        days     = (datetime.now() - ref_date).days if ref_date else 0
        pending.append({
            **lead,
            "days_since_contact": days,
            "urgency": "high" if lead.get("aiTag") == "hot" else "medium",
            "followup_count": get_followup_log_count(lead["id"]),
        })
    return {"pending": pending, "count": len(pending)}


@app.post("/automation/mark-sent/{lead_id}")
def mark_followup_sent(lead_id: str):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead["lastFollowUp"] = datetime.now().strftime("%d-%m-%Y")
    update_lead(lead)
    return {"success": True, "message": f"Follow-up marked sent for {lead['name']}"}


@app.post("/automation/trigger-check")
async def manual_trigger_check():
    results = await check_followup_triggers()
    return {
        "success": True,
        "message": f"Check complete. {results['triggered']} leads need follow-up.",
        "details": results,
    }

# ═══════════════════════════════════════════════════════════════════════════════
# AUTOMATION RULES CRUD
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/automation/rules")
def get_rules():
    rules = get_automation_rules()
    return {"rules": rules, "count": len(rules)}

@app.get("/automation/rules/{rule_id}")
def get_rule(rule_id: int):
    rule = get_automation_rule_by_id(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule

@app.post("/automation/rules")
def create_rule(rule: AutomationRuleIn):
    saved = save_automation_rule(rule.dict())
    return {"success": True, "rule": saved}

@app.put("/automation/rules/{rule_id}")
def update_rule(rule_id: int, rule: AutomationRuleIn):
    if not get_automation_rule_by_id(rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    updated = update_automation_rule(rule_id, rule.dict())
    return {"success": True, "rule": updated}

@app.delete("/automation/rules/{rule_id}")
def delete_rule(rule_id: int):
    if not get_automation_rule_by_id(rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    delete_automation_rule_db(rule_id)
    return {"success": True, "message": f"Rule {rule_id} deleted"}

# ═══════════════════════════════════════════════════════════════════════════════
# BACKGROUND TASKS
# ═══════════════════════════════════════════════════════════════════════════════

async def auto_score_lead(lead_id: str, notes: str):
    await asyncio.sleep(2)
    lead = get_lead_by_id(lead_id)
    if not lead:
        return
    try:
        result = await analyze_lead(lead, notes)
        lead.update({
            "aiScore":     result["score"],
            "aiSummary":   result["summary"],
            "aiBudget":    result["budget"],
            "aiNeed":      result["need"],
            "aiUrgency":   result["urgency"],
            "aiTag":       result["tag"],
            "aiReason":    result["reason"],
            "aiNextAction":result["next_action"],
        })
        update_lead(lead)
        print(f"✅ Auto-scored {lead['name']}: {result['score']}/100 ({result['tag']})")
    except Exception as e:
        print(f"❌ Auto-score failed for {lead_id}: {e}")


async def check_followup_triggers() -> dict:
    print("⏰ Running manual follow-up check...")
    leads    = get_all_leads()
    cutoff   = datetime.now() - timedelta(hours=24)
    triggered = []
    skipped   = 0

    for lead in leads:
        if lead["stage"] in ["Won", "Lost"]:
            skipped += 1
            continue
        fu_date = safe_parse_date(lead.get("lastFollowUp"))
        if fu_date is None or fu_date < cutoff:
            print(f"🔔 {lead['name']} ({lead['company']}) needs follow-up!")
            triggered.append({
                "id":      lead["id"],
                "name":    lead["name"],
                "company": lead["company"],
                "stage":   lead["stage"],
                "aiTag":   lead.get("aiTag", "warm"),
                "phone":   lead.get("phone", ""),
            })

    print(f"⏰ Done: {len(triggered)} triggered, {skipped} skipped")
    return {"triggered": len(triggered), "skipped": skipped, "leads": triggered}

# ─── AUTH MODELS ──────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "user" or "admin"

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"

# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.post("/auth/login")
def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if user["role"] != req.role:
        raise HTTPException(status_code=403, detail=f"This account is not a {req.role} account.")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="This account has been deactivated.")
    # Update last_login
    from database import update_last_login
    update_last_login(user["id"])
    return {"email": user["email"], "role": user["role"], "name": user["name"]}

# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

@app.get("/admin/users")
def list_users():
    return get_all_users()

@app.post("/admin/users")
def add_user(req: CreateUserRequest):
    existing = get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    user = create_user(req.name, req.email, req.password, req.role)
    return user

@app.post("/admin/users/{user_id}/toggle")
def toggle_user(user_id: int):
    toggle_user_active(user_id)
    return {"ok": True}
