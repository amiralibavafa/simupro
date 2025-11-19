// index.js | AI
// Entry point for the SimuPro application. Runs the LLm to produce the interview script and AI voice 
// Author : Amirali Bavafa

import { getResponse } from "./LLMcore/core.js";
import testPrompt from "./LLMcore/test-prompt.js";
import fs from "fs";
import resumeReader from "./inputs/resume-parser.js";
import generateAIVoice from "./LLMcore/voice.js";


// Function to prepare the essentials of a new mock Interview
// Inputs : Resume Path (SQL or local), String of JobDescription (Body Parsed from UI)
// Output : output.json (Interview Prompt), AI voice in mp3 format for each line of the script
// output.json must be stored and loaded on users sql of tests, user mp3 file could be a local storage
// just for the interview stage and could be removed after.
async function generateNewMock(resumePath, JobDescription){
  // function prepare the prompt by adding job description and resume
  // Input : job description string , resume string
  // Output : engineered prompt string
  // IMPORTANT : This is the 1st phase to test the LLM response
  async function preparePrompt(){
      let prompt = testPrompt;
      prompt += '\nJob Description: \n' + JobDescription;// This is the test will be changed IMPORTANT!

      let resume = await resumeReader(resumePath); //Test path IMPORTANT!
      prompt += '\nResume: \n' + resume;
      
      return prompt;
  }


  // Main function to execute the prompt preparation and get response
  // from the LLM core module.
  async function generate() {
    const prompt = await preparePrompt();

    try {
      const rawResponse = await getResponse(prompt);

      // Clean ```json at start and ``` at end if present
      const cleanResponse = rawResponse
        .replace(/^```json\s*/, "")
        .replace(/```$/, "");
        
      console.log("Response:", cleanResponse);
      fs.writeFileSync("./AI/output/output.json", cleanResponse, "utf-8"); //Output stored locally for now (SQL in future).
    } catch (err) {
      console.log("Failed to get response:", err);
    }

    let path = "./AI/output/output.json"; //local path of output.json (SQL in future)
    await generateAIVoice(path); // Generating AI voice
  }
  await generate();
}
export default generateNewMock;