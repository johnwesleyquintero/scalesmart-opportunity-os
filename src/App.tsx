import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus, OpportunityTier, Priority } from "./types";
import { Plus, X, Pencil, Trash, FileText, Check, AlertTriangle, ExternalLink } from "lucide-react";

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

  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [oppToEdit, setOppToEdit] = useState<Opportunity | null>(null);

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

  // Filter application pipeline
  const filtered = opportunities.filter((opp) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchCompany = opp.companyName.toLowerCase().includes(q);
      const matchRole = opp.roleTitle.toLowerCase().includes(q);
      if (!matchCompany && !matchRole) return false;
    }

    // Filter type
    switch (filter) {
      case "ACTIVE":
        return opp.status !== "REJECTED" && opp.status !== "ARCHIVED" && opp.status !== "DORMANT";
      case "INTERVIEWING":
        return opp.status === "INTERVIEWING";
      case "ACTION_REQUIRED":
        // Assessment Pending or Interviewing + P0 or P1 priority only
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

  // Calculate quick stats totals
  const totalActive = opportunities.filter((opp) => opp.status !== "REJECTED" && opp.status !== "ARCHIVED" && opp.status !== "DORMANT").length;
  const totalInterviewing = opportunities.filter((opp) => opp.status === "INTERVIEWING").length;
  const totalActionRequired = opportunities.filter((opp) =>
    (opp.status === "ASSESSMENT_PENDING" || opp.status === "INTERVIEWING") &&
    (opp.priority === "P0" || opp.priority === "P1")
  ).length;
  const totalDormant = opportunities.filter((opp) => opp.status === "DORMANT").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-slate-800">
      {/* 1. Simple Top Bar */}
      <header className="border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900" id="header">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white font-mono">ScaleSmart Opportunity OS</span>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">MVP Mode</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto" id="controls">
          <input
            type="text"
            placeholder="Search Company or Role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2 rounded flex items-center gap-1.5 shrink-0 transition"
          >
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        </div>
      </header>

      {/* 2. Main Content Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0" id="main-workflow">
        {/* Left Side: Basic Navigation Filters */}
        <aside className="w-full lg:w-64 border-b lg:border-r border-slate-800 bg-slate-900/60 p-4 shrink-0" id="sidebar">
          <h2 className="text-xs font-mono tracking-wider text-slate-500 uppercase font-bold mb-3 px-2">Pipeline Filters</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setFilter("ALL")}
              className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded transition ${
                filter === "ALL" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>All Opportunities</span>
              <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">{opportunities.length}</span>
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded transition ${
                filter === "ACTIVE" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Pipeline
              </span>
              <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">{totalActive}</span>
            </button>
            <button
              onClick={() => setFilter("INTERVIEWING")}
              className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded transition ${
                filter === "INTERVIEWING" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Interviewing
              </span>
              <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">{totalInterviewing}</span>
            </button>
            <button
              onClick={() => setFilter("ACTION_REQUIRED")}
              className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded transition ${
                filter === "ACTION_REQUIRED" ? "bg-slate-850 border border-amber-600/30 text-amber-300 font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Action Required (P0/P1)
              </span>
              <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">{totalActionRequired}</span>
            </button>
            <button
              onClick={() => setFilter("DORMANT")}
              className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded transition ${
                filter === "DORMANT" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Dormant
              </span>
              <span className="text-xs bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">{totalDormant}</span>
            </button>
          </nav>
        </aside>

        {/* Center Section: Main Opportunity List (Table View) */}
        <main className="flex-1 overflow-x-auto min-w-0" id="list-view">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-sm">
              <FileText className="w-10 h-10 mb-3 text-slate-700" />
              <p className="font-medium text-slate-400">No opportunities matched filters</p>
              <p className="text-xs mt-1">Adjust search parameters or click Add Opportunity to insert entries</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm" id="table">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs select-none bg-slate-900/40">
                  <th className="py-3 px-4 font-normal">Company / Role</th>
                  <th className="py-3 px-4 font-normal">Tier</th>
                  <th className="py-3 px-4 font-normal">Source</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Priority</th>
                  <th className="py-3 px-4 font-normal">Next Action Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filtered.map((opp) => {
                  const isSelected = selectedId === opp.id;
                  return (
                    <tr
                      key={opp.id}
                      onClick={() => setSelectedId(opp.id)}
                      className={`cursor-pointer transition hover:bg-slate-900/60 ${
                        isSelected ? "bg-slate-900 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-100">
                        <div>
                          <span>{opp.companyName}</span>
                          <span className="block text-xs text-slate-400 font-normal">{opp.roleTitle}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {opp.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{opp.source}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={opp.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(opp, e.target.value as OpportunityStatus)}
                          className="bg-slate-950 border border-slate-800 text-xs rounded px-1.5 py-1 text-slate-300 focus:outline-none cursor-pointer"
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
                      <td className="py-3.5 px-4">
                        <select
                          value={opp.priority}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updatePriority(opp, e.target.value as Priority)}
                          className="bg-slate-950 border border-slate-800 text-xs font-mono rounded px-1.5 py-1 text-slate-300 focus:outline-none cursor-pointer"
                        >
                          <option value="P0">P0</option>
                          <option value="P1">P1</option>
                          <option value="P2">P2</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                        {opp.nextActionDate || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(opp)}
                            className="p-1 px-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded flex items-center gap-1 transition"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(opp.id)}
                            className="p-1 text-slate-500 hover:text-red-400 bg-slate-800 rounded transition"
                            title="Delete"
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

        {/* Right Side: Simple Metadata Detail Panel */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/40 p-5 shrink-0" id="detail-panel">
          {selectedOpp ? (
            <div className="space-y-5" id="detail-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedOpp.companyName}</h3>
                  <p className="text-sm text-slate-400">{selectedOpp.roleTitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(selectedOpp)}
                    className="p-1 px-2.5 bg-slate-800 text-xs text-slate-300 hover:text-white rounded flex items-center gap-1 transition"
                  >
                    Edit All fields
                  </button>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-800 pt-4 text-sm">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Status Transition</label>
                  <select
                    value={selectedOpp.status}
                    onChange={(e) => updateStatus(selectedOpp, e.target.value as OpportunityStatus)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none font-medium cursor-pointer"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Priority</label>
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
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Tier</label>
                    <select
                      value={selectedOpp.tier}
                      onChange={(e) => {
                        const updated: Opportunity = { ...selectedOpp, tier: e.target.value as OpportunityTier, lastActivityDate: "2026-05-24" };
                        setOpportunities(opportunities.map((o) => (o.id === selectedId ? updated : o)));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="T1">T1</option>
                      <option value="T2">T2</option>
                      <option value="T3">T3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Source Filter</label>
                    <span className="block p-2 bg-slate-950 rounded text-slate-300">{selectedOpp.source}</span>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Category</label>
                    <span className="block p-2 bg-slate-950 rounded text-slate-300 truncate">{selectedOpp.category || "Operations"}</span>
                  </div>
                </div>

                {selectedOpp.link && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Outreach URL</label>
                    <a
                      href={selectedOpp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-400 hover:underline hover:text-blue-300 break-all p-2 bg-slate-950 rounded"
                    >
                      <span>Open Link</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Date Applied</label>
                    <span className="block p-2 bg-slate-950 rounded text-slate-300 font-mono text-xs">{selectedOpp.dateApplied || "—"}</span>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Last Update</label>
                    <span className="block p-2 bg-slate-950 rounded text-slate-400 font-mono text-xs">{selectedOpp.lastActivityDate || "—"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Next Action Limit</label>
                  <span className="block p-2 bg-slate-950 rounded text-slate-300 font-mono text-xs">{selectedOpp.nextActionDate || "None planned"}</span>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block mb-1">Operator Notes</label>
                  <div className="p-3 bg-slate-950 text-slate-300 rounded text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedOpp.notes || "No notes entered for this pipeline opportunity."}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
              <FileText className="w-8 h-8 mb-2 text-slate-700" />
              <p className="text-sm font-medium">No opportunity is loaded</p>
              <p className="text-xs mt-0.5">Pick a record from the list to preview basic parameters</p>
            </div>
          )}
        </aside>
      </div>

      {/* 3. Add/Edit Opportunity Clean Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setModalMode(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-tight">
                {modalMode === "ADD" ? "Create New Opportunity" : "Modify Opportunity details"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Acme Inc"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as Opportunity["source"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="OLJ">OLJ</option>
                    <option value="Direct">Direct</option>
                    <option value="Referral">Referral</option>
                    <option value="Funnel">Funnel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as OpportunityTier)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none cursor-pointer"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OpportunityStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none cursor-pointer"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none cursor-pointer"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none font-mono text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Next Action Date Limit</label>
                  <input
                    type="date"
                    value={formNextActionDate}
                    onChange={(e) => setFormNextActionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none font-mono text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Outreach URL Link</label>
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Dossier Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={4}
                    placeholder="Opportunity notes and outreach checklist details"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded text-slate-400 hover:text-white text-xs transition transition duration"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition"
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
