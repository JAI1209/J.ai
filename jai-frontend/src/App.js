import { useState, useEffect } from "react";
import {
  Zap,
  BarChart3,
  Wrench,
  Lock,
  Sparkles,
  Rocket,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Target,
} from "lucide-react";
import { AnimatedBG } from "./components/AnimatedBG";
import { ScorePanel } from "./components/ScorePanel";
import { DiffViewer } from "./components/DiffViewer";
import Dashboard from "./components/Dashboard";
import { getProviders, processPrompt } from "./api/client";
import "./App.css";

// Icon + wordmark as one unit: the gem mark, then ".ai" set in the same
// display face as the headline so it reads as a continuation of the
// mark rather than a separate label next to it.
const Brand = () => (
  <div className="brand">
    <img src="/jai-icon.png" alt="" className="brand-icon" />
    <h1 className="title">
      <span className="title-dot-ai">.ai</span>
    </h1>
  </div>
);

export default function App() {
  const [view, setView] = useState("optimize"); // 'optimize' | 'dashboard'
  const [mode, setMode] = useState(0); // 0 = optimize, 1 = generate
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState(null);
  const [scores, setScores] = useState(null);
  const [diff, setDiff] = useState(null);
  const [copied, setCopied] = useState(false);

  // Discover which providers the backend has configured. No keys ever
  // touch the browser — we just learn which ones are available.
  useEffect(() => {
    getProviders()
      .then(({ providers: list }) => {
        setProviders(list);
        const firstConfigured = list.find((p) => p.configured);
        setProvider(firstConfigured ? firstConfigured.id : list[0]?.id);
      })
      .catch(() => setError("Could not reach J.ai backend. Is it running?"));
  }, []);

  const process = async () => {
    if (!input.trim() || !provider) return;
    setLoading(true);
    setError("");
    setOutput("");
    setTokens(null);
    setScores(null);
    setDiff(null);

    try {
      const data = await processPrompt({
        input,
        mode: mode === 0 ? "optimize" : "generate",
        provider,
      });
      setOutput(data.result);
      setTokens(data.tokens);
      setScores(data.scores);
      setDiff(data.diff);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <AnimatedBG />

      {view === "dashboard" ? (
        <div className="container-dashboard">
          <Dashboard onBack={() => setView("optimize")} />
        </div>
      ) : (
        <div className="container">
          <div className="header">
            <Brand />
            <p className="tagline">Write less. Mean more.</p>

            <button className="dashboard-link" onClick={() => setView("dashboard")}>
              <BarChart3 /> View usage dashboard
            </button>

            <div className="features">
              <div className="feature">
                <div className="feature-icon"><Zap /></div>
                <div className="feature-text">Optimize any prompt in seconds using AI</div>
              </div>
              <div className="feature">
                <div className="feature-icon"><BarChart3 /></div>
                <div className="feature-text">See clarity, structure & constraint scores instantly</div>
              </div>
              <div className="feature">
                <div className="feature-icon"><Wrench /></div>
                <div className="feature-text">Generate perfect prompts from simple briefs</div>
              </div>
              <div className="feature">
                <div className="feature-icon"><Lock /></div>
                <div className="feature-text">Keys stay server-side — nothing exposed in your browser</div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-title">Optimize Now</h2>

            <div className="bento-grid">
              <div className="bento-cell bento-composer">
                <div className="form-group">
                  <div className="mode-tabs">
                    {["Optimize prompt", "Generate from brief"].map((m, i) => (
                      <button
                        key={i}
                        className={`tab ${mode === i ? "active" : ""}`}
                        onClick={() => setMode(i)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{mode === 0 ? "Your prompt" : "Task brief"}</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      mode === 0
                        ? "Paste your long prompt here... We'll optimize it!"
                        : "Describe what you need... e.g., I need a marketing email for young professionals about a fitness app"
                    }
                    className="prompt-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AI Model</label>
                  <div className="model-select">
                    {providers.map((p) => (
                      <button
                        key={p.id}
                        className={`model-btn ${provider === p.id ? "active" : ""}`}
                        onClick={() => setProvider(p.id)}
                        disabled={!p.configured}
                        title={!p.configured ? `${p.label} not configured on server` : ""}
                      >
                        {p.label}{!p.configured && <Lock />}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="action-btn" onClick={process} disabled={loading || !provider}>
                  {loading ? (
                    <><Loader2 className="spin" /> Processing...</>
                  ) : mode === 0 ? (
                    <><Zap /> Optimize Now</>
                  ) : (
                    <><Rocket /> Generate Prompt</>
                  )}
                </button>

                {error && (
                  <div className="error-banner">
                    <AlertTriangle /> {error}
                  </div>
                )}
              </div>

              <div className="bento-cell bento-score">
                {scores ? (
                  <ScorePanel title="Result Score" scores={scores.result} />
                ) : (
                  <div className="bento-score-empty">
                    <Target />
                    <p>Run a prompt to see its score</p>
                  </div>
                )}
              </div>
            </div>

            {output && (
              <div className="output-card">
                <div className="output-label"><Sparkles /> Result</div>
                <div className="output-text">{output}</div>

                {tokens && (
                  <div className="stats-grid">
                    <div className="stat-box">
                      <div className="stat-value">{tokens.before}</div>
                      <div className="stat-label">Original</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{tokens.after}</div>
                      <div className="stat-label">Optimized</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value green">{tokens.saved}</div>
                      <div className="stat-label">Saved</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value green">{tokens.percent}%</div>
                      <div className="stat-label">Reduction</div>
                    </div>
                  </div>
                )}

                <button className="copy-btn" onClick={copy}>
                  {copied ? <><Check /> Copied!</> : <><Copy /> Copy result</>}
                </button>
              </div>
            )}

            {diff && <DiffViewer diff={diff} />}

            {scores && (
              <div className="score-panels-row">
                <ScorePanel title="Before" scores={scores.original} />
                <ScorePanel title="After" scores={scores.result} />
              </div>
)}
          </div>

          <footer className="site-footer">
            Built by <a href="https://jaiportfolioreact.netlify.app" target="_blank" rel="noopener noreferrer">Jai Surya Kumar</a>
          </footer>
        </div>
      )}
    </div>
  );
}
