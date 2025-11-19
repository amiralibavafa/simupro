//resume-parser.js
// Input : local pdf file path (for Test) or file path from database(SQL)
// Output : String of the extracted text from the pdf
// Author : Amirali 
import extract from "pdf-text-extract";

function resumeReader(filepath) {
  return new Promise((resolve, reject) => {
    extract(filepath, (err, pages) => {
      if (err) return reject(err);
      const allText = pages.join("\n");
      resolve(allText);
    });
  });
};

export default resumeReader;