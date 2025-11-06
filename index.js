// index.js
// Entry point for the SimuPro application.
// Author : Amirali Bavafa

import { getResponse } from "./LLMcore/core.js";
import testPrompt from "./LLMcore/test-prompt.js";
import fs from "fs";

// Sample resume for testing
let resume = `Name: Amirali Bavafa
Education: B.Sc. in Computing Science, Simon Fraser University
Skills: JavaScript, Node.js, Python, C++, HTML, CSS, Data Structures, Algorithms
Experience:
- AI Research Assistant at SFU (Jan 2024 - Jul 2024): Worked on AI models for disease prediction, data analysis, and research papers.
- Web Developer for Jal-AB Trading Co.: Built a website using HTML, CSS, JavaScript, and WordPress CDN.
Projects:
- Simon Game: Built a memory game using HTML, CSS, and JavaScript.
- Friends Book: Implemented a social network data structure in C++ to manage users, posts, and interactions.
- Bank Queue Simulation: Implemented a priority queue using binary heap in C++ to simulate bank clients.`;

// Sample job description
let JobDescription = `Position: Software Developer Intern
Company: Tech Solutions Inc.
Location: Vancouver, BC
Responsibilities:
- Design, develop, and maintain web applications using modern JavaScript frameworks.
- Implement efficient algorithms and data structures for backend systems.
- Collaborate with a team to analyze requirements and solve technical challenges.
Requirements:
- Strong programming skills in JavaScript, Python, or C++.
- Understanding of data structures, algorithms, and object-oriented design.
- Experience with web development and project-based learning.
- Problem-solving mindset and ability to work in a team environment.`;

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