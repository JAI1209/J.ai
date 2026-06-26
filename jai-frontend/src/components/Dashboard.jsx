import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getDashboard, getHistory } from "../api/dashboard";

function formatCost(n) {
  if (n == null) return "—";
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

function MiniBarChart({ trend }) {
  if (!trend || trend.length === 0) return null;
  const max = Math.max(...trend.map((t) => t.wordsSaved), 1);

  return (
    <div className="trend-chart">
      {trend.map((t) => (
        <div className="trend-bar-col" key={t.day} title={`${t.day}: ${t.wordsSaved} words saved across ${t.count} run(s)`}>
          <div
            className="trend-bar"
            style={{ height: `${Math.max(4, (t.wordsSaved / max) * 100)}%` }}
          />
          <span className="trend-day">{t.day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ onBack }) {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDashboard(), getHistory(10)])
      .then(([dash, hist]) => {
        setSummary(dash);
        setHistory(hist.history);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Back</button>
        <h2 className="dashboard-title">Usage Dashboard</h2>
      </div>

      {loading && <div className="dashboard-loading">Loading your usage data…</div>}
      {error && <div className="error-banner"><AlertTriangle /> {error}</div>}

      {!loading && !error && summary && (
        <>
          {summary.totalRequests === 0 ? (
            <div className="dashboard-empty">
              <p>No optimizations yet.</p>
              <p className="dashboard-empty-sub">Run a prompt through Optimize mode and your savings will show up here.</p>
            </div>
          ) : (
            <>
              <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-value">{summary.totalOptimizations}</div>
                  <div className="dashboard-stat-label">Prompts Optimized</div>
                </div>
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-value">{summary.wordsSaved}</div>
                  <div className="dashboard-stat-label">Words Saved</div>
                </div>
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-value green">{summary.percentSaved}%</div>
                  <div className="dashboard-stat-label">Avg. Reduction</div>
                </div>
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-value green">
                    {summary.costSaved != null ? formatCost(summary.costSaved) : "—"}
                  </div>
                  <div className="dashboard-stat-label">Est. Cost Saved</div>
                </div>
              </div>

              <p className="dashboard-note">
                Cost estimate based on configured provider's published per-token
                pricing and an approximate words→tokens conversion. Treat as
                directional, not a billing-accurate figure.
              </p>

              {summary.trend.length > 0 && (
                <div className="dashboard-section">
                  <div className="dashboard-section-title">Last 14 active days</div>
                  <MiniBarChart trend={summary.trend} />
                </div>
              )}

              <div className="dashboard-section">
                <div className="dashboard-section-title">Recent Activity</div>
                <div className="history-list">
                  {history.map((h) => (
                    <div className="history-row" key={h.id}>
                      <span className={`history-mode-badge ${h.mode}`}>{h.mode}</span>
                      <span className="history-preview">{h.inputPreview}{h.inputPreview?.length >= 120 ? "…" : ""}</span>
                      <span className="history-meta">
                        {h.mode === "optimize" ? `${h.tokens.percent}% smaller` : `${h.tokens.after} words`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
