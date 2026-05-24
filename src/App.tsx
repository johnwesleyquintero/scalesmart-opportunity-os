import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "./types";
import {
  Plus, X, Pencil, Trash, FileText, Check, AlertTriangle, ExternalLink,
  Radio, Database, Code, Copy, RefreshCw, Send, CheckCircle2, Info, Layers, Download,
  ChevronUp, ChevronDown, ChevronsUpDown
} from "lucide-react";

const INITIAL_DATA: Opportunity[] = [
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

// MOCK Gmail signals for interactive simulation
interface GmailEmailSignal {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  detectedStatus: OpportunityStatus;
  detectedCompany: string;
  detectedRole: string;
}

const INITIAL_SIGNALS: GmailEmailSignal[] = [
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

type FilterType = "ALL" | "ACTIVE" | "INTERVIEWING" | "ACTION_REQUIRED" | "DORMANT";

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem("scalesmart_opportunities_mvp");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing localStorage", e);
      }
    }
    return INITIAL_DATA;
  });

  // Controls UI layout state
  const [activeTab, setActiveTab] = useState<"cockpit" | "radar">("cockpit");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("1");

  // Sort state
  const [sortField, setSortField] = useState<keyof Opportunity | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Opportunity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [oppToEdit, setOppToEdit] = useState<Opportunity | null>(null);
  const [radarSignals, setRadarSignals] = useState<GmailEmailSignal[]>(INITIAL_SIGNALS);
  
  // Custom sandbox parser tool
  const [sandboxEmailText, setSandboxEmailText] = useState("");
  const [sandboxExtractedCompany, setSandboxExtractedCompany] = useState("");
  const [sandboxExtractedRole, setSandboxExtractedRole] = useState("");
  const [sandboxExtractedStatus, setSandboxExtractedStatus] = useState<OpportunityStatus>("APPLIED");
  const [isSandboxParsed, setIsSandboxParsed] = useState(false);

  // Manual code copy indicator
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Modal form states
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formSource, setFormSource] = useState<Opportunity["source"]>("LinkedIn");
  const [formTier, setFormTier] = useState<OpportunityTier>("T2");
  const [formCategory, setFormCategory] = useState("");
  const [formStatus, setFormStatus] = useState<OpportunityStatus>("NEW");
  const [formPriority, setFormPriority] = useState<Priority>("P1");
  const [formLink, setFormLink] = useState("");
  const [formDateApplied, setFormDateApplied] = useState("");
  const [formNextActionDate, setFormNextActionDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    localStorage.setItem("scalesmart_opportunities_mvp", JSON.stringify(opportunities));
  }, [opportunities]);

  const selectedOpp = opportunities.find((o) => o.id === selectedId) || null;

  // Sync to form states for add/edit modal
  const openAddModal = () => {
    setModalMode("ADD");
    setFormCompany("");
    setFormRole("");
    setFormSource("LinkedIn");
    setFormTier("T2");
    setFormCategory("");
    setFormStatus("NEW");
    setFormPriority("P1");
    setFormLink("");
    setFormDateApplied("2026-05-24");
    setFormNextActionDate("");
    setFormNotes("");
  };

  const openEditModal = (opp: Opportunity) => {
    setModalMode("EDIT");
    setOppToEdit(opp);
    setFormCompany(opp.companyName);
    setFormRole(opp.roleTitle);
    setFormSource(opp.source);
    setFormTier(opp.tier);
    setFormCategory(opp.category || "");
    setFormStatus(opp.status);
    setFormPriority(opp.priority);
    setFormLink(opp.link || "");
    setFormDateApplied(opp.dateApplied || "");
    setFormNextActionDate(opp.nextActionDate || "");
    setFormNotes(opp.notes || "");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim()) return;

    if (modalMode === "ADD") {
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        companyName: formCompany.trim(),
        roleTitle: formRole.trim(),
        source: formSource,
        tier: formTier,
        category: formCategory.trim() || "Operations",
        status: formStatus,
        priority: formPriority,
        link: formLink.trim() || undefined,
        dateApplied: formDateApplied || undefined,
        lastActivityDate: "2026-05-24",
        nextActionDate: formNextActionDate || undefined,
        notes: formNotes.trim() || undefined
      };
      setOpportunities([newOpp, ...opportunities]);
      setSelectedId(newOpp.id);
    } else if (modalMode === "EDIT" && oppToEdit) {
      const updated: Opportunity = {
        ...oppToEdit,
        companyName: formCompany.trim(),
        roleTitle: formRole.trim(),
        source: formSource,
        tier: formTier,
        category: formCategory.trim() || "Operations",
        status: formStatus,
        priority: formPriority,
        link: formLink.trim() || undefined,
        dateApplied: formDateApplied || undefined,
        nextActionDate: formNextActionDate || undefined,
        lastActivityDate: "2026-05-24",
        notes: formNotes.trim() || undefined
      };
      setOpportunities(opportunities.map((o) => (o.id === oppToEdit.id ? updated : o)));
    }
    setModalMode(null);
    setOppToEdit(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this opportunity?")) {
      const remaining = opportunities.filter((o) => o.id !== id);
      setOpportunities(remaining);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id || null);
      }
    }
  };

  const updateStatus = (opp: Opportunity, nextStatus: OpportunityStatus) => {
    const updated: Opportunity = {
      ...opp,
      status: nextStatus,
      lastActivityDate: "2026-05-24"
    };
    setOpportunities(opportunities.map((o) => (o.id === opp.id ? updated : o)));
  };

  const updatePriority = (opp: Opportunity, p: Priority) => {
    const updated: Opportunity = {
      ...opp,
      priority: p,
      lastActivityDate: "2026-05-24"
    };
    setOpportunities(opportunities.map((o) => (o.id === opp.id ? updated : o)));
  };

  // Live sandbox text parsing logic simulating client Apps Script parser!
  const executeSandboxParse = () => {
    if (!sandboxEmailText.trim()) return;
    const txt = sandboxEmailText.toLowerCase();
    
    // 1. Company Extraction
    let extractedCompany = "Unknown Target";
    const companyKeywords = ["stripe", "spacex", "anthropic", "google", "meta", "netflix", "airbnb", "uber", "figma", "notion"];
    for (const kw of companyKeywords) {
      if (txt.includes(kw)) {
        extractedCompany = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }

    // 2. Role Extraction
    let extractedRole = "Strategic Scaling Strategist";
    if (txt.includes("engineer") || txt.includes("developer")) {
      extractedRole = "Automation Engineer Partner";
    } else if (txt.includes("operator") || txt.includes("operations") || txt.includes("consigliere")) {
      extractedRole = "Revenue Operations Architect";
    } else if (txt.includes("partner") || txt.includes("manager")) {
      extractedRole = "Strategic Logistics Partner";
    }

    // 3. Status Mapping Rules (Strictly as per Gmail v1 radar specification)
    let extractedStatus: OpportunityStatus = "NEW";
    if (txt.includes("schedule") || txt.includes("interview") || txt.includes("technical call") || txt.includes("invitation")) {
      extractedStatus = "INTERVIEWING";
    } else if (txt.includes("assessment") || txt.includes("test") || txt.includes("exercise") || txt.includes("challenge")) {
      extractedStatus = "ASSESSMENT_PENDING";
    } else if (txt.includes("received") || txt.includes("confirm") || txt.includes("submitted") || txt.includes("applied")) {
      extractedStatus = "APPLIED";
    }

    setSandboxExtractedCompany(extractedCompany);
    setSandboxExtractedRole(extractedRole);
    setSandboxExtractedStatus(extractedStatus);
    setIsSandboxParsed(true);
  };

  // Promote a signal directly into Ledger matching v1 design
  const promoteSignalToLedger = (signal: GmailEmailSignal) => {
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      companyName: signal.detectedCompany,
      roleTitle: signal.detectedRole,
      source: "Gmail",
      tier: "T2", // default middle tier
      category: signal.detectedStatus === "ASSESSMENT_PENDING" ? "Technical Assessment" : signal.detectedStatus === "INTERVIEWING" ? "Active Loop" : "Funnel",
      status: signal.detectedStatus,
      priority: signal.detectedStatus === "INTERVIEWING" ? "P0" : "P1",
      dateApplied: "2026-05-24",
      lastActivityDate: "2026-05-24",
      notes: signal.snippet
    };

    setOpportunities([newOpp, ...opportunities]);
    setSelectedId(newOpp.id);
    
    // Remove from radar sim list
    setRadarSignals(radarSignals.filter((s) => s.id !== signal.id));
    alert(`Signal successfully promoted! ${signal.detectedCompany} is now synchronized into your Ledger database.`);
  };

  // Copy Google Apps Script code to clipboard
  const handleCopyCode = () => {
    const code = getAppsScriptCode();
    navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  // Get raw code block
  const getAppsScriptCode = () => {
    return `/**
 * ScaleSmart OS v1 — Gmail Signal Detector & Sheets Loader
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet where your opportunities are kept.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default placeholder code and paste this script.
 * 4. Click the Save icon (floppy disk).
 * 5. Run setupSheet() first to configure your columns, formats, and filters!
 * 6. Run setupTrigger() to establish automatic hourly inbox sweeps!
 */

const SHEET_NAME = "Sheet1";

/**
 * Initializes and formats your active Google Sheet with the correct col headers,
 * font alignments, column widths, frozen rows, and active filters.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = [
    "Company Name", 
    "Role Title", 
    "Source", 
    "Tier", 
    "Status", 
    "Priority", 
    "Link", 
    "Date Applied", 
    "Last Activity Date", 
    "Notes", 
    "Thread ID"
  ];
  
  // Set header row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header look
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#0f172a"); // slate-900 background
  headerRange.setFontColor("#ffffff");    // white text
  headerRange.setFontFamily("Arial");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 28);
  
  // Freeze Row 1 so it stays locked
  sheet.setFrozenRows(1);
  
  // Create filters
  try {
    const existingFilter = sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    const lastRow = sheet.getLastRow() > 1 ? sheet.getLastRow() : 100;
    sheet.getRange(1, 1, lastRow, headers.length).createFilter();
  } catch(e) {
    Logger.log("Filters could not be created/refreshed: " + e.message);
  }

  // Adjust columns to perfect sizing
  sheet.setColumnWidth(1, 180); // Company Name
  sheet.setColumnWidth(2, 220); // Role
  sheet.setColumnWidth(3, 100); // Source
  sheet.setColumnWidth(4, 70);  // Tier
  sheet.setColumnWidth(5, 150); // Status
  sheet.setColumnWidth(6, 80);  // Priority
  sheet.setColumnWidth(7, 240); // Link URL
  sheet.setColumnWidth(8, 110); // Date Applied
  sheet.setColumnWidth(9, 130); // Last Activity
  sheet.setColumnWidth(10, 320); // Notes
  sheet.setColumnWidth(11, 165); // Thread ID
  
  // Insert sample data row if sheet is fresh and only has headers (1 row)
  if (sheet.getLastRow() === 1) {
    const sampleRow = [
      "Stripe",
      "High-Leverage Scaling Consigliere",
      "Referral",
      "T1",
      "ASSESSMENT_PENDING",
      "P1",
      "https://stripe.com",
      "2026-05-18",
      "2026-05-18",
      "Received ledger performance exercise. High cognitive load, solid Tier 1 strategic leverage.",
      "sample-1"
    ];
    sheet.appendRow(sampleRow);
  }
  
  // Show successful outcome popup to operator
  try {
    SpreadsheetApp.getUi().alert("ScaleSmart Ledger initialized! Google Sheet database formatted and ready to collect automated Gmail radar signals.");
  } catch(e) {
    Logger.log("UI Alert failed (this is expected if run from script editor headlessly).");
  }
}

function scanGmailSignals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Gmail Search Query targeting the 3 vital outbound signals
  const searchQuery = "subject:(received your application OR assessment OR completed your application OR schedule your interview OR interview invitation OR recruiter reply)";
  
  // Search threads in the last 7 days to avoid processing duplicates
  const threads = GmailApp.search(searchQuery + " after:" + getFormattedDateSevenDaysAgo(), 0, 30);
  const processedThreadIds = getProcessedThreadIds(sheet);
  
  let newRowsAdded = 0;
  
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var threadId = thread.getId();
    
    // Skip if already imported to ledger
    if (processedThreadIds.indexOf(threadId) !== -1) {
      continue;
    }
    
    var messages = thread.getMessages();
    var firstMessage = messages[0];
    
    var subject = firstMessage.getSubject();
    var from = firstMessage.getFrom();
    var date = firstMessage.getDate();
    var body = firstMessage.getPlainBody();
    
    var company = parseCompany(from, subject, body);
    var roleTitle = parseRoleTitle(subject, body) || "Strategic Opportunity";
    var status = detectStatusFromEmail(subject, body);
    var threadUrl = "https://mail.google.com/mail/u/0/#inbox/" + threadId;
    var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
    
    var newRow = [
      company,          // Company Name
      roleTitle,        // Role Title
      "Gmail",          // Source
      "T2",             // Default Tier
      status,           // Status
      "P1",             // Default Priority
      threadUrl,        // Outbound Link URL
      formattedDate,    // Date Applied
      formattedDate,    // Last Activity Date
      "Signal captured via automatic Apps Script Gmail radar sweep.", 
      threadId          // Keep Thread ID in K Column for duplicates
    ];
    
    sheet.appendRow(newRow);
    newRowsAdded++;
  }
}

function detectStatusFromEmail(subject, body) {
  var s = (subject + " " + body).toLowerCase();
  if (s.indexOf("schedule") !== -1 || s.indexOf("invitation") !== -1 || s.indexOf("interview") !== -1 || s.indexOf("calendar") !== -1) {
    return "INTERVIEWING";
  }
  if (s.indexOf("assessment") !== -1 || s.indexOf("test") !== -1 || s.indexOf("exercise") !== -1 || s.indexOf("challenge") !== -1) {
    return "ASSESSMENT_PENDING";
  }
  return "APPLIED";
}

function parseCompany(from, subject, body) {
  var match = from.match(/([^<]+)/);
  if (match && match[1]) {
    var name = match[1].trim().replace(/['"]/g, "");
    if (name.toLowerCase().indexOf("recruiting") === -1 && name.toLowerCase().indexOf("careers") === -1) {
      return name;
    }
  }
  var emailMatch = from.match(/@([a-zA-Z0-9.-]+)/);
  if (emailMatch && emailMatch[1]) {
    var domain = emailMatch[1].split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }
  return "Parsed Company";
}

function parseRoleTitle(subject, body) {
  var combined = subject + " " + body;
  var regexes = [
    /for the position of ([^,\.]+)/i,
    /for the ([^,\.]+) role/i,
    /application for ([^,\.]+)/i
  ];
  for (var i = 0; i < regexes.length; i++) {
    var match = combined.match(regexes[i]);
    if (match && match[1]) return match[1].trim();
  }
  return "";
}

function getProcessedThreadIds(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var range = sheet.getRange(2, 11, lastRow - 1, 1); // Thread ID kept in K Column
  var values = range.getValues();
  var ids = [];
  for (var i = 0; i < values.length; i++) ids.push(values[i][0]);
  return ids;
}

function getFormattedDateSevenDaysAgo() {
  var d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

function setupTrigger() {
  ScriptApp.newTrigger("scanGmailSignals")
    .timeBased()
    .everyHours(1)
    .create();
}`;
  };

  // CSV State export generator for easy sheets update
  const handleExportCSV = () => {
    let csvContent = "Company Name,Role Title,Source,Tier,Status,Priority,Link,Date Applied,Last Activity Date,Notes,Thread ID\n";
    opportunities.forEach((o) => {
      const row = [
        `"${o.companyName.replace(/"/g, '""')}"`,
        `"${o.roleTitle.replace(/"/g, '""')}"`,
        `"${o.source}"`,
        `"${o.tier}"`,
        `"${o.status}"`,
        `"${o.priority}"`,
        `"${(o.link || "").replace(/"/g, '""')}"`,
        `"${o.dateApplied || ""}"`,
        `"${o.lastActivityDate || ""}"`,
        `"${(o.notes || "").replace(/\n/g, " ").replace(/"/g, '""')}"`,
        `"local-${o.id}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scalesmart_ledger_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter application pipeline
  const filtered = opportunities.filter((opp) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchCompany = opp.companyName.toLowerCase().includes(q);
      const matchRole = opp.roleTitle.toLowerCase().includes(q);
      if (!matchCompany && !matchRole) return false;
    }

    switch (filter) {
      case "ACTIVE":
        return opp.status !== "REJECTED" && opp.status !== "ARCHIVED" && opp.status !== "DORMANT";
      case "INTERVIEWING":
        return opp.status === "INTERVIEWING";
      case "ACTION_REQUIRED":
        return (
          (opp.status === "ASSESSMENT_PENDING" || opp.status === "INTERVIEWING") &&
          (opp.priority === "P0" || opp.priority === "P1")
        );
      case "DORMANT":
        return opp.status === "DORMANT";
      case "ALL":
      default:
        return true;
    }
  });

  // Apply visual sorting to the filtered opportunities
  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (!sortField) return 0;

    let valA = a[sortField];
    let valB = b[sortField];

    const hasA = valA !== undefined && valA !== null && valA !== "";
    const hasB = valB !== undefined && valB !== null && valB !== "";

    // Position empty values always at the bottom of the ledger list
    if (!hasA && hasB) return 1;
    if (hasA && !hasB) return -1;
    if (!hasA && !hasB) return 0;

    // Custom sorting priority values order P0 < P1 < P2, T1 < T2 < T3 naturally sorted alphabetically
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate quick stats totals
  const totalActive = opportunities.filter((opp) => opp.status !== "REJECTED" && opp.status !== "ARCHIVED" && opp.status !== "DORMANT").length;
  const totalInterviewing = opportunities.filter((opp) => opp.status === "INTERVIEWING").length;
  const totalActionRequired = opportunities.filter((opp) =>
    (opp.status === "ASSESSMENT_PENDING" || opp.status === "INTERVIEWING") &&
    (opp.priority === "P0" || opp.priority === "P1")
  ).length;
  const totalDormant = opportunities.filter((opp) => opp.status === "DORMANT").length;

  const renderSortHeader = (label: string, field: keyof Opportunity) => {
    const isActive = sortField === field;
    return (
      <th className="p-0 font-normal align-middle select-none border-b border-slate-800">
        <button
          onClick={() => handleSort(field)}
          className={`flex items-center gap-1.5 hover:bg-slate-900 text-left w-full py-3 px-4 font-mono text-xs transition focus:outline-none ${
            isActive ? "text-blue-400 font-semibold bg-slate-900/45" : "text-slate-400 hover:text-white"
          }`}
        >
          <span>{label}</span>
          {isActive ? (
            sortDirection === "asc" ? (
              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            )
          ) : (
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600 opacity-60 hover:opacity-100 transition" />
          )}
        </button>
      </th>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-slate-850">
      
      {/* 1. Header with System Architecture Integration */}
      <header className="border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900" id="header">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white font-mono">ScaleSmart OS</span>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 font-mono">v1.0 (Radar Core)</span>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab("cockpit")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition flex items-center gap-1.5 ${
                activeTab === "cockpit" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" /> Cockpit Ledger
            </button>
            <button
              onClick={() => setActiveTab("radar")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition flex items-center gap-1.5 relative ${
                activeTab === "radar" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Signal Radar
              {radarSignals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "cockpit" ? (
          <div className="flex items-center gap-3 w-full md:w-auto" id="controls">
            <input
              type="text"
              placeholder="Search Company or Role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2 rounded flex items-center gap-1.5 shrink-0 transition"
            >
              <Plus className="w-4 h-4" /> Add Opportunity
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className="border border-slate-800 hover:bg-slate-800 bg-slate-950 text-slate-300 font-medium text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Export Ledger CSV
            </button>
            <button
              onClick={handleCopyCode}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition"
            >
              <Copy className="w-4 h-4" /> {hasCopiedCode ? "Copied Apps Script" : "Copy Apps Script"}
            </button>
          </div>
        )}
      </header>

      {/* 2. TAB 1: Cockpit Ledger View */}
      {activeTab === "cockpit" && (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0" id="main-workflow">
          {/* Left Side: Pipeline Filters */}
          <aside className="w-full lg:w-64 border-b lg:border-r border-slate-800 bg-slate-900/60 p-4 shrink-0 font-mono" id="sidebar">
            <h2 className="text-xs font-mono tracking-wider text-slate-500 uppercase font-bold mb-3 px-2">Pipeline Filters</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setFilter("ALL")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded transition uppercase ${
                  filter === "ALL" ? "bg-slate-800 text-white font-bold border border-slate-700" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span>All Core Records</span>
                <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850">{opportunities.length}</span>
              </button>
              <button
                onClick={() => setFilter("ACTIVE")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded transition uppercase ${
                  filter === "ACTIVE" ? "bg-slate-800 text-white font-bold border border-slate-700" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Pipeline
                </span>
                <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850">{totalActive}</span>
              </button>
              <button
                onClick={() => setFilter("INTERVIEWING")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded transition uppercase ${
                  filter === "INTERVIEWING" ? "bg-slate-800 text-white font-bold border border-slate-700" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Interviewing
                </span>
                <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850">{totalInterviewing}</span>
              </button>
              <button
                onClick={() => setFilter("ACTION_REQUIRED")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded transition uppercase ${
                  filter === "ACTION_REQUIRED" ? "bg-slate-850 border border-amber-600/30 text-amber-300 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Action Required (P0/P1)
                </span>
                <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850">{totalActionRequired}</span>
              </button>
              <button
                onClick={() => setFilter("DORMANT")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded transition uppercase ${
                  filter === "DORMANT" ? "bg-slate-800 text-white font-bold border border-slate-700" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span> Dormant
                </span>
                <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850">{totalDormant}</span>
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1">Architecture Radar</span>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Gmail scans emails, pushes matching events to Google Sheets. React app visualizes the ledger book directly from Sheets records.
                </p>
                <button
                  onClick={() => setActiveTab("radar")}
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium mt-2 flex items-center gap-1"
                >
                  Configure Pipe <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* Center Column: Opportunity Table Grid */}
          <main className="flex-1 overflow-x-auto min-w-0" id="list-view">
            {sortedAndFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-sm h-full min-h-[400px]">
                <FileText className="w-10 h-10 mb-3 text-slate-700 animate-pulse" />
                <p className="font-medium text-slate-400">No opportunities match selection criteria</p>
                <p className="text-xs mt-1 text-slate-500">Adjust active search, change pipeline filters, or add records manually</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm" id="table">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs select-none bg-slate-900/40">
                    {renderSortHeader("Company / Target Role", "companyName")}
                    {renderSortHeader("Tier", "tier")}
                    {renderSortHeader("Integration Source", "source")}
                    {renderSortHeader("Status Status", "status")}
                    {renderSortHeader("Priority Class", "priority")}
                    {renderSortHeader("Next Action Limit", "nextActionDate")}
                    <th className="py-3 px-4 text-right font-mono text-xs font-normal border-b border-slate-800">Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {sortedAndFiltered.map((opp) => {
                    const isSelected = selectedId === opp.id;
                    return (
                      <tr
                        key={opp.id}
                        onClick={() => setSelectedId(opp.id)}
                        className={`cursor-pointer transition duration-150 hover:bg-slate-900/60 ${
                          isSelected ? "bg-slate-900 border-l-2 border-blue-500" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-semibold text-slate-100 block">{opp.companyName}</span>
                            <span className="text-xs text-slate-400">{opp.roleTitle}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            opp.tier === "T1" ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" :
                            opp.tier === "T2" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                            "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}>
                            {opp.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                          <span className={`flex items-center gap-1.5 ${
                            opp.source === "Gmail" ? "text-blue-400" : "text-slate-400"
                          }`}>
                            {opp.source === "Gmail" && <Radio className="w-3 h-3 animator-pulse" />}
                            {opp.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={opp.status}
                            onChange={(e) => updateStatus(opp, e.target.value as OpportunityStatus)}
                            className="bg-slate-950 border border-slate-850 text-xs rounded px-2.5 py-1 text-slate-300 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="NEW">NEW</option>
                            <option value="APPLIED">APPLIED</option>
                            <option value="ASSESSMENT_PENDING">ASSESSMENT PENDING</option>
                            <option value="INTERVIEWING">INTERVIEWING</option>
                            <option value="OFFER">OFFER</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="DORMANT">DORMANT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={opp.priority}
                            onChange={(e) => updatePriority(opp, e.target.value as Priority)}
                            className={`bg-slate-950 border border-slate-850 text-xs font-mono font-bold rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer ${
                              opp.priority === "P0" ? "text-rose-400" :
                              opp.priority === "P1" ? "text-amber-400" : "text-slate-400"
                            }`}
                          >
                            <option value="P0">P0</option>
                            <option value="P1">P1</option>
                            <option value="P2">P2</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                          {opp.nextActionDate ? opp.nextActionDate : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(opp)}
                              className="p-1 px-2 text-xs text-slate-450 hover:text-white bg-slate-800 rounded flex items-center gap-1 transition"
                              title="Edit Detail"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(opp.id)}
                              className="p-1 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-850 rounded transition"
                              title="Delete Ledger"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </main>

          {/* Right Column: Dynamic Inspector Detail Panel */}
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/40 p-5 shrink-0" id="detail-panel">
            {selectedOpp ? (
              <div className="space-y-5" id="detail-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{selectedOpp.companyName}</h3>
                    <p className="text-xs text-slate-400 font-medium">{selectedOpp.roleTitle}</p>
                  </div>
                  <button
                    onClick={() => openEditModal(selectedOpp)}
                    className="p-1 px-2.5 bg-slate-800 text-[11px] text-slate-300 hover:text-white rounded flex items-center gap-1 transition-all border border-slate-700"
                  >
                    Edit fields
                  </button>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Status Transition</label>
                    <select
                      value={selectedOpp.status}
                      onChange={(e) => updateStatus(selectedOpp, e.target.value as OpportunityStatus)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2.5 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="APPLIED">APPLIED</option>
                      <option value="ASSESSMENT_PENDING">ASSESSMENT PENDING</option>
                      <option value="INTERVIEWING">INTERVIEWING</option>
                      <option value="OFFER">OFFER</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="DORMANT">DORMANT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-1">Priority</label>
                      <select
                        value={selectedOpp.priority}
                        onChange={(e) => updatePriority(selectedOpp, e.target.value as Priority)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none cursor-pointer"
                      >
                        <option value="P0">P0</option>
                        <option value="P1">P1</option>
                        <option value="P2">P2</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-1">Tier</label>
                      <select
                        value={selectedOpp.tier}
                        onChange={(e) => {
                          const updated: Opportunity = { ...selectedOpp, tier: e.target.value as OpportunityTier, lastActivityDate: "2026-05-24" };
                          setOpportunities(opportunities.map((o) => (o.id === selectedId ? updated : o)));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none cursor-pointer"
                      >
                        <option value="T1">T1</option>
                        <option value="T2">T2</option>
                        <option value="T3">T3</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-450 font-mono font-bold block mb-1">Source origin</label>
                      <span className="block p-2 bg-slate-950 rounded text-slate-300 text-xs font-mono">{selectedOpp.source}</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-450 font-mono font-bold block mb-1">Category</label>
                      <span className="block p-2 bg-slate-950 rounded text-slate-300 text-xs truncate">{selectedOpp.category || "Operations"}</span>
                    </div>
                  </div>

                  {selectedOpp.link && (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-450 font-mono font-bold block mb-1">Target Action Link / Email</label>
                      <a
                        href={selectedOpp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-blue-400 hover:underline hover:text-blue-300 p-2 bg-slate-950 rounded"
                      >
                        <span className="truncate font-mono mr-2">{selectedOpp.link}</span> <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-450 block mb-1">Date Applied</label>
                      <span className="block p-2 bg-slate-950 rounded text-slate-300 text-xs">{selectedOpp.dateApplied || "—"}</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-455 block mb-1">Last Updated</label>
                      <span className="block p-2 bg-slate-950 rounded text-slate-400 text-xs">{selectedOpp.lastActivityDate || "—"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-450 font-mono font-bold block mb-1">Next Action Date Limit</label>
                    <span className="block p-2 bg-slate-950 rounded text-slate-300 font-mono text-xs">{selectedOpp.nextActionDate || "No planned action"}</span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-450 font-mono font-bold block mb-1">Notes </label>
                    <div className="p-3 bg-slate-950 text-slate-350 rounded leading-relaxed whitespace-pre-wrap text-xs max-h-48 overflow-y-auto border border-slate-850">
                      {selectedOpp.notes || "No outbound notes or logs configured."}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                <FileText className="w-8 h-8 mb-2 text-slate-700 animate-pulse" />
                <p className="text-sm font-medium">No ledger opportunity is selected</p>
                <p className="text-xs mt-0.5">Click any row in the spreadsheet list to view metadata details</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* 3. TAB 2: Signal Radar & Google Apps Script Setup Panel */}
      {activeTab === "radar" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950" id="radar-hub">
          
          {/* Conceptual Blueprint Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-5 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
                <h2 className="text-base font-bold text-white uppercase font-mono tracking-tight">System Radar Architecture</h2>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Gmail is operated strictly as a <strong className="text-slate-200">Signal Inbox (input-only detector)</strong>. 
                Google Sheets serves as your unified database, and the Apps Script automatically runs behind the scenes to sweep Gmail, extracting signals onto Sheets rows. 
                This React app is the command cockpit to act and make tactical decisions.
              </p>
            </div>
            <div className="flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Operational Flow Direction</span>
              <div className="text-xs font-mono font-bold text-blue-400 mt-1">
                Gmail → Script → Sheets → React UI
              </div>
              <div className="text-[10px] text-slate-500 font-mono leading-tight mt-1 text-left lg:text-right">
                Correct Version (Zero automation spaghetti)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Box: Gmail Radar Simulation & Signal Testing Parser (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* Box A: Un-triaged Gmail Radar Signals Stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                  <span className="text-xs font-bold font-mono text-white flex items-center gap-2 uppercase">
                    <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> 
                    Live Detected Signals Queue ({radarSignals.length})
                  </span>
                  <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    Gmail Scanner Simulator
                  </span>
                </div>
                
                <div className="p-4 space-y-3.5 divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto">
                  {radarSignals.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Radar Queue Cleared. Next hourly Apps Script sweep scheduled.
                    </div>
                  ) : (
                    radarSignals.map((sig, i) => (
                      <div key={sig.id} className={`pt-3 flex flex-col md:flex-row gap-4 items-start ${i === 0 ? 'pt-0' : ''}`}>
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-200 font-mono">{sig.detectedCompany}</span>
                            <span className="text-slate-500 font-mono">({sig.sender})</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                              sig.detectedStatus === "ASSESSMENT_PENDING" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                              sig.detectedStatus === "INTERVIEWING" ? "bg-blue-500/10 text-blue-300 border border-blue-500/30" :
                              "bg-slate-800 text-slate-350"
                            }`}>
                              {sig.detectedStatus}
                            </span>
                          </div>
                          <div className="text-slate-100 font-semibold">{sig.subject}</div>
                          <p className="text-slate-400 leading-relaxed text-[11px] font-sans">{sig.snippet}</p>
                        </div>
                        <div className="shrink-0 flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                          <button
                            onClick={() => promoteSignalToLedger(sig)}
                            className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded transition font-mono whitespace-nowrap"
                          >
                            Sync to Ledger
                          </button>
                          <button
                            onClick={() => setRadarSignals(radarSignals.filter((item) => item.id !== sig.id))}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1.5 rounded text-xs transition font-mono"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box B: Dynamic Email Body Raw Content Parser Test Sandbox */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">Signal Parser Sandbox</h3>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Test your Gmail sweep automation parsing criteria immediately. Paste a raw message or confirmation snippet from your target to review instant status mapping.
                </p>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={sandboxEmailText}
                    onChange={(e) => setSandboxEmailText(e.target.value)}
                    placeholder="Example: We received your application at Stripe for the High-Leverage Scaling Consigliere role..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Mapping: Applied confirm → applied, Schedule calendars → interviewing, exercise → assessment
                    </div>
                    <button
                      type="button"
                      onClick={executeSandboxParse}
                      disabled={!sandboxEmailText.trim()}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs px-3.5 py-1.5 rounded font-mono transition"
                    >
                      Process Signal Input
                    </button>
                  </div>
                </div>

                {isSandboxParsed && (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Extracted Company</span>
                      <strong className="text-slate-100 font-mono">{sandboxExtractedCompany}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Target Role Target</span>
                      <strong className="text-slate-100 font-mono">{sandboxExtractedRole}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Detected Status Map</span>
                      <strong className="text-blue-400 font-mono">{sandboxExtractedStatus}</strong>
                    </div>
                    <div className="col-span-full pt-2 border-t border-slate-850 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400 italic">Looks correct? Insert directly, bypass spreadsheet ledger update?</span>
                      <button
                        onClick={() => {
                          const customOpp: Opportunity = {
                            id: `opp-${Date.now()}`,
                            companyName: sandboxExtractedCompany,
                            roleTitle: sandboxExtractedRole,
                            source: "Gmail",
                            tier: "T2",
                            category: "Outbound Pilot",
                            status: sandboxExtractedStatus,
                            priority: "P1",
                            dateApplied: new Date().toISOString().split("T")[0],
                            lastActivityDate: new Date().toISOString().split("T")[0],
                            notes: "Extracted during custom parser sandbox tests: " + sandboxEmailText.substring(0, 100) + "..."
                          };
                          setOpportunities([customOpp, ...opportunities]);
                          setSelectedId(customOpp.id);
                          setSandboxEmailText("");
                          setIsSandboxParsed(false);
                          alert(`Successfully loaded ${sandboxExtractedCompany} into core Ledger.`);
                        }}
                        className="bg-blue-600/20 hover:bg-blue-650 text-blue-400 hover:text-blue-300 text-xs px-3 py-1 rounded font-mono transition border border-blue-500/30"
                      >
                        Approve & Sync Core
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Setup Blueprint Guide & Apps Script Code copy (5 cols) */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* Setup steps list */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">Active Pipe Quick Setup</h3>
                </div>
                
                <ol className="text-xs text-slate-400 space-y-3 pl-4 list-decimal leading-relaxed">
                  <li>
                    Create a clean <strong className="text-slate-200">Google Sheets spreadsheet</strong>. Rename your target tab to <code className="bg-slate-950 font-mono px-1 border border-slate-850">Sheet1</code>.
                  </li>
                  <li>
                    Select <strong className="text-slate-200">Extensions &gt; Apps Script</strong> at the top bar.
                  </li>
                  <li>
                    Delete all existing default content inside the editor and paste the compiled Apps Script source code.
                  </li>
                  <li>
                    Click <strong className="text-slate-200">Save</strong>. Highlight and run function <code className="bg-slate-950 font-mono px-1 text-slate-300">setupTrigger()</code> representing hourly automated scans!
                  </li>
                </ol>
                
                <p className="text-[11px] text-slate-500 leading-normal">
                  Because Gmail maps purely to Sheets rows, this prevents CRM tagging explosions, and protects operational state integrity. That is why this setup works long-term.
                </p>
              </div>

              {/* Source Code Container */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col max-h-[440px]">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center font-mono">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    Google Apps Script Code
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                  >
                    {hasCopiedCode ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <div className="bg-slate-950 p-4 overflow-y-auto flex-1 font-mono text-[10px] text-slate-300 space-y-1 select-all scrollbar-thin">
                  <pre className="whitespace-pre">{getAppsScriptCode()}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Core Opportunity Form Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setModalMode(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">
                {modalMode === "ADD" ? "Create New Opportunity" : "Modify Opportunity details"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 hover:bg-slate-850 rounded text-slate-450 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Lead Revenue Builder"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as Opportunity["source"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="OLJ">OLJ</option>
                    <option value="Direct">Direct</option>
                    <option value="Referral">Referral</option>
                    <option value="Funnel">Funnel</option>
                    <option value="Gmail">Gmail</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as OpportunityTier)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="T1">T1</option>
                    <option value="T2">T2</option>
                    <option value="T3">T3</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. AI Strategy"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OpportunityStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="NEW">NEW</option>
                    <option value="APPLIED">APPLIED</option>
                    <option value="ASSESSMENT_PENDING">ASSESSMENT</option>
                    <option value="INTERVIEWING">INTERVIEWING</option>
                    <option value="OFFER">OFFER</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="DORMANT">DORMANT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none cursor-pointer font-mono font-bold"
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={formDateApplied}
                    onChange={(e) => setFormDateApplied(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none font-mono text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Next Action Date Limit</label>
                  <input
                    type="date"
                    value={formNextActionDate}
                    onChange={(e) => setFormNextActionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none font-mono text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Outreach URL Link</label>
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Dossier Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={4}
                    placeholder="Opportunity notes and outreach checklist details"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 font-mono">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded text-slate-400 hover:text-white text-xs transition transition duration"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
