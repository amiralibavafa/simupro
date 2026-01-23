// Analysis.jsx
// Interview Analysis component - auto-runs analysis, NEVER asks for job description

import { useState, useEffect, useRef } from "react";
import "./interview.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5005";

function Analysis({ sessionId, jobDescription, onAnalysisComplete }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent double-run in React strict mode
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const performAnalysis = async () => {
      console.log("=== Analysis Starting ===");
      console.log("Session ID:", sessionId);
      console.log("Job description from props:", jobDescription ? `${jobDescription.length} chars` : "empty");

      if (!sessionId) {
        setError("Session ID is missing. Please complete the interview first.");
        setIsLoading(false);
        return;
      }

      // Step 1: Check for existing analysis
      try {
        const existingRes = await fetch(`${API_BASE_URL}/api/interview/analyze/${sessionId}`);
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          if (existingData.analyzed && existingData.score) {
            console.log("Found existing analysis, transitioning to results");
            setIsLoading(false);
            onAnalysisComplete(existingData);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check existing analysis:", err);
      }

      // Step 2: Get jobDescription from multiple sources
      let jobDesc = jobDescription || "";

      // Try fetching from backend if not in props
      if (!jobDesc.trim()) {
        console.log("Fetching jobDescription from backend...");
        try {
          const jobRes = await fetch(`${API_BASE_URL}/api/interview/jobdescription/${sessionId}`);
          if (jobRes.ok) {
            const jobData = await jobRes.json();
            if (jobData.jobDescription) {
              jobDesc = jobData.jobDescription;
              console.log("Got jobDescription from backend:", jobDesc.length, "chars");
            }
          }
        } catch (err) {
          console.error("Failed to fetch jobDescription:", err);
        }
      }

      // Try fetching from session data
      if (!jobDesc.trim()) {
        console.log("Trying to get jobDescription from session data...");
        try {
          const sessionRes = await fetch(`${API_BASE_URL}/api/interview/session/${sessionId}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.jobDescription) {
              jobDesc = sessionData.jobDescription;
              console.log("Got jobDescription from session:", jobDesc.length, "chars");
            }
          }
        } catch (err) {
          console.error("Failed to fetch session data:", err);
        }
      }

      // Use a default placeholder if still empty (analysis will still run)
      if (!jobDesc.trim()) {
        console.log("No jobDescription found, using placeholder");
        jobDesc = "General software engineering position requiring problem-solving and communication skills.";
      }

      // Step 3: Run analysis
      try {
        console.log("Running analysis with jobDescription:", jobDesc.substring(0, 50) + "...");
        const res = await fetch(`${API_BASE_URL}/api/interview/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            jobDescription: jobDesc.trim(),
          }),
        });

        const data = await res.json();
        console.log("Analysis response received");

        if (!res.ok) {
          throw new Error(data.details || data.error || "Analysis failed");
        }

        // Validate response has required fields
        if (!data.score || !data.overall_feedback || !data.leetcode_recommendations) {
          console.error("Invalid analysis response:", data);
          throw new Error("Analysis returned incomplete data");
        }

        console.log("Analysis complete, score:", data.score.value, data.score.color);
        setIsLoading(false);
        onAnalysisComplete(data);
      } catch (err) {
        console.error("Analysis error:", err);
        setError(err.message || "Failed to analyze interview. Please try again.");
        setIsLoading(false);
        hasRunRef.current = false; // Allow retry
      }
    };

    performAnalysis();
  }, [sessionId, jobDescription, onAnalysisComplete]);

  // Retry handler - re-runs analysis without page reload
  const handleRetry = () => {
    hasRunRef.current = false;
    setError("");
    setIsLoading(true);
    // Force re-render to trigger useEffect
    setTimeout(() => {
      hasRunRef.current = false;
      window.location.reload();
    }, 100);
  };

  return (
    <div className="analysisSection">
      <h3 className="analysisTitle">Interview Analysis</h3>

      {isLoading && (
        <div className="analysisLoading">
          <div className="loadingSpinner"></div>
          <p className="analysisSubtitle">Analyzing your interview performance...</p>
          <p className="analysisHint">This may take a moment while AI reviews your answers.</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="analysisError">
          <p>{error}</p>
          <button onClick={handleRetry} className="analyzeBtn">
            Retry Analysis
          </button>
        </div>
      )}
    </div>
  );
}

export default Analysis;
