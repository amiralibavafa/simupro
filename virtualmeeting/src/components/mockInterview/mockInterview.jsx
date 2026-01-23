import { useState, useCallback } from 'react';
import StartButton from '../startButton/startButton.jsx';
import StartTimer from '../startTimer/startTimer.jsx';
import Interview from '../InterviewSpace/Interview.jsx';
import Analysis from '../InterviewSpace/Analysis.jsx';
import Results from '../InterviewSpace/Results.jsx';

import './mockInterview.css';

function MockInterview() {
  const [stage, setStage] = useState('start');
  const [sessionId, setSessionId] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  // Called when interview questions are complete
  const handleInterviewComplete = useCallback((data) => {
    console.log("=== Interview Complete ===");
    console.log("Session ID:", data.sessionId);
    console.log("Job Description:", data.jobDescription ? "Available" : "NOT AVAILABLE");
    setSessionId(data.sessionId);
    setJobDescription(data.jobDescription || "");
    setStage('analysis');
    console.log("Stage set to: analysis");
  }, []);

  // Called when analysis is complete
  const handleAnalysisComplete = useCallback((data) => {
    console.log("=== Analysis Complete ===");
    console.log("Analysis data:", data);
    console.log("Score:", data?.score);
    setAnalysisData(data);
    setStage('results');
    console.log("Stage set to: results");
  }, []);

  // Go back to analysis from results
  const handleBackToAnalysis = useCallback(() => {
    setStage('analysis');
  }, []);

  // Start a new session
  const handleNewSession = useCallback(() => {
    setSessionId(null);
    setJobDescription("");
    setAnalysisData(null);
    setStage('start');
  }, []);

  return (
    <div className='body'>
      {stage === 'start' && (
        <StartButton onStart={() => setStage('timer')} />
      )}

      {stage === 'timer' && (
        <StartTimer onFinish={() => setStage('interview')} />
      )}

      {stage === 'interview' && (
        <Interview onComplete={handleInterviewComplete} />
      )}

      {stage === 'analysis' && (
        <div className="stageWrapper">
          <Analysis
            sessionId={sessionId}
            jobDescription={jobDescription}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      )}

      {stage === 'results' && (
        <div className="stageWrapper">
          <Results
            analysis={analysisData}
            onBack={handleBackToAnalysis}
            onNewSession={handleNewSession}
          />
        </div>
      )}
    </div>
  );
}

export default MockInterview;
