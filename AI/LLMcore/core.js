// core.js
// This file contains core functions and utilities for the LLM Core module.
// It Provides response in JSON file questions and coding tasks.
// Author : Amirali Bavafa

import {GoogleGenAI} from "@google/genai";

// Initialize the GoogleGenAI client with API key from environment variables
const genai = new GoogleGenAI({
    apiKey: "AIzaSyCQM4_dduT5LxZhobKWOentv7VKQQB6lfc",
});

//function get Response
//Input : Engineered Prompt
//Output : Response as String but in Json format
export async function getResponse(prompt){
    try {
        const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",  // or whichever model you have access to
        contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
        });
        return response.text;  // According to docs “text” holds the response. :contentReference[oaicite:2]{index=2}
  } catch (err) {
        console.error("Error calling Gemini API:", err);
        throw err;
  }
}