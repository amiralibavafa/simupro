// VoiceRecorder.jsx
// Voice recording using FREE Web Speech API (no OpenAI)
// Works in Chrome on macOS

import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5005";

// Get SpeechRecognition API (Chrome uses webkit prefix)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function VoiceRecorder({ sessionId, questionId, question, onDone }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const recognitionRef = useRef(null);

  // Check browser support
  const isSupported = !!SpeechRecognition;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      setTranscript((prev) => {
        if (finalTranscript) {
          return prev + finalTranscript;
        }
        return prev;
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setError("");
    setTranscript("");
    setSaved(false);

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError("Failed to start voice recognition.");
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  // Save transcript to backend
  const saveTranscript = useCallback(async () => {
    if (!transcript.trim()) {
      setError("No transcript to save. Please speak first.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || `session_${Date.now()}`,
          questionId: questionId || `q_${Date.now()}`,
          transcript: transcript.trim(),
          question: question || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to save");
      }

      setSaved(true);
    } catch (err) {
      console.error("Save error:", err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [transcript, sessionId, questionId, question]);

  // Handle done - save and callback
  const handleDone = useCallback(async () => {
    if (!saved && transcript.trim()) {
      await saveTranscript();
    }
    if (onDone) {
      onDone(transcript.trim());
    }
  }, [saved, transcript, saveTranscript, onDone]);

  // Not supported
  if (!isSupported) {
    return (
      <div className="voiceRecorder">
        <div className="errorBox">
          <p className="errorText">
            Voice input not supported in this browser. Please use Chrome.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="voiceRecorder">
      {/* Status */}
      {isListening && (
        <div className="voiceStatus voiceStatus--recording">
          <span className="recordingIndicator" />
          <span>Speaking...</span>
        </div>
      )}

      {isSaving && (
        <div className="voiceStatus voiceStatus--uploading">
          <span>Saving...</span>
        </div>
      )}

      {saved && (
        <div className="voiceStatus voiceStatus--done">
          <span>Saved!</span>
        </div>
      )}

      {/* Transcript display */}
      {transcript && (
        <div className="transcriptBox">
          <h4>Your Answer:</h4>
          <p className="transcriptText">{transcript}</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="errorBox">
          <p className="errorText">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="voiceButtons">
        {!isListening ? (
          <button
            onClick={startListening}
            className="voiceRecordBtn"
            disabled={isSaving}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="voiceRecordBtn voiceRecordBtn--recording"
          >
            <span className="recordingDot" />
            Speaking...
          </button>
        )}

        {transcript && !isListening && (
          <button
            onClick={handleDone}
            className="voiceRecordBtn voiceRecordBtn--done"
            disabled={isSaving}
          >
            {saved ? "Next Question" : "Done"}
          </button>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder;
