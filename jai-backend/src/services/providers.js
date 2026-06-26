/**
 * Provider Abstraction Layer
 * ---------------------------
 * Every provider exposes the same shape: complete({ apiKey, mode, input }).
 * Adding a new provider (OpenAI, Claude, DeepSeek) = add one entry here,
 * no changes needed anywhere else in the app.
 */
const fetch = require("node-fetch");

const SYSTEM_PROMPTS = {
  optimize:
    "You are a prompt optimization expert. Rewrite the user's prompt to use minimum tokens while preserving 100% of the original intent, requirements, and constraints. Never remove meaning. Return ONLY the optimized prompt, no preamble.",
  generate:
    "You are an expert prompt engineer. Convert the user's brief into a complete, professional, highly structured AI prompt. Return ONLY the generated prompt, no preamble.",
};

function buildUserMessage(mode, input) {
  return mode === "generate"
    ? `Create a professional, well-structured AI prompt for this brief:\n${input}`
    : `Optimize this prompt:\n${input}`;
}

async function callGroq({ apiKey, mode, input }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] },
        { role: "user", content: buildUserMessage(mode, input) },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq request failed");
  return data.choices[0].message.content.trim();
}

async function callGemini({ apiKey, mode, input }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${SYSTEM_PROMPTS[mode]}\n\n${buildUserMessage(mode, input)}` }] },
        ],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Gemini request failed");
  return data.candidates[0].content.parts[0].text.trim();
}

// --- Stubs ready to fill in later. Same shape, just plug in the fetch call. ---
async function callOpenAI({ apiKey, mode, input }) {
  throw new Error("OpenAI provider not yet configured. Add OPENAI_API_KEY and implement callOpenAI.");
}
async function callClaude({ apiKey, mode, input }) {
  throw new Error("Claude provider not yet configured. Add ANTHROPIC_API_KEY and implement callClaude.");
}
async function callDeepSeek({ apiKey, mode, input }) {
  throw new Error("DeepSeek provider not yet configured.");
}

const PROVIDERS = {
  groq: { fn: callGroq, envKey: "GROQ_API_KEY", label: "Groq" },
  gemini: { fn: callGemini, envKey: "GEMINI_API_KEY", label: "Gemini" },
  openai: { fn: callOpenAI, envKey: "OPENAI_API_KEY", label: "OpenAI" },
  claude: { fn: callClaude, envKey: "ANTHROPIC_API_KEY", label: "Claude" },
  deepseek: { fn: callDeepSeek, envKey: "DEEPSEEK_API_KEY", label: "DeepSeek" },
};

function listProviders() {
  return Object.entries(PROVIDERS).map(([id, p]) => ({
    id,
    label: p.label,
    configured: Boolean(process.env[p.envKey]),
  }));
}

async function runProvider(providerId, { mode, input }) {
  const provider = PROVIDERS[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  const apiKey = process.env[provider.envKey];
  if (!apiKey) throw new Error(`${provider.label} is not configured on the server.`);

  return provider.fn({ apiKey, mode, input });
}

module.exports = { runProvider, listProviders, PROVIDERS };
