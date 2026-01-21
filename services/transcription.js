// services/transcription.js
// Speech-to-text transcription using OpenAI Whisper API
// No external binaries required (ffmpeg not needed)

import OpenAI from "openai";
import fs from "fs";

// Initialize OpenAI client - API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio file to text using OpenAI Whisper
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudio(audioFilePath) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`Audio file not found: ${audioFilePath}`);
  }

  try {
    const audioFile = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    return transcription.trim();
  } catch (error) {
    console.error("Transcription error:", error);

    if (error.code === "invalid_api_key") {
      throw new Error("Invalid OpenAI API key");
    }

    if (error.code === "insufficient_quota") {
      throw new Error("OpenAI API quota exceeded");
    }

    throw new Error(`Transcription failed: ${error.message}`);
  }
}

export default { transcribeAudio };
