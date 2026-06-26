export const ScorePanel = ({ title, scores }) => {
  if (!scores) return null;

  const ringColor = (n) => (n >= 75 ? "#22c55e" : n >= 50 ? "#7F77DD" : "#ef4444");

  return (
    <div className="score-panel">
      <div className="score-panel-header">
        <span className="score-panel-title">{title}</span>
        <span className="score-final" style={{ color: ringColor(scores.final) }}>
          {scores.final}<span className="score-final-max">/100</span>
        </span>
      </div>

      <div className="score-bars">
        {scores.breakdown.map((item) => (
          <div className="score-bar-row" key={item.label} title={item.note}>
            <span className="score-bar-label">{item.label}</span>
            <div className="score-bar-track">
              <div
                className="score-bar-fill"
                style={{ width: `${item.score}%`, background: ringColor(item.score) }}
              />
            </div>
            <span className="score-bar-value">{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
