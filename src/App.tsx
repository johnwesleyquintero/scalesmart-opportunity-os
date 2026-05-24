import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "./types";
import {
  Plus, X, Pencil, Trash, FileText, Check, AlertTriangle, ExternalLink,
  Radio, Database, Code, Copy, RefreshCw, Send, CheckCircle2, Info, Layers, Download,
  ChevronUp, ChevronDown, ChevronsUpDown, Sun, Moon, GripVertical,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
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
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("scalesmart_dark_theme");
    return saved !== "false"; // default is true (dark mode) as currently styled
  });

  useEffect(() => {
    localStorage.setItem("scalesmart_dark_theme", String(isDark));
  }, [isDark]);

  // Notion Theme styling variables mapping
  const theme = isDark ? {
    bgApp: "bg-[#191919] text-[#f1f1ef]",
    bgHeader: "bg-[#202020] border-[#2c2c2c]",
    bgSidebar: "bg-[#202020] border-[#2c2c2c]",
    bgCard: "bg-[#191919] border-[#2c2c2c]",
    bgPanel: "bg-[#202020] border-[#2c2c2c]",
    bgInput: "bg-[#252525] border-[#2c2c2c] text-[#f1f1ef] placeholder:text-[#9b9a97]/60 focus:border-[#2eaadc]",
    bgButtonSec: "bg-[#252525] hover:bg-[#2f2f2f] text-[#f1f1ef] border-[#2c2c2c]",
    textPrimary: "text-[#f1f1ef]",
    textSecondary: "text-[#9b9a97]",
    border: "border-[#2c2c2c]",
    hoverRow: "hover:bg-[#252525]/60",
    selectedRow: "bg-[#2c2c2c]/85",
    thead: "bg-[#1f1f1f] text-[#9b9a97] border-[#2c2c2c]",
    accentBlue: "text-[#2eaadc]",
    indicatorBg: "bg-[#252525] text-[#9b9a97] border-[#2c2c2c]",
  } : {
    bgApp: "bg-[#fbfbfa] text-[#37352f]",
    bgHeader: "bg-[#f7f7f5] border-[#eae9e6]",
    bgSidebar: "bg-[#f7f7f5] border-[#eae9e6]",
    bgCard: "bg-[#ffffff] border-[#eae9e6]",
    bgPanel: "bg-[#f7f7f5] border-[#eae9e6]",
    bgInput: "bg-[#ffffff] border-[#eae9e6] text-[#37352f] placeholder:text-[#787774]/60 focus:border-[#2383e2]",
    bgButtonSec: "bg-[#ffffff] hover:bg-[#f1f1ef] text-[#37352f] border-[#eae9e6]",
    textPrimary: "text-[#37352f]",
    textSecondary: "text-[#787774]",
    border: "border-[#eae9e6]",
    hoverRow: "hover:bg-[#f1f1ef]",
    selectedRow: "bg-[#eae9e6]/80",
    thead: "bg-[#f7f7f5] text-[#787774] border-[#eae9e6]",
    accentBlue: "text-[#2383e2]",
    indicatorBg: "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]",
  };

  const [activeTab, setActiveTab] = useState<"cockpit" | "radar">("cockpit");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("1");

  // Collapsible Sidebars persistent states
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("scalesmart_left_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("scalesmart_right_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("scalesmart_left_sidebar_open", String(isLeftSidebarOpen));
  }, [isLeftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("scalesmart_right_sidebar_open", String(isRightSidebarOpen));
  }, [isRightSidebarOpen]);

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

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragAndDropReorder = (draggedId: string, overId: string) => {
    if (draggedId === overId) return;

    // Clear active column sorting to preserve custom order immediately
    if (sortField) {
      setSortField(null);
    }

    const fromIndex = opportunities.findIndex((item) => item.id === draggedId);
    const toIndex = opportunities.findIndex((item) => item.id === overId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const reordered = [...opportunities];
      const [movedItem] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, movedItem);

      setOpportunities(reordered);

      // Auto-sync order with Google Sheet if appsScriptUrl is present
      if (appsScriptUrl.trim()) {
        pushLedgerToSheets(reordered, true).catch((err) => {
          console.error("Auto-sync of reordered list to Google Sheets failed:", err);
        });
      }
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
  const [sandboxExtractedPriority, setSandboxExtractedPriority] = useState<Priority>("P1");
  const [sandboxExtractedNextActionDate, setSandboxExtractedNextActionDate] = useState("No planned action");
  const [sandboxExtractedSalary, setSandboxExtractedSalary] = useState("");
  const [sandboxExtractedNotes, setSandboxExtractedNotes] = useState("");
  const [isSandboxParsed, setIsSandboxParsed] = useState(false);
  const [isParsingSandbox, setIsParsingSandbox] = useState(false);
  const [sandboxParserError, setSandboxParserError] = useState<string | null>(null);
  const [sandboxParserMethod, setSandboxParserMethod] = useState<"Gemini AI" | "Local Heuristics">("Gemini AI");

  // Apps Script Web App Connection Configs
  const [customGeminiApiKey, setCustomGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("scalesmart_gemini_api_key") || "";
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem("scalesmart_appscript_url") || "";
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("scalesmart_gemini_api_key", customGeminiApiKey);
  }, [customGeminiApiKey]);

  useEffect(() => {
    localStorage.setItem("scalesmart_appscript_url", appsScriptUrl);
    if (appsScriptUrl) {
      setConnectionStatus("success");
    }
  }, [appsScriptUrl]);

  // Handle keyboard shortcuts (Ctrl+\ and Ctrl+[) to toggle layout panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      }
      if (e.ctrlKey && (e.key === "[" || e.key === "]")) {
        e.preventDefault();
        setIsRightSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleConnectAppsScript = async (urlToTest: string) => {
    if (!urlToTest.trim()) {
      alert("Please enter a valid Google Apps Script Web App URL first.");
      return;
    }
    const cleanUrl = urlToTest.trim();
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const target = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=fetch`;
      const res = await fetch(target, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOpportunities(data);
        setConnectionStatus("success");
        setAppsScriptUrl(cleanUrl);
        alert(`Connected to live Google Sheets! Successfully fetched and synchronized ${data.length} ledger row(s).`);
      } else {
        throw new Error("Payload did not return a valid ledger rows array. Please ensure the Apps Script code is copied and deployed perfectly.");
      }
    } catch (err: any) {
      console.error("Live Web App Connection Error", err);
      setConnectionStatus("error");
      setConnectionError(err.toString());
      alert(`Sync failed: ${err.toString()}\n\nCRITICAL APPS SCRIPT VERIFICATION:\n1. Make sure you deployed the script as a "Web App"\n2. Set "Execute as": "Me"\n3. Set "Who has access": "Anyone" (so the browser can execute the fetch without Google OAuth pre-blocking).\n4. Confirm you ran setupSheet() in the Google Sheet first.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const triggerLiveScan = async () => {
    if (!appsScriptUrl.trim()) {
      alert("Please configure and connect your Apps Script Deployment URL first.");
      return;
    }
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const target = `${appsScriptUrl.trim()}${appsScriptUrl.trim().includes('?') ? '&' : '?'}action=scan`;
      const res = await fetch(target, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
      const result = await res.json();
      if (result.status === "success") {
        alert("Live Gmail Inbox sweep completed successfully! Fetching fresh ledger sync now...");
        await handleConnectAppsScript(appsScriptUrl);
      } else {
        throw new Error(result.message || "Unknown error occurred on scan.");
      }
    } catch (err: any) {
      console.error("Trigger Scan Error", err);
      alert(`Trigger Sweep Failed: ${err.toString()}\nMake sure Gmail permissions are authorized in your Apps Script project by running a function once in the editor.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const pushLedgerToSheets = async (customOpps?: Opportunity[], quiet = false) => {
    const listToSync = customOpps || opportunities;
    if (!appsScriptUrl.trim()) {
      if (!quiet) alert("Please configure and connect your Apps Script Deployment URL first.");
      return;
    }
    if (!customOpps && !confirm("Are you sure you want to push your local cockpit state to Google Sheets? This will update the rows in your target Sheet1 to match your current React UI state.")) {
      return;
    }
    setIsConnecting(true);
    try {
      await fetch(appsScriptUrl.trim(), {
        method: "POST",
        mode: "no-cors", // bypass typical pre-flight redirect restrictions in Apps Script Web App
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify({
          action: "sync_all",
          opportunities: listToSync
        })
      });
      if (!quiet) {
        alert("Cockpit push complete! Your Google Sheets rows have been updated successfully.");
      }
    } catch (err: any) {
      console.error("Push state failed", err);
      if (!quiet) {
        alert(`Push synchronization failed: ${err.toString()}`);
      }
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

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

  // Live sandbox text parsing logic supporting AI-powered full-stack endpoint and resilient fallback heuristics
  const executeSandboxParse = async () => {
    if (!sandboxEmailText.trim()) return;
    setIsParsingSandbox(true);
    setSandboxParserError(null);
    setIsSandboxParsed(false);

    try {
      const response = await fetch("/api/parse-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: sandboxEmailText,
          customApiKey: customGeminiApiKey.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSandboxExtractedCompany(data.companyName || "Unknown Target");
      setSandboxExtractedRole(data.roleTitle || "Unspecified Role");
      setSandboxExtractedStatus(data.status || "NEW");
      setSandboxExtractedPriority(data.priority || "P1");
      setSandboxExtractedNextActionDate(data.nextActionDate || "No planned action");
      setSandboxExtractedSalary(data.salary || "");
      setSandboxExtractedNotes(data.notesSummary || "");
      setSandboxParserMethod("Gemini AI");
      setIsSandboxParsed(true);
    } catch (err: any) {
      console.warn("AI parsing failed or key missing. Activating resilient client-side heuristic engines...", err);
      
      // Smart Heuristic Fallback
      const txt = sandboxEmailText.toLowerCase();

      // Email Metadata / Header Parsing (e.g. from company.com or company name in signatures)
      let companyFallback = "Unknown Target";
      
      // 1. Try to find domain in emails (e.g. recruit@stripe.com, updates@open-ai.com, hr@spacex.com)
      const emailDomainRegex = /@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
      const foundEmail = sandboxEmailText.match(emailDomainRegex);
      if (foundEmail) {
        const domainParts = foundEmail[0].substring(1).split(".");
        const potentialDomain = domainParts[0];
        if (!["gmail", "outlook", "yahoo", "hotmail", "protonmail", "icloud", "mail", "zoho"].includes(potentialDomain)) {
          companyFallback = potentialDomain.charAt(0).toUpperCase() + potentialDomain.slice(1);
        }
      }

      // 2. Keyword heuristic list as backup
      if (companyFallback === "Unknown Target") {
        const companyKeywords = ["stripe", "spacex", "anthropic", "google", "meta", "netflix", "airbnb", "uber", "figma", "notion", "amazon", "microsoft", "apple", "vessel", "linear", "vercel"];
        for (const kw of companyKeywords) {
          if (txt.includes(kw)) {
            companyFallback = kw.charAt(0).toUpperCase() + kw.slice(1);
            break;
          }
        }
      }

      // Dynamic Role Extraction
      let roleFallback = "Strategic Scaling Partner";
      const engineerRegex = /(software engineer|developer|frontend|backend|fullstack|engineering|technical)/i;
      const operationsRegex = /(operations|operator|consigliere|revenue|process|efficiency)/i;
      const managerRegex = /(manager|lead|director|product manager|pm|scrum)/i;
      const strategyRegex = /(strategy|consultant|logistic|partner|analyst)/i;

      if (engineerRegex.test(sandboxEmailText)) {
        roleFallback = "Automation Engineer Partner";
      } else if (operationsRegex.test(sandboxEmailText)) {
        roleFallback = "Revenue Operations Coach";
      } else if (managerRegex.test(sandboxEmailText)) {
        roleFallback = "Operational Lead / Pod PM";
      } else if (strategyRegex.test(sandboxEmailText)) {
        roleFallback = "Strategic Solutions Consigliere";
      }

      // Dynamic Status Parsing
      let statusFallback: OpportunityStatus = "NEW";
      if (/schedule|interview|call|calendar|meeting|invite|speak|ring|zoom/i.test(sandboxEmailText)) {
        statusFallback = "INTERVIEWING";
      } else if (/assessment|test|challenge|exercise|hackerrank|code|coderpad/i.test(sandboxEmailText)) {
        statusFallback = "ASSESSMENT_PENDING";
      } else if (/offer|congratulations|pleased to invite|package/i.test(sandboxEmailText)) {
        statusFallback = "OFFER";
      } else if (/unfortunately|unable to proceed|regret|not moving|forward with other/i.test(sandboxEmailText)) {
        statusFallback = "REJECTED";
      } else if (/received|confirm|submitted|applied|incoming/i.test(sandboxEmailText)) {
        statusFallback = "APPLIED";
      }

      // Priority Based heuristic rules
      let priorityFallback: Priority = "P1";
      if (statusFallback === "INTERVIEWING" || statusFallback === "OFFER") {
        priorityFallback = "P0";
      } else if (statusFallback === "REJECTED") {
        priorityFallback = "P2";
      }

      // Extract Salary (e.g. $120k, $80/hr, etc.)
      let salaryFallback = "";
      const salaryRegex = /(\$\d+[\d,]*\s*(?:-\s*\$\d+[\d,]*\s*)?(?:k|K|M)?(?:\/yr|\/yr|\s*annual)?|\$\d+\s*\/\s*hr)/;
      const foundSalary = sandboxEmailText.match(salaryRegex);
      if (foundSalary) {
        salaryFallback = foundSalary[0];
      }

      // Date Limit
      const dateFallback = "No planned action";

      // Formulate a nice summary bullet notes block
      const noteLines = [`Raw text parsed using fast fallback keyword logic.`];
      if (foundSalary) noteLines.push(`Extracted Salary Indicator: ${foundSalary[0]}`);
      if (statusFallback === "INTERVIEWING") {
        noteLines.push(`Warning: Interview scheduling signals detected.`);
      }

      setSandboxExtractedCompany(companyFallback);
      setSandboxExtractedRole(roleFallback);
      setSandboxExtractedStatus(statusFallback);
      setSandboxExtractedPriority(priorityFallback);
      setSandboxExtractedNextActionDate(dateFallback);
      setSandboxExtractedSalary(salaryFallback);
      setSandboxExtractedNotes(noteLines.map(l => `• ${l}`).join("\n"));
      setSandboxParserMethod("Local Heuristics");
      setIsSandboxParsed(true);
    } finally {
      setIsParsingSandbox(false);
    }
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
}

/**
 * API Web App Endpoint: doGet
 * Allows the React UI to fetch the live ledger and trigger Gmail sweeps.
 */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  
  if (action === "fetch") {
    return handleFetchLedger();
  } else if (action === "scan") {
    scanGmailSignals();
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Gmail inbox sweep completed successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Default: return live ledger
  return handleFetchLedger();
}

function handleFetchLedger() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var range = sheet.getRange(2, 1, lastRow - 1, 11);
  var values = range.getValues();
  var items = [];
  
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    items.push({
      id: r[10] || "row-" + (i + 2),
      companyName: r[0],
      roleTitle: r[1] || "Strategic Role",
      source: r[2] || "Direct",
      tier: r[3] || "T2",
      status: r[4] || "NEW",
      priority: r[5] || "P2",
      link: r[6] || "",
      dateApplied: r[7] ? (r[7] instanceof Date ? Utilities.formatDate(r[7], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(r[7])) : "",
      lastActivityDate: r[8] ? (r[8] instanceof Date ? Utilities.formatDate(r[8], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(r[8])) : "",
      notes: r[9] || "",
      threadId: r[10] || ""
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(items))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * API Web App Endpoint: doPost
 * Receives pushes from the React Cockpit to save ledger additions/modifications.
 */
function doPost(e) {
  try {
    var postData = e && e.postData && e.postData.contents;
    if (!postData) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data payload found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var payload = JSON.parse(postData);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (payload.action === "sync_all") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 11).clearContent();
      }
      
      var opportunities = payload.opportunities;
      if (opportunities && opportunities.length > 0) {
        var rows = opportunities.map(function(o) {
          return [
            o.companyName,
            o.roleTitle,
            o.source,
            o.tier,
            o.status,
            o.priority,
            o.link || "",
            o.dateApplied || "",
            o.lastActivityDate || "",
            o.notes || "",
            o.threadId || o.id
          ];
        });
        sheet.getRange(2, 1, rows.length, 11).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Ledger batch-synchronized successfully." }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (payload.action === "add_opportunity") {
      var o = payload.opportunity;
      if (o) {
        sheet.appendRow([
          o.companyName,
          o.roleTitle,
          o.source,
          o.tier,
          o.status,
          o.priority,
          o.link || "",
          o.dateApplied || "",
          o.lastActivityDate || "",
          o.notes || "",
          o.id
        ]);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Opportunity added successfully." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown post action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
      <th className={`p-0 font-normal align-middle select-none border-b ${theme.border}`}>
        <button
          onClick={() => handleSort(field)}
          className={`flex items-center gap-1.5 ${isDark ? "hover:bg-slate-900" : "hover:bg-[#eae9e6]/50"} text-left w-full py-3 px-4 font-mono text-xs transition focus:outline-none ${
            isActive 
              ? `${theme.accentBlue} font-semibold ${isDark ? "bg-slate-900/45" : "bg-[#eae9e6]/30"}` 
              : `${theme.textSecondary} hover:text-blue-500`
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
    <div className={`min-h-screen ${theme.bgApp} flex flex-col font-sans antialiased selection:bg-slate-800`}>
      
      {/* 1. Header with System Architecture Integration */}
      <header className={`border-b ${theme.border} px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme.bgHeader}`} id="header">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
            <span className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#37352f]"} font-mono`}>ScaleSmart OS</span>
            <span className={`text-xs ${isDark ? "text-slate-400 bg-slate-850/80 border-slate-700" : "text-neutral-500 bg-neutral-200/50 border-neutral-300"} px-2.5 py-1 rounded-md border font-mono`}>v1.0 (Radar)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 p-0.5 ${isDark ? "bg-slate-950 border-slate-800" : "bg-[#eae9e6]/50 border-neutral-300"} border rounded-lg`}>
              <button
                onClick={() => setActiveTab("cockpit")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition flex items-center gap-1.5 ${
                  activeTab === "cockpit" 
                    ? (isDark ? "bg-slate-800 text-white border border-slate-700" : "bg-white text-[#37352f] border border-[#eae9e6] shadow-xs") 
                    : `${theme.textSecondary} hover:text-blue-500`
                }`}
              >
                <Database className="w-3.5 h-3.5" /> Cockpit Ledger
              </button>
              <button
                onClick={() => setActiveTab("radar")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition flex items-center gap-1.5 relative ${
                  activeTab === "radar" 
                    ? (isDark ? "bg-slate-800 text-white border border-slate-700" : "bg-white text-[#37352f] border border-[#eae9e6] shadow-xs") 
                    : `${theme.textSecondary} hover:text-blue-500`
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-blue-500" /> Signal Radar
                {radarSignals.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg border transition duration-150 flex items-center justify-center ${theme.bgButtonSec}`}
              title="Toggle theme mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-450" /> : <Moon className="w-4 h-4 text-[#37352f]" />}
            </button>

            {/* Sidebar Viewport Control Panel */}
            {activeTab === "cockpit" && (
              <div className={`flex items-center gap-1 border-l pl-2 ml-1 ${isDark ? "border-slate-800" : "border-[#eae9e6]"}`}>
                <button
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className={`p-1.5 rounded-lg border transition duration-150 flex items-center justify-center ${
                    isLeftSidebarOpen 
                      ? (isDark ? "bg-blue-500/20 text-blue-400 border-blue-500/35" : "bg-blue-50 text-blue-600 border-blue-200") 
                      : theme.bgButtonSec
                  }`}
                  title={isLeftSidebarOpen ? "Hide Left Sidebar Filters (Ctrl+\\)" : "Show Left Sidebar Filters"}
                >
                  {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={`p-1.5 rounded-lg border transition duration-150 flex items-center justify-center ${
                    isRightSidebarOpen 
                      ? (isDark ? "bg-blue-500/20 text-blue-400 border-blue-500/35" : "bg-blue-50 text-blue-600 border-blue-200") 
                      : theme.bgButtonSec
                  }`}
                  title={isRightSidebarOpen ? "Hide Right Detail Inspector" : "Show Right Detail Inspector"}
                >
                  {isRightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === "cockpit" ? (
          <div className="flex items-center gap-3 w-full md:w-auto" id="controls">
            <input
              type="text"
              placeholder="Search Company or Role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64 ${theme.bgInput}`}
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
              className={`border font-medium text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition ${theme.bgButtonSec}`}
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
          {isLeftSidebarOpen && (
            <aside className={`w-full lg:w-64 border-b lg:border-r ${theme.border} ${theme.bgSidebar} p-4 shrink-0 font-mono relative`} id="sidebar">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className={`text-xs font-mono tracking-wider ${theme.textSecondary} uppercase font-bold`}>Pipeline Filters</h2>
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className={`p-1 rounded transition ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-[#f1f1ef] text-[#787774] hover:text-[#37352f]"}`}
                  title="Collapse sidebar filters"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            <nav className="space-y-1">
              <button
                onClick={() => setFilter("ALL")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded border transition uppercase ${
                  filter === "ALL" 
                    ? (isDark ? "bg-[#2c2c2c] text-white font-bold border-[#333333]" : "bg-white text-[#37352f] font-bold border-[#eae9e6] shadow-xs")
                    : `border-transparent ${theme.textSecondary} hover:text-blue-500 hover:${isDark ? "bg-slate-800/40" : "bg-[#f1f1ef]"}`
                }`}
              >
                <span>All Core Records</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-950 text-slate-400 border-slate-850" : "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]"}`}>{opportunities.length}</span>
              </button>
              <button
                onClick={() => setFilter("ACTIVE")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded border transition uppercase ${
                  filter === "ACTIVE" 
                    ? (isDark ? "bg-[#2c2c2c] text-white font-bold border-[#333333]" : "bg-white text-[#37352f] font-bold border-[#eae9e6] shadow-xs")
                    : `border-transparent ${theme.textSecondary} hover:text-blue-500 hover:${isDark ? "bg-slate-800/40" : "bg-[#f1f1ef]"}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Pipeline
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-950 text-slate-400 border-slate-850" : "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]"}`}>{totalActive}</span>
              </button>
              <button
                onClick={() => setFilter("INTERVIEWING")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded border transition uppercase ${
                  filter === "INTERVIEWING" 
                    ? (isDark ? "bg-[#2c2c2c] text-white font-bold border-[#333333]" : "bg-white text-[#37352f] font-bold border-[#eae9e6] shadow-xs")
                    : `border-transparent ${theme.textSecondary} hover:text-blue-500 hover:${isDark ? "bg-slate-800/40" : "bg-[#f1f1ef]"}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Interviewing
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-950 text-slate-400 border-slate-850" : "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]"}`}>{totalInterviewing}</span>
              </button>
              <button
                onClick={() => setFilter("ACTION_REQUIRED")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded border transition uppercase ${
                  filter === "ACTION_REQUIRED" 
                    ? (isDark ? "bg-amber-950/40 border border-amber-600/30 text-amber-300 font-bold" : "bg-amber-50 border border-amber-250 text-amber-800 font-bold")
                    : `border-transparent ${theme.textSecondary} hover:text-amber-500 hover:${isDark ? "bg-slate-800/40" : "bg-[#f1f1ef]"}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Action Required (P0/P1)
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-950 text-slate-400 border-slate-850" : "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]"}`}>{totalActionRequired}</span>
              </button>
              <button
                onClick={() => setFilter("DORMANT")}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded border transition uppercase ${
                  filter === "DORMANT" 
                    ? (isDark ? "bg-[#2c2c2c] text-white font-bold border-[#333333]" : "bg-white text-[#37352f] font-bold border-[#eae9e6] shadow-xs")
                    : `border-transparent ${theme.textSecondary} hover:text-blue-500 hover:${isDark ? "bg-slate-800/40" : "bg-[#f1f1ef]"}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span> Dormant
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-950 text-slate-400 border-slate-850" : "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]"}`}>{totalDormant}</span>
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
              <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1">Architecture Radar</span>
                <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>
                  Gmail scans emails, pushes matching events to Google Sheets. React app visualizes the ledger book directly from Sheets records.
                </p>
                <button
                  onClick={() => setActiveTab("radar")}
                  className="text-[11px] text-blue-500 hover:text-blue-400 underline font-medium mt-2 flex items-center gap-1"
                >
                  Configure Pipe <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </aside>
          )}

          {/* Center Column: Opportunity Table Grid */}
          <main className="flex-1 overflow-x-auto min-w-0 relative" id="list-view">
            {/* Edge floating restore buttons when sidebars are collapsed */}
            {!isLeftSidebarOpen && (
              <button
                onClick={() => setIsLeftSidebarOpen(true)}
                className={`absolute left-0 top-1/4 z-10 p-1.5 rounded-r-md border-y border-r shadow-xs ${
                  isDark 
                    ? "bg-[#202020] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" 
                    : "bg-white border-[#eae9e6] text-[#787774] hover:text-[#37352f] hover:bg-slate-100"
                } transition-all duration-150 flex items-center gap-1 font-mono text-[9px] font-bold`}
                title="Expand Filters Sidebar (Ctrl+\)"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline select-none tracking-wide">FILTERS</span>
              </button>
            )}

            {!isRightSidebarOpen && (
              <button
                onClick={() => setIsRightSidebarOpen(true)}
                className={`absolute right-0 top-1/4 z-10 p-1.5 rounded-l-md border-y border-l shadow-xs ${
                  isDark 
                    ? "bg-[#202020] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" 
                    : "bg-white border-[#eae9e6] text-[#787774] hover:text-[#37352f] hover:bg-slate-100"
                } transition-all duration-150 flex items-center gap-1 font-mono text-[9px] font-bold`}
                title="Expand Detail Inspector (Ctrl+[)"
              >
                <span className="hidden sm:inline select-none tracking-wide">INSPECTOR</span>
                <PanelRightOpen className="w-3.5 h-3.5 text-blue-500" />
              </button>
            )}

            {sortedAndFiltered.length === 0 ? (
              <div className={`flex flex-col items-center justify-center p-12 text-sm h-full min-h-[400px] ${theme.textSecondary}`}>
                <FileText className={`w-10 h-10 mb-3 ${isDark ? "text-slate-700" : "text-slate-350"} animate-pulse`} />
                <p className={`font-medium ${isDark ? "text-slate-400" : "text-[#37352f]"}`}>No opportunities match selection criteria</p>
                <p className="text-xs mt-1 text-slate-500 font-mono">Adjust active search, change pipeline filters, or add records manually</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm" id="table">
                <thead>
                  <tr className={`border-b ${theme.border} ${theme.textSecondary} font-mono text-xs select-none ${isDark ? "bg-slate-900/40" : "bg-[#f7f7f5]"}`}>
                    <th className={`w-10 py-3 px-2 text-center border-b ${theme.border}`} title="Manual Drag Priority Order">
                      <span className="sr-only">Drag</span>
                    </th>
                    {renderSortHeader("Company / Target Role", "companyName")}
                    {renderSortHeader("Tier", "tier")}
                    {renderSortHeader("Integration Source", "source")}
                    {renderSortHeader("Status Status", "status")}
                    {renderSortHeader("Priority Class", "priority")}
                    {renderSortHeader("Next Action Limit", "nextActionDate")}
                    <th className={`py-3 px-4 text-right font-mono text-xs font-normal border-b ${theme.border}`}>Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-850" : "divide-[#eae9e6]"}`}>
                  {sortedAndFiltered.map((opp) => {
                    const isSelected = selectedId === opp.id;
                    const isBeingDragged = draggingId === opp.id;
                    return (
                      <tr
                        key={opp.id}
                        onClick={() => setSelectedId(opp.id)}
                        draggable
                        onDragStart={(e) => {
                          setDraggingId(opp.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          if (draggingId && draggingId !== opp.id) {
                            handleDragAndDropReorder(draggingId, opp.id);
                          }
                        }}
                        className={`cursor-pointer transition duration-155 ${theme.hoverRow} ${
                          isSelected ? `${theme.selectedRow} border-l-4 ${isDark ? "border-blue-450 bg-blue-500/5" : "border-blue-600 bg-blue-500/5"}` : ""
                        } ${isBeingDragged ? "opacity-30 bg-blue-500/10 cursor-grabbing" : ""}`}
                      >
                        <td className="py-3.5 px-2 text-center text-slate-400 hover:text-blue-500 cursor-grab active:cursor-grabbing" title="Drag row to manually set priority order">
                          <GripVertical className="w-4 h-4 mx-auto opacity-50 hover:opacity-100 transition-opacity" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className={`font-semibold ${isDark ? "text-slate-100" : "text-[#37352f]"} block`}>{opp.companyName}</span>
                            <span className={`text-xs ${theme.textSecondary}`}>{opp.roleTitle}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            opp.tier === "T1" ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" :
                            opp.tier === "T2" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                            (isDark ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-[#f1f1ef] text-[#787774] border border-[#eae9e6]")
                          }`}>
                            {opp.tier}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 ${isDark ? "text-slate-300" : "text-[#37352f]"} font-mono text-xs`}>
                          <span className={`flex items-center gap-1.5 ${
                            opp.source === "Gmail" ? (isDark ? "text-blue-400" : "text-blue-600") : theme.textSecondary
                          }`}>
                            {opp.source === "Gmail" && <Radio className="w-3 h-3 animate-pulse" />}
                            {opp.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={opp.status}
                            onChange={(e) => updateStatus(opp, e.target.value as OpportunityStatus)}
                            className={`border text-[11px] rounded px-2.5 py-1 font-mono focus:outline-none focus:border-blue-500 cursor-pointer ${theme.bgInput}`}
                          >
                            <option value="NEW" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>NEW</option>
                            <option value="APPLIED" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>APPLIED</option>
                            <option value="ASSESSMENT_PENDING" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>ASSESSMENT PENDING</option>
                            <option value="INTERVIEWING" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>INTERVIEWING</option>
                            <option value="OFFER" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>OFFER</option>
                            <option value="REJECTED" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>REJECTED</option>
                            <option value="DORMANT" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>DORMANT</option>
                            <option value="ARCHIVED" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>ARCHIVED</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={opp.priority}
                            onChange={(e) => updatePriority(opp, e.target.value as Priority)}
                            className={`border text-[11px] font-mono font-bold rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer ${theme.bgInput} ${
                              opp.priority === "P0" ? "text-rose-400" :
                              opp.priority === "P1" ? "text-amber-400" : (isDark ? "text-slate-400" : "text-neutral-500")
                            }`}
                          >
                            <option value="P0" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P0</option>
                            <option value="P1" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P1</option>
                            <option value="P2" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P2</option>
                          </select>
                        </td>
                        <td className={`py-3.5 px-4 ${isDark ? "text-slate-300" : "text-[#37352f]"} font-mono text-xs`}>
                          {opp.nextActionDate ? opp.nextActionDate : <span className={isDark ? "text-slate-700" : "text-neutral-300"}>—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(opp)}
                              className={`p-1 px-2 text-xs rounded flex items-center gap-1 transition ${theme.bgButtonSec}`}
                              title="Edit Detail"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(opp.id)}
                              className={`p-1 rounded transition ${isDark ? "text-slate-500 hover:text-red-400 bg-slate-800" : "text-neutral-500 hover:text-red-500 bg-neutral-200/55"}`}
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
          {isRightSidebarOpen && (
            <aside className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l ${theme.border} ${theme.bgSidebar} p-5 shrink-0`} id="detail-panel">
              {selectedOpp ? (
                <div className="space-y-5" id="detail-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#37352f]"} tracking-tight`}>{selectedOpp.companyName}</h3>
                      <p className={`text-xs ${theme.textSecondary} font-medium`}>{selectedOpp.roleTitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(selectedOpp)}
                        className={`p-1 px-2 text-[11px] rounded flex items-center gap-1 transition-all border ${theme.bgButtonSec}`}
                      >
                        <Pencil className="w-2.5 h-2.5" /> Edit
                      </button>
                      <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className={`p-1 rounded transition ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-[#f1f1ef] text-[#787774] hover:text-[#37352f]"}`}
                        title="Collapse details panel"
                      >
                        <PanelRightClose className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                <div className={`space-y-4 border-t ${theme.border} pt-4 text-xs`}>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Status Transition</label>
                    <select
                      value={selectedOpp.status}
                      onChange={(e) => updateStatus(selectedOpp, e.target.value as OpportunityStatus)}
                      className={`w-full border rounded p-2.5 focus:outline-none font-medium cursor-pointer ${theme.bgInput}`}
                    >
                      <option value="NEW" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>NEW</option>
                      <option value="APPLIED" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>APPLIED</option>
                      <option value="ASSESSMENT_PENDING" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>ASSESSMENT PENDING</option>
                      <option value="INTERVIEWING" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>INTERVIEWING</option>
                      <option value="OFFER" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>OFFER</option>
                      <option value="REJECTED" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>REJECTED</option>
                      <option value="DORMANT" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>DORMANT</option>
                      <option value="ARCHIVED" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>ARCHIVED</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <label className={`text-[10px] uppercase tracking-wider ${theme.textSecondary} font-mono block mb-1`}>Priority</label>
                      <select
                        value={selectedOpp.priority}
                        onChange={(e) => updatePriority(selectedOpp, e.target.value as Priority)}
                        className={`w-full border rounded p-2 focus:outline-none cursor-pointer ${theme.bgInput}`}
                      >
                        <option value="P0" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P0</option>
                        <option value="P1" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P1</option>
                        <option value="P2" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P2</option>
                      </select>
                    </div>
                    <div>
                      <label className={`text-[10px] uppercase tracking-wider ${theme.textSecondary} font-mono block mb-1`}>Tier</label>
                      <select
                        value={selectedOpp.tier}
                        onChange={(e) => {
                          const updated: Opportunity = { ...selectedOpp, tier: e.target.value as OpportunityTier, lastActivityDate: "2026-05-24" };
                          setOpportunities(opportunities.map((o) => (o.id === selectedId ? updated : o)));
                        }}
                        className={`w-full border rounded p-2 focus:outline-none cursor-pointer ${theme.bgInput}`}
                      >
                        <option value="T1" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>T1</option>
                        <option value="T2" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>T2</option>
                        <option value="T3" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>T3</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Source origin</label>
                      <span className={`block p-2 rounded text-xs font-mono ${isDark ? "bg-[#252525] text-slate-300" : "bg-[#f1f1ef] text-[#37352f]"}`}>{selectedOpp.source}</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Category</label>
                      <span className={`block p-2 rounded text-xs truncate ${isDark ? "bg-[#252525] text-slate-300" : "bg-[#f1f1ef] text-[#37352f] border border-[#eae9e6]/60"}`}>{selectedOpp.category || "Operations"}</span>
                    </div>
                  </div>

                  {selectedOpp.link && (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Target Action Link / Email</label>
                      <a
                        href={selectedOpp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between text-blue-500 hover:underline hover:text-blue-600 p-2 rounded ${isDark ? "bg-[#252525]" : "bg-[#f1f1ef]"}`}
                      >
                        <span className="truncate font-mono mr-2">{selectedOpp.link}</span> <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Date Applied</label>
                      <span className={`block p-2 rounded text-xs ${isDark ? "bg-[#252525] text-slate-300" : "bg-[#f1f1ef] text-[#37352f]"}`}>{selectedOpp.dateApplied || "—"}</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Last Updated</label>
                      <span className={`block p-2 rounded text-xs ${isDark ? "bg-[#252525] text-slate-400" : "bg-[#f1f1ef] text-[#787774]"}`}>{selectedOpp.lastActivityDate || "—"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Next Action Date Limit</label>
                    <span className={`block p-2 rounded font-mono text-xs ${isDark ? "bg-[#252525] text-slate-300" : "bg-[#f1f1ef] text-[#37352f]"}`}>{selectedOpp.nextActionDate || "No planned action"}</span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Notes </label>
                    <div className={`p-3 rounded leading-relaxed whitespace-pre-wrap text-xs max-h-48 overflow-y-auto border ${isDark ? "bg-[#252525] text-slate-300 border-[#2c2c2c]" : "bg-white text-[#37352f] border-[#eae9e6] shadow-xs"}`}>
                      {selectedOpp.notes || "No outbound notes or logs configured."}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center ${theme.textSecondary} text-center py-12 relative`}>
                <button
                  onClick={() => setIsRightSidebarOpen(false)}
                  className={`absolute top-2 right-2 p-1.5 rounded transition ${isDark ? "hover:bg-slate-850 text-slate-400 hover:text-white" : "hover:bg-[#f1f1ef] text-[#787774] hover:text-[#37352f]"}`}
                  title="Collapse inspector"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
                <FileText className={`w-8 h-8 mb-2 ${isDark ? "text-slate-700" : "text-slate-300"} animate-pulse`} />
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-[#37352f]"}`}>No ledger opportunity is selected</p>
                <p className="text-xs mt-1">Click any row in the spreadsheet list to view metadata details</p>
              </div>
            )}
          </aside>
          )}
        </div>
      )}

      {/* 3. TAB 2: Signal Radar & Google Apps Script Setup Panel */}
      {activeTab === "radar" && (
        <div className={`flex-1 overflow-y-auto p-6 space-y-8 ${isDark ? "bg-[#191919]" : "bg-white"}`} id="radar-hub">
          
          {/* Conceptual Blueprint Banner */}
          <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 p-5 rounded-lg border ${isDark ? "bg-slate-900/40 border-slate-850" : "bg-[#f7f7f5] border-[#eae9e6]"}`}>
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Radio className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"} animate-pulse`} />
                <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-[#37352f]"} uppercase font-mono tracking-tight`}>System Radar Architecture</h2>
              </div>
              <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                Gmail is operated strictly as a <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Signal Inbox (input-only detector)</strong>. 
                Google Sheets serves as your unified database, and the Apps Script automatically runs behind the scenes to sweep Gmail, extracting signals onto Sheets rows. 
                This React app is the command cockpit to act and make tactical decisions.
              </p>
            </div>
            <div className={`flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l ${theme.border} pt-3 lg:pt-0 lg:pl-4`}>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Operational Flow Direction</span>
              <div className={`text-xs font-mono font-bold ${isDark ? "text-blue-400" : "text-blue-600"} mt-1`}>
                Gmail → Script → Sheets → React UI
              </div>
              <div className={`text-[10px] ${theme.textSecondary} font-mono leading-tight mt-1 text-left lg:text-right`}>
                Correct Version (Zero automation spaghetti)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Box: Gmail Radar Simulation & Signal Testing Parser (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* Box A: Un-triaged Gmail Radar Signals Stream */}
              <div className={`border rounded-lg overflow-hidden ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${isDark ? "border-slate-800 bg-[#252525]/50" : "border-[#eae9e6] bg-[#f7f7f5]"}`}>
                  <span className={`text-xs font-bold font-mono ${isDark ? "text-white" : "text-[#37352f]"} flex items-center gap-2 uppercase`}>
                    <Radio className={`w-3.5 h-3.5 ${isDark ? "text-blue-400" : "text-blue-600"} animate-pulse`} /> 
                    Live Detected Signals Queue ({radarSignals.length})
                  </span>
                  <span className={`text-[10px] border px-2 py-0.5 rounded font-mono ${isDark ? "bg-[#191919] border-slate-850 text-slate-400" : "bg-[#f1f1ef] border-[#eae9e6] text-[#787774]"}`}>
                    Gmail Scanner Simulator
                  </span>
                </div>
                
                <div className={`p-4 space-y-3.5 divide-y ${isDark ? "divide-slate-800/60" : "divide-[#eae9e6]/60"} max-h-[300px] overflow-y-auto`}>
                  {radarSignals.length === 0 ? (
                    <div className={`text-center py-10 ${theme.textSecondary} text-xs`}>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Radar Queue Cleared. Next hourly Apps Script sweep scheduled.
                    </div>
                  ) : (
                    radarSignals.map((sig, i) => (
                      <div key={sig.id} className={`pt-3 flex flex-col md:flex-row gap-4 items-start ${i === 0 ? "pt-0" : ""}`}>
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-bold ${isDark ? "text-slate-200" : "text-[#37352f]"} font-mono`}>{sig.detectedCompany}</span>
                            <span className={`font-mono ${theme.textSecondary}`}>({sig.sender})</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                              sig.detectedStatus === "ASSESSMENT_PENDING" ? "bg-amber-500/10 text-amber-500 border border-amber-500/30" :
                              sig.detectedStatus === "INTERVIEWING" ? "bg-blue-500/10 text-blue-500 border border-blue-500/30" :
                              (isDark ? "bg-slate-800 text-slate-350" : "bg-[#f1f1ef] text-[#787774]")
                            }`}>
                              {sig.detectedStatus}
                            </span>
                          </div>
                          <div className={`font-semibold ${isDark ? "text-slate-100" : "text-[#37352f]"}`}>{sig.subject}</div>
                          <p className={`leading-relaxed text-[11px] font-sans ${theme.textSecondary}`}>{sig.snippet}</p>
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
                            className={`px-2.5 py-1.5 rounded text-xs font-mono transition ${theme.bgButtonSec}`}
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
              <div id="sandbox-parser-panel" className={`border rounded-lg p-5 space-y-4 ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    <Code className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                    <h3 className={`text-xs font-bold ${isDark ? "text-white" : "text-[#37352f]"} uppercase font-mono tracking-tight`}>Signal Parser Sandbox</h3>
                  </div>
                  {isSandboxParsed && (
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                      sandboxParserMethod === "Gemini AI" 
                        ? (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200")
                        : (isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200")
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      Engine: {sandboxParserMethod}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${theme.textSecondary} leading-normal`}>
                  Paste rich, multi-line email threads, LinkedIn message chains, or raw communication transcripts directly. Our full-stack AI engine will intelligently extract structured metadata.
                </p>

                <div className="space-y-3">
                  {/* Custom Gemini API Key Browser Input Override */}
                  <div className={`p-3 border rounded-lg ${isDark ? "bg-[#181818] border-slate-800" : "bg-[#faf9f6] border-[#eae9e6]"}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-[#37352f]"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Gemini API Key Override (Local Storage)
                      </label>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        customGeminiApiKey.trim() 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {customGeminiApiKey.trim() ? "Active override" : "Using system default / fallback only"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={customGeminiApiKey}
                        onChange={(e) => setCustomGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy... (Unlocks high-frequency processing / bypasses default limits)"
                        className={`font-mono text-xs flex-1 border rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 ${theme.bgInput}`}
                      />
                      {customGeminiApiKey.trim() && (
                        <button
                          type="button"
                          onClick={() => setCustomGeminiApiKey("")}
                          className={`px-2.5 py-1.5 rounded text-[10px] font-mono border hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition ${theme.bgButtonSec}`}
                        >
                          Clear Key
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className={`px-3 py-1.5 rounded text-[10px] select-none font-mono transition border ${theme.bgButtonSec}`}
                      >
                        {showApiKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className={`text-[9px] ${theme.textSecondary} font-mono mt-1`}>
                      Your key is securely transmitted via TLS proxy to the backend API without logging. Perfect for switching off rate limits!
                    </p>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={6}
                      value={sandboxEmailText}
                      onChange={(e) => setSandboxEmailText(e.target.value)}
                      placeholder="Paste your raw email thread here...&#10;&#10;From: Stripe Jobs &lt;recruitment@stripe.com&gt;&#10;Subject: High-Leverage Consigliere role scheduling...&#10;Hi there, we'd love to schedule an interview next Tuesday at 3pm to review your annual rate target of $175k..."
                      className={`w-full border rounded p-3 text-xs focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-y ${theme.bgInput}`}
                      disabled={isParsingSandbox}
                    />
                    {sandboxEmailText.trim() && (
                      <button
                        onClick={() => {
                          setSandboxEmailText("");
                          setIsSandboxParsed(false);
                          setSandboxParserError(null);
                        }}
                        className={`absolute right-2.5 top-2.5 p-1 rounded-md text-[10px] font-mono border hover:scale-105 transition ${theme.bgButtonSec}`}
                        title="Clear inputs"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <div className={`text-[10px] ${theme.textSecondary} font-mono leading-tight max-w-sm`}>
                      Intelligent Mode: Gemini 3.5 computes deadlines, salary rates, target priorities and details immediately.
                    </div>
                    
                    <button
                      type="button"
                      onClick={executeSandboxParse}
                      disabled={isParsingSandbox || !sandboxEmailText.trim()}
                      className={`w-full sm:w-auto text-xs px-4 py-2 rounded-md font-mono font-bold transition flex items-center justify-center gap-2 border ${
                        isParsingSandbox 
                          ? "bg-blue-600/20 text-blue-400 border-blue-500/30 cursor-not-allowed" 
                          : "bg-blue-600 hover:bg-blue-500 text-white border-transparent"
                      }`}
                    >
                      {isParsingSandbox ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Parsing Thread...
                        </>
                      ) : (
                        "Analyze Thread"
                      )}
                    </button>
                  </div>
                </div>

                {isParsingSandbox && (
                  <div className={`p-6 border rounded-lg flex flex-col items-center justify-center space-y-3 text-xs ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-[#eae9e6]"}`}>
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className={`font-mono font-bold ${isDark ? "text-slate-300" : "text-[#37352f]"}`}>AI Parse Transmit Initiated</span>
                    </div>
                    <p className={`text-[11px] ${theme.textSecondary} text-center max-w-xs leading-relaxed`}>
                      Extracting core organizational anchors, timelines, salaries and contact data points. Please hold...
                    </p>
                  </div>
                )}

                {isSandboxParsed && !isParsingSandbox && (
                  <div className={`p-4 border rounded-lg space-y-4 text-xs ${isDark ? "bg-[#181818] border-slate-850" : "bg-[#fcfcfb] border-[#eae9e6]"}`}>
                    <div className="flex justify-between items-center border-b pb-2 mb-2 border-inherit">
                      <span className="font-mono font-bold text-[10px] text-blue-500 uppercase tracking-wider">Extracted structured parameters (Tweak fields as needed)</span>
                      <span className={`text-[10px] font-mono leading-none ${theme.textSecondary}`}>Verify & tweak details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Company Name */}
                      <div>
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Extracted Company</label>
                        <input
                          type="text"
                          value={sandboxExtractedCompany}
                          onChange={(e) => setSandboxExtractedCompany(e.target.value)}
                          className={`w-full text-xs font-mono p-1.5 rounded border ${theme.bgInput}`}
                        />
                      </div>

                      {/* Target Role Title */}
                      <div>
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Target Role Target</label>
                        <input
                          type="text"
                          value={sandboxExtractedRole}
                          onChange={(e) => setSandboxExtractedRole(e.target.value)}
                          className={`w-full text-xs font-mono p-1.5 rounded border ${theme.bgInput}`}
                        />
                      </div>

                      {/* Detected Status Map */}
                      <div>
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Detected Status Map</label>
                        <select
                          value={sandboxExtractedStatus}
                          onChange={(e) => setSandboxExtractedStatus(e.target.value as OpportunityStatus)}
                          className={`w-full text-xs font-mono p-1.5 bg-inherit rounded border ${theme.bgInput}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="APPLIED">APPLIED</option>
                          <option value="ASSESSMENT_PENDING">ASSESSMENT_PENDING</option>
                          <option value="INTERVIEWING">INTERVIEWING</option>
                          <option value="OFFER">OFFER</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="DORMANT">DORMANT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>

                      {/* Priority Selector */}
                      <div>
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Priority Category</label>
                        <select
                          value={sandboxExtractedPriority}
                          onChange={(e) => setSandboxExtractedPriority(e.target.value as Priority)}
                          className={`w-full text-xs font-mono p-1.5 bg-inherit rounded border ${theme.bgInput}`}
                        >
                          <option value="P0">P0 - Urgent Loop (Highest)</option>
                          <option value="P1">P1 - Active Outbound (Medium)</option>
                          <option value="P2">P2 - Standard/Passive (Low)</option>
                        </select>
                      </div>

                      {/* Action deadline / date */}
                      <div>
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Next Action Date</label>
                        <input
                          type="text"
                          value={sandboxExtractedNextActionDate}
                          onChange={(e) => setSandboxExtractedNextActionDate(e.target.value)}
                          placeholder="e.g. YYYY-MM-DD or No planned action"
                          className={`w-full text-xs font-mono p-1.5 rounded border ${theme.bgInput}`}
                        />
                      </div>

                      {/* Extracted Compensation */}
                      <div>
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Extracted Salary/Rate</label>
                        <input
                          type="text"
                          value={sandboxExtractedSalary}
                          onChange={(e) => setSandboxExtractedSalary(e.target.value)}
                          placeholder="e.g. $140,000 range, $75/hr"
                          className={`w-full text-xs font-mono p-1.5 rounded border ${theme.bgInput}`}
                        />
                      </div>

                      {/* Extract Summarized Context bullet notes */}
                      <div className="col-span-1 md:col-span-2">
                        <label className={`text-[10px] font-mono uppercase tracking-wider ${theme.textSecondary} block mb-1`}>Summarized Context Notes</label>
                        <textarea
                          rows={3}
                          value={sandboxExtractedNotes}
                          onChange={(e) => setSandboxExtractedNotes(e.target.value)}
                          placeholder="Extract specific timeline contexts..."
                          className={`w-full text-xs font-mono p-2 rounded border resize-y ${theme.bgInput}`}
                        />
                      </div>
                    </div>

                    <div className={`pt-3 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-inherit`}>
                      <span className={`text-[11px] ${theme.textSecondary} italic leading-tight`}>
                        Verify fields above & confirm insertion directly into the core Opp ledger. It generates instantly.
                      </span>
                      <button
                        onClick={async () => {
                          const salaryNote = sandboxExtractedSalary ? `[Salary: ${sandboxExtractedSalary}]` : "";
                          const customOpp: Opportunity = {
                            id: `opp-${Date.now()}`,
                            companyName: sandboxExtractedCompany,
                            roleTitle: sandboxExtractedRole,
                            source: "Gmail",
                            tier: "T2",
                            category: "Outbound Pilot",
                            status: sandboxExtractedStatus,
                            priority: sandboxExtractedPriority,
                            nextActionDate: sandboxExtractedNextActionDate,
                            dateApplied: new Date().toISOString().split("T")[0],
                            lastActivityDate: new Date().toISOString().split("T")[0],
                            notes: (salaryNote ? `${salaryNote}\n` : "") + sandboxExtractedNotes
                          };
                          const updatedList = [customOpp, ...opportunities];
                          setOpportunities(updatedList);
                          setSelectedId(customOpp.id);
                          setSandboxEmailText("");
                          setIsSandboxParsed(false);

                          if (appsScriptUrl.trim()) {
                            try {
                              await pushLedgerToSheets(updatedList, true);
                              alert(`Successfully imported "${customOpp.companyName}" locally and synchronized it with your Google Sheet!`);
                            } catch (err: any) {
                              alert(`Successfully imported "${customOpp.companyName}" locally, but Google Sheet push failed: ${err.message || err}`);
                            }
                          } else {
                            alert(`Successfully imported "${customOpp.companyName}" locally! Connect your Apps Script connector below to enable automatic Google Sheets syncing.`);
                          }
                        }}
                        className={`w-full sm:w-auto text-xs px-4 py-2 font-mono font-bold rounded-md transition border ${
                          isDark 
                            ? "bg-blue-600/20 hover:bg-blue-600/35 text-blue-400 border-blue-500/35" 
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        }`}
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
              
              {/* Deployed Web App Connection Cockpit */}
              <div className={`border rounded-lg p-5 space-y-4 ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Database className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                    <h3 className={`text-xs font-bold uppercase font-mono tracking-tight truncate ${isDark ? "text-white" : "text-[#37352f]"}`}>
                      Live Production Connector
                    </h3>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    connectionStatus === "success" 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                      : connectionStatus === "error"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                      : "bg-neutral-500/10 text-neutral-500 border-neutral-500/30"
                  }`}>
                    {connectionStatus === "success" ? "CONNECTED" : connectionStatus === "error" ? "SYNC_FAIL" : "OFFLINE_DEMO"}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                  Connect your deployed Google Apps Script Web App URL to link this React cockpit live with your Google Sheets DB and active Gmail scanner.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className={`text-[10px] uppercase font-mono ${theme.textSecondary} block mb-1 font-semibold`}>
                      Apps Script Web App URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={appsScriptUrl}
                        onChange={(e) => setAppsScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className={`font-mono text-xs flex-1 border rounded p-2 focus:outline-none focus:border-blue-500 ${theme.bgInput}`}
                      />
                      <button
                        onClick={() => handleConnectAppsScript(appsScriptUrl)}
                        disabled={isConnecting || !appsScriptUrl.trim()}
                        className={`px-3 py-2 rounded text-xs select-none flex items-center gap-1 font-mono transition border ${
                          isConnecting 
                            ? "opacity-50 cursor-not-allowed" 
                            : isDark ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-600" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? "animate-spin" : ""}`} />
                        Connect
                      </button>
                    </div>
                  </div>

                  {connectionError && (
                    <div className="p-2.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 leading-relaxed max-h-32 overflow-y-auto">
                      <strong>Deployment Error:</strong> {connectionError}
                    </div>
                  )}

                  {connectionStatus === "success" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={triggerLiveScan}
                        disabled={isConnecting}
                        className={`w-full py-2.5 px-3 rounded text-xs font-mono font-bold transition border flex items-center justify-center gap-1.5 shadow-xs ${
                          isConnecting 
                            ? "opacity-50 cursor-not-allowed" 
                            : isDark ? "bg-slate-900 border-slate-750 text-[#34d399] hover:bg-slate-850 hover:text-emerald-305" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                        }`}
                        title="Command Google Apps Script to run scanGmailSignals() live and fetch updated data"
                      >
                        <Radio className={`w-3.5 h-3.5 ${isConnecting ? "animate-pulse text-emerald-450" : "text-emerald-500"}`} />
                        Trigger Gmail Sweep
                      </button>
                      <button
                        onClick={pushLedgerToSheets}
                        disabled={isConnecting}
                        className={`w-full py-2.5 px-3 rounded text-xs font-mono font-bold transition border flex items-center justify-center gap-1.5 shadow-xs ${
                          isConnecting 
                            ? "opacity-50 cursor-not-allowed" 
                            : `${theme.bgButtonSec} hover:text-blue-500`
                        }`}
                        title="Overwrite your active Google Sheets data with the current local React client state"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-500" />
                        Push Local to Sheets
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Setup steps list */}
              <div className={`border rounded-lg p-5 space-y-4 ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
                <div className="flex items-center gap-1.5">
                  <Layers className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                  <h3 className={`text-xs font-bold ${isDark ? "text-white" : "text-[#37352f]"} uppercase font-mono tracking-tight`}>Active Pipe Quick Setup</h3>
                </div>
                
                <ol className={`text-xs ${theme.textSecondary} space-y-3 pl-4 list-decimal leading-relaxed`}>
                  <li>
                    Create a clean <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Google Sheets spreadsheet</strong>. Rename your target tab to <code className={`font-mono px-1 border rounded ${isDark ? "bg-slate-950 border-slate-850" : "bg-neutral-100 border-neutral-200 text-neutral-800"}`}>Sheet1</code>.
                  </li>
                  <li>
                    Select <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Extensions &gt; Apps Script</strong> at the top bar.
                  </li>
                  <li>
                    Delete all existing default content inside the editor and paste the compiled Apps Script source code.
                  </li>
                  <li>
                    Click <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Save</strong>. Highlight and run function <code className={`font-mono px-1 rounded ${isDark ? "bg-slate-950 text-slate-300" : "bg-neutral-100 border border-neutral-200 text-neutral-800"}`}>setupTrigger()</code> representing hourly automated scans!
                  </li>
                </ol>
                
                <p className="text-[11px] text-[#787774] leading-normal font-mono">
                  Because Gmail maps purely to Sheets rows, this prevents CRM tagging explosions, and protects operational state integrity. That is why this setup works long-term.
                </p>
              </div>

              {/* Source Code Container */}
              <div className={`border rounded-lg overflow-hidden flex flex-col max-h-[440px] ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center font-mono ${isDark ? "border-slate-800 bg-[#252525]/50" : "border-[#eae9e6] bg-[#f7f7f5]"}`}>
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-[#37352f]"}`}>
                    <Code className={`w-3.5 h-3.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    Google Apps Script Code
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`text-[10px] underline font-medium cursor-pointer ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                  >
                    {hasCopiedCode ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <div className={`p-4 overflow-y-auto flex-1 font-mono text-[10px] text-slate-300 space-y-1 select-all scrollbar-thin ${isDark ? "bg-slate-950" : "bg-[#f7f7f5]"}`}>
                  <pre className={`whitespace-pre ${isDark ? "text-slate-300" : "text-[#37352f]"}`}>{getAppsScriptCode()}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
         {/* 4. Core Opportunity Form Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalMode(null)} />
          <div className={`relative w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${isDark ? "bg-[#202020] border-[#2c2c2c]" : "bg-white border-[#eae9e6]"}`}>
            <div className={`px-5 py-4 border-b flex justify-between items-center ${isDark ? "border-slate-850 bg-[#252525]/50" : "border-[#eae9e6] bg-[#f7f7f5]"}`}>
              <h3 className={`text-xs font-bold uppercase font-mono tracking-tight ${isDark ? "text-white" : "text-[#37352f]"}`}>
                {modalMode === "ADD" ? "Create New Opportunity" : "Modify Opportunity details"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className={`p-1 rounded transition ${isDark ? "hover:bg-slate-850 text-slate-400 hover:text-white" : "hover:bg-neutral-200 text-[#787774] hover:text-black"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className={`w-full border rounded p-2.5 focus:outline-none focus:border-blue-500 font-sans ${theme.bgInput}`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Lead Revenue Builder"
                    className={`w-full border rounded p-2.5 focus:outline-none focus:border-blue-500 font-sans ${theme.bgInput}`}
                  />
                </div>

                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as Opportunity["source"])}
                    className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer ${theme.bgInput}`}
                  >
                    <option value="LinkedIn" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>LinkedIn</option>
                    <option value="OLJ" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>OLJ</option>
                    <option value="Direct" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>Direct</option>
                    <option value="Referral" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>Referral</option>
                    <option value="Funnel" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>Funnel</option>
                    <option value="Gmail" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>Gmail</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as OpportunityTier)}
                    className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer font-mono ${theme.bgInput}`}
                  >
                    <option value="T1" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>T1</option>
                    <option value="T2" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>T2</option>
                    <option value="T3" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>T3</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. AI Strategy"
                    className={`w-full border rounded p-2.5 focus:outline-none focus:border-blue-500 font-sans ${theme.bgInput}`}
                  />
                </div>
                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OpportunityStatus)}
                    className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer font-mono ${theme.bgInput}`}
                  >
                    <option value="NEW" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>NEW</option>
                    <option value="APPLIED" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>APPLIED</option>
                    <option value="ASSESSMENT_PENDING" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>ASSESSMENT</option>
                    <option value="INTERVIEWING" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>INTERVIEWING</option>
                    <option value="OFFER" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>OFFER</option>
                    <option value="REJECTED" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>REJECTED</option>
                    <option value="DORMANT" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>DORMANT</option>
                    <option value="ARCHIVED" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer font-mono font-bold ${theme.bgInput}`}
                  >
                    <option value="P0" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P0</option>
                    <option value="P1" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P1</option>
                    <option value="P2" className={isDark ? "bg-[#202020]" : "bg-white text-black"}>P2</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Applied Date</label>
                  <input
                    type="date"
                    value={formDateApplied}
                    onChange={(e) => setFormDateApplied(e.target.value)}
                    className={`w-full border rounded p-2.5 focus:outline-none font-mono text-xs ${theme.bgInput}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Next Action Date Limit</label>
                  <input
                    type="date"
                    value={formNextActionDate}
                    onChange={(e) => setFormNextActionDate(e.target.value)}
                    className={`w-full border rounded p-2.5 focus:outline-none font-mono text-xs ${theme.bgInput}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Outreach URL Link</label>
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://"
                    className={`w-full border rounded p-2.5 focus:outline-none focus:border-blue-500 font-mono ${theme.bgInput}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Dossier Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={4}
                    placeholder="Opportunity notes and outreach checklist details"
                    className={`w-full border rounded p-2.5 focus:outline-none focus:border-blue-500 text-xs ${theme.bgInput}`}
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t font-mono ${isDark ? "border-slate-850" : "border-[#eae9e6]"}`}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className={`px-4 py-2 rounded text-xs transition font-mono ${theme.bgButtonSec}`}
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
