export const PromptCard = ({ mode, setMode, input, setInput, model, setModel, loading, onProcess }) => {
  const MODELS = ["Groq", "Gemini"];

  return (
    <div className="prompt-card">
      <div className="mode-tabs">
        {["Optimize prompt", "Generate from brief"].map((m, i) => (
          <button key={i} className={`tab ${mode === i ? "active" : ""}`} onClick={() => setMode(i)}>
            {m}
          </button>
        ))}
      </div>

      <label className="input-label">{mode === 0 ? "Your prompt" : "Task brief"}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 0 ? "Paste your long prompt here..." : "Describe what you need..."}
        className="prompt-textarea"
      />

      <div className="model-select">
        <label>AI Model:</label>
        <div className="model-buttons">
          {MODELS.map((m) => (
            <button
              key={m}
              className={`model-btn ${model === m ? "active" : ""}`}
              onClick={() => setModel(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <button className="action-btn" onClick={onProcess} disabled={loading}>
        {loading ? "✨ Processing..." : mode === 0 ? "⚡ Optimize Now" : "🚀 Generate Prompt"}
      </button>
    </div>
  );
};