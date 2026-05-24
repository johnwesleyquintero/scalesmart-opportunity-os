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
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "No text signal provided to parser." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY is not configured in environment variables.",
        isDemo: true
      });
    }

    try {
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
          systemInstruction: "Extract company details, role, status map, and other core metadata. Status must map exactly to one of: 'NEW', 'APPLIED', 'ASSESSMENT_PENDING', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ARCHIVED'. Output in strict JSON conforming to the structural request schema.",
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
              priority: {
                type: Type.STRING,
                description: "Determined category priority based on urgency of signal. Must be 'P0' if active loop/assessment/interview, 'P1' if standard applied/ongoing leads, 'P2' if passive/rejections."
              },
              nextActionDate: {
                type: Type.STRING,
                description: "If an explicit deadline, interview date or action limit is resolved from text, format as YYYY-MM-DD. If relative (e.g., 'next Tuesday'), resolve it assuming today is 2026-05-24. Otherwise, return 'No planned action'."
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
            required: ["companyName", "roleTitle", "status", "priority", "notesSummary"]
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
