# ScaleSmart Opportunity OS v1 — Strict MVP Edition

A lightweight, high-leverage pipeline cockpit built specifically for founders and operators to focus on outbound outreach flow, follow-up discipline, and opportunity prioritization.

## 🧠 Core Principle
> **One table, one state system, one UI loop.**
Everything is driven directly by the `opportunities[]` state and standard client-side synchronization.

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

## ⏱️ Prebuilt Operator Filters
* **All Opportunities** — Complete raw snapshot of every row in the local store.
* **Active Pipeline** — Interactive rows filtering out `REJECTED`, `ARCHIVED`, and `DORMANT` statuses.
* **Interviewing** — Targets that have reached the active communication stage.
* **Action Required** — Instantly isolates pending or interviewing opportunities marked as **P0** or **P1** high priority.
* **Dormant** — Targets set aside for long-term tracking or review.

---

## 🛠️ Data Model Schema
The code centers on a single clean TypeScript interface:

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
  source: "LinkedIn" | "OLJ" | "Direct" | "Referral" | "Funnel";
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

## ⚡ Tech Stack Specs & Execution
* **Framework:** React + Vite + TypeScript.
* **Styling:** Tailwind CSS.
* **Icons:** `lucide-react`.
* **State Management:** High-performance client-side `useState` backed up automatically by local persistence (`localStorage`).

No server-side database latency, no complex integrations, just immediate founder-friendly pipeline management.
