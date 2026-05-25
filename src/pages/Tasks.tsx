// Tasks.tsx - Dimatrix CRM Task Board
// All data fetched from FastAPI backend (SQLite) — no hardcoded tasks, no localStorage

import React, { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

// DB statuses (what backend stores)
type DBStatus = "pending" | "in_progress" | "done";
type DBPriority = "High" | "Medium" | "Low";

// UI columns (what the kanban shows)
type UIStatus = "Today" | "Ongoing" | "Completed" | "Overdue";

interface Task {
  id: string;
  title: string;
  description?: string;
  lead_id?: string;
  lead_name?: string;
  assigned_to?: string;
  due_date?: string;        // "DD-MM-YYYY" or "YYYY-MM-DD"
  priority: DBPriority;
  status: DBStatus;
  created_at?: string;
  updated_at?: string;
}

// ─── Status Mapping ───────────────────────────────────────────────────────────
// DB → UI:  pending = Today, in_progress = Ongoing, done = Completed
// Overdue is computed: pending/in_progress + due_date in the past
// UI → DB:  Today = pending, Ongoing = in_progress, Completed = done

function dbToUI(task: Task): UIStatus {
  const s = task.status as string;
  if (s === "done") return "Completed";
  if (task.due_date && isOverdue(task.due_date)) return "Overdue"; // s is never "done" here
  if (s === "in_progress") return "Ongoing";
  return "Today"; // pending
}

function uiToDB(ui: UIStatus): DBStatus {
  if (ui === "Completed") return "done";
  if (ui === "Ongoing") return "in_progress";
  return "pending"; // Today + Overdue both map to pending in DB
}

function isOverdue(dueDateStr: string): boolean {
  if (!dueDateStr) return false;
  try {
    let date: Date;
    if (dueDateStr.includes("-") && dueDateStr.length === 10) {
      const parts = dueDateStr.split("-");
      // DD-MM-YYYY
      if (parts[2].length === 4) {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // YYYY-MM-DD
        date = new Date(dueDateStr);
      }
    } else {
      date = new Date(dueDateStr);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  } catch {
    return false;
  }
}

function formatDisplayDate(dueDateStr?: string): string {
  if (!dueDateStr) return "";
  try {
    const parts = dueDateStr.split("-");
    if (parts.length !== 3) return dueDateStr;
    // DD-MM-YYYY
    if (parts[2].length === 4) return dueDateStr;
    // YYYY-MM-DD → DD-MM-YYYY
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  } catch {
    return dueDateStr;
  }
}

// Convert HTML date input (YYYY-MM-DD) for storage
function toStorageDate(htmlDate: string): string {
  if (!htmlDate) return "";
  const parts = htmlDate.split("-");
  if (parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
  }
  return htmlDate;
}

function toHTMLDate(stored: string): string {
  if (!stored) return "";
  const parts = stored.split("-");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
  }
  return stored;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${err}`);
  }
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<DBPriority>("Medium");
  const [formStatus, setFormStatus] = useState<UIStatus>("Today");
  const [formDueDate, setFormDueDate] = useState("");

  // ── Fetch all tasks from backend ──
  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch("/tasks");
      setTasks(data.tasks || []);
    } catch (e: any) {
      setError("Could not connect to backend. Make sure FastAPI is running on port 8000.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Helpers ──
  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPriority("Medium");
    setFormStatus("Today");
    setFormDueDate("");
    setEditingTask(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setFormStatus(dbToUI(task));
    setFormDueDate(toHTMLDate(task.due_date || ""));
    setShowAddModal(true);
  };

  // ── Create task ──
  const handleSaveTask = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      priority: formPriority,
      status: uiToDB(formStatus),
      due_date: toStorageDate(formDueDate),
      assigned_to: "Me",
    };

    try {
      if (editingTask) {
        // PUT update
        await apiFetch(`/tasks/${editingTask.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...editingTask, ...payload }),
        });
      } else {
        // POST create
        await apiFetch("/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await fetchTasks();
      setShowAddModal(false);
      resetForm();
    } catch (e: any) {
      alert("Failed to save task: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete task ──
  const handleDeleteTask = async (id: string, title: string) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    try {
      await apiFetch(`/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      alert("Failed to delete task: " + e.message);
    }
  };

  // ── Move task to different status column ──
  const handleMoveTask = async (task: Task, newUI: UIStatus) => {
    const newDBStatus = uiToDB(newUI);
    try {
      await apiFetch(`/tasks/${task.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newDBStatus }),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newDBStatus } : t))
      );
    } catch (e: any) {
      alert("Failed to update status: " + e.message);
    }
  };

  // ── Filtering ──
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const getTasksByUI = (col: UIStatus) =>
    filteredTasks.filter((t) => dbToUI(t) === col);

  // ── Summary data ──
  const todayTasks = tasks.filter((t) => dbToUI(t) === "Today");
  const overdueTasks = tasks.filter((t) => dbToUI(t) === "Overdue");

  // ─── Render helpers ───────────────────────────────────────────────────────

  const priorityBadgeStyle = (priority: string): React.CSSProperties => ({
    background:
      priority === "High"
        ? "linear-gradient(135deg, #e63946 0%, #ff6b7b 100%)"
        : priority === "Medium"
        ? "linear-gradient(135deg, #e67e22 0%, #f39c12 100%)"
        : "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600" as const,
    letterSpacing: "0.3px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  });

  const COLUMNS: UIStatus[] = ["Today", "Ongoing", "Completed", "Overdue"];

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading tasks from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorWrap}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Backend not reachable</h3>
        <p style={styles.errorMsg}>{error}</p>
        <button style={styles.retryBtn} onClick={fetchTasks}>
          Retry
        </button>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>

      {/* Summary cards */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div style={styles.summaryIcon}>📅</div>
            <h4 style={styles.summaryTitle}>Today's Tasks</h4>
            <span style={styles.summaryCount}>{todayTasks.length}</span>
          </div>
          <div style={styles.summaryDivider} />
          {todayTasks.length > 0 ? (
            todayTasks.map((t) => (
              <div key={t.id} style={styles.summaryItem}>
                <span style={styles.summaryItemDot} />
                <span style={styles.summaryItemText}>{t.title}</span>
                <span style={{ ...priorityBadgeStyle(t.priority), fontSize: "10px", padding: "2px 8px" }}>
                  {t.priority}
                </span>
              </div>
            ))
          ) : (
            <div style={styles.summaryEmpty}>No tasks for today</div>
          )}
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div style={styles.summaryIcon}>⚠️</div>
            <h4 style={styles.summaryTitle}>Overdue Tasks</h4>
            <span style={styles.summaryCountOverdue}>{overdueTasks.length}</span>
          </div>
          <div style={styles.summaryDivider} />
          {overdueTasks.length > 0 ? (
            overdueTasks.map((t) => (
              <div key={t.id} style={styles.summaryItemOverdue}>
                <span style={styles.summaryItemDotOverdue} />
                <span style={styles.summaryItemTextOverdue}>{t.title}</span>
                <span style={styles.overdueIcon}>!</span>
              </div>
            ))
          ) : (
            <div style={styles.summaryEmpty}>All caught up! 🎉</div>
          )}
        </div>
      </div>

      {/* Page title */}
      <div style={styles.titleSection}>
        <h2 style={styles.pageTitle}>Task Board</h2>
        <div style={styles.titleAccent} />
      </div>

      {/* Search + actions bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={styles.searchInput}
          />
          {searchText && (
            <button style={styles.clearSearch} onClick={() => setSearchText("")}>×</button>
          )}
        </div>
        <div style={styles.filterActions}>
          <span style={styles.taskCount}>{tasks.length} tasks total</span>
          <button style={styles.refreshBtn} onClick={fetchTasks} title="Refresh">
            🔄
          </button>
          <button style={styles.addBtn} onClick={openAddModal}>
            <span>+</span> New Task
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div style={styles.kanbanBoard}>
        {COLUMNS.map((col) => {
          const colTasks = getTasksByUI(col);
          return (
            <div key={col} style={styles.kanbanColumn}>
              <div style={styles.columnHeader}>
                <h4 style={styles.columnTitle}>{col}</h4>
                <span style={styles.columnCount}>{colTasks.length}</span>
              </div>

              <div style={styles.columnContent}>
                {colTasks.map((task) => (
                  <div key={task.id} style={styles.taskCard}>
                    <div style={styles.taskCardHeader}>
                      <span style={styles.taskDate}>
                        {formatDisplayDate(task.due_date) || "No due date"}
                      </span>
                      <span style={priorityBadgeStyle(task.priority)}>{task.priority}</span>
                    </div>

                    <div style={styles.taskTitle}>{task.title}</div>

                    {task.description && (
                      <div style={styles.taskDesc}>{task.description}</div>
                    )}

                    {task.lead_name && (
                      <div style={styles.taskLead}>👤 {task.lead_name}</div>
                    )}

                    {/* Move to column buttons */}
                    <div style={styles.moveButtons}>
                      {COLUMNS.filter((c) => c !== col).map((c) => (
                        <button
                          key={c}
                          style={styles.moveBtn}
                          onClick={() => handleMoveTask(task, c)}
                          title={`Move to ${c}`}
                        >
                          → {c}
                        </button>
                      ))}
                    </div>

                    <div style={styles.taskFooter}>
                      <span style={styles.taskAvatar}>
                        {task.title.charAt(0).toUpperCase()}
                      </span>
                      <div style={styles.taskActions}>
                        <button
                          style={styles.editBtn}
                          onClick={() => openEditModal(task)}
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div style={styles.emptyCol}>
                    <span style={styles.emptyIcon}>📋</span>
                    <p style={styles.emptyText}>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                style={styles.modalClose}
                onClick={() => { setShowAddModal(false); resetForm(); }}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Task Title *</label>
                <input
                  style={styles.input}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Follow up call with Arjun"
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, minHeight: "72px", resize: "vertical" }}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional details..."
                />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroupHalf}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.select}
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as DBPriority)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div style={styles.inputGroupHalf}>
                  <label style={styles.label}>Column</label>
                  <select
                    style={styles.select}
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UIStatus)}
                  >
                    <option value="Today">Today</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => { setShowAddModal(false); resetForm(); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                onClick={handleSaveTask}
                disabled={saving || !formTitle.trim()}
              >
                {saving ? "Saving..." : editingTask ? "Save Changes" : "+ Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: { [key: string]: any } = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "100%",
    padding: "0",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    gap: "16px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f0f0f0",
    borderTop: "4px solid #1a2744",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#888", fontSize: "15px" },
  errorWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    gap: "12px",
    textAlign: "center",
    padding: "40px",
  },
  errorIcon: { fontSize: "48px" },
  errorTitle: { fontSize: "20px", fontWeight: "700", color: "#111", margin: 0 },
  errorMsg: { fontSize: "14px", color: "#888", maxWidth: "400px" },
  retryBtn: {
    marginTop: "8px",
    padding: "12px 28px",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  summarySection: { display: "flex", gap: "24px", marginBottom: "40px" },
  summaryCard: {
    flex: 1,
    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02) inset",
  },
  summaryCardHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  summaryIcon: {
    fontSize: "24px",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    color: "white",
    boxShadow: "0 8px 16px -4px rgba(26,39,68,0.2)",
  },
  summaryTitle: { fontWeight: "700", fontSize: "18px", color: "#111", flex: 1, margin: 0 },
  summaryCount: {
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white", padding: "4px 12px", borderRadius: "30px", fontSize: "14px", fontWeight: "700",
  },
  summaryCountOverdue: {
    background: "linear-gradient(135deg, #e63946 0%, #ff6b7b 100%)",
    color: "white", padding: "4px 12px", borderRadius: "30px", fontSize: "14px", fontWeight: "700",
  },
  summaryDivider: {
    height: "2px",
    background: "linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%)",
    margin: "16px 0",
  },
  summaryItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f0f0f0" },
  summaryItemOverdue: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f0f0f0" },
  summaryItemDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#2ecc71", flexShrink: 0 },
  summaryItemDotOverdue: { width: "6px", height: "6px", borderRadius: "50%", background: "#e63946", flexShrink: 0 },
  summaryItemText: { flex: 1, fontSize: "14px", color: "#333", fontWeight: "500" },
  summaryItemTextOverdue: { flex: 1, fontSize: "14px", color: "#e63946", fontWeight: "500" },
  overdueIcon: {
    width: "18px", height: "18px", borderRadius: "50%", background: "#e63946",
    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "bold", flexShrink: 0,
  },
  summaryEmpty: { textAlign: "center", padding: "20px", color: "#aaa", fontSize: "14px", fontStyle: "italic" },
  titleSection: { marginBottom: "24px" },
  pageTitle: {
    fontSize: "28px", fontWeight: "700",
    background: "linear-gradient(135deg, #111 0%, #444 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    margin: "0 0 8px", letterSpacing: "-0.02em",
  },
  titleAccent: { width: "60px", height: "4px", background: "linear-gradient(90deg, #1a2744 0%, #2c3e50 100%)", borderRadius: "4px" },
  filterBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px",
    background: "white", padding: "16px 24px", borderRadius: "20px", marginBottom: "32px",
    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)",
  },
  searchWrapper: {
    display: "flex", alignItems: "center", gap: "12px", flex: 1,
    background: "#f5f7fa", padding: "0 16px", borderRadius: "14px", border: "1px solid #eef2f6",
  },
  searchIcon: { fontSize: "16px", opacity: 0.5 },
  searchInput: { flex: 1, padding: "14px 0", border: "none", background: "none", fontSize: "15px", outline: "none" },
  clearSearch: {
    background: "none", border: "none", fontSize: "20px", cursor: "pointer",
    color: "#aaa", padding: "0 4px", lineHeight: 1,
  },
  filterActions: { display: "flex", gap: "10px", alignItems: "center" },
  taskCount: { fontSize: "13px", color: "#888", fontWeight: "500", whiteSpace: "nowrap" },
  refreshBtn: {
    padding: "10px 14px", border: "1px solid #eef2f6", borderRadius: "14px",
    background: "white", cursor: "pointer", fontSize: "16px",
  },
  addBtn: {
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white", border: "none", borderRadius: "14px",
    padding: "12px 24px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
    boxShadow: "0 8px 16px -4px rgba(26,39,68,0.2)",
    whiteSpace: "nowrap" as const,
  },
  kanbanBoard: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" },
  kanbanColumn: { display: "flex", flexDirection: "column", gap: "16px" },
  columnHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" },
  columnTitle: { fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 },
  columnCount: { background: "#f0f2f5", padding: "4px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#666" },
  columnContent: { display: "flex", flexDirection: "column", gap: "12px" },
  taskCard: {
    background: "white", borderRadius: "18px", padding: "18px",
    boxShadow: "0 5px 15px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)",
    cursor: "default",
  },
  taskCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  taskDate: { fontSize: "11px", color: "#888", fontWeight: "500" },
  taskTitle: { fontSize: "15px", fontWeight: "600", color: "#111", marginBottom: "8px", lineHeight: 1.4 },
  taskDesc: { fontSize: "12px", color: "#888", marginBottom: "8px", lineHeight: 1.5 },
  taskLead: { fontSize: "12px", color: "#555", fontWeight: "500", marginBottom: "10px" },
  moveButtons: {
    display: "flex", flexWrap: "wrap" as const, gap: "4px", marginBottom: "12px",
  },
  moveBtn: {
    padding: "3px 8px", fontSize: "10px", fontWeight: "600",
    border: "1px solid #e0e4e9", borderRadius: "8px",
    background: "#f5f7fa", color: "#555", cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  taskFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  taskAvatar: {
    width: "28px", height: "28px", borderRadius: "10px",
    background: "linear-gradient(135deg, #f0f2f5 0%, #e0e4e9 100%)",
    color: "#555", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700",
  },
  taskActions: { display: "flex", gap: "4px" },
  editBtn: {
    background: "none", border: "none", fontSize: "15px", cursor: "pointer",
    padding: "4px 6px", borderRadius: "8px", opacity: 0.7,
  },
  deleteBtn: {
    background: "none", border: "none", fontSize: "15px", cursor: "pointer",
    padding: "4px 6px", borderRadius: "8px", opacity: 0.7,
  },
  emptyCol: {
    background: "white", borderRadius: "18px", padding: "40px 20px",
    textAlign: "center", border: "2px dashed #e0e4e9",
  },
  emptyIcon: { fontSize: "32px", opacity: 0.5, display: "block", marginBottom: "8px" },
  emptyText: { fontSize: "14px", color: "#aaa", margin: 0 },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: { background: "white", borderRadius: "32px", width: "500px", boxShadow: "0 40px 60px -20px rgba(0,0,0,0.3)" },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "28px 32px", borderBottom: "1px solid #f0f0f0",
  },
  modalTitle: { fontSize: "22px", fontWeight: "700", color: "#111", margin: 0 },
  modalClose: { background: "none", border: "none", fontSize: "32px", cursor: "pointer", color: "#999", lineHeight: 1 },
  modalBody: { padding: "28px 32px", display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  inputGroupHalf: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  inputRow: { display: "flex", gap: "16px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#555" },
  input: {
    padding: "14px 18px", border: "1px solid #eef2f6",
    borderRadius: "16px", fontSize: "15px", outline: "none",
    background: "#fafbfc", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box" as const,
  },
  select: {
    padding: "14px 18px", border: "1px solid #eef2f6",
    borderRadius: "16px", fontSize: "15px", outline: "none",
    background: "#fafbfc", cursor: "pointer",
  },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: "12px",
    padding: "24px 32px 32px", borderTop: "1px solid #f0f0f0",
  },
  cancelBtn: {
    padding: "14px 28px", border: "1px solid #eef2f6", borderRadius: "16px",
    background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "500",
  },
  saveBtn: {
    padding: "14px 28px", border: "none", borderRadius: "16px",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600",
  },
};

// Add spinner keyframes
const styleTag = document.createElement("style");
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);

export default Tasks;