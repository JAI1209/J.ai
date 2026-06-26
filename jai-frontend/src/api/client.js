// Central place for all backend calls. No API keys live here — ever.
// Set REACT_APP_API_URL in .env for local dev (defaults to localhost:5000).

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

/** Which providers are configured on the server right now */
export function getProviders() {
  return request("/api/providers");
}

/**
 * Run a prompt through optimize/generate. Returns result + token stats +
 * before/after scores + diff (diff is null in generate mode).
 */
export function processPrompt({ input, mode, provider }) {
  return request("/api/process", {
    method: "POST",
    body: JSON.stringify({ input, mode, provider }),
  });
}

/** Pure scoring, no LLM call — safe to call on every keystroke (debounced) */
export function scorePromptOnly(input) {
  return request("/api/score", {
    method: "POST",
    body: JSON.stringify({ input }),
  });
}
