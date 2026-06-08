import { Router } from "express";

const parseResumeRouter = Router();

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const SYSTEM_PROMPT = `You are a precise resume parser. Extract structured data from resume text and return ONLY valid JSON matching the schema exactly. No explanation, no markdown fences, just raw JSON.

Schema:
{
  "personalInfo": {
    "fullName": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string"
  },
  "profileSummary": ["string"],
  "coreCompetencies": ["string"],
  "technicalSkills": [{ "category": "string", "skills": "string" }],
  "softSkills": ["string"],
  "domainExposure": ["string"],
  "workExperience": [{
    "id": "string",
    "company": "string",
    "position": "string",
    "startDate": "string",
    "endDate": "string",
    "isCurrent": false,
    "bullets": ["string"]
  }],
  "education": [{
    "id": "string",
    "degree": "string",
    "field": "string",
    "institution": "string",
    "location": "string",
    "year": "string"
  }],
  "projects": [{
    "id": "string",
    "title": "string",
    "role": "string",
    "duration": "string",
    "bullets": ["string"]
  }],
  "languages": ["string"],
  "selectedTemplate": "modern"
}

Rules:
- id fields should be "1", "2", "3" etc.
- profileSummary: 3-5 concise bullet points about the candidate
- coreCompetencies: up to 15 key competencies
- technicalSkills: group by category (Languages, Frameworks, Cloud, etc.)
- softSkills: inferred from context if not explicit
- domainExposure: industries/domains the candidate has worked in
- bullets: ATS-friendly action-oriented bullet points
- isCurrent: true only for current role
- Use empty string "" for missing fields, empty array [] for missing lists
- Return ONLY the JSON object, no other text`;

parseResumeRouter.post("/parse-resume", async (req, res) => {
  const { text } = req.body as { text?: string };

  if (!text || typeof text !== "string" || text.trim().length < 50) {
    res.status(400).json({ error: "Resume text too short or missing." });
    return;
  }

  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "AI parsing is not configured." });
    return;
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://resume-builder.replit.app",
        "X-Title": "Resume Builder",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        max_tokens: 8192,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Parse this resume text into the JSON schema:\n\n${text.slice(0, 12000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      req.log.error({ status: response.status, body: errBody }, "OpenRouter error");
      res.status(502).json({ error: "AI model returned an error. Please try again." });
      return;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const raw = data.choices?.[0]?.message?.content ?? "";

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      req.log.error({ raw }, "Failed to parse AI JSON response");
      res.status(502).json({ error: "AI returned malformed JSON. Please try again." });
      return;
    }

    res.json({ resumeData: parsed });
  } catch (err) {
    req.log.error({ err }, "parse-resume fetch failed");
    res.status(500).json({ error: "Network error contacting AI service." });
  }
});

export default parseResumeRouter;
