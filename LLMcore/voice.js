//voice.js
//Goal : this method uses the interview script to generate mp3 files for the AI interviewer so they will be played in the back ground like a humanbeing talking
//Inputs : 
//Outputs :
//Author : Amirali Bavafa


// THIS IS A TEST FUNCTION FOR NOW TO SEE IF THE API WORKS 
import fs from 'fs';
import fetch from 'node-fetch';

const apiKey = 'sk_d48285ada8e06717085f9812beb1980ac3e571f7549f2bb1';
const text = "Hello Amirali, thank you for joining us today. How are you doing?";

const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
  method: 'POST',
  headers: {
    'xi-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text,
    voice_settings: { stability: 0.75, similarity_boost: 0.75 }
  })
});

const buffer = Buffer.from(await response.arrayBuffer());
fs.writeFileSync('./output/hello_amirali.mp3', buffer);
console.log('✅ MP3 saved!');
