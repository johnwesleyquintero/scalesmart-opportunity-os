import React, { useState } from "react";
import { Database, RefreshCw, Radio, Send, Layers, Code } from "lucide-react";

interface AppsScriptConnectorProps {
  appsScriptUrl: string;
  setAppsScriptUrl: (url: string) => void;
  isConnecting: boolean;
  connectionStatus: "idle" | "success" | "error";
  connectionError: string | null;
  handleConnectAppsScript: (url: string) => void;
  triggerLiveScan: () => void;
  pushLedgerToSheets: () => void;
  isDark: boolean;
  theme: any;
  setToast: (toast: { message: string; type: "success" | "error" | "info" } | null) => void;
}

export default function AppsScriptConnector({
  appsScriptUrl,
  setAppsScriptUrl,
  isConnecting,
  connectionStatus,
  connectionError,
  handleConnectAppsScript,
  triggerLiveScan,
  pushLedgerToSheets,
  isDark,
  theme,
  setToast
}: AppsScriptConnectorProps) {
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const getAppsScriptCode = () => {
    return `/**
 * ScaleSmart OS v1 — Gmail Signal Detector & Sheets Loader
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet where your opportunities are kept.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default placeholder code and paste this script.
 * 4. Click the Save icon (floppy disk).
 * 5. Run setupSheet() first to configure your columns, formats, and filters!
 * 6. Run setupTrigger() to establish automatic hourly inbox sweeps!
 */

const SHEET_NAME = "Sheet1";

/**
 * Initializes and formats your active Google Sheet with the correct col headers,
 * font alignments, column widths, frozen rows, and active filters.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = [
    "Company Name", 
    "Role Title", 
    "Source", 
    "Tier", 
    "Status", 
    "Priority", 
    "Link", 
    "Date Applied", 
    "Last Activity Date", 
    "Notes", 
    "Thread ID"
  ];
  
  // Set header row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header look
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#0f172a"); // slate-900 background
  headerRange.setFontColor("#ffffff");    // white text
  headerRange.setFontFamily("Arial");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 28);
  
  // Freeze Row 1 so it stays locked
  sheet.setFrozenRows(1);
  
  // Create filters
  try {
    const existingFilter = sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    const lastRow = sheet.getLastRow() > 1 ? sheet.getLastRow() : 100;
    sheet.getRange(1, 1, lastRow, headers.length).createFilter();
  } catch(e) {
    Logger.log("Filters could not be created/refreshed: " + e.message);
  }

  // Adjust columns to perfect sizing
  sheet.setColumnWidth(1, 180); // Company Name
  sheet.setColumnWidth(2, 220); // Role
  sheet.setColumnWidth(3, 100); // Source
  sheet.setColumnWidth(4, 70);  // Tier
  sheet.setColumnWidth(5, 150); // Status
  sheet.setColumnWidth(6, 80);  // Priority
  sheet.setColumnWidth(7, 240); // Link URL
  sheet.setColumnWidth(8, 110); // Date Applied
  sheet.setColumnWidth(9, 130); // Last Activity
  sheet.setColumnWidth(10, 320); // Notes
  sheet.setColumnWidth(11, 165); // Thread ID
  
  // Insert sample data row if sheet is fresh and only has headers (1 row)
  if (sheet.getLastRow() === 1) {
    const sampleRow = [
      "Stripe",
      "High-Leverage Scaling Consigliere",
      "Referral",
      "T1",
      "ASSESSMENT_PENDING",
      "P1",
      "https://stripe.com",
      "2026-05-18",
      "2026-05-18",
      "Received ledger performance exercise. High cognitive load, solid Tier 1 strategic leverage.",
      "sample-1"
    ];
    sheet.appendRow(sampleRow);
  }
  
  // Show successful outcome popup to operator
  try {
    SpreadsheetApp.getUi().alert("ScaleSmart Ledger initialized! Google Sheet database formatted and ready to collect automated Gmail radar signals.");
  } catch(e) {
    Logger.log("UI Alert failed (this is expected if run from script editor headlessly).");
  }
}

function scanGmailSignals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Gmail Search Query targeting the 3 vital outbound signals
  const searchQuery = "subject:(received your application OR assessment OR completed your application OR schedule your interview OR interview invitation OR recruiter reply)";
  
  // Search threads in the last 7 days to avoid processing duplicates
  const threads = GmailApp.search(searchQuery + " after:" + getFormattedDateSevenDaysAgo(), 0, 30);
  const processedThreadIds = getProcessedThreadIds(sheet);
  
  let newRowsAdded = 0;
  
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var threadId = thread.getId();
    
    // Skip if already imported to ledger
    if (processedThreadIds.indexOf(threadId) !== -1) {
      continue;
    }
    
    var messages = thread.getMessages();
    var firstMessage = messages[0];
    
    var subject = firstMessage.getSubject();
    var from = firstMessage.getFrom();
    var date = firstMessage.getDate();
    var body = firstMessage.getPlainBody();
    
    var company = parseCompany(from, subject, body);
    var roleTitle = parseRoleTitle(subject, body) || "Strategic Opportunity";
    var status = detectStatusFromEmail(subject, body);
    var threadUrl = "https://mail.google.com/mail/u/0/#inbox/" + threadId;
    var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
    
    var newRow = [
      company,          // Company Name
      roleTitle,        // Role Title
      "Gmail",          // Source
      "T2",             // Default Tier
      status,           // Status
      "P1",             // Default Priority
      threadUrl,        // Outbound Link URL
      formattedDate,    // Date Applied
      formattedDate,    // Last Activity Date
      "Signal captured via automatic Apps Script Gmail radar sweep.", 
      threadId          // Keep Thread ID in K Column for duplicates
    ];
    
    sheet.appendRow(newRow);
    newRowsAdded++;
  }
}

function detectStatusFromEmail(subject, body) {
  var s = (subject + " " + body).toLowerCase();
  if (s.indexOf("schedule") !== -1 || s.indexOf("invitation") !== -1 || s.indexOf("interview") !== -1 || s.indexOf("calendar") !== -1) {
    return "INTERVIEWING";
  }
  if (s.indexOf("assessment") !== -1 || s.indexOf("test") !== -1 || s.indexOf("exercise") !== -1 || s.indexOf("challenge") !== -1) {
    return "ASSESSMENT_PENDING";
  }
  return "APPLIED";
}

function parseCompany(from, subject, body) {
  var match = from.match(/([^<]+)/);
  if (match && match[1]) {
    var name = match[1].trim().replace(/['"]/g, "");
    if (name.toLowerCase().indexOf("recruiting") === -1 && name.toLowerCase().indexOf("careers") === -1) {
      return name;
    }
  }
  var emailMatch = from.match(/@([a-zA-Z0-9.-]+)/);
  if (emailMatch && emailMatch[1]) {
    var domain = emailMatch[1].split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }
  return "Parsed Company";
}

function parseRoleTitle(subject, body) {
  var combined = subject + " " + body;
  var regexes = [
    /for the position of ([^,\\.]+)/i,
    /for the ([^,\\.]+) role/i,
    /application for ([^,\\.]+)/i
  ];
  for (var i = 0; i < regexes.length; i++) {
    var match = combined.match(regexes[i]);
    if (match && match[1]) return match[1].trim();
  }
  return "";
}

function getProcessedThreadIds(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var range = sheet.getRange(2, 11, lastRow - 1, 1); // Thread ID kept in K Column
  var values = range.getValues();
  var ids = [];
  for (var i = 0; i < values.length; i++) ids.push(values[i][0]);
  return ids;
}

function getFormattedDateSevenDaysAgo() {
  var d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

function setupTrigger() {
  ScriptApp.newTrigger("scanGmailSignals")
    .timeBased()
    .everyHours(1)
    .create();
}

/**
 * API Web App Endpoint: doGet
 * Allows the React UI to fetch the live ledger and trigger Gmail sweeps.
 */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  
  if (action === "fetch") {
    return handleFetchLedger();
  } else if (action === "scan") {
    scanGmailSignals();
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Gmail inbox sweep completed successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Default: return live ledger
  return handleFetchLedger();
}

function handleFetchLedger() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var range = sheet.getRange(2, 1, lastRow - 1, 11);
  var values = range.getValues();
  var items = [];
  
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    items.push({
      id: r[10] || "row-" + (i + 2),
      companyName: r[0],
      roleTitle: r[1] || "Strategic Role",
      source: r[2] || "Direct",
      tier: r[3] || "T2",
      status: r[4] || "NEW",
      priority: r[5] || "P2",
      link: r[6] || "",
      dateApplied: r[7] ? (r[7] instanceof Date ? Utilities.formatDate(r[7], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(r[7])) : "",
      lastActivityDate: r[8] ? (r[8] instanceof Date ? Utilities.formatDate(r[8], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(r[8])) : "",
      notes: r[9] || "",
      threadId: r[10] || ""
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(items))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * API Web App Endpoint: doPost
 * Receives pushes from the React Cockpit to save ledger additions/modifications.
 */
function doPost(e) {
  try {
    var postData = e && e.postData && e.postData.contents;
    if (!postData) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data payload found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var payload = JSON.parse(postData);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (payload.action === "sync_all") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 11).clearContent();
      }
      
      var opportunities = payload.opportunities;
      if (opportunities && opportunities.length > 0) {
        var rows = opportunities.map(function(o) {
          return [
            o.companyName,
            o.roleTitle,
            o.source,
            o.tier,
            o.status,
            o.priority,
            o.link || "",
            o.dateApplied || "",
            o.lastActivityDate || "",
            o.notes || "",
            o.threadId || o.id
          ];
        });
        sheet.getRange(2, 1, rows.length, 11).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Ledger batch-synchronized successfully." }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (payload.action === "add_opportunity") {
      var o = payload.opportunity;
      if (o) {
        sheet.appendRow([
          o.companyName,
          o.roleTitle,
          o.source,
          o.tier,
          o.status,
          o.priority,
          o.link || "",
          o.dateApplied || "",
          o.lastActivityDate || "",
          o.notes || "",
          o.id
        ]);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Opportunity added successfully." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown post action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(getAppsScriptCode());
      setHasCopiedCode(true);
      setToast({ message: "Apps Script Code copied to clipboard successfully!", type: "success" });
      setTimeout(() => setHasCopiedCode(false), 2000);
    } catch (err: any) {
      setToast({ message: `Copy failed: ${err.message || err}`, type: "error" });
    }
  };

  return (
    <div className="xl:col-span-5 space-y-6">
      {/* Deployed Web App Connection Cockpit */}
      <div className={`border rounded-lg p-5 space-y-4 ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Database className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
            <h3 className={`text-xs font-bold uppercase font-mono tracking-tight truncate ${isDark ? "text-white" : "text-[#37352f]"}`}>
              Live Production Connector
            </h3>
          </div>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            connectionStatus === "success" 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
              : connectionStatus === "error"
              ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
              : "bg-neutral-500/10 text-neutral-500 border-neutral-500/30"
          }`}>
            {connectionStatus === "success" ? "CONNECTED" : connectionStatus === "error" ? "SYNC_FAIL" : "OFFLINE_DEMO"}
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
          Connect your deployed Google Apps Script Web App URL to link this React cockpit live with your Google Sheets DB and active Gmail scanner.
        </p>

        <div className="space-y-3">
          <div>
            <label className={`text-[10px] uppercase font-mono ${theme.textSecondary} block mb-1 font-semibold`}>
              Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className={`font-mono text-xs flex-1 border rounded p-2 focus:outline-none focus:border-blue-500 ${theme.bgInput}`}
              />
              <button
                onClick={() => handleConnectAppsScript(appsScriptUrl)}
                disabled={isConnecting || !appsScriptUrl.trim()}
                className={`px-3 py-2 rounded text-xs select-none flex items-center gap-1 font-mono transition border ${
                  isConnecting 
                    ? "opacity-50 cursor-not-allowed" 
                    : isDark ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-600" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? "animate-spin" : ""}`} />
                Connect
              </button>
            </div>
          </div>

          {connectionError && (
            <div className="p-2.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 leading-relaxed max-h-32 overflow-y-auto">
              <strong>Deployment Error:</strong> {connectionError}
            </div>
          )}

          {connectionStatus === "success" && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={triggerLiveScan}
                disabled={isConnecting}
                className={`w-full py-2.5 px-3 rounded text-xs font-mono font-bold transition border flex items-center justify-center gap-1.5 shadow-xs ${
                  isConnecting 
                    ? "opacity-50 cursor-not-allowed" 
                    : isDark ? "bg-slate-900 border-slate-700 text-[#34d399] hover:bg-slate-800 hover:text-emerald-300" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                }`}
                title="Command Google Apps Script to run scanGmailSignals() live and fetch updated data"
              >
                <Radio className={`w-3.5 h-3.5 ${isConnecting ? "animate-pulse text-emerald-450" : "text-emerald-500"}`} />
                Trigger Gmail Sweep
              </button>
              <button
                onClick={pushLedgerToSheets}
                disabled={isConnecting}
                className={`w-full py-2.5 px-3 rounded text-xs font-mono font-bold transition border flex items-center justify-center gap-1.5 shadow-xs ${
                  isConnecting 
                    ? "opacity-50 cursor-not-allowed" 
                    : `${theme.bgButtonSec} hover:text-blue-500`
                }`}
                title="Overwrite your active Google Sheets data with the current local React client state"
              >
                <Send className="w-3.5 h-3.5 text-blue-500" />
                Push Local to Sheets
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Setup steps list */}
      <div className={`border rounded-lg p-5 space-y-4 ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
        <div className="flex items-center gap-1.5">
          <Layers className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          <h3 className={`text-xs font-bold ${isDark ? "text-white" : "text-[#37352f]"} uppercase font-mono tracking-tight`}>Active Pipe Quick Setup</h3>
        </div>
        
        <ol className={`text-xs ${theme.textSecondary} space-y-3 pl-4 list-decimal leading-relaxed`}>
          <li>
            Create a clean <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Google Sheets spreadsheet</strong>. Rename your target tab to <code className={`font-mono px-1 border rounded ${isDark ? "bg-slate-950 border-slate-850" : "bg-neutral-100 border-neutral-200 text-neutral-850"}`}>Sheet1</code>.
          </li>
          <li>
            Select <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Extensions &gt; Apps Script</strong> at the top bar.
          </li>
          <li>
            Delete all existing default content inside the editor and paste the compiled Apps Script source code.
          </li>
          <li>
            Click <strong className={isDark ? "text-slate-200" : "text-[#37352f] font-bold"}>Save</strong>. Highlight and run function <code className={`font-mono px-1 rounded ${isDark ? "bg-slate-950 text-slate-300" : "bg-neutral-100 border border-neutral-200 text-neutral-850"}`}>setupTrigger()</code> representing hourly automated scans!
          </li>
        </ol>
        
        <p className="text-[11px] text-[#787774] leading-normal font-mono">
          Because Gmail maps purely to Sheets rows, this prevents CRM tagging explosions, and protects operational state integrity. That is why this setup works long-term.
        </p>
      </div>

      {/* Source Code Container */}
      <div className={`border rounded-lg overflow-hidden flex flex-col max-h-[440px] ${isDark ? "bg-[#202020] border-slate-800" : "bg-white border-[#eae9e6] shadow-xs"}`}>
        <div className={`px-4 py-3 border-b flex justify-between items-center font-mono ${isDark ? "border-slate-800 bg-[#252525]/50" : "border-[#eae9e6] bg-[#f7f7f5]"}`}>
          <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-[#37352f]"}`}>
            <Code className={`w-3.5 h-3.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            Google Apps Script Code
          </span>
          <button
            onClick={handleCopyCode}
            className={`text-[10px] underline font-medium cursor-pointer ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
          >
            {hasCopiedCode ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <div className={`p-4 overflow-y-auto flex-1 font-mono text-[10px] text-slate-300 space-y-1 select-all scrollbar-thin ${isDark ? "bg-slate-950" : "bg-[#f7f7f5]"}`}>
          <pre className={`whitespace-pre ${isDark ? "text-slate-300" : "text-[#37352f]"}`}>{getAppsScriptCode()}</pre>
        </div>
      </div>
    </div>
  );
}
