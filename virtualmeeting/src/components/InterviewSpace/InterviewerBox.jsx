import { useRef, useEffect } from "react";
import useTypewriter from "./TypeWriter";

function InterviewerBox({ text, audio, active, onDone }) {
  const audioRef = useRef(null);

  const typedText = useTypewriter(text, 45, active);

  useEffect(() => {
    if (!active || !audio) return;

    if (audioRef.current) {
      audioRef.current.src = `http://localhost:5005/audio/${audio}`;
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = onDone;
    }
  }, [audio, active, onDone]);

  return (
    <div className="interviewerBox">
      <p>{typedText}</p>
      <audio ref={audioRef} />
    </div>
  );
}

export default InterviewerBox;