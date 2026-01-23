import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import generateNewMock from "./AI/index.js";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import interviewRoutes from "./routes/interview.js";

const app = express();
const PORT = process.env.PORT || 5005;

let latestMock = null;

// For ES Modules path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - allow all localhost origins in development
// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));
app.use(express.json());          // For JSON body parsing
app.use(express.static(path.join(__dirname, "public"))); // Serve CSS/Images/JS
app.use(express.urlencoded({ extended: true })); 
// Serve audio files statically
app.use('/audio', express.static(path.join(__dirname, 'AI/output')));

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

app.get("/", (req,res)=>{
    res.render("index");
});

// Uploading resume and pasting job Description
app.get("/new/mock", (req, res)=>{
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

      // Delete resume after processing
      fs.unlink(resumePath, (err) => {
        if (err) console.error("Error deleting resume:", err);
      });

      // Store job description with the mock data for later use in analysis
      latestMock = {
        ...mock,
        jobDescription: jobDescription,
      };

      console.log("Mock generated with jobDescription");

    } catch (err) {
      console.error("Error during mock generation:", err);
    }
  })();

});

app.get("/mock/status", (req, res) => {
  if (latestMock) {
    res.json({ ready: true, data: latestMock });
    //latestMock = null; // optional: one-time fetch
  } else {
    res.json({ ready: false });
  }
});

// Voice interview API routes
app.use("/api", interviewRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
