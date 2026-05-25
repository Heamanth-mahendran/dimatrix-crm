<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from "react";
=======
// App.tsx - The main file that ties everything together
// Manages which page is shown and the global leads state

import React, { useState, useEffect } from "react";
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
import Layout from "./common/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import Contacts from "./pages/Contacts";
import Tasks from "./pages/Tasks";
import AiInsights from "./pages/AiInsights";
import Automation from "./pages/Automation";
import Reports from "./pages/Reports";
<<<<<<< HEAD
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { Lead } from "./types/lead";
import { leadsApi } from "./services/api";

interface AuthUser {
  email: string;
  role: "user" | "admin";
  name: string;
}

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("dimatrix_auth");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [activePage, setActivePage] = useState("Dashboard");
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState("Leads");

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem("dimatrix_auth", JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem("dimatrix_auth");
  };

  const loadLeads = useCallback(async () => {
    try {
      setError(null);
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (err) {
      setError("Could not connect to backend. Is Flask running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser && authUser.role === "user") {
      loadLeads();
    } else {
      setLoading(false);
    }
  }, [authUser, loadLeads]);

  // Not logged in — show login page
  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin — show admin dashboard
  if (authUser.role === "admin") {
    return <AdminDashboard adminName={authUser.name} onLogout={handleLogout} />;
  }

  // ── Regular user CRM ─────────────────────────────────────────────────────────

  const handleNavigate = (page: string) => {
    if (page !== "Add Lead") setEditLead(null);
    setActivePage(page);
    loadLeads();
  };

  const handleEditLead = (lead: Lead) => {
    setPreviousPage(activePage);
    setEditLead(lead);
    setActivePage("Add Lead");
  };

  const handleNavigateToForm = (page: string) => {
    if (page === "Add Lead") setPreviousPage(activePage);
    setActivePage(page);
  };

  const handleLeadSave = async () => {
    await loadLeads();
    setEditLead(null);
    setActivePage(previousPage);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>
        <h2>⏳ Loading leads from database...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#e74c3c" }}>
        <h2>⚠️ Backend Error</h2>
        <p>{error}</p>
        <p style={{ color: "#888" }}>
          Make sure Flask is running:{" "}
          <code>cd backend && python app.py</code>
        </p>
        <button onClick={loadLeads} style={{ marginTop: 16, padding: "8px 20px" }}>
          Retry
        </button>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <Dashboard
            leads={leads}
            onNavigate={handleNavigate}
            onRefresh={loadLeads}
          />
        );
=======
import { Lead } from "./types/lead";
import { getLeads } from "./utils/storage";

const App: React.FC = () => {
  // activePage tracks which page is currently shown
  const [activePage, setActivePage] = useState("Dashboard");

  // editLead stores the lead being edited (null means we're adding a new one)
  const [editLead, setEditLead] = useState<Lead | null>(null);

  // leads is our main data - loaded from localStorage
  const [leads, setLeads] = useState<Lead[]>([]);

  // useEffect runs once when the app first loads
  // We use it to load leads from localStorage
  useEffect(() => {
    const savedLeads = getLeads(); // Load from localStorage
    setLeads(savedLeads);
  }, []); // The empty [] means "only run once on load"

  // Called when user clicks a nav item in the sidebar
  const handleNavigate = (page: string) => {
    setActivePage(page);
    // If navigating away from Add Lead, clear the edit state
    if (page !== "Add Lead") {
      setEditLead(null);
    }
  };

  // Called when edit button is clicked on a lead
  const handleEditLead = (lead: Lead) => {
    setEditLead(lead);        // Store which lead we're editing
    setActivePage("Add Lead"); // Show the form page
  };

  // Called when Add/Edit form is saved
  const handleLeadSave = () => {
    const updatedLeads = getLeads(); // Reload from localStorage
    setLeads(updatedLeads);
    setEditLead(null);
    setActivePage("Leads");  // Go back to Leads page after saving
  };

  // Decide which page component to render based on activePage
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard leads={leads} onNavigate={handleNavigate} />;

>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
      case "Leads":
        return (
          <Leads
            leads={leads}
            onLeadsChange={setLeads}
<<<<<<< HEAD
            onNavigate={handleNavigateToForm}
            onEditLead={handleEditLead}
          />
        );
=======
            onNavigate={handleNavigate}
            onEditLead={handleEditLead}
          />
        );

>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
      case "Add Lead":
        return (
          <AddLead
            editLead={editLead}
            onSave={handleLeadSave}
<<<<<<< HEAD
            onCancel={() => setActivePage(previousPage)}
          />
        );
      case "Contacts":
        return <Contacts leads={leads} onNavigate={handleNavigateToForm} />;
      case "Tasks":
        return <Tasks />;
      case "Ai insights":
        return <AiInsights leads={leads} onLeadsRefresh={loadLeads} />;
      case "Automation":
        return <Automation leads={leads} onLeadsRefresh={loadLeads} />;
      case "Reports":
        return <Reports leads={leads} />;
      default:
=======
            onCancel={() => setActivePage("Leads")}
          />
        );

      case "Contacts":
        return <Contacts leads={leads} />;

      case "Tasks":
        return <Tasks />;

      case "Ai insights":
        return <AiInsights leads={leads} />;

      case "Automation":
        return <Automation leads={leads} />;

      case "Reports":
        return <Reports leads={leads} />;

      default:
        // For pages not built yet, show a placeholder
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
        return (
          <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
            <h2>{activePage}</h2>
            <p>This page is coming soon.</p>
          </div>
        );
    }
  };

  return (
<<<<<<< HEAD
    <Layout activePage={activePage} onNavigate={handleNavigate} onLogout={handleLogout} userName={authUser.name}>
=======
    // Layout wraps everything with Sidebar + Navbar
    <Layout activePage={activePage} onNavigate={handleNavigate}>
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
      {renderPage()}
    </Layout>
  );
};

export default App;
