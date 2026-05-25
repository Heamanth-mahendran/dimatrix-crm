<<<<<<< HEAD
// Navbar.tsx - Top navigation bar with AI Assistant trigger
// The AI ASSISTANT button opens the slide-in AIAssistant panel

import React, { useState } from "react";
import AIAssistant from "../pages/AIAssistant";

interface NavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconSearch: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" />
    <path d="M11 11l3 3" />
  </svg>
);

const IconBell: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5a4.5 4.5 0 00-4.5 4.5c0 2-.5 3-1.5 4h12c-1-1-1.5-2-1.5-4A4.5 4.5 0 008 1.5z" />
    <path d="M6.5 13.5a1.5 1.5 0 003 0" />
  </svg>
);

const IconSettings: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
  </svg>
);

const IconSparkle: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1v14M1 8h14M3.5 3.5l9 9M12.5 3.5l-9 9" strokeWidth="1" opacity="0.4" />
    <path d="M8 2l1 3.5L12 8l-3 1.5L8 13l-1-3.5L4 8l3-1.5z" strokeWidth="1.4" />
  </svg>
);

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const Navbar: React.FC<NavbarProps> = ({ searchValue, onSearchChange }) => {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .nb-root {
          display: flex;
          align-items: center;
          gap: 0;
          height: 56px;
          background: #ffffff;
          border-bottom: 1px solid #e5e9f0;
          position: fixed;
          top: 0;
          left: 224px;
          right: 0;
          z-index: 99;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0 24px 0 28px;
        }

        /* Search */
        .nb-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 360px;
        }

        .nb-search-icon {
          position: absolute;
          left: 11px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .nb-search-input {
          width: 100%;
          height: 36px;
          padding: 0 14px 0 34px;
          border: 1px solid #e5e9f0;
          border-radius: 8px;
          font-size: 13.5px;
          color: #111827;
          background: #f8fafc;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }

        .nb-search-input::placeholder { color: #b0b7c3; }

        .nb-search-input:focus {
          border-color: #1a56db;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }

        /* Divider */
        .nb-sep {
          width: 1px;
          height: 28px;
          background: #e5e9f0;
          margin: 0 20px;
          flex-shrink: 0;
        }

        /* AI button */
        .nb-ai-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 16px;
          background: #1a56db;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.1px;
          transition: background 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }

        .nb-ai-btn:hover {
          background: #1446c0;
          box-shadow: 0 2px 8px rgba(26,86,219,0.25);
        }

        .nb-ai-icon {
          display: flex;
          align-items: center;
          opacity: 0.9;
        }

        /* Right section */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
        }

        /* Icon buttons */
        .nb-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          position: relative;
          transition: background 0.12s, color 0.12s;
        }

        .nb-icon-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* Notification badge */
        .nb-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          border: 1.5px solid #fff;
        }

        /* Thin separator before user */
        .nb-user-sep {
          width: 1px;
          height: 24px;
          background: #e5e9f0;
          margin: 0 12px 0 8px;
          flex-shrink: 0;
        }

        /* User greeting */
        .nb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 8px;
          transition: background 0.12s;
        }

        .nb-user:hover { background: #f3f4f6; }

        .nb-greeting {
          text-align: right;
          line-height: 1.25;
        }

        .nb-greeting-sub {
          font-size: 10.5px;
          color: #9ca3af;
          font-weight: 500;
        }

        .nb-greeting-name {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }

        .nb-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1a56db, #3b82f6);
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <div className="nb-root">

        {/* Search */}
        <div className="nb-search-wrap">
          <span className="nb-search-icon"><IconSearch /></span>
          <input
            className="nb-search-input"
            type="text"
            placeholder="Search contacts, leads, deals..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="nb-sep" />

        {/* AI Assistant button */}
        <button className="nb-ai-btn" onClick={() => setAssistantOpen(true)}>
          <span className="nb-ai-icon"><IconSparkle /></span>
          AI Assistant
        </button>

        {/* Right icons */}
        <div className="nb-right">

          <button className="nb-icon-btn" title="Notifications">
            <IconBell />
            <span className="nb-badge" />
          </button>

          <button className="nb-icon-btn" title="Settings">
            <IconSettings />
          </button>

          <div className="nb-user-sep" />

          {/* User */}
          <div className="nb-user">
            <div className="nb-greeting">
              <div className="nb-greeting-sub">{getGreeting()}</div>
              <div className="nb-greeting-name">Heamanth</div>
            </div>
            <div className="nb-user-avatar">HM</div>
          </div>

        </div>
      </div>

      {/* Slide-in AI Assistant panel */}
      <AIAssistant
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </>
  );
};

export default Navbar;
=======
// Navbar.tsx - The top navigation bar
// Shows search bar, AI Assistant button, and username

import React from "react";

interface NavbarProps {
  searchValue: string;                    // Current search text
  onSearchChange: (value: string) => void; // Called when user types in search
}

const Navbar: React.FC<NavbarProps> = ({ searchValue, onSearchChange }) => {
  return (
    <div style={styles.navbar}>

      {/* Search input field */}
      <input
        type="text"
        placeholder="Search for contacts, leads"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)} // Update search on every keystroke
        style={styles.searchInput}
      />

      {/* AI Assistant button - dark blue */}
      <button style={styles.aiButton}>AI ASSISTANT</button>

      {/* Username display on the right */}
      <span style={styles.username}>Good Afternoon,Heamanth</span>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "16px 32px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e5e5",
    position: "fixed",           // Stays at top when scrolling
    top: 0,
    left: "200px",               // Starts after the sidebar
    right: 0,
    zIndex: 99,
  },
  searchInput: {
    flex: 1,                     // Takes up most of the space
    maxWidth: "380px",
    padding: "10px 16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    color: "#333",
  },
  aiButton: {
    backgroundColor: "#1a2744", // Dark navy blue
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  username: {
    marginLeft: "auto",          // Pushes to the far right
    fontSize: "15px",
    color: "#333",
    fontWeight: "800",
    fontFamily:"poppins"
    
  },
};

export default Navbar;
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
