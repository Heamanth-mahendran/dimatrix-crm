// App.tsx - The main file that ties everything together
// Manages which page is shown and the global leads state

import React, { useState, useEffect } from "react";
import Layout from "./common/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import Contacts from "./pages/Contacts";
import Tasks from "./pages/Tasks";
import AiInsights from "./pages/AiInsights";
import Automation from "./pages/Automation";
import Reports from "./pages/Reports";
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

      case "Leads":
        return (
          <Leads
            leads={leads}
            onLeadsChange={setLeads}
            onNavigate={handleNavigate}
            onEditLead={handleEditLead}
          />
        );

      case "Add Lead":
        return (
          <AddLead
            editLead={editLead}
            onSave={handleLeadSave}
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
        return (
          <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
            <h2>{activePage}</h2>
            <p>This page is coming soon.</p>
          </div>
        );
    }
  };

  return (
    // Layout wraps everything with Sidebar + Navbar
    <Layout activePage={activePage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default App;
