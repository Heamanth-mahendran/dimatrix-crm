# ai_service.py - The AI Brain of Dimatrix CRM
# Uses Ollama qwen2.5:3b - lightweight, fast, perfect for FYP demo

import httpx
import json
import os
import asyncio
import re
from typing import Optional

# ─── Configuration ────────────────────────────────────────────────────────────

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

# ─── Core AI Call ─────────────────────────────────────────────────────────────

async def call_ollama(prompt: str, system: str = "") -> str:
    """Call local Ollama instance"""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(120.0, connect=10.0, read=120.0, write=10.0)
    ) as client:
        response = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 400,
                    "num_ctx": 2048
                }
            }
        )
        response.raise_for_status()
        data = response.json()

        # 🔧 FIX: Safely extract content with fallback
        message = data.get("message")
        if message is None:
            print(f"[AI ERROR] No 'message' field in Ollama response. Keys: {data.keys()}")
            raise Exception(f"Ollama returned unexpected response format: {str(data)[:200]}")
        
        content = message.get("content") if isinstance(message, dict) else None
        
        if not content:
            print(f"[AI ERROR] Empty content from Ollama. Full response: {str(data)[:300]}")
            raise Exception(f"Ollama returned empty content. Check if model '{OLLAMA_MODEL}' is loaded and working.")
        
        return content.strip()


async def call_ai(prompt: str, system: str = "") -> str:
    """Main AI call entry point"""
    return await call_ollama(prompt, system)


# ─── Lead Analysis ────────────────────────────────────────────────────────────

async def analyze_lead(lead: dict, notes: str = "") -> dict:
    """AI Lead Analysis - scores 1-100, tags hot/warm/cold"""

    prompt = f"""Analyze this sales lead. Reply with ONLY a JSON object, nothing else.

Name: {lead.get('name')} | Company: {lead.get('company')} | Source: {lead.get('source')}
Deal: Rs.{lead.get('dealValue', 0)} | Stage: {lead.get('stage')} | Priority: {lead.get('priority')}
Notes: {notes or lead.get('notes', 'None')}

JSON only, no explanation:
{{"score":75,"summary":"one line about this lead","budget":"budget insight","need":"what they need","urgency":"medium","tag":"warm","reason":"why this score in 2 sentences","next_action":"one specific action to take"}}"""

    ai_response = await call_ollama(prompt)
    print(f"[AI RAW] {ai_response[:300]}")

    parsed = parse_json_response(ai_response)

    if parsed:
        tag = str(parsed.get("tag", "warm")).lower().strip()
        if tag not in ("hot", "warm", "cold"):
            score = float(parsed.get("score", 50))
            tag = "hot" if score >= 80 else "warm" if score >= 50 else "cold"

        return {
            "score": float(parsed.get("score", 50)),
            "summary": str(parsed.get("summary", f"{lead.get('name')} from {lead.get('company')}")),
            "budget": str(parsed.get("budget", f"Rs.{lead.get('dealValue', 0)}")),
            "need": str(parsed.get("need", "Not specified")),
            "urgency": str(parsed.get("urgency", "medium")).lower(),
            "tag": tag,
            "reason": str(parsed.get("reason", "Based on lead information")),
            "next_action": str(parsed.get("next_action", "Follow up with the lead")),
        }
    else:
        raise Exception(f"JSON parse failed. Raw response: {ai_response[:200]}")


# ─── Reply Analysis & Re-scoring ──────────────────────────────────────────────

async def analyze_reply(lead: dict, reply_text: str) -> dict:
    """Analyze a client's reply message and re-score the lead accordingly."""

    prev_score = lead.get("aiScore", 50)
    prev_tag   = lead.get("aiTag", "warm")

    prompt = f"""A sales lead just replied. Analyze their reply and re-score the lead. Reply with ONLY a JSON object, nothing else.

Lead context:
  Name: {lead.get('name')} | Company: {lead.get('company')}
  Deal value: Rs.{lead.get('dealValue', 0)} | Stage: {lead.get('stage')}
  Previous AI score: {prev_score}/100 | Previous tag: {prev_tag}
  Previous notes: {lead.get('notes', 'None')}

Client reply:
\"\"\"{reply_text}\"\"\"

Scoring guide:
- Positive / interested reply  → raise score, consider "hot" if very engaged
- Neutral / asking questions   → slight raise or keep, tag "warm"
- Negative / not interested    → lower score, tag "cold"
- Asking for price / proposal  → strong raise, "hot"
- Ghosting follow-up but now replied → moderate raise

JSON only, no explanation:
{{"score":80,"tag":"hot","urgency":"high","sentiment":"positive","intent":"interested_in_proposal","summary":"one line about what the client said","reason":"why you changed the score in 2 sentences","next_action":"one specific next action to take now","status_suggestion":"Proposal Sent"}}

Valid tags: hot | warm | cold
Valid urgency: high | medium | low
Valid status_suggestion (CRM stage): New leads | Contacted | Qualified | Proposal Sent | Follow up | Won | Lost"""

    await asyncio.sleep(1)

    last_err = None
    for attempt in range(1, 4):
        try:
            ai_response = await call_ollama(prompt)
            print(f"[AI REPLY RAW] {ai_response[:300]}")
            parsed = parse_json_response(ai_response)
            if parsed:
                break
            raise Exception("JSON parse failed")
        except Exception as e:
            last_err = e
            wait = attempt * 4
            print(f"[AI] Reply analysis attempt {attempt}/3 failed: {e}. Retrying in {wait}s...")
            await asyncio.sleep(wait)
    else:
        raise Exception(f"Reply analysis failed after 3 attempts. Last error: {last_err}")

    tag = str(parsed.get("tag", prev_tag)).lower().strip()
    if tag not in ("hot", "warm", "cold"):
        score = float(parsed.get("score", prev_score))
        tag = "hot" if score >= 80 else "warm" if score >= 50 else "cold"

    urgency = str(parsed.get("urgency", "medium")).lower().strip()
    if urgency not in ("high", "medium", "low"):
        urgency = "medium"

    valid_stages = ["New leads", "Contacted", "Qualified", "Proposal Sent", "Follow up", "Won", "Lost"]
    status_suggestion = parsed.get("status_suggestion", "")
    if status_suggestion not in valid_stages:
        status_suggestion = None

    return {
        "score":             float(parsed.get("score", prev_score)),
        "tag":               tag,
        "urgency":           urgency,
        "sentiment":         str(parsed.get("sentiment", "neutral")),
        "intent":            str(parsed.get("intent", "unknown")),
        "summary":           str(parsed.get("summary", "Client replied")),
        "reason":            str(parsed.get("reason", "Score updated based on client reply")),
        "next_action":       str(parsed.get("next_action", "Follow up based on client reply")),
        "status_suggestion": status_suggestion,
        "prev_score":        prev_score,
        "prev_tag":          prev_tag,
    }


# ─── Follow-up Generator ──────────────────────────────────────────────────────

async def generate_followup(lead: dict, channel: str, context: str = "") -> str:
    """Generate a personalized follow-up message"""
    
    # 🔧 FIX: Safe notes extraction
    notes = (lead.get('notes') or '').strip()
    has_notes = bool(notes)

    styles = {
        "whatsapp": "Short WhatsApp message, 2-3 sentences max, casual and friendly tone. No formal language.",
        "email": "Professional email. Include: Subject line, greeting, 2 short paragraphs, sign-off.",
        "closing": "Urgent sales closing message. Create urgency, mention value, strong call-to-action."
    }
    style = styles.get(channel, styles["whatsapp"])
    
    # 🔧 FIX: Safe name extraction
    full_name = lead.get('name', 'there')
    first_name = full_name.split()[0] if full_name else 'there'

    prompt = f"""Write a {channel} follow-up message for this sales lead. Write ONLY the message, no explanation, no label.

Lead name: {first_name} | Company: {lead.get('company')} | Stage: {lead.get('stage')}
Deal value: Rs.{lead.get('dealValue', 0)} | AI Score: {lead.get('aiScore', 50)}/100
Previous conversation: {notes if has_notes else 'No conversation yet - this is the first outreach'}
Extra context: {context or 'Standard follow-up'}

Rules:
- Address them as {first_name}
- {'Reference their specific need from the conversation' if has_notes else 'Introduce yourself and ask about their requirements'}
- Do NOT mention budget or deal value directly
- Sound like a real human salesperson, not a bot
- Style: {style}

Write the message now:"""

    await asyncio.sleep(2)

    last_err = None
    for attempt in range(1, 4):
        try:
            result = await call_ollama(prompt)
            # 🔧 FIX: Check if result is not None/empty before returning
            if result and result.strip():
                return result.strip()
            print(f"[AI] Follow-up attempt {attempt}: Got empty result from Ollama")
            raise Exception('Empty or None response from Ollama')
        except Exception as e:
            last_err = e
            wait = attempt * 4
            print(f'[AI] Follow-up attempt {attempt}/3 failed: {e}. Retrying in {wait}s...')
            await asyncio.sleep(wait)

    # 🔧 FIX: Return a fallback message instead of raising exception
    print(f"[AI] All follow-up attempts failed. Using fallback message.")
    if channel == "whatsapp":
        return f"Hi {first_name}, hope you're doing well! I wanted to follow up on our conversation. Let me know if you have any questions!"
    elif channel == "email":
        return f"Subject: Following up\n\nHi {first_name},\n\nHope you're doing well! I wanted to follow up on our conversation. Let me know if you have any questions.\n\nBest regards"
    else:
        return f"Hi {first_name}, following up on our conversation. Let me know if you need anything."


# ─── Next Best Action ─────────────────────────────────────────────────────────

async def generate_next_action(lead: dict) -> str:
    """Generate the single best next action for a lead"""

    prompt = f"""Best next action for this sales lead? Reply ONE sentence only.

{lead.get('name')} | {lead.get('stage')} | Score:{lead.get('aiScore', 50)} | Tag:{lead.get('aiTag', 'warm')} | Rs.{lead.get('dealValue', 0)}

One sentence:"""

    try:
        ai_response = await call_ollama(prompt)
        # 🔧 FIX: Safe stripping with fallback
        if ai_response:
            return ai_response.strip().split('\n')[0].strip('"').strip("'")
        return "Follow up with the lead"
    except Exception as e:
        print(f"[AI] Next action generation failed: {e}")
        return "Review lead and schedule follow-up"


# ─── Batch Scoring ────────────────────────────────────────────────────────────

async def batch_score_leads(leads: list) -> list:
    """Score leads one by one (sequential = stable for local Ollama)"""
    updated_leads = []

    for lead in leads:
        try:
            result = await analyze_lead(lead, lead.get("notes", ""))
            lead.update({
                "aiScore": result["score"],
                "aiSummary": result["summary"],
                "aiBudget": result["budget"],
                "aiNeed": result["need"],
                "aiUrgency": result["urgency"],
                "aiTag": result["tag"],
                "aiReason": result["reason"],
                "aiNextAction": result["next_action"],
            })
            print(f"Scored {lead.get('name')}: {result['score']}/100 ({result['tag']})")
        except Exception as e:
            print(f"Error scoring {lead.get('name')}: {e}")
        updated_leads.append(lead)

    return updated_leads


# ─── AI Assistant Chat ────────────────────────────────────────────────────────

async def ai_assistant_chat(
    user_message: str,
    leads: list,
    conversation_history: list,
    searched_lead: Optional[dict] = None
) -> str:
    """
    CRM-aware AI assistant that knows all leads and can answer questions,
    predict outcomes, and give sales advice.

    Args:
        user_message: The user's question or command
        leads: All leads from the database (injected as context)
        conversation_history: Previous messages in this chat session
        searched_lead: A specific lead the user searched for (optional)
    """

    # Build a compact leads summary for the system prompt
    leads_context = _build_leads_context(leads)

    # Build focused context for a specific lead if searched
    focused_context = ""
    if searched_lead:
        focused_context = f"""
        
FOCUSED LEAD (user searched for this person):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {searched_lead.get('name')} | Company: {searched_lead.get('company')}
Email: {searched_lead.get('email')} | Phone: {searched_lead.get('phone')}
Source: {searched_lead.get('source')} | Campaign: {searched_lead.get('campaign')}
Deal Value: Rs.{searched_lead.get('dealValue', 0)} | Stage: {searched_lead.get('stage')}
Priority: {searched_lead.get('priority')} | Created: {searched_lead.get('createdDate')}
Last Follow-up: {searched_lead.get('lastFollowUp', 'Never')}
AI Score: {searched_lead.get('aiScore', 'Not scored')}/100
AI Tag: {searched_lead.get('aiTag', 'Unknown')}
AI Summary: {searched_lead.get('aiSummary', 'Not analyzed yet')}
AI Budget Insight: {searched_lead.get('aiBudget', 'N/A')}
AI Need: {searched_lead.get('aiNeed', 'N/A')}
AI Urgency: {searched_lead.get('aiUrgency', 'N/A')}
AI Reason: {searched_lead.get('aiReason', 'N/A')}
AI Next Action: {searched_lead.get('aiNextAction', 'N/A')}
Notes: {searched_lead.get('notes', 'None')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    system_prompt = f"""You are an expert AI Sales Assistant for Dimatrix CRM. You have full access to all leads data and help sales teams make smarter decisions.

Your capabilities:
- Answer questions about any lead's status, score, or history
- Predict deal outcomes and win probability
- Suggest next best actions for any lead
- Compare leads and prioritize which to follow up first
- Identify patterns across the entire pipeline
- Give concise, actionable sales advice

{focused_context}

ALL LEADS IN PIPELINE:
{leads_context}

Rules:
- Be concise and direct — you are a busy salesperson's assistant
- Use emojis sparingly but effectively (🔥 for hot leads, ❄️ for cold, etc.)
- Always back your predictions with data from the lead's score/stage/history
- If asked about a lead you don't have data on, say so clearly
- Format numbers with Rs. prefix for Indian currency
- Respond in 2-4 sentences for simple queries, up to 8 for complex analysis
- NEVER make up data — only use what's in the context above"""

    # Build conversation history for multi-turn chat
    messages_for_ollama = []
    for msg in conversation_history[-6:]:  # Last 6 messages for context window
        messages_for_ollama.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    messages_for_ollama.append({"role": "user", "content": user_message})

    # Use httpx directly for multi-turn with system prompt
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(120.0, connect=10.0, read=120.0, write=10.0)
    ) as client:
        all_messages = [{"role": "system", "content": system_prompt}] + messages_for_ollama

        response = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": all_messages,
                "stream": False,
                "options": {
                    "temperature": 0.4,
                    "num_predict": 500,
                    "num_ctx": 3072
                }
            }
        )
        response.raise_for_status()
        data = response.json()

        # 🔧 FIX: Safe content extraction with fallback
        message = data.get("message")
        if message is None:
            raise Exception("No 'message' field in Ollama response")
        
        content = message.get("content") if isinstance(message, dict) else None
        
        if not content:
            raise Exception("Ollama returned empty content for assistant chat.")
        
        return content.strip()


def _build_leads_context(leads: list) -> str:
    """Build a compact text summary of all leads for the AI context window."""
    if not leads:
        return "No leads in the system yet."

    lines = []
    for lead in leads:
        score = lead.get('aiScore', '?')
        tag = lead.get('aiTag', 'unknown')
        tag_icon = "🔥" if tag == "hot" else ("🌡️" if tag == "warm" else "❄️")
        lines.append(
            f"• {lead.get('name')} ({lead.get('company')}) | "
            f"Stage: {lead.get('stage')} | "
            f"Score: {score}/100 {tag_icon} | "
            f"Deal: Rs.{lead.get('dealValue', 0)} | "
            f"Next: {lead.get('aiNextAction', 'N/A')[:60]}"
        )
    return "\n".join(lines)


# ─── JSON Parser ──────────────────────────────────────────────────────────────

def parse_json_response(text: str) -> Optional[dict]:
    """Parse JSON from AI response - handles extra text around JSON"""
    
    # 🔧 FIX: Handle None text
    if not text:
        print("[AI] parse_json_response received None or empty text")
        return None

    try:
        return json.loads(text)
    except Exception:
        pass

    try:
        start = text.index('{')
        end = text.rindex('}') + 1
        return json.loads(text[start:end])
    except Exception:
        pass

    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass

    return None