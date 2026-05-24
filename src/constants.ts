import { Opportunity, OpportunityStatus, OpportunityTier, Priority, GmailEmailSignal } from "./types";

export const INITIAL_DATA: Opportunity[] = [
  {
    id: "1",
    companyName: "Acme Corp",
    roleTitle: "Strategic Enterprise Automation Partner",
    source: "LinkedIn",
    tier: "T1",
    category: "AI Strategy",
    status: "INTERVIEWING",
    priority: "P0",
    link: "https://linkedin.com",
    dateApplied: "2026-05-15",
    lastActivityDate: "2026-05-23",
    nextActionDate: "2026-05-25",
    notes: "VP Operations loved the proof of work. Prepare proposal for scaling onboarding automation.",
    score: 85
  },
  {
    id: "2",
    companyName: "Stripe",
    roleTitle: "High-Leverage Scaling Consigliere",
    source: "Referral",
    tier: "T1",
    category: "Operations",
    status: "ASSESSMENT_PENDING",
    priority: "P1",
    link: "https://stripe.com",
    dateApplied: "2026-05-18",
    lastActivityDate: "2026-05-18",
    nextActionDate: "2026-05-24",
    notes: "Received ledger performance exercise. High cognitive load, solid Tier 1 strategic leverage."
  },
  {
    id: "3",
    companyName: "Nebula Solutions",
    roleTitle: "Lead Revenue Infrastructure Builder",
    source: "OLJ",
    tier: "T2",
    category: "RevOps",
    status: "APPLIED",
    priority: "P2",
    dateApplied: "2026-05-08",
    lastActivityDate: "2026-05-08",
    nextActionDate: "2026-05-28",
    notes: "Applied via online job board. No initial screening yet. Follow-up sequence ready."
  },
  {
    id: "4",
    companyName: "Apex Tech",
    roleTitle: "Legacy Webmaster Support Architect",
    source: "Funnel",
    tier: "T3",
    category: "Web Development",
    status: "DORMANT",
    priority: "P2",
    dateApplied: "2026-04-12",
    lastActivityDate: "2026-04-20",
    notes: "Budget misalignment. soft-archived to dormant status."
  }
];

export const INITIAL_SIGNALS: GmailEmailSignal[] = [
  {
    id: "sig-1",
    sender: "recruiting@stripe.com",
    subject: "Stripe Scaling Consigliere — Ledger Performance Challenge",
    snippet: "Thanks for taking the time to speak with us. The next step is a high-cognitive-load, 3-hour practical ledger scaling simulation exercise...",
    detectedStatus: "ASSESSMENT_PENDING",
    detectedCompany: "Stripe",
    detectedRole: "High-Leverage Scaling Consigliere"
  },
  {
    id: "sig-2",
    sender: "careers@spacex.com",
    subject: "Interview Schedule: SpaceX Logistics Infrastructure Partner",
    snippet: "We would love to invite you for your initial technical deep-dive. Please use the calendar slot below to schedule your synchronous discussion...",
    detectedStatus: "INTERVIEWING",
    detectedCompany: "SpaceX",
    detectedRole: "Logistics Infrastructure Partner"
  },
  {
    id: "sig-3",
    sender: "no-reply@anthropic.com",
    subject: "Application Received: Strategic Operations Lead Blueprints",
    snippet: "We received your submission for the Strategic Operations position. Our operational team is reviewing your blueprints. No further actions needed...",
    detectedStatus: "APPLIED",
    detectedCompany: "Anthropic",
    detectedRole: "Strategic Operations Lead"
  }
];

export const SANDBOX_TEMPLATES = [
  {
    company: "Google",
    role: "Software Engineer",
    text: "From: Google Careers <no-reply@careers.google.com>\nSubject: Update on your Software Engineer application\n\nDear Candidate,\nThank you for submitting your resume! We have successfully received your application. Base range is $185k/yr. We will follow up."
  },
  {
    company: "Stripe",
    role: "API Engineer",
    text: "From: Stripe Recruiting <recruiting@stripe.com>\nSubject: Schedule technical systems review\n\nHi Wesley,\nWe love your automation and ScaleSmart project experience! Let's schedule a 45-minute technical system design loop next Wednesday."
  },
  {
    company: "Anthropic",
    role: "Revenue Coach",
    text: "From: Anthropic Talent <offers@anthropic.ai>\nSubject: Employment Offer - Revenue Operations\n\nWesley, we are thrilled to extend a solid offer of employment! Base will be $210,000 annual. Congrats on this milestone!"
  },
  {
    company: "Airbnb",
    role: "UX Engineer",
    text: "From: Airbnb Careers <jobs@airbnb.com>\nSubject: Your engineering application status\n\nDear Wesley,\nUnfortunately, we have decided to move forward with other candidates who closely align. We wish you success."
  }
];

export const SOURCE_OPTIONS: Opportunity["source"][] = ["LinkedIn", "OLJ", "Direct", "Referral", "Funnel", "Gmail"];

export const TIER_OPTIONS: OpportunityTier[] = ["T1", "T2", "T3"];

export const PRIORITY_OPTIONS: Priority[] = ["P0", "P1", "P2"];

export const STATUS_OPTIONS: { value: OpportunityStatus; label: string }[] = [
  { value: "NEW", label: "NEW" },
  { value: "APPLIED", label: "APPLIED" },
  { value: "ASSESSMENT_PENDING", label: "ASSESSMENT" },
  { value: "INTERVIEWING", label: "INTERVIEWING" },
  { value: "OFFER", label: "OFFER" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "DORMANT", label: "DORMANT" },
  { value: "ARCHIVED", label: "ARCHIVED" }
];
