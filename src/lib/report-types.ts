// Shape returned by the AI analyzer. Keep in sync with the prompt schema.
export interface ResumeReport {
  extracted: {
    name: string;
    contact: { email?: string; phone?: string; location?: string; links?: string[] };
    summary: string;
    skills: string[];
    education: { institution: string; degree: string; year?: string }[];
    experience: { role: string; company: string; duration?: string; description?: string }[];
    projects: { name: string; description?: string }[];
    certifications: string[];
  };
  scores: {
    overall: number;
    formatting: number;
    skills: number;
    experience: number;
    education: number;
    ats: number;
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recruiterPerspective: string;
    interviewReady: boolean;
  };
  ats: {
    score: number;
    issues: string[];
    recommendations: string[];
    missingKeywords: string[];
  };
  skillGap: {
    matchPercentage: number;
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
  };
  summaryRewrite: {
    original: string;
    improved: string;
  };
  grammar: {
    writingScore: number;
    issues: string[];
    suggestions: string[];
    examples: { before: string; after: string }[];
  };
  sections: {
    contact: boolean;
    summary: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    experience: boolean;
    certifications: boolean;
  };
  improvements: {
    summary: { original: string; improved: string };
    skills: { original: string; improved: string };
    projects: { original: string; improved: string };
    experience: { original: string; improved: string };
  };
  career: {
    readinessScore: number;
    level: "Beginner" | "Developing" | "Job Ready" | "Competitive";
    roadmap: { step: string; reason: string }[];
  };
}
