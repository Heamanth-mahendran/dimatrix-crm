// This file has helper functions to save and load leads from localStorage
// localStorage is like a mini database inside the browser

import { Lead } from "../types/lead";
import { sampleLeads } from "../data/sampleLeads";

// The key name we use to store leads in localStorage
const STORAGE_KEY = "dimatrix_leads";

// Load all leads from localStorage
// If no leads exist yet, we load the sample data
export function getLeads(): Lead[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    // Parse the JSON string back into a JavaScript array
    return JSON.parse(data);
  } else {
    // First time opening the app - save sample data and return it
    saveLeads(sampleLeads);
    return sampleLeads;
  }
}

// Save the entire leads array to localStorage
export function saveLeads(leads: Lead[]): void {
  // JSON.stringify converts the array into a string so localStorage can store it
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

// Add one new lead to the list
export function addLead(lead: Lead): void {
  const leads = getLeads();
  leads.push(lead); // Add the new lead to the end of the array
  saveLeads(leads);
}

// Update an existing lead by its ID
export function updateLead(updatedLead: Lead): void {
  const leads = getLeads();
  // Find the lead with the same ID and replace it
  const index = leads.findIndex((l) => l.id === updatedLead.id);
  if (index !== -1) {
    leads[index] = updatedLead;
    saveLeads(leads);
  }
}

// Delete a lead by its ID
export function deleteLead(id: string): void {
  const leads = getLeads();
  // Keep all leads EXCEPT the one with the matching ID
  const filtered = leads.filter((l) => l.id !== id);
  saveLeads(filtered);
}

// Generate a unique ID for each new lead
// Date.now() gives milliseconds since 1970 - always unique
export function generateId(): string {
  return Date.now().toString();
}
