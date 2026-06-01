import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // API Route: AI Signal Parser endpoint using Gemini 3.5 Flash
  app.post("/api/parse-signal", async (req, res) => {
    const { text, customApiKey } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "No text signal provided to parser." });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "No Gemini API key detected. Please configure a key in the settings panel or enter your own custom API Key in the browser input box.",
        needsKey: true
      });
    }

    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // Lazy-load @google/genai module
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const promptText = `
You are a highly efficient recruitment tracker parser. Extract essential application details from the following raw text snippet or full email thread.
Provide a clean structured output.

Input Text Signal:
"""
${text}
"""
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "Extract company details, role, status map, and determine the operational Tier level based on the following e-commerce/Amazon recruitment framework:\n- T1 (Execution / VA Level): Simple operations, data entry, product research, basic Amazon/Shopify tasks, SOP-following roles.\n- T2 (Operations / Specialist Level - Default): Amazon ops, catalog management, PPC support, inventory coordination, Shopify/Amazon hybrid roles, multi-task execution roles.\n- T3 (Systems / Architect Level): Agency roles, leadership roles, backend Amazon roles, catalog recovery, SOP creation, multi-brand operations, strategic or PM-level roles.\n\nStatus must map exactly to one of: 'NEW', 'APPLIED', 'ASSESSMENT_PENDING', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ARCHIVED'. Output in strict JSON conforming to the structural request schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: {
                type: Type.STRING,
                description: "Clean extracted name of company of application. Keep it concise (e.g. Stripe, OpenAI, SpaceX, Anthropic). No extra suffixes."
              },
              roleTitle: {
                type: Type.STRING,
                description: "Extracted role title (e.g. Solutions Engineer, Strategy Consigliere, Backend Dev)."
              },
              status: {
                type: Type.STRING,
                description: "Recruitment milestone status. Must be exactly one of: 'NEW', 'APPLIED', 'ASSESSMENT_PENDING', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ARCHIVED'."
              },
              tier: {
                type: Type.STRING,
                description: "Determined operational Tier based on role scope. Must be 'T1', 'T2', or 'T3'."
              },
              priority: {
                type: Type.STRING,
                description: "Determined category priority based on urgency of signal. Must be 'P0' if active loop/assessment/interview, 'P1' if standard applied/ongoing leads, 'P2' if passive/rejections."
              },
              nextActionDate: {
                type: Type.STRING,
                description: `If an explicit deadline, interview date or action limit is resolved from text, format as YYYY-MM-DD. If relative (e.g., 'next Tuesday'), resolve it assuming today is ${todayStr}. Otherwise, return 'No planned action'.`
              },
              salary: {
                type: Type.STRING,
                description: "Any compensation information mentioned (e.g. '$140,000 range' or '$80/hr'). Return empty string if not mentioned."
              },
              notesSummary: {
                type: Type.STRING,
                description: "A bulleted professional context block summarizing the stage (maximum 3 bullet points with timeline next steps)."
              }
            },
            required: ["companyName", "roleTitle", "status", "tier", "priority", "notesSummary"]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const parsed = JSON.parse(jsonStr);
      return res.json(parsed);
    } catch (err: any) {
      console.error("Server-side Gemini extraction failure:", err);
      return res.status(500).json({ 
        error: "System was unable to compute parsed AI structure. Deep parsing failure.", 
        details: err.message 
      });
    }
  });

  // API Route: AI Copilot Assistant Draft and Preparation Generator Endpoint
  app.post("/api/generate-draft", async (req, res) => {
    const { companyName, roleTitle, currentNotes, status, targetType, customApiKey } = req.body;
    if (!companyName || !roleTitle) {
      return res.status(400).json({ error: "Missing company name or role title." });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "No Gemini API key detected. Please configure a key in the settings panel or enter your own custom API Key.",
        needsKey: true
      });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const promptText = `
You are an expert career-coaching copilot and e-commerce senior operations consultant specializing in Amazon logistics, catalog health, inventory systems optimization, custom Google Sheets dashboard automation, and process engineering.

Based on the candidate's opportunity details, generate a professional, direct, and highly technical tactical response or blueprint.

Opportunity Context:
- Company: "${companyName}"
- Role: "${roleTitle}"
- Recruitment Phase Milestone: "${status || "APPLIED"}"
- Target Output Document Type: "${targetType || "Outreach/Follow-up Email"}"
- Active Activity Notes:
"""
${currentNotes || "No notes yet"}
"""

Depending on the requested Document Type (${targetType}), output one of the following formatted clearly in Markdown:
1. "Outreach Email / Interview Follow-up": Write an elegant, professional, high-leverage email or message draft to copy-paste. Personalize it with the company name, demonstrating a systems-first mindset, catalog recovery experience, or customized automation suggestions. Keep it crisp, clean, and proactive.
2. "Interview Preparation Blueprint": Compile a targeted preparation guide with 3 core domain-knowledge questions this company might ask based on the role and status (e.g. tracking indexation issues, addressing listing suppressions, parent-child variation hierarchy, flat file formatting, or custom Apps Script automation) and provide deep-insight, high-scoring answers.
3. "Action Checklist & Cover Letter": Create a tailored cover letter demonstrating expertise in managing complex Amazon stores or inventory, and bullet a 3-step action roadmap for the candidate to win the phase.
4. "Strategic Process Optimization": Design a proposed SOP blueprint for this company's e-commerce workflows. For example, explain how to sync Sellers Central indices with a custom database, construct listing checks, and build Google Apps Script reporting pipelines. Make it look highly expert.

Important Design Requirements:
- Write with professional composure, zero conversational fluff, and high technical accuracy.
- Structure beautifully using neat Markdown headers (##), bold accents (**), lists (-), and inline code blocks (\`) so that it parses elegantly in our UI markdown renderer.
- Address the user as Wesley or Operator; maintain a highly encouraging and strategic partner tone.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
      });

      const text = response.text || "No response generated by the model.";
      return res.json({ text });
    } catch (err: any) {
      console.error("Server-side draft generation failure:", err);
      return res.status(500).json({ 
        error: "Failed to generate AI blueprint draft.", 
        details: err.message 
      });
    }
  });

  // Serve static files / Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully activated and serving on http://0.0.0.0:${PORT}`);
  });
}

startServer();
