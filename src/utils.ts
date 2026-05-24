import { Opportunity } from "./types";

/**
 * Checks if an opportunity has specific action risks (deadline missed or quiet response).
 * Resolves relative to '2026-05-24' as today's date.
 */
export const getRiskOfOpportunity = (
  opp: Opportunity,
  todayStr: string = "2026-05-24"
): { type: "deadline_missed" | "no_response" | "none"; message: string } => {
  if (["OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(opp.status)) {
    return { type: "none", message: "" };
  }
  
  if (opp.nextActionDate && opp.nextActionDate < todayStr) {
    return { type: "deadline_missed", message: `Action deadline missed (${opp.nextActionDate})` };
  }

  // Active loop checks (no response in 10+ days since apply date)
  if (opp.status === "APPLIED" && opp.dateApplied) {
    const applyDate = opp.dateApplied;
    // Calculate 10 days before today (relative to 2026-05-24). 
    // "2026-05-14" is exactly 10 days before "2026-05-24"
    if (applyDate < "2026-05-14") {
      return { type: "no_response", message: "Inbox quiet for over 10 days" };
    }
  }

  return { type: "none", message: "" };
};
