import { useEffect, useRef, useState } from "react";

export default function useTypewriter(text, speed = 50, active = true) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!active || typeof text !== "string") return;

    // Reset state safely
    setDisplayedText("");
    indexRef.current = 0;

    const typeNext = () => {
      // 🔒 HARD STOP — prevents undefined
      if (indexRef.current >= text.length) return;

      const char = text[indexRef.current];
      indexRef.current += 1;

      setDisplayedText((prev) => prev + char);

      timeoutRef.current = setTimeout(typeNext, speed);
    };

    // Start typing
    timeoutRef.current = setTimeout(typeNext, speed);

    // Cleanup — CRITICAL for Strict Mode
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, active]);

  return displayedText;
}
