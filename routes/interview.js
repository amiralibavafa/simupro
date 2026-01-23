// routes/interview.js
// API routes for voice interview functionality (no OpenAI - uses Web Speech API in browser)

import express from "express";
import { saveAnswer, getSessionAnswers, saveJobDescription, getJobDescription } from "../services/storage.js";
import { analyzeInterview, getAnalysis } from "../services/analysis.js";

const router = express.Router();

/**
 * POST /api/interview/answer
 * Save an interview answer (transcript from Web Speech API)
 *
 * Request body: { sessionId, questionId, transcript, question? }
 * Response: { saved: true, createdAt }
 */
router.post("/interview/answer", (req, res) => {
  const { sessionId, questionId, transcript, question } = req.body;

  // Validate required fields
  if (!sessionId) {
    return res.status(400).json({
      error: "Missing sessionId",
      details: "sessionId is required",
    });
  }

  if (!questionId) {
    return res.status(400).json({
      error: "Missing questionId",
      details: "questionId is required",
    });
  }

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({
      error: "Missing transcript",
      details: "transcript is required and must not be empty",
    });
  }

  try {
    // Save the answer to persistent storage
    const savedRecord = saveAnswer({
      sessionId,
      questionId,
      transcript,
      question: question || null,
    });

    return res.json({
      saved: true,
      createdAt: savedRecord.createdAt,
    });
  } catch (error) {
    console.error("Interview answer route error:", error);

    return res.status(500).json({
      error: "Failed to save answer",
      details: error.message,
    });
  }
});

/**
 * GET /api/interview/session/:sessionId
 * Get all answers for a session
 *
 * Response: { sessionId, answers: [...], createdAt, lastUpdated } | 404
 */
router.get("/interview/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = getSessionAnswers(sessionId);

    if (!session) {
      // Return empty session instead of 404 for new sessions
      return res.json({
        sessionId,
        answers: [],
        createdAt: null,
      });
    }

    return res.json(session);
  } catch (error) {
    console.error("Get session error:", error);

    return res.status(500).json({
      error: "Failed to retrieve session",
      details: error.message,
    });
  }
});

/**
 * POST /api/interview/analyze
 * Analyze interview performance using Gemini AI
 *
 * Request body: { sessionId, jobDescription }
 * Response: { overall_feedback, score, leetcode_recommendations, ... }
 */
router.post("/interview/analyze", async (req, res) => {
  const { sessionId, jobDescription } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: "Missing sessionId",
      details: "sessionId is required",
    });
  }

  if (!jobDescription || jobDescription.trim().length === 0) {
    return res.status(400).json({
      error: "Missing jobDescription",
      details: "jobDescription is required",
    });
  }

  try {
    const analysis = await analyzeInterview(sessionId, jobDescription.trim());
    return res.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
});

/**
 * GET /api/interview/analyze/:sessionId
 * Get saved analysis for a session
 *
 * Response: { overall_feedback, score, leetcode_recommendations, ... } | null
 */
router.get("/interview/analyze/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  try {
    const analysis = getAnalysis(sessionId);

    if (!analysis) {
      return res.json({
        sessionId,
        analyzed: false,
        message: "No analysis found for this session",
      });
    }

    return res.json({ ...analysis, analyzed: true });
  } catch (error) {
    console.error("Get analysis error:", error);
    return res.status(500).json({
      error: "Failed to retrieve analysis",
      details: error.message,
    });
  }
});

/**
 * POST /api/interview/jobdescription
 * Save job description for a session
 *
 * Request body: { sessionId, jobDescription }
 */
router.post("/interview/jobdescription", (req, res) => {
  const { sessionId, jobDescription } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  if (!jobDescription) {
    return res.status(400).json({ error: "Missing jobDescription" });
  }

  try {
    saveJobDescription(sessionId, jobDescription);
    return res.json({ saved: true });
  } catch (error) {
    console.error("Save job description error:", error);
    return res.status(500).json({ error: "Failed to save job description" });
  }
});

/**
 * GET /api/interview/jobdescription/:sessionId
 * Get job description for a session
 */
router.get("/interview/jobdescription/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  try {
    const jobDescription = getJobDescription(sessionId);
    return res.json({ sessionId, jobDescription });
  } catch (error) {
    console.error("Get job description error:", error);
    return res.status(500).json({ error: "Failed to get job description" });
  }
});

export default router;
