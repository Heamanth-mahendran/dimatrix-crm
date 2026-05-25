// Layout.tsx - Wraps every page with Sidebar + Navbar
<<<<<<< HEAD
=======
// So we don't repeat Sidebar and Navbar in every page file

>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
<<<<<<< HEAD
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  onLogout?: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ activePage, onNavigate, children, onLogout, userName }) => {
=======
  activePage: string;                    // Which page is active
  onNavigate: (page: string) => void;    // Function to change page
  children: React.ReactNode;             // The page content goes here
}

const Layout: React.FC<LayoutProps> = ({ activePage, onNavigate, children }) => {
  // searchValue state lives here so Navbar can update it
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
  const [searchValue, setSearchValue] = useState("");

  return (
    <div style={styles.container}>
<<<<<<< HEAD
      <Sidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} userName={userName} />
      <div style={styles.mainArea}>
        <Navbar searchValue={searchValue} onSearchChange={setSearchValue} />
=======

      {/* Left sidebar */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Right side: top navbar + page content */}
      <div style={styles.mainArea}>
        <Navbar searchValue={searchValue} onSearchChange={setSearchValue} />

        {/* Page content - has top padding because navbar is fixed */}
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
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
<<<<<<< HEAD
    marginLeft: "200px",
    flex: 1,
  },
  pageContent: {
    marginTop: "70px",
    padding: "26px",
=======
    marginLeft: "200px",         // Same width as sidebar
    flex: 1,
  },
  pageContent: {
    marginTop: "70px",           // Space for the fixed navbar
    padding: "32px",
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
    minHeight: "calc(100vh - 70px)",
  },
};

export default Layout;
