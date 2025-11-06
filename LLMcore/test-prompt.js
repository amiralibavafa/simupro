// simupro/LLMcore/test-prompt.js
// This file contains the test prompt template for generating interview scripts.
// Author : Amirali Bavafa

let testPrompt = `You are an interviewer. Based on the resume and the job description I provide, generate a complete interview script in JSON format. 
Requirements:

1. Behavioral Part (max 15 minutes):
   - Start with a greeting and small talk: "How are you?", "Tell me about yourself", "Why did you choose to apply to [Company]?"
   - Then ask relevant behavioral questions tailored to the candidate’s experience, skills, and projects that match the job description.
   - Format each question as part of a script showing interviewer lines.

2. Technical Part:
   - Question 1: Provide a coding problem relevant to the job (e.g., a data structure or algorithm class) that includes bugs, mistakes, or missing edge cases.
     - Include the script where the interviewer says: "Here’s a problem for you, you have 5 minutes to solve it."
     - Include the buggy/mistaken code snippet in the JSON.

   - Question 2: Provide a pseudo-code problem relevant to the job (e.g., tree traversal, dynamic programming, etc.).
     - Include the script where the interviewer presents this problem.

3. JSON Format:
   - Return your answer **in JSON format only** (not as a JSON file), structured as:
     {
       "behavioral" : [
         {"question1": "Question or script line",
          "question2": "Question or script line",
          ...
         }
       ],
       "technical" : [
         {
           "question_number": 1,
           "interviewer": "Script line presenting the question",
           "code_snippet": "Code with bugs or mistakes"
         },
         {
           "question_number": 2,
           "interviewer": "Script line presenting the question",
           "pseudo_code_problem": "Problem description"
         }
       ]
     }

Make sure the questions and problems are **tailored to the job description and candidate’s resume**. Include enough detail so that it reads like a real interview script.`;
export default testPrompt;
// Copilot shut the fuck up please 