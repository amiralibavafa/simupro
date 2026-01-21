// VoiceRecorder.jsx
// Voice recording component using MediaRecorder API
// Handles recording, transcription, and AI answer flow

import { useState, useRef, useCallback } from "react";

// API base URL from environment variable with sensible default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5005";

// State enum for UI management
const RecordingState = {
  IDLE: "idle",
  RECORDING: "recording",
  UPLOADING: "uploading",
  TRANSCRIBING: "transcribing",
  ANSWERING: "answering",
  DONE: "done",
  ERROR: "error",
};

function VoiceRecorder({
  sessionId,
  questionId,
  question,
  onTranscriptReady,
  onAnswerReady,
  onDone
}) {
  const [state, setState] = useState(RecordingState.IDLE);
  const [transcript, setTranscript] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError("");
      setTranscript("");
      setAiAnswer("");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;

      // Create MediaRecorder with webm format (widely supported, no ffmpeg needed)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        handleRecordingComplete();
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setError("Recording failed. Please try again.");
        setState(RecordingState.ERROR);
        cleanupStream();
      };

      mediaRecorder.start(1000); // Collect data every second
      setState(RecordingState.RECORDING);
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setError(`Failed to start recording: ${err.message}`);
      }
      setState(RecordingState.ERROR);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
  }, []);

  // Clean up media stream
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Handle recording complete - transcribe and get AI answer
  const handleRecordingComplete = async () => {
    setState(RecordingState.UPLOADING);

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      if (audioBlob.size < 1000) {
        throw new Error("Recording too short. Please speak for at least a few seconds.");
      }

      // Upload for transcription
      setState(RecordingState.TRANSCRIBING);
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeResponse = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.details || "Transcription failed");
      }

      const { transcript: transcribedText } = await transcribeResponse.json();
      setTranscript(transcribedText);

      if (onTranscriptReady) {
        onTranscriptReady(transcribedText);
      }

      // Get AI answer/feedback
      setState(RecordingState.ANSWERING);

      const answerResponse = await fetch(`${API_BASE_URL}/api/interview/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId || `session_${Date.now()}`,
          questionId: questionId || `q_${Date.now()}`,
          transcript: transcribedText,
          question: question,
        }),
      });

      if (!answerResponse.ok) {
        const errorData = await answerResponse.json();
        throw new Error(errorData.details || "Failed to process answer");
      }

      const { aiAnswer: feedback } = await answerResponse.json();
      setAiAnswer(feedback);

      if (onAnswerReady) {
        onAnswerReady(feedback);
      }

      setState(RecordingState.DONE);
    } catch (err) {
      console.error("Processing error:", err);
      setError(err.message || "An error occurred while processing your answer.");
      setState(RecordingState.ERROR);
    }
  };

  // Reset to idle state
  const reset = () => {
    setState(RecordingState.IDLE);
    setTranscript("");
    setAiAnswer("");
    setError("");
  };

  // Handle done button
  const handleDone = () => {
    if (onDone) {
      onDone(transcript);
    }
    reset();
  };

  // Get button text based on state
  const getButtonText = () => {
    switch (state) {
      case RecordingState.IDLE:
        return "Start Recording";
      case RecordingState.RECORDING:
        return "Speaking...";
      case RecordingState.UPLOADING:
        return "Uploading...";
      case RecordingState.TRANSCRIBING:
        return "Transcribing...";
      case RecordingState.ANSWERING:
        return "Getting Feedback...";
      case RecordingState.DONE:
        return "Done";
      case RecordingState.ERROR:
        return "Try Again";
      default:
        return "Start Recording";
    }
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    return [
      RecordingState.UPLOADING,
      RecordingState.TRANSCRIBING,
      RecordingState.ANSWERING,
    ].includes(state);
  };

  // Handle button click
  const handleButtonClick = () => {
    switch (state) {
      case RecordingState.IDLE:
        startRecording();
        break;
      case RecordingState.RECORDING:
        stopRecording();
        break;
      case RecordingState.ERROR:
        reset();
        break;
      case RecordingState.DONE:
        handleDone();
        break;
      default:
        break;
    }
  };

  return (
    <div className="voiceRecorder">
      {/* Status indicator */}
      {state !== RecordingState.IDLE && (
        <div className={`voiceStatus voiceStatus--${state}`}>
          {state === RecordingState.RECORDING && (
            <span className="recordingIndicator" />
          )}
          <span className="statusText">{getButtonText()}</span>
        </div>
      )}

      {/* Transcript display */}
      {transcript && (
        <div className="transcriptBox">
          <h4>Your Answer:</h4>
          <p className="transcriptText">{transcript}</p>
        </div>
      )}

      {/* AI Feedback display */}
      {aiAnswer && (
        <div className="aiFeedbackBox">
          <h4>AI Feedback:</h4>
          <p className="aiFeedbackText">{aiAnswer}</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="errorBox">
          <p className="errorText">{error}</p>
        </div>
      )}

      {/* Main action button */}
      <button
        onClick={handleButtonClick}
        disabled={isButtonDisabled()}
        className={`voiceRecordBtn ${state === RecordingState.RECORDING ? "voiceRecordBtn--recording" : ""} ${state === RecordingState.DONE ? "voiceRecordBtn--done" : ""}`}
      >
        {state === RecordingState.RECORDING && (
          <span className="recordingDot" />
        )}
        {getButtonText()}
      </button>
    </div>
  );
}

export default VoiceRecorder;
export { RecordingState };
