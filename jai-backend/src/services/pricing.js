/**
 * Provider Pricing (USD per 1,000,000 tokens)
 * ---------------------------------------------
 * Source: Groq official pricing (groq.com/pricing) and Google AI Gemini
 * API pricing (ai.google.dev/gemini-api/docs/pricing), checked June 2026.
 *
 * IMPORTANT: prices change. This is a best-effort estimate for showing
 * directional savings on a dashboard — not a billing-accurate ledger.
 * If you wire in OpenAI/Claude/DeepSeek later, add their rates here too.
 */
const PRICING = {
  groq: {
    // llama-3.1-8b-instant — the model actually used in providers.js
    inputPerMillion: 0.05,
    outputPerMillion: 0.08,
    label: "Groq (Llama 3.1 8B Instant)",
  },
  gemini: {
    // gemini-1.5-flash-latest — legacy-tier pricing as last verified.
    // NOTE: Google has since shipped newer Flash tiers (2.5 / 3.x) at
    // different rates. Treat this number as approximate.
    inputPerMillion: 0.35,
    outputPerMillion: 1.05,
    label: "Gemini 1.5 Flash",
  },
  openai: { inputPerMillion: null, outputPerMillion: null, label: "OpenAI" },
  claude: { inputPerMillion: null, outputPerMillion: null, label: "Claude" },
  deepseek: { inputPerMillion: null, outputPerMillion: null, label: "DeepSeek" },
};

// Rough word-to-token ratio for English text. Real tokenizers differ
// (BPE splits sub-words), but ~1.3 tokens/word is a standard estimate
// good enough for a directional cost dashboard.
const TOKENS_PER_WORD = 1.3;

function wordsToTokens(words) {
  return Math.round(words * TOKENS_PER_WORD);
}

/**
 * Estimate the $ cost of a request, and the $ saved by sending the
 * optimized version instead of the original, treating both as INPUT
 * tokens (this is what actually changes — the optimizer reduces what
 * you send, not what the model outputs).
 */
function estimateSavings({ provider, beforeWords, afterWords }) {
  const rate = PRICING[provider];
  if (!rate || rate.inputPerMillion == null) {
    return { costBefore: null, costAfter: null, costSaved: null, configured: false, label: rate?.label || provider };
  }

  const beforeTokens = wordsToTokens(beforeWords);
  const afterTokens = wordsToTokens(afterWords);

  const costBefore = (beforeTokens / 1_000_000) * rate.inputPerMillion;
  const costAfter = (afterTokens / 1_000_000) * rate.inputPerMillion;

  return {
    costBefore,
    costAfter,
    costSaved: costBefore - costAfter,
    configured: true,
    label: rate.label,
  };
}

module.exports = { PRICING, estimateSavings, wordsToTokens, TOKENS_PER_WORD };
