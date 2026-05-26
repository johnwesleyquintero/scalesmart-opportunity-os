import { Opportunity } from "./types";

/**
 * Returns today's date formatted as YYYY-MM-DD in the local timezone.
 */
export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if an opportunity has specific action risks (deadline missed or quiet response).
 * Resolves dynamically relative to today's date in local time or custom date string.
 */
export const getRiskOfOpportunity = (
  opp: Opportunity,
  todayStr: string = getTodayString()
): { type: "deadline_missed" | "no_response" | "none"; message: string } => {
  if (["OFFER", "REJECTED", "DORMANT", "ARCHIVED"].includes(opp.status)) {
    return { type: "none", message: "" };
  }
  
  if (opp.nextActionDate && opp.nextActionDate < todayStr) {
    return { type: "deadline_missed", message: `Action deadline missed (${opp.nextActionDate})` };
  }

  // Active loop checks (no response in 10+ days since apply date)
  if (opp.status === "APPLIED" && opp.dateApplied) {
    try {
      // Parse dates explicitly at midnight to prevent off-by-one errors from time offsets
      const todayVal = new Date(todayStr + "T00:00:00");
      const applyVal = new Date(opp.dateApplied + "T00:00:00");
      
      if (!isNaN(todayVal.getTime()) && !isNaN(applyVal.getTime())) {
        const diffTime = todayVal.getTime() - applyVal.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 10) {
          return { type: "no_response", message: `Inbox quiet for over ${diffDays} days` };
        }
      }
    } catch (e) {
      console.error("Error evaluating risk dynamic date offsets", e);
    }
  }

  return { type: "none", message: "" };
};

