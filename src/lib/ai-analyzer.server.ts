// Server-only: calls Lovable AI Gateway to produce a structured resume report.
import type { ResumeReport } from "./report-types";

const SYSTEM_PROMPT = `You are SkillMatch AI, an expert technical recruiter and resume coach.
Analyze the user's resume against the target job role. Be honest, specific, and constructive.
Return ONLY valid JSON matching the schema. Do not include markdown fences or commentary.
All scores are integers 0-100. Always populate every field — use empty arrays/strings if data is missing.`;

const JSON_SCHEMA_DESCRIPTION = `JSON schema:
{
  "extracted": {
    "name": string,
    "contact": { "email": string?, "phone": string?, "location": string?, "links": string[] },
    "summary": string,
    "skills": string[],
    "education": [{"institution": string, "degree": string, "year": string?}],
    "experience": [{"role": string, "company": string, "duration": string?, "description": string?}],
    "projects": [{"name": string, "description": string?}],
    "certifications": string[]
  },
  "scores": { "overall": int, "formatting": int, "skills": int, "experience": int, "education": int, "ats": int },
  "feedback": { "strengths": string[3-6], "weaknesses": string[3-6], "recruiterPerspective": string, "interviewReady": boolean },
  "ats": { "score": int, "issues": string[], "recommendations": string[], "missingKeywords": string[] },
  "skillGap": { "matchPercentage": int, "requiredSkills": string[6-10], "matchedSkills": string[], "missingSkills": string[] },
  "summaryRewrite": { "original": string, "improved": string },
  "grammar": { "writingScore": int, "issues": string[], "suggestions": string[], "examples": [{"before": string, "after": string}] },
  "sections": { "contact": bool, "summary": bool, "education": bool, "skills": bool, "projects": bool, "experience": bool, "certifications": bool },
  "improvements": {
    "summary": {"original": string, "improved": string},
    "skills": {"original": string, "improved": string},
    "projects": {"original": string, "improved": string},
    "experience": {"original": string, "improved": string}
  },
  "career": {
    "readinessScore": int,
    "level": "Beginner" | "Developing" | "Job Ready" | "Competitive",
    "roadmap": [{"step": string, "reason": string}]
  }
}`;

export async function analyzeResume(
  resumeText: string,
  jobRole: string,
): Promise<ResumeReport> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const userPrompt = `Target job role: ${jobRole}

Resume content:
"""
${resumeText.slice(0, 18000)}
"""

${JSON_SCHEMA_DESCRIPTION}

Produce the JSON report now.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    throw new Error(`AI analysis failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI returned empty response");

  // Strip accidental fences just in case.
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  let parsed: ResumeReport;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned malformed JSON");
  }
  return parsed;
}
