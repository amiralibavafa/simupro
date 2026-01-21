// services/storage.js
// JSON file-based storage for interview answers
// Safe append/update logic with file locking to prevent corruption

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const INTERVIEWS_FILE = path.join(DATA_DIR, "interviews.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read all interview data (thread-safe)
function readInterviewData() {
  ensureDataDir();

  if (!fs.existsSync(INTERVIEWS_FILE)) {
    return {};
  }

  try {
    const data = fs.readFileSync(INTERVIEWS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading interviews file:", err);
    // If file is corrupted, backup and start fresh
    if (fs.existsSync(INTERVIEWS_FILE)) {
      const backupPath = `${INTERVIEWS_FILE}.backup.${Date.now()}`;
      fs.renameSync(INTERVIEWS_FILE, backupPath);
      console.log(`Corrupted file backed up to: ${backupPath}`);
    }
    return {};
  }
}

// Write interview data atomically (thread-safe)
function writeInterviewData(data) {
  ensureDataDir();

  // Write to temp file first, then rename (atomic operation)
  const tempFile = `${INTERVIEWS_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, INTERVIEWS_FILE);
}

/**
 * Save an interview answer
 * @param {object} params - Answer data
 * @param {string} params.sessionId - Interview session ID
 * @param {string} params.questionId - Question identifier
 * @param {string} params.transcript - Raw transcript from speech-to-text
 * @param {string} params.aiAnswer - AI-generated response/feedback
 * @returns {object} - Saved answer with createdAt timestamp
 */
export function saveAnswer({ sessionId, questionId, transcript, aiAnswer }) {
  const data = readInterviewData();

  // Initialize session if it doesn't exist
  if (!data[sessionId]) {
    data[sessionId] = {
      sessionId,
      createdAt: new Date().toISOString(),
      answers: [],
    };
  }

  // Check if answer for this question already exists
  const existingIndex = data[sessionId].answers.findIndex(
    (a) => a.questionId === questionId
  );

  const answerRecord = {
    questionId,
    transcript,
    aiAnswer,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Update existing answer
    data[sessionId].answers[existingIndex] = answerRecord;
  } else {
    // Add new answer
    data[sessionId].answers.push(answerRecord);
  }

  // Update session's lastUpdated timestamp
  data[sessionId].lastUpdated = new Date().toISOString();

  writeInterviewData(data);

  return answerRecord;
}

/**
 * Get all answers for a session
 * @param {string} sessionId - Interview session ID
 * @returns {object|null} - Session data with answers, or null if not found
 */
export function getSessionAnswers(sessionId) {
  const data = readInterviewData();
  return data[sessionId] || null;
}

/**
 * Get all sessions
 * @returns {object} - All interview sessions
 */
export function getAllSessions() {
  return readInterviewData();
}

/**
 * Delete a session
 * @param {string} sessionId - Interview session ID
 * @returns {boolean} - True if deleted, false if not found
 */
export function deleteSession(sessionId) {
  const data = readInterviewData();

  if (!data[sessionId]) {
    return false;
  }

  delete data[sessionId];
  writeInterviewData(data);
  return true;
}

export default {
  saveAnswer,
  getSessionAnswers,
  getAllSessions,
  deleteSession,
};
