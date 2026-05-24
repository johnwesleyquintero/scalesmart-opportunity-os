import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "../types";
import { 
  Pencil, PanelRightClose, AlertTriangle, ExternalLink, FileText, 
  Copy, Check, ChevronDown, ChevronUp, PlusCircle, History, Trash2, Gauge 
} from "lucide-react";
import { getRiskOfOpportunity } from "../utils";

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

  // Scorecard evaluation metrics (1-5 range)
  const [sop, setSop] = useState(3);
  const [automation, setAutomation] = useState(3);
  const [compensation, setCompensation] = useState(3);
  const [urgency, setUrgency] = useState(3);

  // Sync state when active opportunity changes
  useEffect(() => {
    if (selectedOpp) {
      setSop(selectedOpp.sopScore ?? 3);
      setAutomation(selectedOpp.automationScore ?? 3);
      setCompensation(selectedOpp.compensationScore ?? 3);
      setUrgency(selectedOpp.urgencyScore ?? 3);
      setLogInput("");
    }
  }, [selectedOpp]);

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
      lastActivityDate: "2026-05-24"
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
      lastActivityDate: "2026-05-24"
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
      lastActivityDate: "2026-05-24"
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
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Status Transition</label>
          <select
            value={selectedOpp.status}
            onChange={(e) => onUpdateStatus(selectedOpp, e.target.value as OpportunityStatus)}
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

          {/* Quick Trigger Progress Pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedOpp.status !== "APPLIED" && selectedOpp.status !== "ASSESSMENT_PENDING" && selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "APPLIED")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-80 border-slate-750" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                → Applied
              </button>
            )}
            {selectedOpp.status !== "ASSESSMENT_PENDING" && selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "ASSESSMENT_PENDING")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-80 border-slate-755" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-955"
                }`}
              >
                → Test
              </button>
            )}
            {selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "INTERVIEWING")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-80 border-slate-755" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-955"
                }`}
              >
                → Loop
              </button>
            )}
            {selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "OFFER")}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-505 transition shrink-0"
              >
                ✨ Offered
              </button>
            )}
            {selectedOpp.status !== "REJECTED" && selectedOpp.status !== "DORMANT" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "REJECTED")}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-rose-500/10 text-rose-455 bg-rose-500/5 hover:bg-rose-500/10 transition hover:text-rose-355 shrink-0"
              >
                ✕ Reject
              </button>
            )}
            {selectedOpp.status !== "DORMANT" && selectedOpp.status !== "REJECTED" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "DORMANT")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-80 border-slate-755" : "bg-white border-[#eae9e6] text-neutral-650 hover:bg-neutral-50 hover:text-neutral-955"
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
              <option value="T1" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🟢 T1 — Execution</option>
              <option value="T2" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🟡 T2 — Specialist</option>
              <option value="T3" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🔴 T3 — Systems</option>
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

            <p className={`text-[10px] mt-2 mb-3 leading-relaxed ${theme.textSecondary}`}>
              Weighted: 25% SOP manual clarity, 25% Automation potential, 30% Compensation structure, 20% Urgency.
            </p>

            <button
              onClick={() => setIsScorecardOpen(!isScorecardOpen)}
              className={`w-full py-1 px-2 rounded font-mono text-[10px] border flex items-center justify-center gap-1 transition ${
                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-850" : "bg-white border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span>{isScorecardOpen ? "Hide Triage Matrix Weights" : "Tweak Matrix Weights"}</span>
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

        {/* Global static notes */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Notes </label>
          <div className={`p-3 rounded leading-relaxed whitespace-pre-wrap text-xs max-h-48 overflow-y-auto border ${isDark ? "bg-[#252525] text-slate-300 border-[#2c2c2c]" : "bg-white text-[#37352f] border-[#eae9e6] shadow-xs"}`}>
            {selectedOpp.notes || "No outbound notes configured."}
          </div>
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
