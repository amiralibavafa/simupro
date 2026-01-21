// services/aiAnswer.js
// AI answer evaluation using existing Google Gemini integration
// Provides feedback on user's interview responses

import { getResponse } from "../AI/LLMcore/core.js";

/**
 * Generate AI feedback/evaluation for a user's interview answer
 * @param {object} params - Answer parameters
 * @param {string} params.question - The interview question that was asked
 * @param {string} params.transcript - The user's answer (transcribed from speech)
 * @returns {Promise<string>} - AI-generated feedback
 */
export async function evaluateAnswer({ question, transcript }) {
  if (!transcript || transcript.trim().length === 0) {
    return "No answer was provided. Please try again with a spoken response.";
  }

  const prompt = `You are an expert interview coach providing constructive feedback on interview answers.

The candidate was asked this interview question:
"${question}"

The candidate's response was:
"${transcript}"

Please provide:
1. A brief assessment of the answer's strengths (what they did well)
2. Areas for improvement (specific, actionable suggestions)
3. A score out of 10 with brief justification
4. A suggested better response structure (optional)

Keep your feedback concise, encouraging, and actionable. Format your response clearly with sections.`;

  try {
    const response = await getResponse(prompt);
    return response;
  } catch (error) {
    console.error("AI evaluation error:", error);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
}

/**
 * Simple pass-through for typed answers (reuses existing pipeline)
 * This maintains compatibility with the existing typed answer flow
 * @param {string} transcript - The user's typed or transcribed answer
 * @returns {Promise<string>} - Simple acknowledgment
 */
export async function processAnswer(transcript) {
  // For simple processing, just return acknowledgment
  // This can be extended to do more complex processing
  return `Answer recorded: "${transcript.substring(0, 100)}${transcript.length > 100 ? "..." : ""}"`;
}

export default {
  evaluateAnswer,
  processAnswer,
};
