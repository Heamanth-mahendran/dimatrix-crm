import React, { useState } from "react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  userName?: string;
}

// ── SVG Icons — named top-level consts (fixes "Element type is invalid" runtime error) ──
const IconDashboard: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

const IconLeads: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="5" r="3" />
    <path d="M1 14c0-3.314 2.686-5 6-5s6 1.686 6 5" />
    <path d="M11.5 7.5l1.5 1.5 2.5-3" />
  </svg>
);

const IconContacts: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1 13c0-2.761 2.239-4 5-4s5 1.239 5 4" />
    <circle cx="12" cy="5.5" r="2" />
    <path d="M10.5 13c.3-1.8 1.5-2.5 2.5-2.5 1.5 0 2.5.9 2.5 2.5" />
  </svg>
);

const IconTasks: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <path d="M5 8l2 2 4-4" />
  </svg>
);

const IconAiInsights: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M11 3.5L9.5 5M5 11l-1.5 1.5" />
  </svg>
);

const IconAutomation: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8a6 6 0 1110.472-4" />
    <path d="M14 2l-1.528 2L10 2.5" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const IconReports: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="1.5" />
    <path d="M5 10V8M8 10V6M11 10V4" />
  </svg>
);

const IconLogout: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
  </svg>
);

// ── Nav groups — Icon stored as a component reference, NOT inside a Record ────
const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", Icon: IconDashboard },
      { label: "Leads",     Icon: IconLeads },
      { label: "Contacts",  Icon: IconContacts },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Tasks",       Icon: IconTasks },
      { label: "Ai insights", Icon: IconAiInsights },
      { label: "Automation",  Icon: IconAutomation },
      { label: "Reports",     Icon: IconReports },
    ],
  },
];

const ACCENT        = "#1a56db";
const ACCENT_BG     = "#eff4ff";
const ACCENT_BORDER = "#c3d7fd";

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout, userName }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const displayName = userName || "Heamanth";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .sb-root {
          width: 224px;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0;
          z-index: 100;
          border-right: 1px solid #e5e9f0;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .sb-logo {
          padding: 0 18px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #e5e9f0;
          flex-shrink: 0;
        }

        .sb-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: ${ACCENT};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sb-logo-name {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }

        .sb-logo-sub {
          font-size: 10.5px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.2px;
          text-transform: uppercase;
        }

        .sb-workspace {
          margin: 10px 14px 4px;
          padding: 8px 10px;
          background: #f8fafc;
          border: 1px solid #e5e9f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-workspace-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px #dcfce7;
        }

        .sb-workspace-name {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-workspace-plan {
          font-size: 10px;
          font-weight: 700;
          color: ${ACCENT};
          background: ${ACCENT_BG};
          border: 1px solid ${ACCENT_BORDER};
          padding: 1px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .sb-nav {
          flex: 1;
          padding: 6px 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-group-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #9ca3af;
          padding: 14px 20px 5px;
        }

        .sb-nav-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 2px 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          position: relative;
          font-family: 'DM Sans', sans-serif;
        }

        .sb-nav-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          height: 38px;
          padding: 0 10px;
          border-radius: 7px;
          transition: background 0.12s;
        }

        .sb-nav-btn:hover .sb-nav-inner {
          background: #f3f4f6;
        }

        .sb-nav-btn.active .sb-nav-inner {
          background: ${ACCENT_BG};
          border: 1px solid ${ACCENT_BORDER};
        }

        .sb-nav-btn.active::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 22px;
          background: ${ACCENT};
          border-radius: 2px;
        }

        .sb-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          flex-shrink: 0;
          color: #6b7280;
          transition: color 0.12s;
        }

        .sb-nav-btn.active .sb-nav-icon { color: ${ACCENT}; }
        .sb-nav-btn:hover:not(.active) .sb-nav-icon { color: #374151; }

        .sb-nav-label {
          font-size: 13.5px;
          font-weight: 500;
          color: #374151;
          transition: color 0.12s;
          flex: 1;
        }

        .sb-nav-btn.active .sb-nav-label {
          font-weight: 600;
          color: ${ACCENT};
        }

        .sb-nav-btn:hover:not(.active) .sb-nav-label { color: #111827; }

        .sb-divider {
          height: 1px;
          background: #f0f2f5;
          margin: 4px 16px;
        }

        .sb-user {
          padding: 10px 12px 14px;
          border-top: 1px solid #e5e9f0;
          flex-shrink: 0;
        }

        .sb-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          transition: background 0.15s;
          cursor: pointer;
        }

        .sb-user-card:hover { background: #f3f4f6; }

        .sb-avatar {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1a56db, #3b82f6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sb-user-info { flex: 1; min-width: 0; }

        .sb-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .sb-user-role {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
          margin-top: 1px;
        }

        .sb-logout {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e5e9f0;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .sb-logout:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }
      `}</style>

      <div className="sb-root">

        <div className="sb-logo">
          <div className="sb-logo-mark">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <div className="sb-logo-name">Dimatrix</div>
            <div className="sb-logo-sub">CRM Platform</div>
          </div>
        </div>

        <div className="sb-workspace">
          <div className="sb-workspace-dot" />
          <div className="sb-workspace-name">My Workspace</div>
          <div className="sb-workspace-plan">Pro</div>
        </div>

        <nav className="sb-nav">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="sb-divider" />}
              <div className="sb-group-label">{group.label}</div>
              {group.items.map(({ label, Icon }) => {
                const isActive = activePage === label;
                return (
                  <button
                    key={label}
                    className={`sb-nav-btn${isActive ? " active" : ""}`}
                    onClick={() => onNavigate(label)}
                    onMouseEnter={() => setHovered(label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="sb-nav-inner">
                      <span className="sb-nav-icon">
                        <Icon size={15} />
                      </span>
                      <span className="sb-nav-label">{label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sb-user">
          <div className="sb-user-card">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{displayName}</div>
              <div className="sb-user-role">Administrator</div>
            </div>
            <button
              className="sb-logout"
              title="Log out"
              onClick={() => onLogout ? onLogout() : undefined}
            >
              <IconLogout size={14} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;