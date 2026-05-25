import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "../types";
import { SOURCE_OPTIONS, TIER_OPTIONS, STATUS_OPTIONS, PRIORITY_OPTIONS } from "../constants";

interface OpportunityModalProps {
  modalMode: "ADD" | "EDIT" | null;
  oppToEdit: Opportunity | null;
  onClose: () => void;
  onSave: (formData: Omit<Opportunity, "id" | "lastActivityDate"> & { id?: string }) => void;
  isDark: boolean;
  theme: any;
}

export default function OpportunityModal({
  modalMode,
  oppToEdit,
  onClose,
  onSave,
  isDark,
  theme
}: OpportunityModalProps) {
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
  const [isCustomStatus, setIsCustomStatus] = useState(false);

  // Populate form with item details if in edit mode
  useEffect(() => {
    if (modalMode === "EDIT" && oppToEdit) {
      setFormCompany(oppToEdit.companyName || "");
      setFormRole(oppToEdit.roleTitle || "");
      setFormSource(oppToEdit.source || "LinkedIn");
      setFormTier(oppToEdit.tier || "T2");
      setFormCategory(oppToEdit.category || "");
      setFormStatus(oppToEdit.status || "NEW");
      setFormPriority(oppToEdit.priority || "P1");
      setFormLink(oppToEdit.link || "");
      setFormDateApplied(oppToEdit.dateApplied || "");
      setFormNextActionDate(oppToEdit.nextActionDate || "");
      setFormNotes(oppToEdit.notes || "");
      const isCustom = !["NEW", "APPLIED", "ASSESSMENT_PENDING", "INTERVIEWING", "OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(oppToEdit.status || "NEW");
      setIsCustomStatus(isCustom);
    } else {
      // Reset to defaults for addition
      setFormCompany("");
      setFormRole("");
      setFormSource("LinkedIn");
      setFormTier("T2");
      setFormCategory("");
      setFormStatus("NEW");
      setFormPriority("P1");
      setFormLink("");
      setFormDateApplied(new Date().toISOString().split("T")[0]);
      setFormNextActionDate("");
      setFormNotes("");
      setIsCustomStatus(false);
    }
  }, [modalMode, oppToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim()) return;

    onSave({
      id: oppToEdit?.id,
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
      notes: formNotes.trim() || undefined
    });
  };

  return (
    <AnimatePresence>
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${isDark ? "bg-[#202020] border-[#2c2c2c]" : "bg-white border-[#eae9e6]"}`}
          >
            <div className={`px-5 py-4 border-b flex justify-between items-center ${isDark ? "border-slate-850 bg-[#252525]/50" : "border-[#eae9e6] bg-[#f7f7f5]"}`}>
              <h3 className={`text-xs font-bold uppercase font-mono tracking-tight ${isDark ? "text-white" : "text-[#37352f]"}`}>
                {modalMode === "ADD" ? "Create New Opportunity" : "Modify Opportunity details"}
              </h3>
              <button
                onClick={onClose}
                className={`p-1 rounded transition ${isDark ? "hover:bg-slate-850 text-slate-400 hover:text-white" : "hover:bg-neutral-200 text-[#787774] hover:text-black"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
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
                    {SOURCE_OPTIONS.map((src) => (
                      <option key={src} value={src} className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as OpportunityTier)}
                    className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer font-sans ${theme.bgInput}`}
                  >
                    <option value="T1" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                      🟢 T1 — Execution / VA Level
                    </option>
                    <option value="T2" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                      🟡 T2 — Operations / Specialist Level (Default)
                    </option>
                    <option value="T3" className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                      🔴 T3 — Systems / Architect Level
                    </option>
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
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Status</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomStatus(!isCustomStatus)}
                      className="text-[10px] font-mono text-blue-500 hover:text-blue-600 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      {isCustomStatus ? "Use Preset" : "+ Custom Status"}
                    </button>
                  </div>
                  {isCustomStatus ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. SCHEDULED INTERVIEW"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value.toUpperCase())}
                      className={`w-full border rounded p-2.5 focus:outline-none focus:border-blue-500 font-mono ${theme.bgInput}`}
                    />
                  ) : (
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as OpportunityStatus)}
                      className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer font-mono ${theme.bgInput}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                          {opt.value === "ASSESSMENT_PENDING" ? "ASSESSMENT" : opt.label}
                        </option>
                      ))}
                      {![
                        "NEW", "APPLIED", "ASSESSMENT_PENDING", "INTERVIEWING", "OFFER", "REJECTED", "DORMANT", "ARCHIVED"
                      ].includes(formStatus) && (
                        <option value={formStatus} className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                          ➡️ {formStatus} (CUSTOM)
                        </option>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className={`text-xs block mb-1 font-medium ${isDark ? "text-slate-400" : "text-[#787774]"}`}>Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className={`w-full border rounded p-2.5 focus:outline-none cursor-pointer font-mono font-bold ${theme.bgInput}`}
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority} className={isDark ? "bg-[#202020] text-white" : "bg-white text-black"}>
                        {priority}
                      </option>
                    ))}
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
                  onClick={onClose}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
