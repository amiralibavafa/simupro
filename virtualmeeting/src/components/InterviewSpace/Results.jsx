// Results.jsx
// Results view - displays score badge, evidence, feedback, and LeetCode recommendations

import "./interview.css";

function Results({ analysis, onBack, onNewSession }) {
  const getScoreColorClass = (score) => {
    if (score <= 30) return "scoreBadge--red";
    if (score <= 70) return "scoreBadge--yellow";
    return "scoreBadge--green";
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "difficultyBadge--easy";
      case "Medium": return "difficultyBadge--medium";
      case "Hard": return "difficultyBadge--hard";
      default: return "difficultyBadge--medium";
    }
  };

  if (!analysis) {
    return (
      <div className="resultsSection">
        <h3 className="resultsTitle">No Results Available</h3>
        <p className="resultsError">Analysis data is not available.</p>
        <div className="resultsButtons">
          <button onClick={onNewSession} className="resultBtn resultBtn--primary">
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const scoreValue = analysis.score?.value ?? 0;
  const scoreColor = getScoreColorClass(scoreValue);
  const scoreSummary = analysis.score?.summary || "";
  const feedback = analysis.overall_feedback || [];
  const evidence = analysis.evidence || [];
  const leetcode = analysis.leetcode_recommendations || [];

  return (
    <div className="resultsSection">
      <h3 className="resultsTitle">Your Interview Results</h3>

      {/* Score Badge */}
      <div className={`scoreBadge ${scoreColor}`}>
        <span className="scoreValue">{scoreValue}</span>
        <span className="scoreLabel">/ 100</span>
      </div>

      {/* Score Summary */}
      {scoreSummary && (
        <p className="scoreSummary">{scoreSummary}</p>
      )}

      {/* Evidence Section - What was observed */}
      {evidence.length > 0 && (
        <div className="evidenceSection">
          <h4>What We Observed</h4>
          <ul className="evidenceList">
            {evidence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback Section */}
      {feedback.length > 0 && (
        <div className="feedbackSection">
          <h4>Areas for Improvement</h4>
          <ul className="feedbackList">
            {feedback.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* LeetCode Recommendations */}
      {leetcode.length > 0 && (
        <div className="leetcodeSection">
          <h4>Recommended Practice Problems</h4>
          <ul className="leetcodeList">
            {leetcode.map((rec, idx) => (
              <li key={idx} className="leetcodeItem">
                <div className="leetcodeHeader">
                  <a
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcodeLink"
                  >
                    {rec.title}
                  </a>
                  {rec.difficulty && (
                    <span className={`difficultyBadge ${getDifficultyClass(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                  )}
                </div>
                {rec.why_this && (
                  <p className="leetcodeWhy">{rec.why_this}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Answers Analyzed Count */}
      {analysis.answersAnalyzed && (
        <p className="answersCount">
          Based on {analysis.answersAnalyzed} answer{analysis.answersAnalyzed !== 1 ? 's' : ''} provided
        </p>
      )}

      {/* Timestamp */}
      {analysis.analyzedAt && (
        <p className="resultsTimestamp">
          Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
        </p>
      )}

      {/* Action Buttons */}
      <div className="resultsButtons">
        <button onClick={onBack} className="resultBtn resultBtn--secondary">
          Back
        </button>
        <button onClick={onNewSession} className="resultBtn resultBtn--primary">
          New Interview
        </button>
      </div>
    </div>
  );
}

export default Results;
