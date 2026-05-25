// lead.ts - Lead type definitions only
// This file defines the shape (type) of a Lead object
// TypeScript uses this to catch errors when you use wrong data

export type LeadStage =
  | "New leads"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Follow up"
  | "Won"
  | "Lost";

export type LeadPriority = "High" | "medium" | "low";

export type LeadSource =
  | "Meta ads"
  | "Google ads"
  | "Referral"
  | "Cold call"
  | "Website"
  | "Other";

// This is the main Lead type - every lead object must have these fields
export interface Lead {
  id: string;                    // Unique ID for each lead
  name: string;                  // Lead's full name
  email: string;                 // Lead's email address
  phone: string;                 // Lead's phone number
  company: string;               // Company name
  source: LeadSource;            // Where this lead came from
  campaign: string;              // Campaign name
  dealValue: number;             // Expected deal value in rupees
  stage: LeadStage;              // Which stage in the sales pipeline
  priority: LeadPriority;        // High, medium, or low priority
  aiScore: number;               // AI score from 0 to 100
  createdDate: string;           // Date the lead was created (as a string)
  lastFollowUp?: string; 
  aiTag?: "hot" | "warm" | "cold";         // Last follow-up date (optional)
}