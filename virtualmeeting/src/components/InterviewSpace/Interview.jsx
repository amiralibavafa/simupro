import { useEffect, useState } from "react";
import InterviewerBox from "./InterviewerBox";
import IntervieweeBox from "./IntervieweeBox";
import "./interview.css";

function Interview() {
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("ai"); // ai | user

  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetch("http://localhost:5005/mock/status");
      const data = await res.json();
      if (data.ready) {
        setMockData(data.data);
        setLoading(false);
      } else {
        setTimeout(checkStatus, 1200);
      }
    };
    checkStatus();
  }, []);

  if (loading) return <div className="mainArea" />;

  const questions = mockData.parsedScript.behavioral;
  const audioFiles = mockData.audioFiles;

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
        onDone={() => {
          setPhase("ai");
          setIndex((i) => i + 1);
        }}
      />
    </div>
  );
}

export default Interview;
