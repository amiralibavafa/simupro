// routes/interview.js
// API routes for voice interview functionality

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { transcribeAudio } from "../services/transcription.js";
import { saveAnswer, getSessionAnswers } from "../services/storage.js";
import { evaluateAnswer } from "../services/aiAnswer.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for audio uploads
// Store in temp directory, auto-delete after processing
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads", "audio");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp + original extension to avoid conflicts
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `audio_${Date.now()}${ext}`);
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max (Whisper API limit)
  },
  fileFilter: function (req, file, cb) {
    // Accept common audio formats that Whisper supports
    const allowedMimes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
      "audio/flac",
      "audio/m4a",
      "video/webm", // Chrome sometimes sends webm as video/webm
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  },
});

/**
 * POST /api/transcribe
 * Transcribe audio to text using OpenAI Whisper
 *
 * Request: multipart/form-data with "audio" field
 * Response: { transcript: string }
 */
router.post("/transcribe", audioUpload.single("audio"), async (req, res) => {
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({
      error: "No audio file provided",
      details: "Please upload an audio file with field name 'audio'",
    });
  }

  try {
    const transcript = await transcribeAudio(audioFile.path);

    // Clean up uploaded file after transcription
    fs.unlink(audioFile.path, (err) => {
      if (err) console.error("Error deleting temp audio file:", err);
    });

    return res.json({ transcript });
  } catch (error) {
    // Clean up file even on error
    if (audioFile.path && fs.existsSync(audioFile.path)) {
      fs.unlink(audioFile.path, () => {});
    }

    console.error("Transcription route error:", error);

    return res.status(500).json({
      error: "Transcription failed",
      details: error.message,
    });
  }
});

/**
 * POST /api/interview/answer
 * Process an interview answer and get AI feedback
 *
 * Request body: { sessionId, questionId, transcript, question? }
 * Response: { aiAnswer: string, saved: boolean }
 */
router.post("/interview/answer", async (req, res) => {
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
    // Generate AI feedback using the existing AI pipeline
    let aiAnswer;

    if (question) {
      // If question is provided, evaluate the answer
      aiAnswer = await evaluateAnswer({ question, transcript });
    } else {
      // Simple acknowledgment if no question context
      aiAnswer = `Answer recorded successfully. Transcript: "${transcript.substring(0, 200)}${transcript.length > 200 ? "..." : ""}"`;
    }

    // Save the answer to persistent storage
    const savedRecord = saveAnswer({
      sessionId,
      questionId,
      transcript,
      aiAnswer,
    });

    return res.json({
      aiAnswer,
      saved: true,
      createdAt: savedRecord.createdAt,
    });
  } catch (error) {
    console.error("Interview answer route error:", error);

    return res.status(500).json({
      error: "Failed to process answer",
      details: error.message,
    });
  }
});

/**
 * GET /api/interview/session/:sessionId
 * Get all answers for a session
 *
 * Response: { sessionId, answers: [...], createdAt, lastUpdated } | null
 */
router.get("/interview/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = getSessionAnswers(sessionId);

    if (!session) {
      return res.status(404).json({
        error: "Session not found",
        details: `No session found with ID: ${sessionId}`,
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

// Handle multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        details: "Audio file must be less than 25MB",
      });
    }
    return res.status(400).json({
      error: "File upload error",
      details: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: "Upload error",
      details: err.message,
    });
  }

  next();
});

export default router;
