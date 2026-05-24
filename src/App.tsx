import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority, GmailEmailSignal } from "./types";
import {
  Plus, X, Trash, FileText, Check, AlertTriangle, ExternalLink,
  Radio, Database, Code, RefreshCw, Send, CheckCircle2, Info, Layers, Download,
  Sun, Moon, GripVertical, Search, Pencil,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  INITIAL_DATA,
  INITIAL_SIGNALS,
  SOURCE_OPTIONS,
  TIER_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS
} from "./constants";

// Sub-component Suite imports for modular layout structure
import ToastNotification from "./components/ToastNotification";
import OpportunityModal from "./components/OpportunityModal";
import OpportunityDetails from "./components/OpportunityDetails";
import AppsScriptConnector from "./components/AppsScriptConnector";
import SignalSandbox from "./components/SignalSandbox";

const getRiskOfOpportunity = (opp: Opportunity): { type: "deadline_missed" | "no_response" | "none", message: string } => {
  if (["OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(opp.status)) {
    return { type: "none", message: "" };
  }
  
  if (opp.nextActionDate && opp.nextActionDate < "2026-05-24") {
    return { type: "deadline_missed", message: `Action deadline missed (${opp.nextActionDate})` };
  }

  if (opp.status === "APPLIED" && opp.dateApplied && opp.dateApplied < "2026-05-14") {
    return { type: "no_response", message: "Inbox quiet for over 10 days" };
  }

  return { type: "none", message: "" };
};

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
    return saved !== "false"; // default is true (dark mode)
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
    selectedRow: "bg-[#22314f] text-white",
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
    selectedRow: "bg-[#e8f1fc] text-[#1c1c1c]",
    thead: "bg-[#f7f7f5] text-[#787774] border-[#eae9e6]",
    accentBlue: "text-[#2383e2]",
    indicatorBg: "bg-[#eae9e6]/50 text-[#787774] border-[#eae9e6]",
  };

  const [activeTab, setActiveTab] = useState<"cockpit" | "radar">("cockpit");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [focusedId, setFocusedId] = useState<string | null>("1");

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

  // Premium inline overlays & toast states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Expire after 4 seconds automatically
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Apps Script Web App Connection Configs
  const [customGeminiApiKey, setCustomGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("scalesmart_gemini_api_key") || "";
  });

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

  const handleConnectAppsScript = async (urlToTest: string) => {
    if (!urlToTest.trim()) {
      setToast({ message: "Please enter a valid Google Apps Script Web App URL first.", type: "error" });
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
        setToast({ message: `Successfully connected to live Google Sheets! Retrieved and synced ${data.length} ledger row(s).`, type: "success" });
      } else {
        throw new Error("Payload did not return a valid ledger rows array. Please ensure the Apps Script code is copied and deployed perfectly.");
      }
    } catch (err: any) {
      console.error("Live Web App Connection Error", err);
      setConnectionStatus("error");
      setConnectionError(err.toString());
      setToast({ message: `Sync Failed: ${err.message || err}. Ensure Execute as: "Me", Access: "Anyone", and run setupSheet().`, type: "error" });
    } finally {
      setIsConnecting(false);
    }
  };

  const triggerLiveScan = async () => {
    if (!appsScriptUrl.trim()) {
      setToast({ message: "Please configure and connect your Apps Script Deployment URL first.", type: "info" });
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
        setToast({ message: "Live Gmail Inbox sweep completed successfully! Instantly fetching fresh database rows...", type: "success" });
        await handleConnectAppsScript(appsScriptUrl);
      } else {
        throw new Error(result.message || "Unknown error occurred on scan.");
      }
    } catch (err: any) {
      console.error("Trigger Scan Error", err);
      setToast({ message: `Sweep Failed: ${err.message || err}. Make sure Gmail permissions are authorized in the Apps Script console.`, type: "error" });
    } finally {
      setIsConnecting(false);
    }
  };

  const pushLedgerToSheets = async (customOpps?: Opportunity[], quiet = false) => {
    const listToSync = customOpps || opportunities;
    if (!appsScriptUrl.trim()) {
      if (!quiet) setToast({ message: "Please configure and connect your Apps Script Deployment URL first.", type: "info" });
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
        setToast({ message: "Cockpit push completed! Your Google Sheets rows have been synced successfully.", type: "success" });
      }
    } catch (err: any) {
      console.error("Push state failed", err);
      if (!quiet) {
        setToast({ message: `Push synchronization failed: ${err.message || err}`, type: "error" });
      }
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("scalesmart_opportunities_mvp", JSON.stringify(opportunities));
  }, [opportunities]);

  const selectedOpp = opportunities.find((o) => o.id === selectedId) || null;

  const openAddModal = () => {
    setModalMode("ADD");
    setOppToEdit(null);
  };

  const openEditModal = (opp: Opportunity) => {
    setModalMode("EDIT");
    setOppToEdit(opp);
  };

  const handleSaveModal = (formData: Omit<Opportunity, "id" | "lastActivityDate"> & { id?: string }) => {
    let updatedList = [...opportunities];
    
    if (modalMode === "ADD") {
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        companyName: formData.companyName,
        roleTitle: formData.roleTitle,
        source: formData.source,
        tier: formData.tier,
        category: formData.category,
        status: formData.status,
        priority: formData.priority,
        link: formData.link,
        dateApplied: formData.dateApplied,
        nextActionDate: formData.nextActionDate,
        lastActivityDate: "2026-05-24",
        notes: formData.notes
      };
      
      updatedList = [newOpp, ...updatedList];
      setOpportunities(updatedList);
      setSelectedId(newOpp.id);
      setFocusedId(newOpp.id);
      setToast({ message: `Successfully added "${newOpp.companyName}" to local Ledger!`, type: "success" });
    } else if (modalMode === "EDIT" && oppToEdit) {
      const updated: Opportunity = {
        ...oppToEdit,
        companyName: formData.companyName,
        roleTitle: formData.roleTitle,
        source: formData.source,
        tier: formData.tier,
        category: formData.category,
        status: formData.status,
        priority: formData.priority,
        link: formData.link,
        dateApplied: formData.dateApplied,
        nextActionDate: formData.nextActionDate,
        lastActivityDate: "2026-05-24",
        notes: formData.notes
      };
      
      updatedList = opportunities.map((o) => (o.id === oppToEdit.id ? updated : o));
      setOpportunities(updatedList);
      setToast({ message: `Successfully updated "${updated.companyName}" details!`, type: "success" });
    }
    
    setModalMode(null);
    setOppToEdit(null);

    // Auto-sync spreadsheet with Sheets
    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this opportunity?")) {
      const remaining = opportunities.filter((o) => o.id !== id);
      setOpportunities(remaining);
      const nextActiveId = remaining[0]?.id || null;
      if (selectedId === id) {
        setSelectedId(nextActiveId);
      }
      if (focusedId === id) {
        setFocusedId(nextActiveId);
      }

      // Auto-sync with Sheets
      if (appsScriptUrl.trim()) {
        pushLedgerToSheets(remaining, true).catch(() => {});
      }
    }
  };

  const updateStatus = (opp: Opportunity, nextStatus: OpportunityStatus) => {
    const updated: Opportunity = {
      ...opp,
      status: nextStatus,
      lastActivityDate: "2026-05-24"
    };
    const updatedList = opportunities.map((o) => (o.id === opp.id ? updated : o));
    setOpportunities(updatedList);

    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const updatePriority = (opp: Opportunity, p: Priority) => {
    const updated: Opportunity = {
      ...opp,
      priority: p,
      lastActivityDate: "2026-05-24"
    };
    const updatedList = opportunities.map((o) => (o.id === opp.id ? updated : o));
    setOpportunities(updatedList);

    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const updateTier = (opp: Opportunity, t: OpportunityTier) => {
    const updated: Opportunity = {
      ...opp,
      tier: t,
      lastActivityDate: "2026-05-24"
    };
    const updatedList = opportunities.map((o) => (o.id === opp.id ? updated : o));
    setOpportunities(updatedList);

    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const handleApproveSandboxOpportunity = (customOpp: Opportunity) => {
    const updatedList = [customOpp, ...opportunities];
    setOpportunities(updatedList);
    setSelectedId(customOpp.id);
    setFocusedId(customOpp.id);

    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true)
        .then(() => {
          setToast({ message: `Successfully imported "${customOpp.companyName}" locally and synchronized it with your live Google Sheet database!`, type: "success" });
        })
        .catch((err: any) => {
          setToast({ message: `Successfully imported "${customOpp.companyName}" locally, but Google Sheet push failed: ${err.message || err}`, type: "error" });
        });
    } else {
      setToast({ message: `Successfully imported "${customOpp.companyName}" locally! Connect your Google Sheet Apps Script below to enable cloud synchronization.`, type: "success" });
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

    const updatedList = [newOpp, ...opportunities];
    setOpportunities(updatedList);
    setSelectedId(newOpp.id);
    setFocusedId(newOpp.id);
    
    // Remove from radar sim list
    setRadarSignals(radarSignals.filter((s) => s.id !== signal.id));
    setToast({ message: `Signal successfully promoted! "${signal.detectedCompany}" is now integrated into your live Ledger database.`, type: "success" });

    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
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
    link.setAttribute("download", `scalesmart_os_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: "Ledger spreadsheet exported as standard CSV. Ready for direct copy paste imports!", type: "success" });
  };

  // Compute stats totals
  const numAll = opportunities.length;
  const numActive = opportunities.filter((o) => !["OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(o.status)).length;
  const numInterviewing = opportunities.filter((o) => o.status === "INTERVIEWING").length;
  const numActionRequired = opportunities.filter((o) => getRiskOfOpportunity(o).type !== "none").length;
  const numDormant = opportunities.filter((o) => ["DORMANT", "ARCHIVED"].includes(o.status)).length;

  const filtered = opportunities.filter((o) => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || o.companyName.toLowerCase().includes(q) || o.roleTitle.toLowerCase().includes(q) || (o.notes || "").toLowerCase().includes(q);
    
    // Tab filter matching
    if (filter === "ALL") return matchesSearch;
    if (filter === "ACTIVE") return matchesSearch && !["OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(o.status);
    if (filter === "INTERVIEWING") return matchesSearch && o.status === "INTERVIEWING";
    if (filter === "ACTION_REQUIRED") {
      const risk = getRiskOfOpportunity(o);
      return matchesSearch && risk.type !== "none";
    }
    if (filter === "DORMANT") return matchesSearch && ["DORMANT", "ARCHIVED"].includes(o.status);
    return matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle keyboard shortcuts (Ctrl+\ and Ctrl+[) and list arrow key / Enter navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
        return;
      }
      if (e.ctrlKey && (e.key === "[" || e.key === "]")) {
        e.preventDefault();
        setIsRightSidebarOpen((prev) => !prev);
        return;
      }

      // Keyboard arrow keys and Enter navigation for sorted spreadsheet rows in Cockpit tab
      if (activeTab === "cockpit" && sorted.length > 0) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          
          let currentIndex = sorted.findIndex((o) => o.id === (focusedId || selectedId));
          if (currentIndex === -1) {
            currentIndex = 0;
          }

          let nextIndex = currentIndex;
          if (e.key === "ArrowDown") {
            nextIndex = Math.min(currentIndex + 1, sorted.length - 1);
          } else if (e.key === "ArrowUp") {
            nextIndex = Math.max(currentIndex - 1, 0);
          }

          const nextItemId = sorted[nextIndex].id;
          setFocusedId(nextItemId);

          // Smooth scrolling of designated row element to keep elements in viewport naturally
          const rowElement = document.getElementById(`row-${nextItemId}`);
          if (rowElement && typeof rowElement.scrollIntoView === "function") {
            rowElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }

        if (e.key === "Enter") {
          e.preventDefault();
          const targetId = focusedId || selectedId;
          const targetItem = sorted.find((o) => o.id === targetId);
          if (targetItem) {
            setSelectedId(targetItem.id);
            setFocusedId(targetItem.id);
            setIsRightSidebarOpen(true); // Open Details Inspector
            setToast({ message: `Opened "${targetItem.companyName}" details via keyboard selection`, type: "success" });
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab, sorted, focusedId, selectedId, isLeftSidebarOpen, isRightSidebarOpen]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 select-none ${theme.bgApp}`} id="scalesmart-root">
      {/* 1. Global Header Bar */}
      <header className={`h-11 border-b flex items-center justify-between px-4 z-40 select-none sticky top-0 ${theme.bgHeader}`}>
        <div className="flex items-center gap-2">
          <Layers className={`w-4 h-4 ${isDark ? "text-cyan-400 animate-pulse" : "text-blue-500"}`} />
          <h1 className="text-xs font-black uppercase tracking-widest font-mono">
            Scalesmart <span className={theme.accentBlue}>OS</span>
          </h1>
          <span className={`text-[8.5px] font-mono leading-none border px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-neutral-100 border-neutral-200 text-neutral-600"}`}>
            PRO OPERATOR v1.0
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
            <input
              type="text"
              placeholder="Search target company or outreach keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded pl-8 pr-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 ${theme.bgInput}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 rounded transition ${isDark ? "hover:bg-slate-850 text-amber-450 hover:text-amber-400" : "hover:bg-[#eae9e6] text-neutral-600"}`}
            title={isDark ? "Toggle Light mode" : "Toggle Dark mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        
        {/* Helper layout button overlays when sidebar collapsed */}
        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            className={`absolute left-2 bottom-5 z-40 p-2 rounded-full border shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-black border-[#eae9e6]"
            }`}
            title="Expand Sidebar Controls"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        {!isRightSidebarOpen && (
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className={`absolute right-2 bottom-5 z-40 p-2 rounded-full border shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-black border-[#eae9e6]"
            }`}
            title="Expand Opportunity Inspector"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}

        {/* 2. Collapsible Left Navigation Column */}
        {isLeftSidebarOpen && (
          <aside className={`w-64 border-r shrink-0 flex flex-col justify-between select-none z-30 ${theme.bgSidebar}`} id="left-sidebar">
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">Operational Hub</span>
                <button 
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className={`p-1 rounded transition opacity-60 hover:opacity-100 ${isDark ? "hover:bg-slate-850" : "hover:bg-[#f1f1ef]"}`}
                  title="Collapse left panel (Ctrl+\)"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs list */}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("cockpit")}
                  className={`w-full py-1.5 px-2.5 rounded text-xs text-left transition flex items-center gap-2 cursor-pointer font-medium ${
                    activeTab === "cockpit" 
                      ? (isDark ? "bg-[#2c2c2c]/80 text-white" : "bg-[#eae9e6]/80 text-black font-semibold") 
                      : (isDark ? "text-slate-350 hover:bg-slate-850/60" : "text-neutral-600 hover:bg-neutral-100")
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Spreadsheet List Cockpit
                </button>
                <button
                  onClick={() => setActiveTab("radar")}
                  className={`w-full py-1.5 px-2.5 rounded text-xs text-left transition flex items-center gap-2 cursor-pointer font-medium ${
                    activeTab === "radar" 
                      ? (isDark ? "bg-[#2c2c2c]/80 text-white" : "bg-[#eae9e6]/80 text-black font-semibold") 
                      : (isDark ? "text-slate-350 hover:bg-slate-850/60" : "text-neutral-600 hover:bg-neutral-100")
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-blue-500" />
                  Signal Radar Queue ({radarSignals.length})
                </button>
              </div>

              {/* Status/Priority filter blocks inside sidebars */}
              {activeTab === "cockpit" && (
                <div className="space-y-4 pt-4 border-t border-[#2c2c2c]/10 dark:border-slate-850">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block px-1 tracking-wider">Ledger Partitions</span>
                  <div className="space-y-1 font-mono">
                    <button
                      onClick={() => setFilter("ALL")}
                      className={`w-full flex items-center justify-between text-[11px] py-1 px-1.5 rounded transition ${
                        filter === "ALL" ? "text-blue-500 font-bold" : `${theme.textSecondary} hover:text-sky-400`
                      }`}
                    >
                      <span>🗂️ ALL TARGETS</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${theme.indicatorBg}`}>{numAll}</span>
                    </button>
                    <button
                      onClick={() => setFilter("ACTIVE")}
                      className={`w-full flex items-center justify-between text-[11px] py-1 px-1.5 rounded transition ${
                        filter === "ACTIVE" ? "text-blue-505 font-bold" : `${theme.textSecondary} hover:text-sky-400`
                      }`}
                    >
                      <span>⚡ ACTIVE PIPELINE</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${theme.indicatorBg}`}>{numActive}</span>
                    </button>
                    <button
                      onClick={() => setFilter("INTERVIEWING")}
                      className={`w-full flex items-center justify-between text-[11px] py-1 px-1.5 rounded transition ${
                        filter === "INTERVIEWING" ? "text-blue-500 font-bold" : `${theme.textSecondary} hover:text-sky-400`
                      }`}
                    >
                      <span>💬 ACTIVE LOOPS</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${theme.indicatorBg}`}>{numInterviewing}</span>
                    </button>
                    <button
                      onClick={() => setFilter("ACTION_REQUIRED")}
                      className={`w-full flex items-center justify-between text-[11px] py-1 px-1.5 rounded transition ${
                        filter === "ACTION_REQUIRED" ? "text-rose-450 font-bold" : `${theme.textSecondary} hover:text-sky-400`
                      }`}
                    >
                      <span>⚠️ ALERTS PENDING</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border border-rose-500/10 text-rose-400 bg-rose-500/5`}>{numActionRequired}</span>
                    </button>
                    <button
                      onClick={() => setFilter("DORMANT")}
                      className={`w-full flex items-center justify-between text-[11px] py-1 px-1.5 rounded transition ${
                        filter === "DORMANT" ? "text-blue-500 font-bold" : `${theme.textSecondary} hover:text-sky-400`
                      }`}
                    >
                      <span>💤 ARCHIVES</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${theme.indicatorBg}`}>{numDormant}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-4 border-t text-[10.5px] font-mono select-none flex flex-col gap-2 ${isDark ? "border-slate-850" : "border-neutral-200"}`}>
              <div className="flex justify-between items-center text-slate-400 leading-none">
                <span>LOCAL CACHE</span>
                <span className="text-emerald-500">● ARMORED</span>
              </div>
              <p className="opacity-50 text-[10px] leading-relaxed">
                Persistent storage mapped locally and synchronized live with cloud. Click "Push Local" to overwrite online databases.
              </p>
            </div>
          </aside>
        )}

        {/* 3. MAIN COCKPIT VIEWPORT TABLE CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeTab === "cockpit" && (
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.11 }}
              className="flex-1 flex flex-col lg:flex-row min-w-0"
              id="cockpit-hub"
            >
              <main className="flex-1 overflow-x-auto overflow-y-auto p-6 scrollbar-thin">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h2 className={`text-base font-bold tracking-tight uppercase font-mono ${isDark ? "text-white" : "text-[#37352f]"}`}>
                      Ledger Cockpit Sheet ({sorted.length})
                    </h2>
                    <p className={`text-xs ${theme.textSecondary} font-medium mt-0.5`}>
                      Drag left row handle grids to manually reorder target list. Drag order autosyncs perfectly.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportCSV}
                      className={`p-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition border ${theme.bgButtonSec}`}
                      title="Generates fully formatted spreadsheets CSV document download"
                    >
                      <Download className="w-3.5 h-3.5" /> Export DB
                    </button>
                    <button
                      onClick={openAddModal}
                      className="p-2 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1.5 tracking-tight transition shadow-xs cursor-pointer font-sans"
                    >
                      <Plus className="w-4 h-4" /> Import Lead
                    </button>
                  </div>
                </div>

                {/* Main Spreadsheet grid of Targets list */}
                {sorted.length === 0 ? (
                  <div className={`p-16 border border-dashed rounded-lg text-center ${isDark ? "border-slate-800 bg-[#1f1f1f]" : "border-[#eae9e6] bg-[#f7f7f5]"}`}>
                    <FileText className={`w-12 h-12 ${isDark ? "text-slate-800" : "text-slate-200"} mx-auto mb-3 animate-pulse`} />
                    <p className={`text-xs font-medium font-sans ${isDark ? "text-slate-400" : "text-[#37352f]"}`}>No opportunity matches active filter tags</p>
                    <p className={`text-[11px] ${theme.textSecondary} mt-1 max-w-sm mx-auto`}>
                      Try loosening search descriptors, choosing "ALL TARGETS", or run a Gmail sweep in the Signal Radar hub!
                    </p>
                  </div>
                ) : (
                  <table className={`w-full text-left text-xs border-collapse relative font-sans ${isDark ? "border-slate-850" : "border-[#eae9e6]"}`} id="opportunity-table">
                    <thead>
                      <tr className={`border-b select-none font-mono ${theme.thead}`}>
                        <th className="py-2.5 px-3 w-6 text-center">Reorder</th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition" onClick={() => handleSort("companyName")}>
                          🏢 Company Name {sortField === "companyName" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition" onClick={() => handleSort("roleTitle")}>
                          💼 Role Title {sortField === "roleTitle" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition" onClick={() => handleSort("source")}>
                          🌐 Source {sortField === "source" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition" onClick={() => handleSort("tier")}>
                          🚦 Tier {sortField === "tier" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition" onClick={() => handleSort("status")}>
                          🟢 Status {sortField === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition" onClick={() => handleSort("priority")}>
                          🚩 Priority {sortField === "priority" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eae9e6]/10 dark:divide-slate-855">
                      {sorted.map((item) => {
                        const isSelected = item.id === selectedId;
                        const isFocused = item.id === focusedId;
                        const risk = getRiskOfOpportunity(item);

                        return (
                          <tr
                            key={item.id}
                            id={`row-${item.id}`}
                            draggable
                            onDragStart={() => setDraggingId(item.id)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={() => {
                              if (draggingId) {
                                handleDragAndDropReorder(draggingId, item.id);
                                setDraggingId(null);
                              }
                            }}
                            onClick={() => { setSelectedId(item.id); setFocusedId(item.id); }}
                            className={`transition-colors duration-100 group opacity-90 hover:opacity-100 outline-none relative ${
                              isSelected 
                                ? theme.selectedRow 
                                : isFocused
                                ? (isDark ? "bg-[#253959] text-white" : "bg-[#f1f5f9] text-[#1c1c1c]")
                                : `${theme.hoverRow} ${isDark ? "bg-[#1d1d1d]" : "bg-white"}`
                            } ${isFocused ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                          >
                            <td className="py-1.5 px-2 text-center align-middle">
                              <div className="flex items-center justify-center cursor-row-resize opacity-40 group-hover:opacity-100 transition">
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                            </td>
                            
                            <td className="py-2 px-3 font-semibold break-all leading-relaxed">
                              <div className="flex items-center gap-1.5">
                                <span className={isDark ? "text-slate-100" : "text-[#37352f]"}>{item.companyName}</span>
                                {risk.type !== "none" && (
                                  <AlertTriangle 
                                    className={`w-3.5 h-3.5 shrink-0 ${risk.type === "deadline_missed" ? "text-rose-455" : "text-amber-500 animate-pulse"}`} 
                                    title={risk.message} 
                                  />
                                )}
                              </div>
                            </td>

                            <td className="py-2 px-3 break-all font-medium leading-relaxed max-w-xs">{item.roleTitle}</td>
                            
                            <td className="py-2 px-3 font-mono text-[11px]">{item.source}</td>
                            
                            <td className="py-2 px-3 font-mono text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                item.tier === "T1" 
                                  ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" 
                                  : item.tier === "T2" 
                                  ? "text-blue-400 bg-blue-500/10 border border-blue-500/10"
                                  : "text-slate-400 bg-slate-500/10 border border-slate-700"
                              }`}>
                                {item.tier}
                              </span>
                            </td>

                            <td className="py-2 px-3 align-middle">
                              <span className={`px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] uppercase font-bold tracking-tight inline-block ${
                                item.status === "OFFER" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black animate-pulse" :
                                item.status === "INTERVIEWING" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold" :
                                item.status === "ASSESSMENT_PENDING" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                item.status === "REJECTED" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 line-through opacity-70" :
                                item.status === "APPLIED" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                "bg-slate-500/10 text-slate-400 border border-slate-700"
                              }`}>
                                {item.status === "ASSESSMENT_PENDING" ? "ASSESSMENT" : item.status}
                              </span>
                            </td>

                            <td className="py-2 px-3 align-middle font-mono font-bold text-center">
                              <span className={item.priority === "P0" ? "text-rose-500 font-extrabold" : "opacity-90"}>
                                {item.priority}
                              </span>
                            </td>

                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                                  className={`p-0.5 rounded transition ${isDark ? "text-slate-500 hover:text-white bg-slate-800" : "text-neutral-500 hover:text-black bg-neutral-200/55"}`}
                                  title="Edit Ledger Record"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                  className={`p-0.5 rounded transition ${isDark ? "text-slate-500 hover:text-red-400 bg-slate-800" : "text-neutral-500 hover:text-red-500 bg-neutral-200/55"}`}
                                  title="Delete Ledger"
                                >
                                  <Trash className="w-3 h-3" />
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
                  <OpportunityDetails
                    selectedOpp={selectedOpp}
                    isDark={isDark}
                    theme={theme}
                    onClose={() => setIsRightSidebarOpen(false)}
                    onEdit={openEditModal}
                    onUpdateStatus={updateStatus}
                    onUpdatePriority={updatePriority}
                    onUpdateTier={updateTier}
                  />
                </aside>
              )}
            </motion.div>
          )}

          {/* 4. TAB 2: Signal Radar & Google Apps Script Setup Panel */}
          {activeTab === "radar" && (
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className={`flex-1 overflow-y-auto p-6 space-y-8 ${isDark ? "bg-[#191919]" : "bg-white"}`} 
              id="radar-hub"
            >
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
                                className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded transition font-mono whitespace-nowrap animate-fade-in cursor-pointer"
                              >
                                Sync to Ledger
                              </button>
                              <button
                                onClick={() => setRadarSignals(radarSignals.filter((item) => item.id !== sig.id))}
                                className={`px-2.5 py-1.5 rounded text-xs font-mono transition cursor-pointer ${theme.bgButtonSec}`}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Box B: Modular AI Text Sandbox Parser */}
                  <SignalSandbox
                    isDark={isDark}
                    theme={theme}
                    customGeminiApiKey={customGeminiApiKey}
                    setCustomGeminiApiKey={setCustomGeminiApiKey}
                    onApproveOpportunity={handleApproveSandboxOpportunity}
                    setToast={setToast}
                  />
                </div>

                {/* Right Box: Modular Apps Script connector suite (5 cols) */}
                <AppsScriptConnector
                  appsScriptUrl={appsScriptUrl}
                  setAppsScriptUrl={setAppsScriptUrl}
                  isConnecting={isConnecting}
                  connectionStatus={connectionStatus}
                  connectionError={connectionError}
                  handleConnectAppsScript={handleConnectAppsScript}
                  triggerLiveScan={triggerLiveScan}
                  pushLedgerToSheets={() => pushLedgerToSheets(opportunities)}
                  isDark={isDark}
                  theme={theme}
                  setToast={setToast}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Core Opportunity Form Modal (Modular Overlay) */}
      <OpportunityModal
        modalMode={modalMode}
        oppToEdit={oppToEdit}
        onClose={() => { setModalMode(null); setOppToEdit(null); }}
        onSave={handleSaveModal}
        isDark={isDark}
        theme={theme}
      />

      {/* 6. Floating Notification Toast System (Modular Overlay) */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
        isDark={isDark}
      />
    </div>
  );
}
