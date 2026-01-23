// services/storage.js
// JSON file-based storage for interview answers
// Safe atomic writes (write temp file then rename)

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

// Read all interview data
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
    return {};
  }
}

// Write interview data atomically (temp file then rename)
function writeInterviewData(data) {
  ensureDataDir();

  const tempFile = `${INTERVIEWS_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, INTERVIEWS_FILE);
}

/**
 * Save an interview answer
 * @param {object} params - Answer data
 * @param {string} params.sessionId - Interview session ID
 * @param {string} params.questionId - Question identifier
 * @param {string} params.transcript - Transcript from Web Speech API
 * @param {string} params.question - The question text (optional)
 * @returns {object} - Saved answer with createdAt timestamp
 */
export function saveAnswer({ sessionId, questionId, transcript, question }) {
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
    question,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Update existing answer
    data[sessionId].answers[existingIndex] = answerRecord;
  } else {
    // Add new answer
    data[sessionId].answers.push(answerRecord);
  }

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
 * Save job description for a session
 * @param {string} sessionId - Interview session ID
 * @param {string} jobDescription - Job description text
 */
export function saveJobDescription(sessionId, jobDescription) {
  const data = readInterviewData();

  if (!data[sessionId]) {
    data[sessionId] = {
      sessionId,
      createdAt: new Date().toISOString(),
      answers: [],
    };
  }

  data[sessionId].jobDescription = jobDescription;
  data[sessionId].lastUpdated = new Date().toISOString();

  writeInterviewData(data);
}

/**
 * Get job description for a session
 * @param {string} sessionId - Interview session ID
 * @returns {string|null} - Job description or null
 */
export function getJobDescription(sessionId) {
  const data = readInterviewData();
  return data[sessionId]?.jobDescription || null;
}

export default {
  saveAnswer,
  getSessionAnswers,
  saveJobDescription,
  getJobDescription,
};
