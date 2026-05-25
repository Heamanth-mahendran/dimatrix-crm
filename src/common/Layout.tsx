// Layout.tsx - Wraps every page with Sidebar + Navbar
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  onLogout?: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ activePage, onNavigate, children, onLogout, userName }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div style={styles.container}>
      <Sidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} userName={userName} />
      <div style={styles.mainArea}>
        <Navbar searchValue={searchValue} onSearchChange={setSearchValue} />
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
    marginLeft: "200px",
    flex: 1,
  },
  pageContent: {
    marginTop: "70px",
    padding: "26px",
    minHeight: "calc(100vh - 70px)",
  },
};

export default Layout;
