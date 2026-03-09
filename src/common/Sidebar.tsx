
import React from "react";

// Define what props (properties) this component accepts
interface SidebarProps {
  activePage: string; // Which page is currently active (so we can highlight it)
  onNavigate: (page: string) => void; // Function to call when user clicks a nav item
}

// All the navigation menu items
const navItems = [
  "Dashboard",
  "Leads",
  "Contacts",
  "Tasks",  
  "Ai insights",
  "Automation",
  "Reports",
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    // The outer sidebar container - full height, dark background
    <div style={styles.sidebar}>

      {/* App title at the top */}
      <div style={styles.logo}>Dimatrix CRM</div>

      {/* Navigation menu */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          // Check if this item is the currently active page
          const isActive = activePage === item;

          return (
            <button
              key={item}
              onClick={() => onNavigate(item)} // When clicked, tell parent to navigate
              style={{
                ...styles.navItem,
                // If active, apply the active style (grey background)
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* Divider line between nav and user info */}
      <div style={styles.divider} />

      {/* User profile section at the bottom */}
      <div style={styles.userSection}>
        {/* Avatar circle with initials */}
        <div style={styles.avatar}>HM</div>

        <div style={styles.userInfo}>
          <div style={styles.userName}>Heamanth</div>
          <div style={styles.userRole}>User</div>
          {/* Logout button - red color to stand out */}
          <button style={styles.logoutBtn}>LOG OUT</button>
        </div>
      </div>
    </div>
  );
};

// All the CSS styles written as JavaScript objects
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: "200px",
    minHeight: "100vh",        // Full height of the screen
    backgroundColor: "#0d0d0d", // Very dark background
    display: "flex",
    flexDirection: "column",   // Stack items vertically
    padding: "0",
    position: "fixed",         // Stay in place when scrolling
    left: 0,
    top: 0,
    zIndex: 100,
  },

  logo: {
    color: "white",
    fontSize: "22px",
    fontFamily:"poppins",
    fontWeight: "bolder",
    padding: "30px 24px 20px",
    borderBottom: "1px solid #333",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    flex: 1,                   // Takes up remaining space
  },

navItem: {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "15px",
  padding: "12px 24px",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "6px",
  margin: "2px 12px",
  transition: "background 0.2s",
  WebkitAppearance: "none",
  width: "calc(100% - 24px)", 
  backgroundColor :"transparent" 
},

navItemActive: {
  backgroundColor: "#3a3a3a", 
},

  divider: {
    height: "1px",
    backgroundColor: "#333",
    margin: "0 12px",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 24px",
  },

  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",       // Makes it a circle
    backgroundColor: "white",
    color: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  userName: {
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
  },
  userRole: {
    color: "#aaa",
    fontSize: "13px",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#e63946",           // Red color for logout
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
  },
};

export default Sidebar;
