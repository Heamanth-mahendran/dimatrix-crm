# database.py - Dimatrix CRM Database Layer
import sqlite3
from datetime import datetime
from typing import Optional

DB_PATH = "dimatrix_crm.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL,
            email        TEXT DEFAULT '',
            phone        TEXT DEFAULT '',
            company      TEXT DEFAULT '',
            source       TEXT DEFAULT '',
            campaign     TEXT DEFAULT '',
            dealValue    REAL DEFAULT 0,
            stage        TEXT DEFAULT 'New leads',
            priority     TEXT DEFAULT 'medium',
            aiScore      REAL DEFAULT 0,
            createdDate  TEXT DEFAULT '',
            lastFollowUp TEXT DEFAULT '',
            aiSummary    TEXT DEFAULT '',
            aiBudget     TEXT DEFAULT '',
            aiNeed       TEXT DEFAULT '',
            aiUrgency    TEXT DEFAULT '',
            aiTag        TEXT DEFAULT '',
            aiReason     TEXT DEFAULT '',
            aiNextAction TEXT DEFAULT '',
            notes        TEXT DEFAULT '',
            created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT DEFAULT '',
            lead_id     TEXT DEFAULT '',
            lead_name   TEXT DEFAULT '',
            assigned_to TEXT DEFAULT 'Me',
            due_date    TEXT DEFAULT '',
            priority    TEXT DEFAULT 'medium',
            status      TEXT DEFAULT 'pending',
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS followup_logs (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id      TEXT,
            lead_name    TEXT,
            channel      TEXT,
            message      TEXT,
            whatsapp_url TEXT,
            status       TEXT DEFAULT 'sent',
            sent_at      TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS automation_rules (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            name            TEXT,
            condition_type  TEXT,
            condition_value TEXT,
            action_type     TEXT,
            is_active       INTEGER DEFAULT 1,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized")
    init_users_table()

def row_to_dict(row) -> dict:
    return dict(row) if row else None

# ── LEADS ─────────────────────────────────────────────────────────────────────

def get_all_leads() -> list:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM leads ORDER BY created_at DESC")
    rows = [row_to_dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def get_lead_by_id(lead_id: str) -> Optional[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    row = row_to_dict(cur.fetchone())
    conn.close()
    return row

def save_lead(lead: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    # Use .get() with defaults so missing keys never crash the INSERT
    cur.execute("""
        INSERT INTO leads (
            id, name, email, phone, company, source, campaign,
            dealValue, stage, priority, aiScore,
            createdDate, lastFollowUp,
            aiSummary, aiBudget, aiNeed, aiUrgency,
            aiTag, aiReason, aiNextAction, notes,
            created_at, updated_at
        ) VALUES (
            :id, :name, :email, :phone, :company, :source, :campaign,
            :dealValue, :stage, :priority, :aiScore,
            :createdDate, :lastFollowUp,
            :aiSummary, :aiBudget, :aiNeed, :aiUrgency,
            :aiTag, :aiReason, :aiNextAction, :notes,
            :created_at, :updated_at
        )
    """, {
        "id":           lead.get("id", ""),
        "name":         lead.get("name", ""),
        "email":        lead.get("email", ""),
        "phone":        lead.get("phone", ""),
        "company":      lead.get("company", ""),
        "source":       lead.get("source", ""),
        "campaign":     lead.get("campaign", ""),
        "dealValue":    lead.get("dealValue", 0),
        "stage":        lead.get("stage", "New leads"),
        "priority":     lead.get("priority", "medium"),
        "aiScore":      lead.get("aiScore", 0),
        "createdDate":  lead.get("createdDate", ""),
        "lastFollowUp": lead.get("lastFollowUp", ""),
        "aiSummary":    lead.get("aiSummary", ""),
        "aiBudget":     lead.get("aiBudget", ""),
        "aiNeed":       lead.get("aiNeed", ""),
        "aiUrgency":    lead.get("aiUrgency", ""),
        "aiTag":        lead.get("aiTag", ""),
        "aiReason":     lead.get("aiReason", ""),
        "aiNextAction": lead.get("aiNextAction", ""),
        "notes":        lead.get("notes", ""),
        "created_at":   now,
        "updated_at":   now,
    })
    conn.commit()
    conn.close()
    return get_lead_by_id(lead["id"])

def update_lead(lead: dict) -> dict:
    """
    Safe update — merges incoming partial dict with existing DB row
    so missing keys never wipe out stored AI data.
    """
    conn = get_conn()
    cur = conn.cursor()

    # ── Fetch existing row so we never lose stored fields ──
    cur.execute("SELECT * FROM leads WHERE id = ?", (lead.get("id"),))
    existing = row_to_dict(cur.fetchone())
    if not existing:
        conn.close()
        return None

    # Merge: existing values as base, incoming lead overwrites only what's present
    merged = {**existing, **{k: v for k, v in lead.items() if v is not None and v != ""}}
    merged["updated_at"] = datetime.now().isoformat()

    cur.execute("""
        UPDATE leads SET
            name         = :name,
            email        = :email,
            phone        = :phone,
            company      = :company,
            source       = :source,
            campaign     = :campaign,
            dealValue    = :dealValue,
            stage        = :stage,
            priority     = :priority,
            aiScore      = :aiScore,
            createdDate  = :createdDate,
            lastFollowUp = :lastFollowUp,
            aiSummary    = :aiSummary,
            aiBudget     = :aiBudget,
            aiNeed       = :aiNeed,
            aiUrgency    = :aiUrgency,
            aiTag        = :aiTag,
            aiReason     = :aiReason,
            aiNextAction = :aiNextAction,
            notes        = :notes,
            updated_at   = :updated_at
        WHERE id = :id
    """, {
        "id":           merged.get("id", ""),
        "name":         merged.get("name", ""),
        "email":        merged.get("email", ""),
        "phone":        merged.get("phone", ""),
        "company":      merged.get("company", ""),
        "source":       merged.get("source", ""),
        "campaign":     merged.get("campaign", ""),
        "dealValue":    merged.get("dealValue", 0),
        "stage":        merged.get("stage", "New leads"),
        "priority":     merged.get("priority", "medium"),
        "aiScore":      merged.get("aiScore", 0),
        "createdDate":  merged.get("createdDate", ""),
        "lastFollowUp": merged.get("lastFollowUp", ""),
        "aiSummary":    merged.get("aiSummary", ""),
        "aiBudget":     merged.get("aiBudget", ""),
        "aiNeed":       merged.get("aiNeed", ""),
        "aiUrgency":    merged.get("aiUrgency", ""),
        "aiTag":        merged.get("aiTag", ""),
        "aiReason":     merged.get("aiReason", ""),
        "aiNextAction": merged.get("aiNextAction", ""),
        "notes":        merged.get("notes", ""),
        "updated_at":   merged.get("updated_at", ""),
    })
    conn.commit()
    conn.close()
    return get_lead_by_id(merged["id"])

def delete_lead_db(lead_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    conn.commit()
    conn.close()

# ── TASKS ─────────────────────────────────────────────────────────────────────

def get_all_tasks() -> list:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks ORDER BY created_at DESC")
    rows = [row_to_dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def get_tasks_by_lead(lead_id: str) -> list:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks WHERE lead_id = ? ORDER BY created_at DESC", (lead_id,))
    rows = [row_to_dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def get_task_by_id(task_id: str) -> Optional[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    row = row_to_dict(cur.fetchone())
    conn.close()
    return row

def save_task(task: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    cur.execute("""
        INSERT INTO tasks (
            id, title, description, lead_id, lead_name,
            assigned_to, due_date, priority, status,
            created_at, updated_at
        ) VALUES (
            :id, :title, :description, :lead_id, :lead_name,
            :assigned_to, :due_date, :priority, :status,
            :created_at, :updated_at
        )
    """, {
        "id":          task.get("id", ""),
        "title":       task.get("title", ""),
        "description": task.get("description", ""),
        "lead_id":     task.get("lead_id", ""),
        "lead_name":   task.get("lead_name", ""),
        "assigned_to": task.get("assigned_to", "Me"),
        "due_date":    task.get("due_date", ""),
        "priority":    task.get("priority", "medium"),
        "status":      task.get("status", "pending"),
        "created_at":  now,
        "updated_at":  now,
    })
    conn.commit()
    conn.close()
    return get_task_by_id(task["id"])

def update_task(task: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    task["updated_at"] = datetime.now().isoformat()
    cur.execute("""
        UPDATE tasks SET
            title       = :title,
            description = :description,
            lead_id     = :lead_id,
            lead_name   = :lead_name,
            assigned_to = :assigned_to,
            due_date    = :due_date,
            priority    = :priority,
            status      = :status,
            updated_at  = :updated_at
        WHERE id = :id
    """, {
        "id":          task.get("id", ""),
        "title":       task.get("title", ""),
        "description": task.get("description", ""),
        "lead_id":     task.get("lead_id", ""),
        "lead_name":   task.get("lead_name", ""),
        "assigned_to": task.get("assigned_to", "Me"),
        "due_date":    task.get("due_date", ""),
        "priority":    task.get("priority", "medium"),
        "status":      task.get("status", "pending"),
        "updated_at":  task.get("updated_at", ""),
    })
    conn.commit()
    conn.close()
    return get_task_by_id(task["id"])

def delete_task_db(task_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()

# ── FOLLOW-UP LOGS ────────────────────────────────────────────────────────────

def log_followup(
    lead_id: str,
    lead_name: str,
    channel: str,
    message: str,
    whatsapp_url: Optional[str] = None
):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO followup_logs (lead_id, lead_name, channel, message, whatsapp_url)
        VALUES (?, ?, ?, ?, ?)
    """, (lead_id, lead_name, channel, message, whatsapp_url))
    conn.commit()
    conn.close()

def get_followup_logs(lead_id: Optional[str] = None) -> list:
    conn = get_conn()
    cur = conn.cursor()
    if lead_id:
        cur.execute(
            "SELECT * FROM followup_logs WHERE lead_id = ? ORDER BY sent_at DESC",
            (lead_id,)
        )
    else:
        cur.execute("SELECT * FROM followup_logs ORDER BY sent_at DESC")
    rows = [row_to_dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def get_followup_log_count(lead_id: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM followup_logs WHERE lead_id = ?", (lead_id,))
    count = cur.fetchone()[0]
    conn.close()
    return count

# ── AUTOMATION RULES ──────────────────────────────────────────────────────────

def get_automation_rules() -> list:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM automation_rules ORDER BY id")
    rows = [row_to_dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def get_automation_rule_by_id(rule_id: int) -> Optional[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM automation_rules WHERE id = ?", (rule_id,))
    row = row_to_dict(cur.fetchone())
    conn.close()
    return row

def save_automation_rule(rule: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO automation_rules (
            name, condition_type, condition_value, action_type, is_active
        ) VALUES (:name, :condition_type, :condition_value, :action_type, :is_active)
    """, rule)
    rule_id = cur.lastrowid
    conn.commit()
    conn.close()
    return get_automation_rule_by_id(rule_id)

def update_automation_rule(rule_id: int, rule: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        UPDATE automation_rules SET
            name            = :name,
            condition_type  = :condition_type,
            condition_value = :condition_value,
            action_type     = :action_type,
            is_active       = :is_active
        WHERE id = :id
    """, {**rule, "id": rule_id})
    conn.commit()
    conn.close()
    return get_automation_rule_by_id(rule_id)

def delete_automation_rule_db(rule_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM automation_rules WHERE id = ?", (rule_id,))
    conn.commit()
    conn.close()

# ── AUTH / USERS ──────────────────────────────────────────────────────────────

def init_users_table():
    """Create users table and seed initial records if needed."""
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS crm_users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT UNIQUE NOT NULL,
            password   TEXT NOT NULL,
            role       TEXT DEFAULT 'user',
            is_active  INTEGER DEFAULT 1,
            last_login TEXT DEFAULT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

    # Seed default records if table is empty
    cur.execute("SELECT COUNT(*) FROM crm_users")
    count = cur.fetchone()[0]
    if count == 0:
        cur.executemany(
            "INSERT INTO crm_users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [
                ("Heamanth", "heamanthmahendran36@gmail.com", "Heamanth@user", "user"),
                ("Heamanth Admin", "heamanthmahendrann@gmail.com", "Heamanth@admin", "admin"),
            ]
        )
        conn.commit()
    conn.close()

def get_user_by_email(email: str) -> Optional[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM crm_users WHERE email = ?", (email,))
    row = row_to_dict(cur.fetchone())
    conn.close()
    return row

def get_all_users() -> list:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, is_active, last_login, created_at FROM crm_users ORDER BY created_at ASC")
    rows = [row_to_dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def create_user(name: str, email: str, password: str, role: str = "user") -> dict:
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    cur.execute(
        "INSERT INTO crm_users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)",
        (name, email, password, role, now)
    )
    user_id = cur.lastrowid
    conn.commit()
    conn.close()
    return {"id": user_id, "name": name, "email": email, "role": role, "is_active": True, "created_at": now, "last_login": None}

def toggle_user_active(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE crm_users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

def update_last_login(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE crm_users SET last_login = ? WHERE id = ?", (datetime.now().isoformat(), user_id))
    conn.commit()
    conn.close()
