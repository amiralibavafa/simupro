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
// NOTE: The function saves the generated Voice in local folder output for future 
// it should become on a temprorary cloud perhaps SQL and getting deleted after mock
// test is done for storage efficiency.
async function generateAIVoice(path) {
  // Load LLM script
  const raw = fs.readFileSync(path, "utf-8");
  const data = JSON.parse(raw);

  // Prepare array to store audio file names
  const audioFiles = []; 

  // Loop through behavioral questions
  for (let i = 0; i < data.behavioral.length; i++) {
    const item = data.behavioral[i];
    const text = item.interviewer;
    var fileName = `behavioral_${i + 1}.wav`;
    audioFiles.push(fileName);

    console.log(`Generating voice for question ${i + 1}...`);

    // Wrap say.export in a Promise so we can await it
    await new Promise((resolve, reject) => {
      say.export(text, null, 1.0, `./AI/output/behavioral_${i + 1}.wav`, (err) => {
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
  return audioFiles;
}

export default generateAIVoice;
