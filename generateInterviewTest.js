import generateNewMock from "./AI/index.js";

let JobDescription = `Position: Software Developer Intern
Company: VanTech Solutions Inc.
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

let resumePath = "./AI/inputs/resume.pdf";

console.log("Generating Interview script and AI voice...");
generateNewMock(resumePath, JobDescription);