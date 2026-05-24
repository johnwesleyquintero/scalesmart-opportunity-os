# ScaleSmart Opportunity OS v1 — Unified Command System

A lightweight, high-leverage pipeline cockpit built specifically for founders and operators to focus on outbound outreach flow, follow-up discipline, and opportunity prioritization.

---

## 🧠 The 4-Layer System Architecture
ScaleSmart OS operates on a clean, single-direction pipeline that prevents over-automation spaghetti and keeps you in absolute control of your data.

```
[ Gmail Signal ] ──► [ Google Apps Script ] ──► [ Google Sheets ] ──► [ React Cockpit ]
 (Radar Input)          (Lightweight Pipe)        (Ledger Ledger)       (Decision Center)
```

1. **Gmail (Signal Inbox)**: Acts strictly as your outbound radar. It catches 3 clean signals: Application Confirmations (`APPLIED`), Practical Assessments (`ASSESSMENT_PENDING`), and Recruiter scheduling invites (`INTERVIEWING`).
2. **Google Sheets (Source of Truth)**: The unified database holding all rows cleanly on your Drive.
3. **Google Apps Script (The Transfer Pipe)**: Runs timed background sweeps of targeted keywords, converting matches to rows. Includes a `setupSheet()` routine for automatic layout structure.
4. **React Cockpit (The Operator UI)**: Visualizes the Ledger book, enables rapid inline status transitions, provides detailed record editing, and keeps priorities straight.

---

## ⚡ Key System Features (v1.0 Core)

### 🎨 Notion-Inspired Dark & Light Themes
Includes a dedicated, persistent theme toggle with a customizable palette replicating the Notion aesthetic across both tabs:
* **Light Mode**: Mimics the warm, clean paper-like background (`#ffffff`, `#f7f7f5`, `#eae9e6`) with deep charcoal text (`#37352f`).
* **Dark Mode**: Replicates the clean obsidian tones (`#191919`, `#202020`) with soft slate typography.
* **Dual Persistence**: Theme preference is automatically sync'd and persisted via standard client-side `localStorage`.

### 📈 Interactive Column Sorting
The central cockpit table offers immediate high-performance sorting. Click any header indicator:
* **Company Name** (Alphabetical order)
* **Outbound Tier** (T1 ➔ T2 ➔ T3 priority groups)
* **Integration Source** (Manual vs Automated Gmail signals)
* **Pipeline Status** (Outbound stage alignment)
* **Priority Level** (P0 ➔ P1 ➔ P2 high-stress triage)
* **Next Action Limit** (Calendar timeline dates)

### 🛰️ Built-In Apps Script Bootstrapper
A fully formatted, duplicate-resistant Apps Script is ready to copy straight from the **Signal Radar** panel. It includes:
* **`setupSheet()`**: Auto-formats Sheet headers, locks/freezes Row 1, applies custom dark theme styling, adjusts precise column sizes, and configures active operational filter views.
* **`scanGmailSignals()`**: Scans recent inbox indicators, normalizes names/titles, avoids duplicates by storing unique thread IDs, and appends fresh records.
* **`setupTrigger()`**: Configures automatic, hands-free hourly background scanning sweeps.

---

## 🧭 Operational Pipeline Statuses
The cockpit enforces the following strict status flows with no external noise:
* **NEW** — Raw outbound prospects or initial discovery matches.
* **APPLIED** — Active outreach sent, awaiting target engagement.
* **ASSESSMENT_PENDING** — Practical exercises, blueprints, or proposals outstanding.
* **INTERVIEWING** — Synchronous high-context technical calls in progress.
* **OFFER** — Secured contract won.
* **REJECTED** — Selection closed without immediate leverage.
* **DORMANT** — Soft shelf; stored for future warm automation dry-out sequences.
* **ARCHIVED** — Hidden by default; removed from active operational lists.

---

## ⏱️ Prebuilt Operator Filter Views
* **All Opportunities** — Complete raw snapshot of every row in the local store.
* **Active Pipeline** — Interactive rows filtering out `REJECTED`, `ARCHIVED`, and `DORMANT` statuses.
* **Interviewing** — Targets that have reached the active communication stage.
* **Action Required** — Instantly isolates pending or interviewing opportunities marked as **P0** or **P1** high priority.
* **Dormant** — Targets set aside for long-term tracking or review.

---

## 🛠️ Data Model Schema
The core TypeScript interface mapped directly across our client application, Spreadsheet headers, and database payloads:

```ts
export type OpportunityStatus =
  | "NEW"
  | "APPLIED"
  | "ASSESSMENT_PENDING"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "DORMANT"
  | "ARCHIVED";

export type OpportunityTier = "T1" | "T2" | "T3";

export type Priority = "P0" | "P1" | "P2";

export interface Opportunity {
  id: string;
  companyName: string;
  roleTitle: string;
  source: "LinkedIn" | "OLJ" | "Direct" | "Referral" | "Funnel" | "Gmail";
  tier: OpportunityTier;
  category: string;
  status: OpportunityStatus;
  priority: Priority;
  link?: string;
  dateApplied?: string;
  lastActivityDate?: string;
  nextActionDate?: string;
  notes?: string;
}
```

---

## ⚡ Tech Stack Specs & Local Development
* **Framework:** React + Vite + TypeScript.
* **Styling:** Tailwind CSS.
* **Icons:** `lucide-react`.
* **State Management:** Intercepted reactive `useState` with local persistence (`localStorage`), offering offline redundancy and fast manual exports to Google Sheets CSV files.
