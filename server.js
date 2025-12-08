import express from "express";
import cors from "cors";
import path from "path";
import generateNewMock from "./AI/index.js";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 5005;

let latestMock = null;

// For ES Modules path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ origin: "http://localhost:3001", credentials: true })); // allow React fetch
app.use(express.json());          // For JSON body parsing
app.use(express.static(path.join(__dirname, "public"))); // Serve CSS/Images/JS
app.use(express.urlencoded({ extended: true })); 

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Uploading resume and pasting job Description
app.get("/", (req, res)=>{
    res.render("upload");
});

app.get("/create/mock", (req,res)=>{
    res.render("loading");
})

app.post("/submit", upload.single("resume"), (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumePath = req.file.path;

  latestMock = null;

  console.log("Resume File Path:", resumePath);

  // Redirect user immediately to loading page
  res.redirect("/create/mock");

  // Run async generation in background
  (async () => {
    try {
      const mock = await generateNewMock(resumePath, jobDescription);

      console.log("Mock generated:", mock);

      // Delete resume after processing
      fs.unlink(resumePath, (err) => {
        if (err) console.error("Error deleting resume:", err);
      });

      latestMock = mock;

    } catch (err) {
      console.error("Error during mock generation:", err);
    }
  })();

});

app.get("/mock/status", (req, res) => {
  if (latestMock) {
    res.json({ ready: true, data: latestMock });
    latestMock = null; // optional: one-time fetch
  } else {
    res.json({ ready: false });
  }
});


// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
