import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "../types";
import { 
  Pencil, PanelRightClose, AlertTriangle, ExternalLink, FileText, 
  Copy, Check, ChevronDown, ChevronUp, PlusCircle, History, Trash2, Gauge,
  Save, Eye
} from "lucide-react";
import { getRiskOfOpportunity, getTodayString } from "../utils";

// Pristine Inline Markdown Parsed Stream Render Engine
function parseInlineElements(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    const boldStartIdx = currentText.indexOf("**");
    const codeStartIdx = currentText.indexOf("`");

    if (boldStartIdx === -1 && codeStartIdx === -1) {
      parts.push(<span key={keyIdx++}>{currentText}</span>);
      break;
    }

    // Bold occurs first or code is missing
    if (boldStartIdx !== -1 && (codeStartIdx === -1 || boldStartIdx < codeStartIdx)) {
      if (boldStartIdx > 0) {
        parts.push(<span key={keyIdx++}>{currentText.substring(0, boldStartIdx)}</span>);
      }
      const boldEndIdx = currentText.indexOf("**", boldStartIdx + 2);
      if (boldEndIdx !== -1) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-sky-500 dark:text-cyan-400">
            {currentText.substring(boldStartIdx + 2, boldEndIdx)}
          </strong>
        );
        currentText = currentText.substring(boldEndIdx + 2);
      } else {
        parts.push(<span key={keyIdx++}>**</span>);
        currentText = currentText.substring(boldStartIdx + 2);
      }
    } 
    // Monospace code occurs first
    else {
      if (codeStartIdx > 0) {
        parts.push(<span key={keyIdx++}>{currentText.substring(0, codeStartIdx)}</span>);
      }
      const codeEndIdx = currentText.indexOf("`", codeStartIdx + 1);
      if (codeEndIdx !== -1) {
        parts.push(
          <code key={keyIdx++} className="px-1 py-0.5 rounded font-mono text-[10px] bg-indigo-500/10 text-indigo-500 dark:text-cyan-300 dark:bg-[#1a1a1a] border border-indigo-550/10 dark:border-cyan-550/10">
            {currentText.substring(codeStartIdx + 1, codeEndIdx)}
          </code>
        );
        currentText = currentText.substring(codeEndIdx + 1);
      } else {
        parts.push(<span key={keyIdx++}>`</span>);
        currentText = currentText.substring(codeStartIdx + 1);
      }
    }
  }

  return <>{parts}</>;
}

function renderMarkdown(text: string, isDark: boolean): React.ReactNode[] {
  if (!text || !text.trim()) {
    return [<p key="empty" className="italic opacity-60 text-[11px]">No notes configured. Select "Edit Notes" to write clean Markdown checklists or SOP details!</p>];
  }

  const lines = text.split("\n");
  
  return lines.map((line, idx) => {
    // 1. Triple header check
    if (line.startsWith("### ")) {
      return (
        <h5 key={idx} className="font-sans font-bold text-[11px] mt-2 mb-1 text-sky-500 dark:text-cyan-400">
          {parseInlineElements(line.slice(4))}
        </h5>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h4 key={idx} className={`font-sans font-bold text-xs mt-3 mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
          {parseInlineElements(line.slice(3))}
        </h4>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h3 key={idx} className={`font-sans font-bold text-sm mt-3.5 mb-1.5 pb-0.5 border-b ${isDark ? "border-slate-800 text-white" : "border-neutral-200 text-neutral-900"}`}>
          {parseInlineElements(line.slice(2))}
        </h3>
      );
    }

    // 2. Checklist checks
    if (line.startsWith("- [ ] ") || line.startsWith("* [ ] ")) {
      return (
        <div key={idx} className="flex items-center gap-2 my-1 text-slate-400 dark:text-slate-400">
          <span className={`w-3.5 h-3.5 rounded border ${isDark ? "border-slate-700 bg-slate-900" : "border-neutral-300 bg-white"} flex-shrink-0`} />
          <span className="font-sans text-xs">{parseInlineElements(line.slice(6))}</span>
        </div>
      );
    }
    if (line.startsWith("- [x] ") || line.startsWith("* [x] ") || line.startsWith("- [X] ") || line.startsWith("* [X] ")) {
      return (
        <div key={idx} className="flex items-center gap-2 my-1 text-slate-500 line-through">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 flex items-center justify-center flex-shrink-0 text-white">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="font-sans text-xs opacity-75">{parseInlineElements(line.slice(6))}</span>
        </div>
      );
    }

    // 3. Bullets check
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={idx} className="flex gap-2 items-start my-1 pl-1">
          <span className={`w-1 h-1 rounded-full ${isDark ? "bg-cyan-400" : "bg-blue-600"} shrink-0 mt-1.5`} />
          <span className="font-sans text-xs flex-1">{parseInlineElements(line.slice(2))}</span>
        </div>
      );
    }

    // 4. Numbers check
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="flex gap-2 items-start my-1 pl-1">
          <span className="font-mono text-[10.5px] font-bold text-sky-400 shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span className="font-sans text-xs flex-1">{parseInlineElements(numMatch[2])}</span>
        </div>
      );
    }

    // 5. Blockquote check
    if (line.startsWith("> ")) {
      return (
        <blockquote key={idx} className={`pl-2.5 border-l-2 py-0.5 my-1.5 italic ${isDark ? "border-slate-800 text-slate-400 bg-slate-900/40" : "border-neutral-300 bg-neutral-50 text-neutral-600"}`}>
          {parseInlineElements(line.slice(2))}
        </blockquote>
      );
    }

    // 6. Horizontal grid
    if (line === "---" || line === "***") {
      return <hr key={idx} className={`my-3 border-t ${isDark ? "border-slate-800" : "border-neutral-200"}`} />;
    }

    // Blank rows
    if (line.trim() === "") {
      return <div key={idx} className="h-1.5" />;
    }

    return (
      <p key={idx} className="font-sans text-xs leading-relaxed my-0.5 min-h-[0.75rem]">
        {parseInlineElements(line)}
      </p>
    );
  });
}

interface OpportunityDetailsProps {
  selectedOpp: Opportunity | null;
  isDark: boolean;
  theme: any;
  onClose: () => void;
  onEdit: (opp: Opportunity) => void;
  onUpdateStatus: (opp: Opportunity, status: OpportunityStatus) => void;
  onUpdatePriority: (opp: Opportunity, priority: Priority) => void;
  onUpdateTier: (opp: Opportunity, tier: OpportunityTier) => void;
  onUpdateOpportunity?: (opp: Opportunity) => void;
}

export default function OpportunityDetails({
  selectedOpp,
  isDark,
  theme,
  onClose,
  onEdit,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateTier,
  onUpdateOpportunity
}: OpportunityDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [logInput, setLogInput] = useState("");
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);

  // Notes inline markdown tab state
  const [editedNotes, setEditedNotes] = useState("");
  const [notesTab, setNotesTab] = useState<"preview" | "edit">("preview");
  const [isCopiedNotes, setIsCopiedNotes] = useState(false);

  // Scorecard evaluation metrics (1-5 range)
  const [sop, setSop] = useState(3);
  const [automation, setAutomation] = useState(3);
  const [compensation, setCompensation] = useState(3);
  const [urgency, setUrgency] = useState(3);

  // Custom status editing states
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState("");

  // Sync state when active opportunity changes
  useEffect(() => {
    if (selectedOpp) {
      setSop(selectedOpp.sopScore ?? 3);
      setAutomation(selectedOpp.automationScore ?? 3);
      setCompensation(selectedOpp.compensationScore ?? 3);
      setUrgency(selectedOpp.urgencyScore ?? 3);
      setLogInput("");
      setEditedNotes(selectedOpp.notes || "");
      setNotesTab("preview");
      setCustomStatusInput(selectedOpp.status || "");
      setIsCustomEditing(false);
    }
  }, [selectedOpp]);

  const handleCopyNotes = async () => {
    if (!editedNotes) return;
    try {
      await navigator.clipboard.writeText(editedNotes);
      setIsCopiedNotes(true);
      setTimeout(() => setIsCopiedNotes(false), 2000);
    } catch (err) {
      console.error("Failed to copy notes: ", err);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedOpp || !onUpdateOpportunity) return;
    const updatedOpp: Opportunity = {
      ...selectedOpp,
      notes: editedNotes,
      lastActivityDate: getTodayString()
    };
    onUpdateOpportunity(updatedOpp);
    setNotesTab("preview");
  };

  const handleCopyLink = async () => {
    if (!selectedOpp?.link) return;
    try {
      await navigator.clipboard.writeText(selectedOpp.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSaveScorecard = () => {
    if (!selectedOpp || !onUpdateOpportunity) return;
    // Calculate 25% SOP, 25% Automation, 30% Comp, 20% Urgency (max score 100)
    const computedScore = Math.round(((sop * 0.25) + (automation * 0.25) + (compensation * 0.3) + (urgency * 0.2)) * 20);
    
    const updated: Opportunity = {
      ...selectedOpp,
      score: computedScore,
      sopScore: sop,
      automationScore: automation,
      compensationScore: compensation,
      urgencyScore: urgency,
      lastActivityDate: getTodayString()
    };
    onUpdateOpportunity(updated);
    setIsScorecardOpen(false);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim() || !selectedOpp || !onUpdateOpportunity) return;

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      text: logInput.trim()
    };

    const updatedLogs = [newLog, ...(selectedOpp.logs || [])];
    const updatedOpp: Opportunity = {
      ...selectedOpp,
      logs: updatedLogs,
      lastActivityDate: getTodayString()
    };

    onUpdateOpportunity(updatedOpp);
    setLogInput("");
  };

  const handleDeleteLog = (logId: string) => {
    if (!selectedOpp || !onUpdateOpportunity) return;
    const updatedLogs = (selectedOpp.logs || []).filter((log) => log.id !== logId);
    const updatedOpp: Opportunity = {
      ...selectedOpp,
      logs: updatedLogs,
      lastActivityDate: getTodayString()
    };
    onUpdateOpportunity(updatedOpp);
  };

  if (!selectedOpp) {
    return (
      <div className={`h-full flex flex-col items-center justify-center ${theme.textSecondary} text-center py-12 relative`}>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 p-1.5 rounded transition ${isDark ? "hover:bg-slate-850 text-slate-400 hover:text-white" : "hover:bg-[#f1f1ef] text-[#787774] hover:text-[#37352f]"}`}
          title="Collapse inspector"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
        <FileText className={`w-8 h-8 mb-2 ${isDark ? "text-slate-700" : "text-slate-300"} animate-pulse`} />
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-[#37352f]"}`}>No ledger opportunity is selected</p>
        <p className="text-xs mt-1">Click any row in the spreadsheet list to view metadata details</p>
      </div>
    );
  }

  const risk = getRiskOfOpportunity(selectedOpp);

  // Color mappings for score gauge
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
  };

  return (
    <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 scrollbar-thin" id="detail-card">
      <div className="flex justify-between items-start">
        <div className="min-w-0 pr-2">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#37352f]"} tracking-tight truncate`}>{selectedOpp.companyName}</h3>
          <p className={`text-xs ${theme.textSecondary} font-medium truncate`}>{selectedOpp.roleTitle}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(selectedOpp)}
            className={`p-1 px-2 text-[11px] rounded flex items-center gap-1 transition-all border ${theme.bgButtonSec}`}
          >
            <Pencil className="w-2.5 h-2.5" /> Edit
          </button>
          <button
            onClick={onClose}
            className={`p-1 rounded transition ${isDark ? "hover:bg-slate-880 text-slate-400 hover:text-white" : "hover:bg-[#f1f1ef] text-[#787774] hover:text-[#37352f]"}`}
            title="Collapse details panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {risk.type !== "none" && (
        <div className={`p-3.5 rounded-xl border flex gap-3 items-start text-xs leading-normal ${
          risk.type === "deadline_missed" 
            ? (isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-800")
            : (isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800")
        }`}>
          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
            risk.type === "deadline_missed" ? "text-rose-400" : "text-amber-500"
          }`} />
          <div>
            <span className="font-mono font-bold uppercase text-[10px] tracking-wide block">Attention Checkpoint Required</span>
            <p className="mt-0.5 text-[11px] leading-relaxed font-sans">{risk.message}</p>
          </div>
        </div>
      )}

      <div className={`space-y-4 border-t ${theme.border} pt-4 text-xs`}>
        {/* Status selection */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Status Transition</label>
            <button
              onClick={() => setIsCustomEditing(!isCustomEditing)}
              className="text-[10px] font-mono text-blue-500 hover:text-blue-600 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              ⌨️ {isCustomEditing ? "Use Dropdown" : "Custom Status..."}
            </button>
          </div>

          {isCustomEditing ? (
            <div className="flex gap-1.5 items-center mt-1">
              <input
                type="text"
                placeholder="Type status (e.g. SCHEDULED INTERVIEW)"
                value={customStatusInput}
                onChange={(e) => setCustomStatusInput(e.target.value)}
                className={`flex-1 text-xs px-2.5 py-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono ${theme.bgInput}`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (customStatusInput.trim()) {
                      onUpdateStatus(selectedOpp, customStatusInput.trim().toUpperCase());
                      setIsCustomEditing(false);
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customStatusInput.trim()) {
                    onUpdateStatus(selectedOpp, customStatusInput.trim().toUpperCase());
                    setIsCustomEditing(false);
                  }
                }}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono font-bold text-[10px] transition cursor-pointer"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setIsCustomEditing(false)}
                className={`px-2 py-1.5 rounded text-[10px] font-mono border transition ${theme.bgButtonSec}`}
              >
                ✕
              </button>
            </div>
          ) : (
            <select
              value={selectedOpp.status}
              onChange={(e) => {
                onUpdateStatus(selectedOpp, e.target.value as OpportunityStatus);
                setCustomStatusInput(e.target.value);
              }}
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
              {![
                "NEW", "APPLIED", "ASSESSMENT_PENDING", "INTERVIEWING", "OFFER", "REJECTED", "DORMANT", "ARCHIVED"
              ].includes(selectedOpp.status) && (
                <option value={selectedOpp.status} className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                  ➡️ {selectedOpp.status} (CUSTOM)
                </option>
              )}
            </select>
          )}

          {/* Quick Trigger Progress Pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedOpp.status !== "APPLIED" && selectedOpp.status !== "ASSESSMENT_PENDING" && selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "APPLIED")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                → Applied
              </button>
            )}
            {selectedOpp.status !== "ASSESSMENT_PENDING" && selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "ASSESSMENT_PENDING")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                → Test
              </button>
            )}
            {selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "INTERVIEWING")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                → Loop
              </button>
            )}
            {selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "OFFER")}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 transition shrink-0"
              >
                ✨ Offered
              </button>
            )}
            {selectedOpp.status !== "REJECTED" && selectedOpp.status !== "DORMANT" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "REJECTED")}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-rose-500/15 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition hover:text-rose-400 shrink-0"
              >
                ✕ Reject
              </button>
            )}
            {selectedOpp.status !== "DORMANT" && selectedOpp.status !== "REJECTED" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "DORMANT")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800" : "bg-white border-[#eae9e6] text-[#6b6b6b] hover:bg-[#fafafa] hover:text-[#111111]"
                }`}
              >
                💤 Dormant
              </button>
            )}
          </div>
        </div>

        {/* Priority & Tier selection */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <div>
            <label className={`text-[10px] uppercase tracking-wider ${theme.textSecondary} font-mono block mb-1`}>Priority</label>
            <select
              value={selectedOpp.priority}
              onChange={(e) => onUpdatePriority(selectedOpp, e.target.value as Priority)}
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
              onChange={(e) => onUpdateTier(selectedOpp, e.target.value as OpportunityTier)}
              className={`w-full border rounded p-2 focus:outline-none cursor-pointer ${theme.bgInput}`}
            >
              <option value="T1" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🔴 T1 — Systems</option>
              <option value="T2" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🟡 T2 — Specialist</option>
              <option value="T3" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🟢 T3 — Execution</option>
            </select>
          </div>
        </div>

        {/* Dynamic WesBI Strategic Priority Calculator (Scorecard) */}
        {onUpdateOpportunity && (
          <div className={`p-4 rounded-xl border ${isDark ? "bg-[#1f1f1f] border-slate-800" : "bg-[#f9f9f8] border-neutral-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gauge className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-blue-500"}`} />
                <span className="font-mono font-bold text-[10px] uppercase tracking-wider">Evaluation Scorecard</span>
              </div>
              <div className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1 ${getScoreColor(selectedOpp.score ?? 0)}`}>
                <span>Score:</span>
                <span>{selectedOpp.score ?? "Unrated"}</span>
              </div>
            </div>

            <p className={`text-[10px] mt-2 mb-2 leading-relaxed ${theme.textSecondary}`}>
              Weighted: 25% SOP manual clarity, 25% Automation potential, 30% Compensation structure, 20% Urgency.
            </p>

            {/* Always-visible visual scorecard breakdown progress meters */}
            <div 
              onClick={() => { if (!isScorecardOpen) setIsScorecardOpen(true); }}
              className={`space-y-2 mt-2 mb-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? "bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/70" 
                  : "bg-neutral-100/30 border-neutral-200 hover:bg-v-50/10 hover:bg-slate-100/60"
              }`}
              title="Click to tweak matrix weights directly"
            >
              {/* SOP Progress Bar */}
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                  <span className="font-bold flex items-center gap-1">🛠️ SOP ALIGNMENT</span>
                  <span className="font-bold text-sky-400">{sop}/5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-450 dark:bg-sky-400 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(sop / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Automation Progress Bar */}
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                  <span className="font-bold flex items-center gap-1">⚡ AUTOMATION COMPAT</span>
                  <span className="font-bold text-amber-500 dark:text-amber-400">{automation}/5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 dark:bg-amber-400 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(automation / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Compensation Progress Bar */}
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                  <span className="font-bold flex items-center gap-1">💰 FINANCIAL COMP TIER</span>
                  <span className="font-bold text-emerald-500 dark:text-emerald-400">{compensation}/5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(compensation / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Urgency Progress Bar */}
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                  <span className="font-bold flex items-center gap-1">🎯 OUTREACH URGENCY</span>
                  <span className="font-bold text-rose-500 dark:text-rose-450">{urgency}/5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 dark:bg-rose-450 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(urgency / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsScorecardOpen(!isScorecardOpen)}
              className={`w-full py-1 px-2 rounded font-mono text-[10px] border flex items-center justify-center gap-1 transition ${
                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-850" : "bg-white border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span>{isScorecardOpen ? "Hide Interactive Sliders" : "Slide & Adjust Priorities"}</span>
              {isScorecardOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isScorecardOpen && (
              <div className="space-y-3 pt-3 mt-3 border-t border-dashed border-slate-800 dark:border-slate-800">
                {/* SOP Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[10.5px]">SOP Clarity (25% weight)</span>
                    <span className="font-mono text-cyan-400 font-bold">{sop}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sop}
                    onChange={(e) => setSop(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className={`text-[8.5px] block font-mono mt-0.5 ${theme.textSecondary}`}>
                    {sop === 1 && "No SOP (Full manual discovery required)"}
                    {sop === 2 && "Vague list (Informal verbal guidelines)"}
                    {sop === 3 && "WIP SOP (Basic checklist, some gaps)"}
                    {sop === 4 && "Strong SOP (Comprehensive text & flow)"}
                    {sop === 5 && "Golden SOP (Zero doubt, videos & templates)"}
                  </span>
                </div>

                {/* Automation Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[10.5px]">Apps Script Readiness (25% weight)</span>
                    <span className="font-mono text-cyan-400 font-bold">{automation}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={automation}
                    onChange={(e) => setAutomation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className={`text-[8.5px] block font-mono mt-0.5 ${theme.textSecondary}`}>
                    {automation === 1 && "Complete manual labor (No API / Google hooks)"}
                    {automation === 2 && "Partially scriptable (Needs manual trigger)"}
                    {automation === 3 && "Scriptable triggers (CSV triggers readably)"}
                    {automation === 4 && "Automated sync (Highly webhook-ready)"}
                    {automation === 5 && "Self-Healing (Full automation flow deployed)"}
                  </span>
                </div>

                {/* Compensation Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[10.5px]">Comp Tier Value (30% weight)</span>
                    <span className="font-mono text-cyan-400 font-bold">{compensation}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={compensation}
                    onChange={(e) => setCompensation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className={`text-[8.5px] block font-mono mt-0.5 ${theme.textSecondary}`}>
                    {compensation === 1 && "Basic entry rate ($5-$10/hr execution)"}
                    {compensation === 2 && "Specialist rate ($10-$18/hr, PPC execution)"}
                    {compensation === 3 && "Premium service ($18-$25/hr specialist)"}
                    {compensation === 4 && "High level ($25-$40/hr systems engineering)"}
                    {compensation === 5 && "Absolute premium / Consulting ($45+/hr)"}
                  </span>
                </div>

                {/* Urgency Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[10.5px]">Outreach Urgency (20% weight)</span>
                    <span className="font-mono text-cyan-400 font-bold">{urgency}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className={`text-[8.5px] block font-mono mt-0.5 ${theme.textSecondary}`}>
                    {urgency === 1 && "Passive (No current active deadline)"}
                    {urgency === 2 && "Follow up sequence target (1-2 weeks)"}
                    {urgency === 3 && "Standard application process review"}
                    {urgency === 4 && "Active communication (Direct loops ongoing)"}
                    {urgency === 5 && "Immediate (Urgent challenge/offer deadline!)"}
                  </span>
                </div>

                {/* Live Preview Box */}
                {(() => {
                  const liveScore = Math.round(((sop * 0.25) + (automation * 0.25) + (compensation * 0.3) + (urgency * 0.2)) * 20);
                  const isModified = liveScore !== (selectedOpp.score ?? 0);
                  return (
                    <div className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                      isDark ? "bg-[#151515] border-slate-800" : "bg-neutral-100/50 border-neutral-200"
                    }`}>
                      <span className="text-slate-500 dark:text-slate-400">Live Computed Score:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isDark ? "text-cyan-400" : "text-blue-650"}`}>
                          {liveScore} / 100
                        </span>
                        {isModified && (
                          <span className="text-[8px] px-1 py-0.2 bg-amber-500/10 text-amber-550 dark:text-amber-400 border border-amber-550/20 dark:border-amber-500/20 rounded font-bold uppercase tracking-wider animate-pulse">
                            MODIFIED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handleSaveScorecard}
                  className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-505 text-white rounded font-bold font-sans text-xs transition shadow-sm cursor-pointer"
                >
                  Recalculate & Save Score
                </button>
              </div>
            )}
          </div>
        )}

        {/* Source & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Source origin</label>
            <span className={`block p-2 rounded text-xs font-mono truncate ${isDark ? "bg-[#252525] text-slate-300" : "bg-[#f1f1ef] text-[#37352f]"}`}>{selectedOpp.source}</span>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Category</label>
            <span className={`block p-2 rounded text-xs truncate ${isDark ? "bg-[#252525] text-slate-300" : "bg-[#f1f1ef] text-[#37352f] border border-[#eae9e6]/60"}`}>{selectedOpp.category || "Operations"}</span>
          </div>
        </div>

        {/* External URL Link */}
        {selectedOpp.link && (
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Target Action Link / Email</label>
            <div className="flex gap-1.5 items-center">
              <a
                href={selectedOpp.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-between text-blue-500 hover:underline hover:text-blue-650 p-2 rounded text-xs min-w-0 ${isDark ? "bg-[#252525]" : "bg-[#f1f1ef]"}`}
              >
                <span className="truncate font-mono mr-2">{selectedOpp.link}</span> <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                onClick={handleCopyLink}
                title="Copy link to clipboard"
                className={`p-2 rounded border transition-all flex items-center justify-center shrink-0 ${
                  copied 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400" 
                    : isDark 
                      ? "bg-[#252525] border-slate-800 text-slate-400 hover:text-slate-200" 
                      : "bg-[#f1f1ef] border-[#eae9e6] text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Applied Dates */}
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

        {/* Interactive Markdown Notes block */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Strategic Notes (Markdown)</span>
            
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#181818] p-0.5 rounded-md border border-neutral-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setNotesTab("preview")}
                className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 font-medium transition cursor-pointer ${
                  notesTab === "preview"
                    ? "bg-white dark:bg-slate-800 text-blue-500 dark:text-cyan-400 shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Eye className="w-2.5 h-2.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setNotesTab("edit")}
                className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 font-medium transition cursor-pointer ${
                  notesTab === "edit"
                    ? "bg-white dark:bg-slate-800 text-blue-500 dark:text-cyan-400 shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Write</span>
              </button>
            </div>
          </div>

          {notesTab === "preview" ? (
            <div className="group/markdown relative">
              <div className={`p-3.5 rounded-lg leading-relaxed text-xs max-h-56 overflow-y-auto border space-y-1.5 ${
                isDark 
                  ? "bg-[#181818] text-slate-350 border-slate-800/80" 
                  : "bg-white text-neutral-800 border-neutral-200 shadow-inner"
              }`}>
                {renderMarkdown(selectedOpp.notes || "", isDark)}
              </div>
              
              {selectedOpp.notes && (
                <div className="absolute right-2.5 top-2.5 opacity-0 group-hover/markdown:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleCopyNotes}
                    className={`p-1 rounded text-[10px] font-mono border transition flex items-center gap-1 ${
                      isCopiedNotes
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : isDark
                          ? "bg-[#252525] border-slate-700 text-slate-400 hover:text-white"
                          : "bg-white border-neutral-250 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                    }`}
                    title="Copy raw markdown to clipboard"
                  >
                    {isCopiedNotes ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{isCopiedNotes ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 border rounded-lg p-2.5 bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-slate-800">
              {/* Cheat sheet/helpers toolbar */}
              <div className="flex items-center flex-wrap gap-1 pb-1.5 border-b border-neutral-200 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setEditedNotes(prev => prev + (prev.endsWith("\n") || prev.length === 0 ? "" : "\n") + "# ")}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono hover:bg-neutral-200 dark:hover:bg-slate-800 text-neutral-600 dark:text-slate-400 border border-neutral-200 dark:border-slate-800 transition cursor-pointer"
                  title="Insert Main Header"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => setEditedNotes(prev => prev + (prev.endsWith("\n") || prev.length === 0 ? "" : "\n") + "## ")}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono hover:bg-neutral-200 dark:hover:bg-slate-800 text-neutral-600 dark:text-slate-400 border border-neutral-200 dark:border-slate-800 transition cursor-pointer"
                  title="Insert Section Header"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => setEditedNotes(prev => prev + "**Bold**")}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono hover:bg-neutral-200 dark:hover:bg-slate-800 text-neutral-600 dark:text-slate-400 border border-neutral-200 dark:border-slate-800 transition font-bold cursor-pointer"
                  title="Insert Bold Text"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setEditedNotes(prev => prev + (prev.endsWith("\n") || prev.length === 0 ? "" : "\n") + "- ")}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono hover:bg-neutral-200 dark:hover:bg-slate-800 text-neutral-600 dark:text-slate-400 border border-neutral-200 dark:border-slate-800 transition cursor-pointer"
                  title="Insert Bullet Point"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => setEditedNotes(prev => prev + (prev.endsWith("\n") || prev.length === 0 ? "" : "\n") + "- [ ] ")}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono hover:bg-neutral-200 dark:hover:bg-slate-800 text-neutral-600 dark:text-slate-400 border border-neutral-200 dark:border-slate-800 transition cursor-pointer"
                  title="Insert Checkbox Task"
                >
                  [ ] Todo
                </button>
              </div>

              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Write structured Markdown notes here...\n\nExample:\n# Key SOP\n- [ ] Research recruiter link\n- [x] Submit online form\n\nUse **bold** or `code` markers."
                rows={5}
                className={`w-full text-xs font-mono p-2 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 leading-normal border resize-y ${theme.bgInput}`}
              />

              <div className="flex justify-end gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditedNotes(selectedOpp.notes || "");
                    setNotesTab("preview");
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded border transition ${
                    isDark ? "bg-[#252525] hover:bg-slate-800 text-slate-400 border-slate-850" : "bg-white hover:bg-neutral-100 text-neutral-600 border-neutral-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-2.5 py-1 text-[10px] font-sans font-bold bg-blue-600 hover:bg-blue-550 text-white rounded shadow-sm hover:shadow transition flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Action Sequence Timeline Log */}
        {onUpdateOpportunity && (
          <div className="pt-4 border-t border-slate-700/10 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5">
              <History className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-blue-500"}`} />
              <span className="font-mono font-bold text-[10px] uppercase tracking-wider">Live Action Sequences</span>
            </div>

            {/* Quick entry log input form */}
            <form onSubmit={handleAddLog} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Log a new task, email, or checklist entry..."
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                className={`flex-1 text-[11px] font-sans px-2.5 py-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-sky-500 ${theme.bgInput}`}
              />
              <button
                type="submit"
                disabled={!logInput.trim()}
                className={`p-1.5 rounded transition flex items-center justify-center cursor-pointer ${
                  logInput.trim()
                    ? "bg-blue-600 hover:bg-blue-550 text-white"
                    : "opacity-40 cursor-not-allowed bg-slate-800 text-slate-500"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </form>

            {/* Interactive chronological logs timeline list */}
            <div className="space-y-4 pt-2 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-700/15 dark:before:bg-slate-800/60">
              {selectedOpp.logs && selectedOpp.logs.length > 0 ? (
                selectedOpp.logs.map((log) => (
                  <div key={log.id} className="flex gap-3 items-start relative text-[11px] group">
                    {/* Bullet marker */}
                    <span className="w-3.5 h-3.5 rounded-full border-2 bg-slate-100 border-indigo-400 group-hover:border-indigo-500 dark:bg-slate-900 shrink-0 mt-0.5 z-10 transition-colors" />
                    
                    {/* Log body */}
                    <div className="flex-1 min-w-0">
                      <span className={`block text-[9px] font-mono font-bold text-slate-500 leading-none`}>{log.date}</span>
                      <p className={`mt-1 pr-4 font-sans font-medium break-words leading-relaxed ${isDark ? "text-slate-300" : "text-neutral-800"}`}>
                        {log.text}
                      </p>
                    </div>

                    {/* Delete entry */}
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-1 rounded transition shrink-0 self-center cursor-pointer"
                      title="De-register this log entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className={`text-center py-4 text-[10.5px] font-mono ${theme.textSecondary}`}>
                  💡 No sequence logged yet. Record your outreach emails or Shopify checklist updates above to sync the record timeline.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
