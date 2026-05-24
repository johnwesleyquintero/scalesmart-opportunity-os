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
    company: "EcomBrands LLC",
    role: "Junior Amazon VA (Tier 1)",
    text: "From: HR Team <recruiting@ecombrands.com>\nSubject: Job Details: Junior Amazon VA & Data Entry Specialist\n\nHi Wesley,\nThank you for applying for our entry-level Amazon VA role. This position is a perfect Tier 1 Execution opportunity. It focuses on day-to-day operations: data entry for listings, manual inventory counts, basic product catalog spreadsheet entry, and Shopify/eBay listing upkeep following our existing SOP guidelines. The starting compensation is $7.50/hr on a part-time basis. Let's schedule a brief greeting call next Monday!"
  },
  {
    company: "SecuLife Operations",
    role: "Catalog Specialist (Tier 2)",
    text: "From: Operations Director <ops@seculife.com>\nSubject: Interview Loop Strategy: Amazon & Shopify Catalog Specialist\n\nDear John Wesley,\nWe were highly impressed with your background managing 200+ ASINs. For this Tier 2 Specialist level position, you will own daily Seller Central catalog health, listing suppressions, variation architecture, flat file uploads, and keyword tracking using Helium 10/Data Dive. The compensation is $18/hr with standard benefits. We would love to host a 30-minute interview discussion next Tuesday at 2 PM to go deeper!"
  },
  {
    company: "My Amazon Guy Agency",
    role: "Systems Architect & Catalog Lead (Tier 3)",
    text: "From: Account Director <partnerships@myamazonguy.com>\nSubject: Discussion: Senior Lead Amazon Catalog recovery & SOP architect (Tier 3)\n\nHi Wesley,\nWe saw your background restoring high-value listing escalations and designing bulk flat-file variation systems. We have a Tier 3 Systems / Architect role open requiring a true subject matter expert. You would be managing high-tier Seller Support escalations, doing deep catalog recovery, designing AI-assisted troubleshooting SOPs, and coordinating processes across multiple client accounts. Base compensation is $35/hr. Let's set up a technical discussion next week!"
  },
  {
    company: "ScaleSmart Consulting",
    role: "E-commerce Operations consultant (Tier 3)",
    text: "From: Managing Partner <consulting@scalesmart.ai>\nSubject: Proposal Agreement - Custom Google Sheets/Apps Script automation system\n\nHi Wesley,\nWe love your WesBI Cockpit dashboard system and custom Google Apps Script automation portfolio. We want to bring you on as an E-commerce Operations Architect consultant. Your scope will include auditing multi-brand order workflows, formulating process checklists, and building customized Apps Script reporting pipelines to keep inventories reconciled. Flat rate of $4,500/month. Standard onboarding begins next Thursday."
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
