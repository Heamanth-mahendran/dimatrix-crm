<<<<<<< HEAD
// src/data/sampleLeads.ts
// Just empty the array - keep the file so no import errors break

import { Lead } from "../types/lead";

export const sampleLeads: Lead[] = [];  
=======
// This file has sample/dummy lead data
// When the app loads for the first time, we save this to localStorage

import { Lead } from "../types/lead";

export const sampleLeads: Lead[] = [
  {
    id: "1",
    name: "Heamanth",
    email: "heamanthmahendran36@gmail.com",
    phone: "7358569113",
    company: "Tech Craft",
    source: "Meta ads",
    campaign: "Summer campaign",  
    dealValue: 42000,
    stage: "New leads",
    priority: "High",
    aiScore: 82,
    createdDate: "22-03-2025",
    lastFollowUp: "20-03-2025",
  },
  {
    id: "2",
    name: "Dinesh",
    email: "dinesh@gmail.com",
    phone: "9876543210",
    company: "Tech Craft",
    source: "Google ads",
    campaign: "Summer campaign",
    dealValue: 42000,
    stage: "Contacted",
    priority: "medium",
    aiScore: 65,
    createdDate: "20-03-2025",
    lastFollowUp: "21-03-2025",
  },
  {
    id: "3",
    name: "Bobert",
    email: "bobert@gmail.com",
    phone: "8765432109",
    company: "Tech Craft",
    source: "Referral",
    campaign: "Summer campaign",
    dealValue: 42000,
    stage: "Qualified",
    priority: "low",
    aiScore: 45,
    createdDate: "18-03-2025",
  },
  {
    id: "4",
    name: "Rohit Sharma",
    email: "rohit@technova.com",
    phone: "9988776655",
    company: "Technova",
    source: "Cold call",
    campaign: "Q1 Outreach",
    dealValue: 10000,
    stage: "Proposal Sent",
    priority: "High",
    aiScore: 90,
    createdDate: "15-03-2025",
    lastFollowUp: "22-03-2025",
  },
  {
    id: "5",
    name: "Priya",
    email: "priya@example.com",
    phone: "9123456789",
    company: "Nexus Corp",
    source: "Website",
    campaign: "Organic",
    dealValue: 25000,
    stage: "Follow up",
    priority: "medium",
    aiScore: 73,
    createdDate: "10-03-2025",
  },
  {
    id: "6",
    name: "Arjun",
    email: "arjun@startup.io",
    phone: "8899001122",
    company: "StartupIO",
    source: "Meta ads",
    campaign: "Summer campaign",
    dealValue: 15000,
    stage: "Won",
    priority: "High",
    aiScore: 95,
    createdDate: "05-03-2025",
    lastFollowUp: "20-03-2025",
  },
  {
    id: "7",
    name: "Meera",
    email: "meera@corp.com",
    phone: "7711223344",
    company: "CorpSolutions",
    source: "Google ads",
    campaign: "Q1 Outreach",
    dealValue: 8000,
    stage: "Lost",
    priority: "low",
    aiScore: 30,
    createdDate: "01-03-2025",
  },
];
>>>>>>> 12313050958124f8b3aadb804842a8e9a09f1392
