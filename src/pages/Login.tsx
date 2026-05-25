import React, { useState } from "react";

interface LoginProps {
  onLogin: (user: { email: string; role: "user" | "admin"; name: string }) => void;
}

const ACCENT = "#1a56db";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: tab }),
      });

      if (res.ok) {
        const data = await res.json();
        onLogin({ email: data.email, role: data.role, name: data.name });
      } else {
        const data = await res.json();
        setError(data.detail || "Invalid email or password.");
      }
    } catch {
      setError("Cannot connect to backend. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .login-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #eff4ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', -apple-system, sans-serif;
          padding: 20px;
        }

        .login-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 40px rgba(26,86,219,0.10), 0 1px 8px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 420px;
          padding: 40px 36px 36px;
        }

        .login-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          justify-content: center;
        }

        .login-logo-mark {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: ${ACCENT};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-logo-text { text-align: left; }
        .login-logo-name { font-size: 17px; font-weight: 700; color: #111827; }
        .login-logo-sub { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }

        .login-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 13.5px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 24px;
        }

        .login-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 24px;
          gap: 4px;
        }

        .login-tab {
          flex: 1;
          padding: 9px 0;
          border: none;
          border-radius: 7px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          background: transparent;
          color: #6b7280;
          font-family: 'DM Sans', sans-serif;
        }

        .login-tab.active {
          background: #fff;
          color: ${ACCENT};
          box-shadow: 0 1px 6px rgba(26,86,219,0.12);
        }

        .login-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }

        .login-input-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .login-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e5e9f0;
          border-radius: 9px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #fafbfc;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: ${ACCENT};
          background: #fff;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.09);
        }

        .login-input-pr { padding-right: 44px; }

        .login-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 0;
        }

        .login-eye:hover { color: #374151; }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background: ${ACCENT};
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(26,86,219,0.18);
          margin-top: 4px;
        }

        .login-btn:hover:not(:disabled) { background: #1447c8; }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #c2410c;
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="login-bg">
        <div className="login-card">
          <div className="login-logo-row">
            <div className="login-logo-mark">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="login-logo-text">
              <div className="login-logo-name">Dimatrix</div>
              <div className="login-logo-sub">CRM Platform</div>
            </div>
          </div>

          <div className="login-title">Welcome back</div>
          <div className="login-subtitle">Sign in to your CRM workspace</div>

          <div className="login-tabs">
            <button className={`login-tab${tab === "user" ? " active" : ""}`} onClick={() => { setTab("user"); setError(""); }}>
              👤 User
            </button>
            <button className={`login-tab${tab === "admin" ? " active" : ""}`} onClick={() => { setTab("admin"); setError(""); }}>
              🔐 Admin
            </button>
          </div>

          {tab === "admin" && (
            <div className="login-admin-badge">
              <span>🔒</span> Admin Portal — Restricted Access
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on">
            <label className="login-label">Email address</label>
            <div className="login-input-wrap">
              <input
                type="email"
                className="login-input"
                placeholder={tab === "admin" ? "admin@example.com" : "you@example.com"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <input
                type={showPass ? "text" : "password"}
                className="login-input login-input-pr"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="login-eye" onClick={() => setShowPass(s => !s)}>
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 9.5M4.3 4.4C2.8 5.4 1.5 6.8 1 8c1 2.5 3.8 4.5 7 4.5a7.8 7.8 0 003.2-.7M7 3.6C7.3 3.5 7.7 3.5 8 3.5c3.2 0 6 2 7 4.5a9 9 0 01-2.1 2.9"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 8c1-2.5 3.8-4.5 7-4.5S14 5.5 15 8c-1 2.5-3.8 4.5-7 4.5S2 10.5 1 8z"/>
                    <circle cx="8" cy="8" r="2"/>
                  </svg>
                )}
              </button>
            </div>

            {error && <div className="login-error">⚠️ {error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in…" : tab === "admin" ? "Sign in as Admin" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
