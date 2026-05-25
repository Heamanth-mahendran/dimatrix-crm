# Dimatrix CRM — AI-Powered CRM System
### Final Year Engineering Project

---

## 🏗️ Project Architecture

```
dimatrix-crm/
├── src/                        ← React Frontend (your existing code)
│   ├── pages/
│   │   ├── AiInsights.tsx      ← ✅ UPDATED: Real AI integration
│   │   ├── Automation.tsx      ← ✅ UPDATED: Real AI follow-ups
│   │   └── ...other pages
│   ├── services/
│   │   └── api.ts              ← ✅ NEW: Frontend API service
│   └── ...
│
└── backend/                    ← ✅ NEW: FastAPI Python Backend
    ├── main.py                 ← API routes + scheduler
    ├── database.py             ← SQLite database operations
    ├── ai_service.py           ← AI brain (Ollama + Anthropic fallback)
    ├── requirements.txt        ← Python dependencies
    └── .env.example            ← Environment variables template
```

---

## 🚀 Quick Start (2 terminals)

### Terminal 1 — Start the AI Backend

```bash
# Navigate to backend
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### Terminal 2 — Start the React Frontend

```bash
# In the project root
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🤖 AI Setup (Choose One)

### Option A: Ollama (FREE, Recommended for FYP)
Runs the AI model locally on your machine — no internet required, no cost.

```bash
# Step 1: Install Ollama
# Download from: https://ollama.ai
# (Available for Windows, Mac, Linux)

# Step 2: Pull the model (one-time download ~4GB)
ollama pull llama3

# Step 3: Start Ollama (it runs in background)
ollama serve
```

That's it! The backend will automatically detect and use Ollama.

### Option B: Anthropic Claude API
Better quality but requires internet + API key.

```bash
# Get API key from: https://console.anthropic.com
# Add to backend/.env:
ANTHROPIC_API_KEY=apikey_01Rj2N8SVvo6BePZj99NhmiT
```

### Option C: No AI (Rule-Based Fallback)
If neither is available, the system uses smart rule-based scoring.
Still works for demo purposes!

---

## 🧠 AI Features Implemented

### 1. Lead Inbox — Single View
- All leads stored in SQLite database
- AI auto-scores when lead is added
- Extracts: Budget, Need, Urgency, Tag (hot/warm/cold)

### 2. Smart Lead Scoring (1–100)
- **Endpoint:** `POST /ai/analyze`
- Analyzes message tone, keywords ("urgent", "price", "need now")
- Returns: Score + Tag + Reason

### 3. AI Follow-up Generator
- **Endpoint:** `POST /ai/followup`
- Channels: WhatsApp / Email / Closing message
- Personalized based on lead data + conversation notes

### 4. Pipeline + Next Action
- **Endpoint:** `POST /ai/next-action/{lead_id}`
- Returns specific action: "Call within 2 hours", "Send portfolio"

### 5. Auto Follow-up Scheduler
- **APScheduler** runs every 30 minutes
- Checks: no reply in 24h → flags for follow-up
- Hot leads → instant notification

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | Get all leads |
| POST | `/leads` | Create lead (auto AI-scores) |
| PUT | `/leads/{id}` | Update lead |
| DELETE | `/leads/{id}` | Delete lead |
| POST | `/ai/analyze` | Analyze lead with AI |
| POST | `/ai/followup` | Generate follow-up message |
| POST | `/ai/next-action/{id}` | Get next best action |
| POST | `/ai/batch-score` | Score all leads at once |
| GET | `/ai/insights` | Dashboard AI insights |
| GET | `/automation/pending-followups` | Leads needing follow-up |
| POST | `/automation/mark-sent/{id}` | Mark follow-up as sent |

**Interactive API docs:** http://localhost:8000/docs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript |
| Backend | FastAPI (Python) |
| Database | SQLite |
| AI Model | Ollama (llama3) — Open Source |
| AI Fallback | Anthropic Claude API |
| Scheduler | APScheduler |
| HTTP Client | httpx (async) |

---

## 📊 For Your FYP Presentation

**Key talking points:**
1. **Open-source AI** — Uses llama3 via Ollama, no vendor lock-in
2. **Async architecture** — AI scoring happens in background, doesn't block UI
3. **Graceful degradation** — Falls back to rule-based if AI unavailable
4. **Real scheduler** — APScheduler checks triggers every 30 minutes
5. **RESTful API** — Clean separation of frontend and backend

**Demo flow:**
1. Add a lead with notes: "Hi, I need a website urgently, budget 50k"
2. Go to AI Insights → Select lead → Click "Analyze This Lead"
3. Watch AI score: 85/100, tag: HOT, reason: "Urgency keyword detected"
4. Click "Generate WhatsApp message" → Copy and show personalized message
5. Go to Automation → Show auto follow-up list with AI messages
