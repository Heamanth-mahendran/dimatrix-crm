// Tasks.tsx - The Tasks page
// Shows Today's tasks, Overdue tasks, and a Kanban-style task board

import React, { useState, useEffect } from "react";

// Define the Task type
interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  status: "Today" | "Ongoing" | "Completed" | "Overdue";
  dueDate: string;
}

// Sample tasks (hardcoded for now - backend will replace this later)
const initialTasks: Task[] = [
  { id: "1", title: "Send proposal to arjun", priority: "High", status: "Today", dueDate: "09-03-2025" },
  { id: "2", title: "Follow up call with Arjun", priority: "High", status: "Ongoing", dueDate: "09-03-2025" },
  { id: "3", title: "Follow up call with Arjun", priority: "High", status: "Ongoing", dueDate: "08-03-2025" },
  { id: "4", title: "Follow up call with Arjun", priority: "High", status: "Ongoing", dueDate: "07-03-2025" },
  { id: "5", title: "Send proposal to Anu", priority: "High", status: "Completed", dueDate: "06-03-2025" },
  { id: "6", title: "Follow up call with Arjun", priority: "High", status: "Overdue", dueDate: "05-03-2025" },
];

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage on initial render
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });
  
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("High");
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("Today");

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks by search
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get tasks for each column
  const getTasksByStatus = (status: Task["status"]) =>
    filteredTasks.filter((t) => t.status === status);

  // Add a new task
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: newTaskPriority,
      status: newTaskStatus,
      dueDate: new Date().toLocaleDateString("en-IN"),
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setShowAddModal(false);
  };

  // Delete a task
  const handleDeleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Get badge style based on priority
  const priorityBadgeStyle = (priority: string): React.CSSProperties => ({
    background: priority === "High" 
      ? "linear-gradient(135deg, #e63946 0%, #ff6b7b 100%)" 
      : priority === "Medium" 
        ? "linear-gradient(135deg, #e67e22 0%, #f39c12 100%)" 
        : "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  });

  // Today's and overdue tasks for the summary section at the top
  const todayTasks = tasks.filter((t) => t.status === "Today");
  const overdueTasks = tasks.filter((t) => t.status === "Overdue");

  return (
    <div style={styles.container}>
      {/* Premium Summary cards at top */}
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
                <span style={styles.priorityDot(priorityBadgeStyle(t.priority).background)} />
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

      {/* Tasks heading with subtle decoration */}
      <div style={styles.titleSection}>
        <h2 style={styles.pageTitle}>Task Board</h2>
        <div style={styles.titleAccent} />
      </div>

      {/* Premium Search and filter bar */}
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
        </div>
        <div style={styles.filterActions}>
          <button style={styles.filterBtn}>Pending</button>
          <button style={styles.filterBtn}>Importance</button>
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <span style={styles.addIcon}>+</span> New Task
          </button>
        </div>
      </div>

      {/* Premium Kanban board - 4 columns */}
      <div style={styles.kanbanBoard}>
        {(["Today", "Ongoing", "Completed", "Overdue"] as Task["status"][]).map((status) => (
          <div key={status} style={styles.kanbanColumn}>
            <div style={styles.columnHeader}>
              <h4 style={styles.columnTitle}>{status}</h4>
              <span style={styles.columnCount}>{getTasksByStatus(status).length}</span>
            </div>

            <div style={styles.columnContent}>
              {getTasksByStatus(status).map((task) => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskCardHeader}>
                    <span style={styles.taskDate}>{task.dueDate}</span>
                    <span style={priorityBadgeStyle(task.priority)}>{task.priority}</span>
                  </div>
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div style={styles.taskFooter}>
                    <span style={styles.taskAvatar}>
                      {task.title.charAt(0).toUpperCase()}
                    </span>
                    {/* Delete button added here */}
                    <button 
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {getTasksByStatus(status).length === 0 && (
                <div style={styles.emptyCol}>
                  <span style={styles.emptyIcon}>📋</span>
                  <p style={styles.emptyText}>No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Premium Add Task Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Task</h3>
              <button style={styles.modalClose} onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Task Title</label>
                <input
                  style={styles.input}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Follow up call with Arjun"
                />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroupHalf}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.select}
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div style={styles.inputGroupHalf}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as any)}
                  >
                    <option>Today</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleAddTask}>
                <span style={styles.addIcon}>+</span> Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "100%",
    padding: "0",
  },
  summarySection: {
    display: "flex",
    gap: "24px",
    marginBottom: "40px",
  },
  summaryCard: {
    flex: 1,
    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02) inset",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  summaryCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
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
  summaryTitle: {
    fontWeight: "700",
    fontSize: "18px",
    color: "#111",
    flex: 1,
    margin: 0,
  },
  summaryCount: {
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "700",
  },
  summaryCountOverdue: {
    background: "linear-gradient(135deg, #e63946 0%, #ff6b7b 100%)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "700",
  },
  summaryDivider: {
    height: "2px",
    background: "linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%)",
    margin: "16px 0",
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  summaryItemOverdue: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
    opacity: 0.9,
  },
  summaryItemDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#2ecc71",
    boxShadow: "0 0 0 2px rgba(46,204,113,0.2)",
  },
  summaryItemDotOverdue: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#e63946",
    boxShadow: "0 0 0 2px rgba(230,57,70,0.2)",
  },
  summaryItemText: {
    flex: 1,
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
  },
  summaryItemTextOverdue: {
    flex: 1,
    fontSize: "14px",
    color: "#e63946",
    fontWeight: "500",
  },
  priorityDot: (color: string) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: color,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }),
  overdueIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#e63946",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  summaryEmpty: {
    textAlign: "center",
    padding: "20px",
    color: "#aaa",
    fontSize: "14px",
    fontStyle: "italic",
  },
  titleSection: {
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #111 0%, #444 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
  },
  titleAccent: {
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #1a2744 0%, #2c3e50 100%)",
    borderRadius: "4px",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    background: "white",
    padding: "16px 24px",
    borderRadius: "20px",
    marginBottom: "32px",
    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    background: "#f5f7fa",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid #eef2f6",
  },
  searchIcon: {
    fontSize: "16px",
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    padding: "14px 0",
    border: "none",
    background: "none",
    fontSize: "15px",
    outline: "none",
  },
  filterActions: {
    display: "flex",
    gap: "10px",
  },
  filterBtn: {
    padding: "12px 24px",
    borderRadius: "14px",
    border: "1px solid #eef2f6",
    background: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#555",
  },
  addBtn: {
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 8px 16px -4px rgba(26,39,68,0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  addIcon: {
    fontSize: "18px",
    fontWeight: "600",
  },
  kanbanBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  kanbanColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 8px",
  },
  columnTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111",
    margin: 0,
  },
  columnCount: {
    background: "#f0f2f5",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
  },
  columnContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  taskCard: {
    background: "white",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 5px 15px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  taskCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  taskDate: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "500",
  },
  taskTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111",
    marginBottom: "16px",
    lineHeight: 1.4,
  },
  taskFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #f0f2f5 0%, #e0e4e9 100%)",
    color: "#555",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "8px",
    opacity: 0.6,
    transition: "opacity 0.2s ease, transform 0.2s ease",
  },
  emptyCol: {
    background: "white",
    borderRadius: "18px",
    padding: "40px 20px",
    textAlign: "center",
    border: "2px dashed #e0e4e9",
  },
  emptyIcon: {
    fontSize: "32px",
    opacity: 0.5,
    display: "block",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#aaa",
    margin: 0,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "32px",
    width: "500px",
    boxShadow: "0 40px 60px -20px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 32px",
    borderBottom: "1px solid #f0f0f0",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#999",
    lineHeight: 1,
  },
  modalBody: {
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  inputGroupHalf: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  inputRow: {
    display: "flex",
    gap: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    padding: "14px 18px",
    border: "1px solid #eef2f6",
    borderRadius: "16px",
    fontSize: "15px",
    outline: "none",
    background: "#fafbfc",
  },
  select: {
    padding: "14px 18px",
    border: "1px solid #eef2f6",
    borderRadius: "16px",
    fontSize: "15px",
    outline: "none",
    background: "#fafbfc",
    cursor: "pointer",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "24px 32px 32px",
    borderTop: "1px solid #f0f0f0",
  },
  cancelBtn: {
    padding: "14px 28px",
    border: "1px solid #eef2f6",
    borderRadius: "16px",
    background: "white",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  saveBtn: {
    padding: "14px 28px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #1a2744 0%, #2c3e50 100%)",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

export default Tasks;