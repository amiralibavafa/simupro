// voice.js
// Goal: generate local AI voice for each question in the interview script
// Inputs: path to the generated LLM script
// Outputs: saves a WAV file for each question
// Author: Amirali Bavafa

import fs from 'fs';
import say from 'say';

// Function generate AI Voice
// Input: path of the latest generated LLM script
// Outputs: generates WAV file for each behavioral question
async function generateAIVoice(path = "./output/output.json") {
  // Load LLM script
  const raw = fs.readFileSync(path, "utf-8");
  const data = JSON.parse(raw);

  // Ensure output directory exists
  if (!fs.existsSync("./output")) {
    fs.mkdirSync("./output");
  }

  // Loop through behavioral questions
  for (let i = 0; i < data.behavioral.length; i++) {
    const item = data.behavioral[i];
    const text = item.interviewer;

    console.log(`Generating voice for question ${i + 1}...`);

    // Wrap say.export in a Promise so we can await it
    await new Promise((resolve, reject) => {
      say.export(text, null, 1.0, `./output/behavioral_${i + 1}.wav`, (err) => {
        if (err) {
          console.error(`Error generating voice for question ${i + 1}:`, err);
          reject(err);
        } else {
          console.log(`Generated: behavioral_${i + 1}.wav`);
          resolve();
        }
      });
    });
  }

  console.log("All behavioral questions processed.");
}

export default generateAIVoice;
