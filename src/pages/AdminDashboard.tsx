import React, { useState, useEffect } from "react";

const ACCENT = "#1a56db";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminName, onLogout }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Failed to load users.");
      }
    } catch {
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const activeUsers = users.filter(u => u.is_active);
  const adminUsers = users.filter(u => u.role === "admin");
  const regularUsers = users.filter(u => u.role === "user");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormSuccess(""); setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setFormSuccess("✅ User created successfully!");
        setForm({ name: "", email: "", password: "", role: "user" });
        fetchUsers();
        setTimeout(() => { setShowAddModal(false); setFormSuccess(""); }, 1500);
      } else {
        const d = await res.json();
        setFormError(d.detail || "Failed to create user.");
      }
    } catch {
      setFormError("Cannot connect to backend.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userId: number, current: boolean) => {
    try {
      await fetch(`http://localhost:8000/admin/users/${userId}/toggle`, { method: "POST" });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u));
    } catch { /* ignore */ }
  };

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .adm-root {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }

        .adm-topbar {
          background: #fff;
          border-bottom: 1px solid #e5e9f0;
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 14px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .adm-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: ${ACCENT};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .adm-brand { font-size: 15px; font-weight: 700; color: #111827; }
        .adm-brand-sub { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }

        .adm-badge {
          margin-left: 8px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #c2410c;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 5px;
          letter-spacing: 0.3px;
        }

        .adm-spacer { flex: 1; }

        .adm-admin-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 6px 12px;
        }

        .adm-avatar {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: linear-gradient(135deg, #1a56db, #3b82f6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .adm-admin-name { font-size: 13px; font-weight: 600; color: #374151; }

        .adm-logout-btn {
          margin-left: 12px;
          background: #fff;
          border: 1.5px solid #e5e9f0;
          border-radius: 7px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .adm-logout-btn:hover { border-color: #fecaca; color: #dc2626; background: #fef2f2; }

        .adm-content { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }

        .adm-page-title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .adm-page-sub { font-size: 14px; color: #6b7280; margin-bottom: 24px; }

        .adm-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .adm-stat-card {
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 12px;
          padding: 20px 22px;
        }

        .adm-stat-label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .adm-stat-num { font-size: 28px; font-weight: 700; color: #111827; line-height: 1; }
        .adm-stat-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }

        .adm-stat-card.green .adm-stat-num { color: #16a34a; }
        .adm-stat-card.blue .adm-stat-num { color: ${ACCENT}; }
        .adm-stat-card.orange .adm-stat-num { color: #ea580c; }

        .adm-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .adm-section-title { font-size: 16px; font-weight: 700; color: #111827; }

        .adm-add-btn {
          background: ${ACCENT};
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
          box-shadow: 0 2px 8px rgba(26,86,219,0.16);
        }
        .adm-add-btn:hover { background: #1447c8; }

        .adm-table-wrap {
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th {
          background: #f8fafc;
          font-size: 11.5px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e9f0;
        }
        .adm-table td {
          padding: 13px 16px;
          font-size: 13.5px;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tr:hover td { background: #fafbfc; }

        .adm-user-cell { display: flex; align-items: center; gap: 10px; }
        .adm-row-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1a56db, #3b82f6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .adm-row-avatar.admin-av { background: linear-gradient(135deg, #dc2626, #f97316); }

        .adm-user-name { font-size: 13.5px; font-weight: 600; color: #111827; }
        .adm-user-email { font-size: 12px; color: #9ca3af; }

        .adm-role-badge {
          display: inline-block;
          padding: 2px 9px;
          border-radius: 5px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: capitalize;
        }
        .adm-role-badge.admin { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
        .adm-role-badge.user { background: #eff4ff; color: #1a56db; border: 1px solid #c3d7fd; }

        .adm-status-dot {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
        }
        .adm-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .adm-dot.active { background: #22c55e; box-shadow: 0 0 0 2px #dcfce7; }
        .adm-dot.inactive { background: #d1d5db; }

        .adm-toggle-btn {
          background: none;
          border: 1.5px solid #e5e9f0;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          color: #6b7280;
        }
        .adm-toggle-btn:hover { background: #f3f4f6; }

        .adm-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; padding: 12px 16px; font-size: 13.5px; margin-bottom: 16px; }

        /* Modal */
        .adm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .adm-modal {
          background: #fff;
          border-radius: 16px;
          padding: 30px 28px 26px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 60px rgba(0,0,0,0.18);
        }

        .adm-modal-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .adm-modal-sub { font-size: 13px; color: #6b7280; margin-bottom: 20px; }

        .adm-field { margin-bottom: 14px; }
        .adm-field label { font-size: 12.5px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; }
        .adm-field input, .adm-field select {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid #e5e9f0;
          border-radius: 8px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #fafbfc;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .adm-field input:focus, .adm-field select:focus {
          border-color: ${ACCENT};
          background: #fff;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.09);
        }

        .adm-modal-actions { display: flex; gap: 10px; margin-top: 18px; }
        .adm-cancel-btn {
          flex: 1;
          padding: 10px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .adm-save-btn {
          flex: 1;
          padding: 10px;
          background: ${ACCENT};
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .adm-save-btn:hover:not(:disabled) { background: #1447c8; }
        .adm-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .adm-form-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 7px; padding: 8px 12px; font-size: 12.5px; margin-bottom: 12px; }
        .adm-form-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; border-radius: 7px; padding: 8px 12px; font-size: 12.5px; margin-bottom: 12px; font-weight: 600; }

        @media (max-width: 700px) {
          .adm-stats-row { grid-template-columns: repeat(2,1fr); }
          .adm-content { padding: 18px 14px; }
        }
      `}</style>

      <div className="adm-root">
        {/* Top bar */}
        <div className="adm-topbar">
          <div className="adm-logo-mark">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <div className="adm-brand">Dimatrix</div>
            <div className="adm-brand-sub">CRM Platform</div>
          </div>
          <span className="adm-badge">ADMIN PANEL</span>
          <div className="adm-spacer" />
          <div className="adm-admin-chip">
            <div className="adm-avatar">{initials(adminName)}</div>
            <span className="adm-admin-name">{adminName}</span>
          </div>
          <button className="adm-logout-btn" onClick={onLogout}>Log out</button>
        </div>

        <div className="adm-content">
          <div className="adm-page-title">Admin Dashboard</div>
          <div className="adm-page-sub">Manage users and monitor CRM activity</div>

          {error && <div className="adm-error">⚠️ {error}</div>}

          {/* Stats */}
          <div className="adm-stats-row">
            <div className="adm-stat-card green">
              <div className="adm-stat-label">Active Users</div>
              <div className="adm-stat-num">{loading ? "—" : activeUsers.length}</div>
              <div className="adm-stat-sub">Currently enabled accounts</div>
            </div>
            <div className="adm-stat-card blue">
              <div className="adm-stat-label">Total Users</div>
              <div className="adm-stat-num">{loading ? "—" : users.length}</div>
              <div className="adm-stat-sub">All registered accounts</div>
            </div>
            <div className="adm-stat-card orange">
              <div className="adm-stat-label">Admins</div>
              <div className="adm-stat-num">{loading ? "—" : adminUsers.length}</div>
              <div className="adm-stat-sub">Admin-role accounts</div>
            </div>
            <div className="adm-stat-card">
              <div className="adm-stat-label">Regular Users</div>
              <div className="adm-stat-num">{loading ? "—" : regularUsers.length}</div>
              <div className="adm-stat-sub">User-role accounts</div>
            </div>
          </div>

          {/* Users table */}
          <div className="adm-section-header">
            <div className="adm-section-title">All Users</div>
            <button className="adm-add-btn" onClick={() => setShowAddModal(true)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
              Add User
            </button>
          </div>

          <div className="adm-table-wrap">
            {loading ? (
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Loading users…</div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="adm-user-cell">
                          <div className={`adm-row-avatar${u.role === "admin" ? " admin-av" : ""}`}>{initials(u.name)}</div>
                          <div>
                            <div className="adm-user-name">{u.name}</div>
                            <div className="adm-user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`adm-role-badge ${u.role}`}>{u.role}</span></td>
                      <td>
                        <span className="adm-status-dot">
                          <span className={`adm-dot${u.is_active ? " active" : " inactive"}`} />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: "#9ca3af" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                      <td style={{ fontSize: 12.5, color: "#9ca3af" }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                      <td>
                        <button className="adm-toggle-btn" onClick={() => handleToggleActive(u.id, u.is_active)}>
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="adm-modal">
            <div className="adm-modal-title">Add New User</div>
            <div className="adm-modal-sub">New user data will be stored in the Dimatrix CRM database.</div>

            {formError && <div className="adm-form-error">⚠️ {formError}</div>}
            {formSuccess && <div className="adm-form-success">{formSuccess}</div>}

            <form onSubmit={handleCreateUser}>
              <div className="adm-field">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="adm-field">
                <label>Email Address</label>
                <input type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="adm-field">
                <label>Password</label>
                <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
              <div className="adm-field">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="adm-modal-actions">
                <button type="button" className="adm-cancel-btn" onClick={() => { setShowAddModal(false); setFormError(""); setFormSuccess(""); }}>
                  Cancel
                </button>
                <button type="submit" className="adm-save-btn" disabled={saving}>
                  {saving ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
