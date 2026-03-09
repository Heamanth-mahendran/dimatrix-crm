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
