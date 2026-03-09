// Layout.tsx - Wraps every page with Sidebar + Navbar
// So we don't repeat Sidebar and Navbar in every page file

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
  activePage: string;                    // Which page is active
  onNavigate: (page: string) => void;    // Function to change page
  children: React.ReactNode;             // The page content goes here
}

const Layout: React.FC<LayoutProps> = ({ activePage, onNavigate, children }) => {
  // searchValue state lives here so Navbar can update it
  const [searchValue, setSearchValue] = useState("");

  return (
    <div style={styles.container}>

      {/* Left sidebar */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Right side: top navbar + page content */}
      <div style={styles.mainArea}>
        <Navbar searchValue={searchValue} onSearchChange={setSearchValue} />

        {/* Page content - has top padding because navbar is fixed */}
        <div style={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  },
  mainArea: {
    marginLeft: "200px",         // Same width as sidebar
    flex: 1,
  },
  pageContent: {
    marginTop: "70px",           // Space for the fixed navbar
    padding: "32px",
    minHeight: "calc(100vh - 70px)",
  },
};

export default Layout;
