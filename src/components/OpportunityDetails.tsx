import React, { useState } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "../types";
import { Pencil, PanelRightClose, AlertTriangle, ExternalLink, FileText, Copy, Check } from "lucide-react";
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
}


export default function OpportunityDetails({
  selectedOpp,
  isDark,
  theme,
  onClose,
  onEdit,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateTier
}: OpportunityDetailsProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="space-y-5" id="detail-card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#37352f]"} tracking-tight`}>{selectedOpp.companyName}</h3>
          <p className={`text-xs ${theme.textSecondary} font-medium`}>{selectedOpp.roleTitle}</p>
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
                  isDark ? "bg-slate-900 border-slate-800 text-slate-355 hover:text-white hover:bg-slate-80 border-slate-755" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-955"
                }`}
              >
                → Test
              </button>
            )}
            {selectedOpp.status !== "INTERVIEWING" && selectedOpp.status !== "OFFER" && (
              <button
                onClick={() => onUpdateStatus(selectedOpp, "INTERVIEWING")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-355 hover:text-white hover:bg-slate-80 border-slate-755" : "bg-white border-[#eae9e6] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-955"
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
                  isDark ? "bg-slate-900 border-slate-800 text-slate-355 hover:text-white hover:bg-slate-80 border-slate-755" : "bg-white border-[#eae9e6] text-neutral-650 hover:bg-neutral-50 hover:text-neutral-955"
                }`}
              >
                💤 Dormant
              </button>
            )}
          </div>
        </div>

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
              <option value="T1" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🟢 T1 — Execution / VA</option>
              <option value="T2" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🟡 T2 — Operations / Specialist</option>
              <option value="T3" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>🔴 T3 — Systems / Architect</option>
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
  );
}
