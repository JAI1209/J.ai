const express = require("express");
const { runProvider, listProviders } = require("../services/providers");
const { scorePrompt, diffPrompts } = require("../services/scoringEngine");
const { estimateSavings } = require("../services/pricing");
const historyStore = require("../services/historyStore");
const { validatePromptInput } = require("../middleware/validate");

const router = express.Router();

/** GET /api/providers - which AI providers are configured server-side */
router.get("/providers", (req, res) => {
  res.json({ providers: listProviders() });
});

/**
 * POST /api/process
 * body: { input, mode: 'optimize'|'generate', provider: 'groq'|'gemini'|... }
 * Runs the prompt through the chosen provider, then scores BOTH the
 * original and the result, and (if mode === 'optimize') returns a diff.
 */
router.post("/process", validatePromptInput, async (req, res) => {
  const { input, mode = "optimize", provider = "groq" } = req.body;

  try {
    const result = await runProvider(provider, { mode, input });

    const originalScore = scorePrompt(input);
    const resultScore = scorePrompt(result);
    const diff = mode === "optimize" ? diffPrompts(input, result) : null;

    const beforeWords = input.trim().split(/\s+/).filter(Boolean).length;
    const afterWords = result.trim().split(/\s+/).filter(Boolean).length;

    const savings = estimateSavings({ provider, beforeWords, afterWords });

    const record = historyStore.addRecord({
      mode,
      provider,
      createdAt: new Date().toISOString(),
      tokens: {
        before: beforeWords,
        after: afterWords,
        saved: beforeWords - afterWords,
        percent: beforeWords > 0 ? Math.round(((beforeWords - afterWords) / beforeWords) * 100) : 0,
      },
      scoreFinalBefore: originalScore.final,
      scoreFinalAfter: resultScore.final,
      costSaved: mode === "optimize" ? savings.costSaved : null,
      inputPreview: input.slice(0, 120),
      resultPreview: result.slice(0, 120),
    });

    res.json({
      result,
      provider,
      mode,
      tokens: record.tokens,
      scores: { original: originalScore, result: resultScore },
      diff,
      savings,
      recordId: record.id,
    });
  } catch (err) {
    res.status(502).json({ error: err.message || "Provider request failed." });
  }
});

/**
 * POST /api/score
 * body: { input }
 * Pure scoring, no LLM call — instant and free. Useful for live "as you type" feedback.
 */
router.post("/score", validatePromptInput, (req, res) => {
  const { input } = req.body;
  res.json({ scores: scorePrompt(input) });
});

/**
 * POST /api/diff
 * body: { original, optimized }
 */
router.post("/diff", (req, res) => {
  const { original, optimized } = req.body || {};
  if (typeof original !== "string" || typeof optimized !== "string") {
    return res.status(400).json({ error: "`original` and `optimized` are required strings." });
  }
  res.json({ diff: diffPrompts(original, optimized) });
});

/**
 * GET /api/dashboard
 * Aggregate stats for the usage analytics dashboard: total tokens/cost
 * saved, request counts, and a 14-day trend.
 */
router.get("/dashboard", (req, res) => {
  res.json(historyStore.getSummary());
});

/**
 * GET /api/history?limit=50
 * Recent optimize/generate events, most recent first.
 */
router.get("/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const all = historyStore.getAll();
  res.json({ history: all.slice(0, limit), total: all.length });
});

module.exports = router;
