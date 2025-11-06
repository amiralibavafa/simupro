// index.js
// Entry point for the SimuPro application.
// Author : Amirali Bavafa

import { getResponse } from "./LLMcore/core.js";
import testPrompt from "./LLMcore/test-prompt.js";
import { JobDescription, resume } from "./LLMcore/sample_input.js"; //TEST
import fs from "fs";

// function prepare the prompt by adding job description and resume
// Input : job description string , resume string
// Output : engineered prompt string
// IMPORTANT : This is the 1st phase to test the LLM response
function preparePrompt(jobDescription, resume){
    let prompt = testPrompt;
    prompt += '\nJob Description: ' + jobDescription;
    prompt += '\nResume: ' + resume;
    return prompt;
}


// Main function to execute the prompt preparation and get response
// from the LLM core module.
async function main() {
  const prompt = preparePrompt(JobDescription, resume);
  console.log("Prompt:", prompt);
  console.log("----------------------------------------------------------------------------");

  try {
    const rawResponse = await getResponse(prompt);

    // Clean ```json at start and ``` at end if present
    const cleanResponse = rawResponse
      .replace(/^```json\s*/, "")
      .replace(/```$/, "");
      
    console.log("Response:", cleanResponse);
    fs.writeFileSync("output.json", cleanResponse);
  } catch (err) {
    console.log("Failed to get response:", err);
  }
}

main();