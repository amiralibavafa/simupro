import { useState } from "react";

function IntervieweeBox({ active, onDone }) {
    const [answer, setAnswer] = useState("");

    if (!active) return <div className="intervieweeBox muted" />;
    return (
    <div className="intervieweeBox">
        <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Your answer..."
        className="intervieweeTextarea"
        />
        <button onClick={onDone} className="intervieweeDoneBtn">
        Done
        </button>
    </div>
    );
}

export default IntervieweeBox;