export type OpportunityStatus =
  | "NEW"
  | "APPLIED"
  | "ASSESSMENT_PENDING"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "DORMANT"
  | "ARCHIVED"
  | (string & {});

export type OpportunityTier = "T1" | "T2" | "T3";

export type Priority = "P0" | "P1" | "P2";

export interface GmailEmailSignal {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  detectedStatus: OpportunityStatus;
  detectedCompany: string;
  detectedRole: string;
}

export interface Opportunity {
  id: string;
  companyName: string;
  roleTitle: string;
  source: "LinkedIn" | "OLJ" | "Direct" | "Referral" | "Funnel" | "Gmail";
  tier: OpportunityTier;
  category: string;
  status: OpportunityStatus;
  priority: Priority;
  link?: string;
  dateApplied?: string;
  lastActivityDate?: string;
  nextActionDate?: string;
  riskFlag?: "none" | "deadline_missed" | "no_response" | "unclear";
  score?: number;
  notes?: string;
  logs?: Array<{ id: string; date: string; text: string }>;
  sopScore?: number;
  automationScore?: number;
  compensationScore?: number;
  urgencyScore?: number;
}
