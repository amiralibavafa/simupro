import { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

function IntervieweeBox({
    active,
    onDone,
    sessionId,
    questionId,
    question,
    mode = "text" // "text" | "voice"
}) {
    const [answer, setAnswer] = useState("");
    const [inputMode, setInputMode] = useState(mode);

    if (!active) return <div className="intervieweeBox muted" />;

    const handleTextDone = () => {
        onDone(answer);   // send answer up
        setAnswer("");   // clear textarea for next question
    };

    const handleVoiceDone = (transcript) => {
        onDone(transcript);   // send transcribed answer up
    };

    return (
    <div className="intervieweeBox">
        {/* Mode toggle */}
        <div className="modeToggle">
            <button
                onClick={() => setInputMode("text")}
                className={`modeBtn ${inputMode === "text" ? "modeBtn--active" : ""}`}
            >
                Type
            </button>
            <button
                onClick={() => setInputMode("voice")}
                className={`modeBtn ${inputMode === "voice" ? "modeBtn--active" : ""}`}
            >
                Voice
            </button>
        </div>

        {/* Text input mode */}
        {inputMode === "text" && (
            <>
                <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Your answer..."
                    className="intervieweeTextarea"
                />
                <button onClick={handleTextDone} className="intervieweeDoneBtn">
                    Done
                </button>
            </>
        )}

        {/* Voice input mode */}
        {inputMode === "voice" && (
            <VoiceRecorder
                sessionId={sessionId}
                questionId={questionId}
                question={question}
                onDone={handleVoiceDone}
            />
        )}
    </div>
    );
}

export default IntervieweeBox;