import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority, GmailEmailSignal } from "./types";
import {
  Plus, X, Trash, FileText, Check, AlertTriangle, ExternalLink,
  Radio, Database, Code, RefreshCw, Send, CheckCircle2, Info, Layers, Download,
  Sun, Moon, GripVertical, Search, Pencil,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Keyboard, HelpCircle,
  Copy, RotateCcw, SlidersHorizontal
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
import { getRiskOfOpportunity } from "./utils";

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

  // Keyboard shortcut help overlay state
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState<boolean>(false);

  // Multi-select bulk operational selection state
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [filter, activeTab]);

  const handleBulkStatus = (nextStatus: OpportunityStatus) => {
    const updatedList = opportunities.map((o) => {
      if (selectedRowIds.includes(o.id)) {
        return { ...o, status: nextStatus, lastActivityDate: "2026-05-24" };
      }
      return o;
    });
    setOpportunities(updatedList);
    setSelectedRowIds([]);
    setToast({ message: `Successfully updated status to ${nextStatus} for ${selectedRowIds.length} lead(s).`, type: "success" });
    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const handleBulkTier = (nextTier: OpportunityTier) => {
    const updatedList = opportunities.map((o) => {
      if (selectedRowIds.includes(o.id)) {
        return { ...o, tier: nextTier, lastActivityDate: "2026-05-24" };
      }
      return o;
    });
    setOpportunities(updatedList);
    setSelectedRowIds([]);
    setToast({ message: `Successfully shifted tier to ${nextTier} for ${selectedRowIds.length} lead(s).`, type: "success" });
    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const handleBulkPriority = (nextPriority: Priority) => {
    const updatedList = opportunities.map((o) => {
      if (selectedRowIds.includes(o.id)) {
        return { ...o, priority: nextPriority, lastActivityDate: "2026-05-24" };
      }
      return o;
    });
    setOpportunities(updatedList);
    setSelectedRowIds([]);
    setToast({ message: `Successfully changed priority to ${nextPriority} for ${selectedRowIds.length} lead(s).`, type: "success" });
    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to permanently delete all ${selectedRowIds.length} selected leads from cockpit? This cannot be undone.`)) {
      return;
    }
    const remaining = opportunities.filter((o) => !selectedRowIds.includes(o.id));
    setOpportunities(remaining);
    setSelectedRowIds([]);
    setToast({ message: `Successfully deleted ${selectedRowIds.length} selected lead(s).`, type: "success" });

    if (selectedId && selectedRowIds.includes(selectedId)) {
      setSelectedId(remaining[0]?.id || null);
    }
    if (focusedId && selectedRowIds.includes(focusedId)) {
      setFocusedId(remaining[0]?.id || null);
    }

    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(remaining, true).catch(() => {});
    }
  };

  const updateOpportunity = (opp: Opportunity) => {
    const updatedList = opportunities.map((o) => (o.id === opp.id ? opp : o));
    setOpportunities(updatedList);
    if (appsScriptUrl.trim()) {
      pushLedgerToSheets(updatedList, true).catch(() => {});
    }
  };

  // Sort state
  const [sortField, setSortField] = useState<keyof Opportunity | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Advanced Filtering states
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [filterSource, setFilterSource] = useState<string>("ALL");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const handleSort = (field: keyof Opportunity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  // Copy spreadsheet contents directly as a pristine formatted Markdown table
  const handleCopyMarkdown = async () => {
    const targets = selectedRowIds.length > 0
      ? opportunities.filter(o => selectedRowIds.includes(o.id))
      : sorted;

    if (targets.length === 0) {
      setToast({ message: "No targeting leads available to copy as Markdown.", type: "error" });
      return;
    }

    let mdContent = "| 🏢 Company Name | 💼 Role Title | 🟢 Tier | 🎯 Priority | 📈 Status | 📊 WesBI Score | 🌐 Source | 📅 Applied | 🔗 Action Link |\n";
    mdContent += "| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n";

    targets.forEach((o) => {
      const company = o.companyName || "—";
      const role = o.roleTitle || "—";
      const tier = o.tier || "—";
      const status = o.status || "—";
      const priority = o.priority || "—";
      const score = o.score !== undefined ? `${o.score}/100` : "—";
      const sourceName = o.source || "—";
      const dateApplied = o.dateApplied || "—";
      const linkStr = o.link ? `[Link](${o.link})` : "—";

      mdContent += `| **${company}** | ${role} | ${tier} | ${priority} | ${status} | ${score} | ${sourceName} | ${dateApplied} | ${linkStr} |\n`;
    });

    try {
      await navigator.clipboard.writeText(mdContent);
      setToast({
        message: `Successfully copied ${targets.length} lead(s) as a Markdown table to clipboard!`,
        type: "success"
      });
    } catch (err: any) {
      console.error("Markdown copy failed:", err);
      setToast({ message: "Failed to write markdown table to clipboard.", type: "error" });
    }
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
    
    // Left side partition tab filter matching
    let matchesPartition = true;
    if (filter === "ACTIVE") {
      matchesPartition = !["OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(o.status);
    } else if (filter === "INTERVIEWING") {
      matchesPartition = o.status === "INTERVIEWING";
    } else if (filter === "ACTION_REQUIRED") {
      const risk = getRiskOfOpportunity(o);
      matchesPartition = risk.type !== "none";
    } else if (filter === "DORMANT") {
      matchesPartition = ["DORMANT", "ARCHIVED"].includes(o.status);
    }

    // Advanced Sub-Filters:
    const matchesPriority = filterPriority === "ALL" || o.priority === filterPriority;
    const matchesTier = filterTier === "ALL" || o.tier === filterTier;
    const matchesSource = filterSource === "ALL" || o.source === filterSource;
    
    let matchesRisk = true;
    if (filterRisk !== "ALL") {
      const risk = getRiskOfOpportunity(o);
      if (filterRisk === "RISK_ONLY") {
        matchesRisk = risk.type !== "none";
      } else {
        matchesRisk = risk.type === filterRisk.toLowerCase();
      }
    }

    return matchesSearch && matchesPartition && matchesPriority && matchesTier && matchesSource && matchesRisk;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;

    // Numerical Score Sorting (handle missing/undefined)
    if (sortField === "score") {
      const scoreA = a.score !== undefined ? a.score : -1;
      const scoreB = b.score !== undefined ? b.score : -1;
      if (scoreA === scoreB) return 0;
      if (scoreA === -1) return 1; // missing goes bottom
      if (scoreB === -1) return -1;
      return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
    }

    // Chronological/Date Sorting (dateApplied, lastActivityDate, nextActionDate)
    if (sortField === "dateApplied" || sortField === "lastActivityDate" || sortField === "nextActionDate") {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      if (!valA && !valB) return 0;
      if (!valA) return 1; // empty dates go to bottom
      if (!valB) return -1;
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

    // Standard lexical string comparison (lowercase)
    const valA = String(a[sortField] || "").toLowerCase();
    const valB = String(b[sortField] || "").toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const isAnyFilterActive = filterPriority !== "ALL" || filterTier !== "ALL" || filterSource !== "ALL" || filterRisk !== "ALL" || sortField !== null;

  // Handle keyboard shortcuts (Ctrl+\ and Ctrl+[) and list arrow key / Enter navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        modalMode !== null
      ) {
        return;
      }

      if (isShortcutModalOpen) {
        if (e.key === "Escape" || e.key === "?") {
          e.preventDefault();
          setIsShortcutModalOpen(false);
        }
        return;
      }

      // Pro Operator instant tab switching
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.key === "c" || e.key === "C") {
          setActiveTab("cockpit");
          setToast({ message: "Switched to Spreadsheet List Cockpit [C]", type: "info" });
          return;
        }
        if (e.key === "r" || e.key === "R") {
          setActiveTab("radar");
          setToast({ message: "Switched to Signal Radar Queue [R]", type: "info" });
          return;
        }
        if (e.key === "?") {
          e.preventDefault();
          setIsShortcutModalOpen(true);
          return;
        }
      }

      // Number keys 1-5 to switch between partitions in Cockpit
      if (activeTab === "cockpit" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.key === "1") {
          setFilter("ALL");
          setToast({ message: "Partition filter: ALL TARGETS [1]", type: "info" });
          return;
        }
        if (e.key === "2") {
          setFilter("ACTIVE");
          setToast({ message: "Partition filter: ACTIVE PIPELINE [2]", type: "info" });
          return;
        }
        if (e.key === "3") {
          setFilter("INTERVIEWING");
          setToast({ message: "Partition filter: ACTIVE LOOPS [3]", type: "info" });
          return;
        }
        if (e.key === "4") {
          setFilter("ACTION_REQUIRED");
          setToast({ message: "Partition filter: ALERTS PENDING [4]", type: "info" });
          return;
        }
        if (e.key === "5") {
          setFilter("DORMANT");
          setToast({ message: "Partition filter: ARCHIVES [5]", type: "info" });
          return;
        }
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
  }, [activeTab, sorted, focusedId, selectedId, isLeftSidebarOpen, isRightSidebarOpen, modalMode, isShortcutModalOpen]);

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
            onClick={() => setIsShortcutModalOpen(true)}
            className={`p-1.5 rounded transition flex items-center gap-1 text-[10.5px] font-mono leading-none ${
              isDark ? "hover:bg-[#2c2c2c] text-sky-400 hover:text-sky-300" : "hover:bg-[#eae9e6]/80 text-blue-600 hover:text-blue-700"
            }`}
            title="Keyboard Shortcut Guide (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline opacity-80">[?] Shortcuts</span>
          </button>

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
                      onClick={handleCopyMarkdown}
                      className={`p-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
                        selectedRowIds.length > 0
                          ? "bg-[#252525] text-cyan-450 border-cyan-400/30 dark:bg-slate-900/80 dark:text-cyan-400 dark:border-cyan-500/20"
                          : theme.bgButtonSec
                      }`}
                      title={
                        selectedRowIds.length > 0
                          ? `Copy ${selectedRowIds.length} selected lead(s) as a Markdown table`
                          : "Copy entire visible list as a Markdown table"
                      }
                    >
                      <Copy className={`w-3.5 h-3.5 ${selectedRowIds.length > 0 ? "text-cyan-400 animate-pulse" : ""}`} />
                      Copy MD {selectedRowIds.length > 0 && `(${selectedRowIds.length})`}
                    </button>
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

                {/* Stacked visual status indicator profile */}
                {opportunities.length > 0 && (() => {
                  const totalOppsCount = opportunities.length || 1;
                  const countByStatus = (status: OpportunityStatus) => opportunities.filter(o => o.status === status).length;
                  
                  const pctNew = (countByStatus("NEW") / totalOppsCount) * 100;
                  const pctApplied = (countByStatus("APPLIED") / totalOppsCount) * 100;
                  const pctAssessment = (countByStatus("ASSESSMENT_PENDING") / totalOppsCount) * 100;
                  const pctInterview = (countByStatus("INTERVIEWING") / totalOppsCount) * 100;
                  const pctOffer = (countByStatus("OFFER") / totalOppsCount) * 100;
                  const pctRejected = (countByStatus("REJECTED") / totalOppsCount) * 100;
                  const pctDormant = ((countByStatus("DORMANT") + countByStatus("ARCHIVED")) / totalOppsCount) * 100;

                  return (
                    <div className={`mb-6 p-4 rounded-lg border ${theme.bgCard} flex flex-col gap-2.5`}>
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                        <span className={`font-bold ${isDark ? "text-slate-300" : "text-[#37352f]"}`}>PIPELINE DISTRIBUTION PROFILE</span>
                        <span className={`text-[9px] ${theme.textSecondary}`}>Hover blocks for active headcounts</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden w-full flex bg-slate-800/10 dark:bg-slate-800">
                        {pctNew > 0 && (
                          <div 
                            style={{ width: `${pctNew}%` }} 
                            className="bg-slate-400 dark:bg-slate-500 transition-all cursor-help"
                            title={`NEW: ${countByStatus("NEW")} record(s) (${Math.round(pctNew)}%)`}
                          />
                        )}
                        {pctApplied > 0 && (
                          <div 
                            style={{ width: `${pctApplied}%` }} 
                            className="bg-indigo-500 transition-all cursor-help"
                            title={`APPLIED: ${countByStatus("APPLIED")} record(s) (${Math.round(pctApplied)}%)`}
                          />
                        )}
                        {pctAssessment > 0 && (
                          <div 
                            style={{ width: `${pctAssessment}%` }} 
                            className="bg-amber-500 transition-all cursor-help"
                            title={`ASSESSMENT: ${countByStatus("ASSESSMENT_PENDING")} record(s) (${Math.round(pctAssessment)}%)`}
                          />
                        )}
                        {pctInterview > 0 && (
                          <div 
                            style={{ width: `${pctInterview}%` }} 
                            className="bg-sky-500 transition-all cursor-help"
                            title={`INTERVIEWING: ${countByStatus("INTERVIEWING")} record(s) (${Math.round(pctInterview)}%)`}
                          />
                        )}
                        {pctOffer > 0 && (
                          <div 
                            style={{ width: `${pctOffer}%` }} 
                            className="bg-emerald-500 transition-all cursor-help"
                            title={`OFFER: ${countByStatus("OFFER")} record(s) (${Math.round(pctOffer)}%)`}
                          />
                        )}
                        {pctRejected > 0 && (
                          <div 
                            style={{ width: `${pctRejected}%` }} 
                            className="bg-rose-500 transition-all cursor-help"
                            title={`REJECTED: ${countByStatus("REJECTED")} record(s) (${Math.round(pctRejected)}%)`}
                          />
                        )}
                        {pctDormant > 0 && (
                          <div 
                            style={{ width: `${pctDormant}%` }} 
                            className="bg-zinc-450 dark:bg-zinc-600 transition-all cursor-help"
                            title={`ARCHIVES: ${countByStatus("DORMANT") + countByStatus("ARCHIVED")} record(s) (${Math.round(pctDormant)}%)`}
                          />
                        )}
                      </div>
                      
                      {/* Grid Legends */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-mono opacity-80 mt-0.5">
                        {countByStatus("NEW") > 0 && (
                          <div className="flex items-center gap-1" title="New records to evaluate">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
                            <span>NEW ({countByStatus("NEW")})</span>
                          </div>
                        )}
                        {countByStatus("APPLIED") > 0 && (
                          <div className="flex items-center gap-1" title="Outreach applied leads">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 inline-block" />
                            <span>APPLIED ({countByStatus("APPLIED")})</span>
                          </div>
                        )}
                        {countByStatus("ASSESSMENT_PENDING") > 0 && (
                          <div className="flex items-center gap-1" title="Tests or takehome exercises pending">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            <span>ASSESSMENT ({countByStatus("ASSESSMENT_PENDING")})</span>
                          </div>
                        )}
                        {countByStatus("INTERVIEWING") > 0 && (
                          <div className="flex items-center gap-1" title="Currently speaking with company loops">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-505 inline-block" />
                            <span>INTERVIEWING ({countByStatus("INTERVIEWING")})</span>
                          </div>
                        )}
                        {countByStatus("OFFER") > 0 && (
                          <div className="flex items-center gap-1" title="Successful Job / Project bids offered!">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            <span className="font-bold text-emerald-500">OFFER ({countByStatus("OFFER")})</span>
                          </div>
                        )}
                        {countByStatus("REJECTED") > 0 && (
                          <div className="flex items-center gap-1" title="Unmatched applications">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                            <span>REJECTED ({countByStatus("REJECTED")})</span>
                          </div>
                        )}
                        {countByStatus("DORMANT") + countByStatus("ARCHIVED") > 0 && (
                          <div className="flex items-center gap-1" title="Archived, dormant, or paused leads">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
                            <span>ARCHIVES ({countByStatus("DORMANT") + countByStatus("ARCHIVED")})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Advanced Controls Desk */}
                <div className={`mb-4 p-3 rounded-lg border ${theme.bgCard} ${isDark ? "border-slate-800" : "border-neutral-250/50"} flex flex-col gap-3 font-sans`}>
                  <div className="flex items-center justify-between border-b pb-2 select-none border-neutral-200/50 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wide">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                      <span className={isDark ? "text-slate-200" : "text-slate-800"}>ADVANCED CONTROLS DESK</span>
                    </div>
                    {isAnyFilterActive && (
                      <button
                        onClick={() => {
                          setFilterPriority("ALL");
                          setFilterTier("ALL");
                          setFilterSource("ALL");
                          setFilterRisk("ALL");
                          setSortField(null);
                          setSortDirection("asc");
                          setToast({ message: "Reset the advanced filters and custom sorting desk successfully!", type: "success" });
                        }}
                        className={`text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                          isDark 
                            ? "bg-slate-900 border-rose-500/30 text-rose-400 hover:bg-rose-950/20" 
                            : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                        }`}
                        title="Reset all search controls back to natural drag order"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>RESET CONTROLS</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
                    {/* Sort Column field */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 font-mono">Sort Column:</span>
                      <select
                        value={sortField || "none"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "none") {
                            setSortField(null);
                          } else {
                            setSortField(val as keyof Opportunity);
                          }
                        }}
                        className={`p-1.5 rounded text-xs border ${theme.bgInput} cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500`}
                      >
                        <option value="none">📌 Drag-and-drop</option>
                        <option value="dateApplied">📅 Date Applied</option>
                        <option value="lastActivityDate">⏱️ Last Activity</option>
                        <option value="nextActionDate">🎯 Next Action</option>
                        <option value="companyName">🏢 Company Name</option>
                        <option value="roleTitle">💼 Role Title</option>
                        <option value="score">📈 WesBI Score</option>
                      </select>
                    </div>

                    {/* Sort Order select */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 font-mono">Sort Order:</span>
                      <select
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
                        disabled={!sortField}
                        className={`p-1.5 rounded text-xs border ${theme.bgInput} cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <option value="asc">Ascending (A-Z / Oldest)</option>
                        <option value="desc">Descending (Z-A / Newest)</option>
                      </select>
                    </div>

                    {/* Priority sub filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 font-mono">Priority:</span>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className={`p-1.5 rounded text-xs border ${theme.bgInput} cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500`}
                      >
                        <option value="ALL">All Priorities</option>
                        <option value="P0">🚩 P0 (Critical)</option>
                        <option value="P1">🚩 P1 (Medium)</option>
                        <option value="P2">🚩 P2 (Standard)</option>
                      </select>
                    </div>

                    {/* Tier Filter option */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 font-mono">Company Tier:</span>
                      <select
                        value={filterTier}
                        onChange={(e) => setFilterTier(e.target.value)}
                        className={`p-1.5 rounded text-xs border ${theme.bgInput} cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500`}
                      >
                        <option value="ALL">All Tiers</option>
                        <option value="T1">⭐ Tier 1 (Dream)</option>
                        <option value="T2">⭐ Tier 2 (High Value)</option>
                        <option value="T3">⭐ Tier 3 (Standard)</option>
                      </select>
                    </div>

                    {/* Outreach channels source dropdown */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 font-mono">Channel:</span>
                      <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className={`p-1.5 rounded text-xs border ${theme.bgInput} cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500`}
                      >
                        <option value="ALL">All Sources</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="OLJ">OLJ</option>
                        <option value="Direct">Direct Outreach</option>
                        <option value="Referral">Warm Referral</option>
                        <option value="Funnel">Automation Funnel</option>
                        <option value="Gmail">Gmail Signal</option>
                      </select>
                    </div>

                    {/* Alert Flag filters */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 font-mono">Alert Profiles:</span>
                      <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className={`p-1.5 rounded text-xs border ${theme.bgInput} cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500`}
                      >
                        <option value="ALL">All Indicators</option>
                        <option value="RISK_ONLY">⚠️ Active Red Flags</option>
                        <option value="DEADLINE_MISSED">⚠️ Deadline Missed</option>
                        <option value="NO_RESPONSE">⚠️ No Response &gt; 14d</option>
                        <option value="UNCLEAR">⚠️ Unclear Next Action</option>
                      </select>
                    </div>
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
                  <table className={`w-full text-left text-xs border-collapse relative font-sans ${isDark ? "border-slate-855" : "border-[#eae9e6]"}`} id="opportunity-table">
                    <thead>
                      <tr className={`border-b select-none font-mono ${theme.thead}`}>
                        <th className="py-2.5 px-3 w-8 text-center select-none">
                          <input 
                            type="checkbox" 
                            className="cursor-pointer font-sans"
                            checked={sorted.length > 0 && selectedRowIds.length === sorted.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRowIds(sorted.map(x => x.id));
                              } else {
                                setSelectedRowIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="py-2.5 px-3 w-6 text-center">Reorder</th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-[#37352f] dark:hover:text-white transition" onClick={() => handleSort("companyName")}>
                          🏢 Company Name {sortField === "companyName" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-[#37352f] dark:hover:text-white transition" onClick={() => handleSort("roleTitle")}>
                          💼 Role Title {sortField === "roleTitle" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-[#37352f] dark:hover:text-white transition" onClick={() => handleSort("source")}>
                          🌐 Source {sortField === "source" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-[#37352f] dark:hover:text-white transition" onClick={() => handleSort("tier")}>
                          🚦 Tier {sortField === "tier" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-[#37352f] dark:hover:text-white transition" onClick={() => handleSort("status")}>
                          🟢 Status {sortField === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="py-2.5 px-3 cursor-pointer select-none hover:text-[#37352f] dark:hover:text-white transition" onClick={() => handleSort("priority")}>
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
                            onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              if (dragOverId !== item.id && draggingId !== item.id) {
                                setDragOverId(item.id);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverId === item.id) {
                                setDragOverId(null);
                              }
                            }}
                            onDrop={() => {
                              if (draggingId) {
                                handleDragAndDropReorder(draggingId, item.id);
                              }
                              setDraggingId(null);
                              setDragOverId(null);
                            }}
                            onClick={() => { setSelectedId(item.id); setFocusedId(item.id); }}
                            className={`transition-all duration-100 group outline-none relative ${
                              draggingId === item.id
                                ? (isDark ? "opacity-30 bg-slate-800 border-y-2 border-dashed border-sky-500 scale-[0.99]" : "opacity-30 bg-slate-100 border-y-2 border-dashed border-sky-400 scale-[0.99]")
                                : dragOverId === item.id
                                ? (isDark ? "bg-sky-550/15 border-b-2 border-sky-500 scale-[1.002]" : "bg-sky-50 border-b-2 border-sky-400 scale-[1.002]")
                                : isSelected 
                                ? theme.selectedRow 
                                : isFocused
                                ? (isDark ? "bg-[#253959] text-white" : "bg-[#f1f5f9] text-[#1c1c1c]")
                                : `${theme.hoverRow} ${isDark ? "bg-[#1d1d1d]" : "bg-white"}`
                            } ${isFocused ? "ring-2 ring-blue-500 ring-inset" : ""} ${draggingId ? "cursor-grabbing" : ""}`}
                          >
                            <td className="py-2 px-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                className="cursor-pointer"
                                checked={selectedRowIds.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRowIds(prev => [...prev, item.id]);
                                  } else {
                                    setSelectedRowIds(prev => prev.filter(id => id !== item.id));
                                  }
                                }}
                              />
                            </td>

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
                            
                            <td className="py-2 px-3 font-mono text-center font-bold relative">
                              <div className="relative inline-block group/tier">
                                <span 
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-help inline-block font-bold select-none ${
                                    item.tier === "T1" 
                                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-500/25" 
                                      : item.tier === "T2" 
                                      ? "text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/25"
                                      : "text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-400 dark:bg-rose-500/15 dark:border-rose-500/25"
                                  }`}
                                >
                                  {item.tier}
                                </span>
                                
                                {/* Rich Hover Tooltip Box */}
                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-xl border text-left transition-all duration-150 origin-bottom scale-95 opacity-0 pointer-events-none group-hover/tier:scale-100 group-hover/tier:opacity-100 group-hover/tier:pointer-events-auto z-40 ${
                                  isDark 
                                    ? "bg-[#181818] border-slate-800 text-slate-100" 
                                    : "bg-white border-neutral-200 text-neutral-800"
                                }`}>
                                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-500/10 dark:border-slate-800">
                                    {item.tier === "T1" ? (
                                      <>
                                        <span className="text-emerald-500 font-bold font-mono text-[10px]">🟢 T1</span>
                                        <span className="font-sans font-black text-[9.5px] uppercase tracking-wider">Execution / VA Level</span>
                                      </>
                                    ) : item.tier === "T2" ? (
                                      <>
                                        <span className="text-amber-500 font-bold font-mono text-[10px]">🟡 T2</span>
                                        <span className="font-sans font-black text-[9.5px] uppercase tracking-wider">Operations / Specialist (Default)</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-rose-500 font-bold font-mono text-[10px]">🔴 T3</span>
                                        <span className="font-sans font-black text-[9.5px] uppercase tracking-wider">Systems / Architect</span>
                                      </>
                                    )}
                                  </div>
                                  
                                  <p className={`text-[10.5px] leading-relaxed font-sans font-medium ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
                                    {item.tier === "T1" && "Simple operations, data entry, distributor research, basic Amazon/Shopify catalog execution tasks, following strict SOPs."}
                                    {item.tier === "T2" && "Amazon Operations, active catalog health audits, basic PPC, inventory coordination, Shopify/Amazon hybrid roles."}
                                    {item.tier === "T3" && "Strategic agency leaders, backend Amazon recovery, flat-file variation engineering, customized App Script automation & SOP playbook design."}
                                  </p>
                                  
                                  {/* Triangle Caret indicator */}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-neutral-200 dark:border-t-slate-800" />
                                  <div className={`absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[3.5px] ${
                                    isDark ? "border-t-[#181818]" : "border-t-white"
                                  }`} />
                                </div>
                              </div>
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

                {/* Floating Bulk Operations Console Box */}
                {selectedRowIds.length > 0 && (
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4">
                    <div className={`p-3 rounded-lg border shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs ${
                      isDark 
                        ? "bg-[#1f1f1f] border-slate-800 text-[#f1f1ef] shadow-black/80" 
                        : "bg-white border-neutral-200 text-[#37352f] shadow-neutral-350/50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="font-mono font-bold leading-none">{selectedRowIds.length} lead(s) selected</span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2">
                        <select
                          onChange={(e) => {
                            const nextStatus = e.target.value as OpportunityStatus;
                            if (!nextStatus) return;
                            handleBulkStatus(nextStatus);
                            e.target.value = "";
                          }}
                          className={`px-2 py-1 rounded border text-[10.5px] font-mono cursor-pointer focus:outline-none ${theme.bgInput}`}
                        >
                          <option value="">Move Status...</option>
                          <option value="NEW">NEW</option>
                          <option value="APPLIED">APPLIED</option>
                          <option value="ASSESSMENT_PENDING">ASSESSMENT</option>
                          <option value="INTERVIEWING">INTERVIEWING</option>
                          <option value="OFFER">OFFER</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="DORMANT">DORMANT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>

                        <select
                          onChange={(e) => {
                            const nextTier = e.target.value as OpportunityTier;
                            if (!nextTier) return;
                            handleBulkTier(nextTier);
                            e.target.value = "";
                          }}
                          className={`px-2 py-1 rounded border text-[10.5px] font-mono cursor-pointer focus:outline-none ${theme.bgInput}`}
                        >
                          <option value="">Shift Tier...</option>
                          <option value="T1">T1 (Execution)</option>
                          <option value="T2">T2 (Specialist)</option>
                          <option value="T3">T3 (Systems)</option>
                        </select>

                        <select
                          onChange={(e) => {
                            const nextPriority = e.target.value as Priority;
                            if (!nextPriority) return;
                            handleBulkPriority(nextPriority);
                            e.target.value = "";
                          }}
                          className={`px-2 py-1 rounded border text-[10.5px] font-mono cursor-pointer focus:outline-none ${theme.bgInput}`}
                        >
                          <option value="">Set Priority...</option>
                          <option value="P0">P0 (Critical)</option>
                          <option value="P1">P1 (Medium)</option>
                          <option value="P2">P2 (Low)</option>
                        </select>

                        <button
                          onClick={handleCopyMarkdown}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10.5px] font-bold font-sans transition flex items-center gap-1.5 cursor-pointer"
                          title="Generate and copy a Markdown table of all selected leads"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy MD
                        </button>

                        <button
                          onClick={handleBulkDelete}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10.5px] font-bold font-sans transition flex items-center gap-1 cursor-pointer"
                        >
                          Delete Selected
                        </button>

                        <button
                          onClick={() => setSelectedRowIds([])}
                          className="px-1.5 py-1 hover:underline text-[10.5px] font-mono opacity-70 hover:opacity-100 transition whitespace-nowrap cursor-pointer"
                        >
                          Deselect
                        </button>
                      </div>
                    </div>
                  </div>
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
                    onUpdateOpportunity={updateOpportunity}
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

      {/* Keyboard Shortcuts Guide Overlay */}
      <AnimatePresence>
        {isShortcutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => setIsShortcutModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`w-full max-w-xl rounded-xl border p-6 shadow-2xl overflow-hidden relative ${
                isDark ? "bg-[#202020] border-slate-800 text-slate-100" : "bg-white border-neutral-200 text-neutral-800"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsShortcutModalOpen(false)}
                className={`absolute right-4 top-4 p-1 rounded-full transition ${
                  isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Keyboard className={`w-5 h-5 ${isDark ? "text-sky-400" : "text-blue-600"}`} />
                <h3 className="text-xs font-black uppercase tracking-wider font-mono">
                  Pro Operator Hotkey Console
                </h3>
              </div>

              <p className={`text-xs ${theme.textSecondary} mb-6 leading-relaxed`}>
                ScaleSmart Operations Suite supports quick typing driving workflows to allow rapid response, zero-mouse database triage, and quick view toggles. Use the shortcuts below directly from the interface:
              </p>

              <div className="space-y-6">
                {/* Section 1 */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-widest border-b pb-1 border-sky-500/10 dark:border-sky-500/20">
                    📡 View Navigation & Structure
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Spreadsheet List Cockpit</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">C</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Signal Radar Queue</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">R</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Toggle Left Control Hub</span>
                      <div className="flex gap-1 items-center">
                        <kbd className="px-1 py-0.5 text-[9px] font-mono leading-none rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">Ctrl</kbd>
                        <span className="opacity-40 text-[9px]">+</span>
                        <kbd className="px-1 py-0.5 text-[9px] font-mono leading-none rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">\</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Toggle Details Sidebar</span>
                      <div className="flex gap-1 items-center">
                        <kbd className="px-1 py-0.5 text-[9px] font-mono leading-none rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">Ctrl</kbd>
                        <span className="opacity-40 text-[9px]">+</span>
                        <kbd className="px-1 py-0.5 text-[9px] font-mono leading-none rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">[ / ]</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest border-b pb-1 border-amber-500/10 dark:border-amber-500/20">
                    🚦 Cockpit Partition Filters
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Show All Targets</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">1</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Show Active Pipeline</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">2</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Show Active Loops</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">3</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Show Alerts Pending</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">4</kbd>
                    </div>
                    <div className="flex items-center justify-between sm:col-span-2">
                      <span className={`${theme.textSecondary}`}>Show Dormant/Archives</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">5</kbd>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest border-b pb-1 border-emerald-500/10 dark:border-emerald-500/20">
                    📊 Spreadsheet Keyboard Driving (Cockpit)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Highlight previous / next row</span>
                      <div className="flex gap-1 font-sans">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">↑</kbd>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">↓</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.textSecondary}`}>Inspect & open focused row</span>
                      <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-neutral-100 border-neutral-300 dark:bg-slate-800 dark:border-slate-700 select-none">Enter</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-dashed border-slate-500/15 flex justify-between items-center text-[10px] font-mono opacity-60">
                <span>Press <span className="font-bold">?</span> or <span className="font-bold">Esc</span> to close</span>
                <span>SYSTEM VERSION 1.0</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Floating Notification Toast System (Modular Overlay) */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
        isDark={isDark}
      />
    </div>
  );
}
