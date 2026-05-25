import React, { useState, useEffect, useCallback } from "react";
import Layout from "./common/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import Contacts from "./pages/Contacts";
import Tasks from "./pages/Tasks";
import AiInsights from "./pages/AiInsights";
import Automation from "./pages/Automation";
import Reports from "./pages/Reports";
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
      case "Leads":
        return (
          <Leads
            leads={leads}
            onLeadsChange={setLeads}
            onNavigate={handleNavigateToForm}
            onEditLead={handleEditLead}
          />
        );
      case "Add Lead":
        return (
          <AddLead
            editLead={editLead}
            onSave={handleLeadSave}
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
        return (
          <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
            <h2>{activePage}</h2>
            <p>This page is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate} onLogout={handleLogout} userName={authUser.name}>
      {renderPage()}
    </Layout>
  );
};

export default App;
