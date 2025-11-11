// index.js
// Entry point for the SimuPro application. Runs the LLm to produce the interview script and AI voice 
// Author : Amirali Bavafa

import { getResponse } from "./LLMcore/core.js";
import testPrompt from "./LLMcore/test-prompt.js";
import { JobDescription, resume } from "./LLMcore/sample_input.js"; //TEST
import fs from "fs";
import resumeReader from "./inputs/resume-parser.js";

// function prepare the prompt by adding job description and resume
// Input : job description string , resume string
// Output : engineered prompt string
// IMPORTANT : This is the 1st phase to test the LLM response
async function preparePrompt(jobDescription, resumePath){
    let prompt = testPrompt;
    prompt += '\nJob Description: \n' + jobDescription;// This is the test will be changed IMPORTANT!

    let resume = await resumeReader("./inputs/resume.pdf"); //Test path IMPORTANT!
    prompt += '\nResume: \n' + resume;
    
    return prompt;
}


// Main function to execute the prompt preparation and get response
// from the LLM core module.
async function main() {
  const prompt = await preparePrompt(JobDescription, resume);
  console.log("Prompt:", prompt);
  console.log("----------------------------------------------------------------------------");

  try {
    const rawResponse = await getResponse(prompt);

    // Clean ```json at start and ``` at end if present
    const cleanResponse = rawResponse
      .replace(/^```json\s*/, "")
      .replace(/```$/, "");
      
    console.log("Response:", cleanResponse);
    fs.writeFileSync("./output/output.json", cleanResponse, "utf-8");
  } catch (err) {
    console.log("Failed to get response:", err);
  }
}

main();