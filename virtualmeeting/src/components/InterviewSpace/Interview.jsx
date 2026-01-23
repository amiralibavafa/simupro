import { useEffect, useState, useMemo } from "react";
import InterviewerBox from "./InterviewerBox";
import IntervieweeBox from "./IntervieweeBox";
import "./interview.css";

// API base URL from environment variable with sensible default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5005";

function Interview({ onComplete }) {
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("ai"); // ai | user
  const [allAnswers, setAllAnswers] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  // Generate a unique session ID for this interview session
  const sessionId = useMemo(() => `session_${Date.now()}`, []);

  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetch(`${API_BASE_URL}/mock/status`);
      const data = await res.json();
      if (data.ready) {
        console.log("=== Mock Data Received ===");
        console.log("Has jobDescription:", !!data.data?.jobDescription);
        console.log("jobDescription length:", data.data?.jobDescription?.length || 0);
        setMockData(data.data);
        setLoading(false);

        // Save jobDescription to backend for this session
        if (data.data?.jobDescription) {
          try {
            await fetch(`${API_BASE_URL}/api/interview/jobdescription`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                jobDescription: data.data.jobDescription,
              }),
            });
            console.log("JobDescription saved to backend for session:", sessionId);
          } catch (err) {
            console.error("Failed to save jobDescription:", err);
          }
        }
      } else {
        setTimeout(checkStatus, 1200);
      }
    };
    checkStatus();
  }, [sessionId]);

  const questions = mockData?.parsedScript?.behavioral || [];
  const audioFiles = mockData?.audioFiles || [];
  // Get jobDescription from mockData (stored when mock was created)
  const jobDescription = mockData?.jobDescription || "";

  const handleAnswerDone = (answer) => {
    setAllAnswers(prev => `${prev}${questions[index]?.interviewer} : ${answer} \n`);
  };

  useEffect(() => {
    if (!mockData) return;
    if (isFinished) return;

    // when interview is finished
    if (index === questions.length && questions.length > 0) {
      console.log("Interview finished");
      setIsFinished(true);
      // Pass answers, sessionId, AND jobDescription to parent
      if (onComplete) {
        onComplete({
          answers: allAnswers,
          sessionId,
          jobDescription,
        });
      }
    }
  }, [index, mockData, questions.length, allAnswers, onComplete, sessionId, isFinished, jobDescription]);

  if (loading) return <div className="mainArea" />;

  return (
    <div className="mainArea">
      <InterviewerBox
        text={questions[index]?.interviewer}
        audio={audioFiles[index]}
        active={phase === "ai"}
        onDone={() => setPhase("user")}
      />

      <IntervieweeBox
        active={phase === "user"}
        sessionId={sessionId}
        questionId={`q_${index}`}
        question={questions[index]?.interviewer}
        mode="voice"
        onDone={(answer) => {
          handleAnswerDone(answer);
          setPhase("ai");
          setIndex((i) => i + 1);
        }}
      />
    </div>
  );
}

export default Interview;
