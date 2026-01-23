// services/analysis.js
// Interview analysis service using Gemini AI
// Strict schema enforcement with evidence-based evaluation

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getResponse } from "../AI/LLMcore/core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const ANALYSIS_FILE = path.join(DATA_DIR, "analysis.json");
const OUTPUT_JSON_PATH = path.join(__dirname, "..", "AI", "output", "output.json");
const INTERVIEWS_FILE = path.join(DATA_DIR, "interviews.json");

// Default LeetCode problems as fallback (2 Easy, 2 Medium, 1 Hard)
const DEFAULT_LEETCODE = [
  { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", why_this: "Fundamental problem for hash map usage and array manipulation." },
  { title: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", why_this: "Classic stack problem for string validation and parsing." },
  { title: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", why_this: "Common pattern for interval manipulation and sorting." },
  { title: "LRU Cache", link: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium", why_this: "Tests data structure design and implementation skills." },
  { title: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard", why_this: "Advanced algorithm for efficient data processing." }
];

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read analysis data
function readAnalysisData() {
  ensureDataDir();
  if (!fs.existsSync(ANALYSIS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(ANALYSIS_FILE, "utf-8"));
  } catch (err) {
    console.error("Error reading analysis file:", err);
    return {};
  }
}

// Write analysis data atomically
function writeAnalysisData(data) {
  ensureDataDir();
  const tempFile = `${ANALYSIS_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, ANALYSIS_FILE);
}

// Read AI script (output.json)
function readAIScript() {
  if (!fs.existsSync(OUTPUT_JSON_PATH)) {
    throw new Error("AI script (output.json) not found");
  }
  return JSON.parse(fs.readFileSync(OUTPUT_JSON_PATH, "utf-8"));
}

// Read user session answers
function readSessionAnswers(sessionId) {
  if (!fs.existsSync(INTERVIEWS_FILE)) {
    return null;
  }
  const data = JSON.parse(fs.readFileSync(INTERVIEWS_FILE, "utf-8"));
  return data[sessionId] || null;
}

// Convert title to LeetCode slug
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Build the strict analysis prompt
function buildAnalysisPrompt(jobDescription, aiScript, userAnswers) {
  return `You are a strict interview evaluator. You MUST use the provided JSON inputs. You MUST follow the output schema exactly. Do NOT output markdown. Do NOT output extra commentary.

You are given THREE inputs:
1) JOB_DESCRIPTION (string)
2) AI_SCRIPT_JSON (the interviewer's questions/prompts from output.json)
3) USER_ANSWERS_JSON (the user's transcripted answers from our saved session file)

Your job:
- Match each user answer to the corresponding interview question (by questionId if present, otherwise by order).
- Evaluate the quality of the user's answers AGAINST the JOB_DESCRIPTION.
- Give actionable feedback focused on interview speech + content quality (STAR method, clarity, specificity, technical depth, examples).

IMPORTANT RULES:
- You MUST use USER_ANSWERS_JSON content. Do NOT say "no answers were given" unless USER_ANSWERS_JSON is empty or has 0 usable answers.
- If answers are short/vague, say that specifically and cite which question types were weak (behavioral/technical), but still give targeted improvements.
- The LeetCode recommendations must be relevant to the JOB_DESCRIPTION (not generic).
- Output MUST be valid JSON and match the schema EXACTLY.

SCORING:
Compute a single overall score 0-100 based on:
- Relevance to job requirements (40%)
- Specificity & evidence/examples (25%)
- Communication/structure (STAR, clarity) (20%)
- Technical correctness/depth (15%)
Then output score.value as an integer 0..100.
DO NOT choose random scores: justify with the input answers.

COLOR RULE (strict):
- 0-30 => red
- 31-70 => yellow
- 71-100 => green
Return only the color string in score.color.

OUTPUT SCHEMA (RETURN ONLY THIS JSON):
{
  "overall_feedback": [
    "Exactly 5 or 6 bullets. Each bullet <= 20 words. Focus on improvements."
  ],
  "score": {
    "value": 0-100,
    "color": "red|yellow|green",
    "summary": "1 sentence summary of why this score was given."
  },
  "evidence": [
    "3-6 short bullets referencing what the user did/said (based on USER_ANSWERS_JSON)."
  ],
  "leetcode_recommendations": [
    {
      "title": "LeetCode problem title",
      "link": "https://leetcode.com/problems/<slug>/",
      "difficulty": "Easy|Medium|Hard",
      "why_this": "1 sentence connecting it to JOB_DESCRIPTION."
    }
  ]
}

LEETCODE RULES:
- Provide EXACTLY 5 problems: 2 Easy, 2 Medium, 1 Hard.
- Every link MUST start with "https://leetcode.com/problems/" and end with "/".
- Choose problems that match the JOB_DESCRIPTION skill needs (e.g. backend => caching/concurrency/graphs; data => SQL/arrays/hashing).
- If you are unsure of a slug, still provide the best-known slug format in the link.

Now analyze these inputs:

JOB_DESCRIPTION:
${jobDescription}

AI_SCRIPT_JSON:
${JSON.stringify(aiScript, null, 2)}

USER_ANSWERS_JSON:
${JSON.stringify(userAnswers, null, 2)}

Return ONLY the JSON object:`;
}

// Build repair prompt for retry
function buildRepairPrompt(originalResponse) {
  return `The previous response was invalid JSON. Return ONLY valid JSON matching this exact schema:

{
  "overall_feedback": ["string", "string", "string", "string", "string"],
  "score": { "value": <number 0-100>, "color": "<red|yellow|green>", "summary": "string" },
  "evidence": ["string", "string", "string"],
  "leetcode_recommendations": [
    { "title": "string", "link": "https://leetcode.com/problems/slug/", "difficulty": "Easy|Medium|Hard", "why_this": "string" }
  ]
}

EXACTLY 5-6 items in overall_feedback.
EXACTLY 3-6 items in evidence.
EXACTLY 5 items in leetcode_recommendations (2 Easy, 2 Medium, 1 Hard).
score.color must be "red" (0-30), "yellow" (31-70), or "green" (71-100).
All leetcode links MUST start with https://leetcode.com/problems/ and end with /

Previous invalid response:
${originalResponse.substring(0, 500)}

Return ONLY the corrected JSON:`;
}

// Clean and parse Gemini response
function cleanJsonResponse(text) {
  let cleaned = text.trim();

  // Remove markdown code blocks
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  // Find JSON object boundaries
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return cleaned.trim();
}

// Enforce score within 0-100 and compute color
function enforceScore(score) {
  let value = typeof score?.value === "number" ? score.value : 50;
  value = Math.max(0, Math.min(100, Math.round(value)));

  let color;
  if (value <= 30) {
    color = "red";
  } else if (value <= 70) {
    color = "yellow";
  } else {
    color = "green";
  }

  const summary = score?.summary || "Score based on overall interview performance.";

  return { value, color, summary };
}

// Enforce exactly 5 valid LeetCode recommendations with difficulty
function enforceLeetCode(recommendations) {
  const result = [];
  const seen = new Set();
  const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
  const targetDifficulties = { Easy: 2, Medium: 2, Hard: 1 };

  // Process provided recommendations
  if (Array.isArray(recommendations)) {
    for (const rec of recommendations) {
      if (result.length >= 5) break;

      const title = rec?.title || "Unknown Problem";
      let link = rec?.link || "";
      const difficulty = ["Easy", "Medium", "Hard"].includes(rec?.difficulty) ? rec.difficulty : "Medium";
      const why_this = rec?.why_this || "Good practice problem for this role.";

      // Fix link if needed
      if (!link.startsWith("https://leetcode.com/problems/")) {
        const slug = titleToSlug(title);
        link = `https://leetcode.com/problems/${slug}/`;
      }
      if (!link.endsWith("/")) {
        link += "/";
      }

      // Avoid duplicates
      if (!seen.has(link)) {
        seen.add(link);
        difficulties[difficulty]++;
        result.push({ title, link, difficulty, why_this });
      }
    }
  }

  // Fill with defaults if less than 5
  for (const def of DEFAULT_LEETCODE) {
    if (result.length >= 5) break;
    if (!seen.has(def.link)) {
      seen.add(def.link);
      result.push({ ...def });
    }
  }

  return result.slice(0, 5);
}

// Enforce exactly 5-6 feedback lines
function enforceFeedback(feedback) {
  const defaultFeedback = [
    "Use the STAR method (Situation, Task, Action, Result) for behavioral answers.",
    "Provide specific examples from your experience, not generic statements.",
    "Quantify your achievements with numbers and metrics when possible.",
    "Connect your answers directly to the job requirements mentioned.",
    "Practice speaking more concisely while still being thorough."
  ];

  if (!Array.isArray(feedback) || feedback.length === 0) {
    return defaultFeedback;
  }

  const result = feedback
    .filter(line => typeof line === "string" && line.trim().length > 0)
    .map(line => {
      const words = line.trim().split(/\s+/);
      if (words.length > 20) {
        return words.slice(0, 20).join(" ") + "...";
      }
      return line.trim();
    });

  while (result.length < 5) {
    result.push(defaultFeedback[result.length] || "Continue practicing interview skills.");
  }

  return result.slice(0, 6);
}

// Enforce evidence array
function enforceEvidence(evidence) {
  const defaultEvidence = [
    "User provided responses to interview questions.",
    "Answers were evaluated against job description requirements.",
    "Communication style and structure were assessed."
  ];

  if (!Array.isArray(evidence) || evidence.length === 0) {
    return defaultEvidence;
  }

  const result = evidence
    .filter(line => typeof line === "string" && line.trim().length > 0)
    .map(line => line.trim());

  while (result.length < 3) {
    result.push(defaultEvidence[result.length] || "Interview performance was evaluated.");
  }

  return result.slice(0, 6);
}

// Parse and validate Gemini response with strict enforcement
function parseAndEnforceResponse(responseText) {
  const cleaned = cleanJsonResponse(responseText);
  const parsed = JSON.parse(cleaned);

  const result = {
    overall_feedback: enforceFeedback(parsed.overall_feedback),
    score: enforceScore(parsed.score),
    evidence: enforceEvidence(parsed.evidence),
    leetcode_recommendations: enforceLeetCode(parsed.leetcode_recommendations)
  };

  return result;
}

/**
 * Analyze interview performance with retry logic and strict enforcement
 */
export async function analyzeInterview(sessionId, jobDescription) {
  const MAX_RETRIES = 2;

  // Load AI script
  const aiScript = readAIScript();

  // Load user answers
  const session = readSessionAnswers(sessionId);
  if (!session || !session.answers || session.answers.length === 0) {
    throw new Error(`No answers found for session: ${sessionId}`);
  }

  console.log(`Analyzing session ${sessionId} with ${session.answers.length} answers`);

  // Build initial prompt
  const prompt = buildAnalysisPrompt(jobDescription, aiScript, session.answers);

  let lastError = null;
  let lastRawResponse = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Analysis attempt ${attempt}/${MAX_RETRIES}`);

      const currentPrompt = attempt === 1 ? prompt : buildRepairPrompt(lastRawResponse);
      const responseText = await getResponse(currentPrompt);
      lastRawResponse = responseText;

      console.log("Raw response length:", responseText.length);

      const analysis = parseAndEnforceResponse(responseText);

      // Add metadata
      analysis.sessionId = sessionId;
      analysis.jobDescription = jobDescription;
      analysis.analyzedAt = new Date().toISOString();
      analysis.answersAnalyzed = session.answers.length;

      // Save to storage
      const allAnalysis = readAnalysisData();
      allAnalysis[sessionId] = analysis;
      writeAnalysisData(allAnalysis);

      console.log(`Analysis successful: score=${analysis.score.value} (${analysis.score.color})`);
      return analysis;
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt} failed:`, err.message);

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Fallback response
  console.error("All attempts failed, using fallback");

  const fallbackAnalysis = {
    overall_feedback: [
      "Practice using the STAR method for behavioral questions.",
      "Provide more specific examples from your experience.",
      "Connect your answers to the job requirements.",
      "Speak more concisely while covering key points.",
      "Prepare technical examples relevant to the role."
    ],
    score: { value: 40, color: "yellow", summary: "Analysis encountered issues; default score applied." },
    evidence: [
      `${session.answers.length} answer(s) were provided during the interview.`,
      "Responses were recorded but full analysis could not be completed.",
      "Retry recommended for detailed feedback."
    ],
    leetcode_recommendations: DEFAULT_LEETCODE.slice(0, 5),
    sessionId,
    jobDescription,
    analyzedAt: new Date().toISOString(),
    answersAnalyzed: session.answers.length,
    _fallback: true
  };

  const allAnalysis = readAnalysisData();
  allAnalysis[sessionId] = fallbackAnalysis;
  writeAnalysisData(allAnalysis);

  return fallbackAnalysis;
}

/**
 * Get saved analysis for a session
 */
export function getAnalysis(sessionId) {
  const data = readAnalysisData();
  return data[sessionId] || null;
}

export default {
  analyzeInterview,
  getAnalysis,
};
