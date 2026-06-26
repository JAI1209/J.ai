const MAX_INPUT_LENGTH = 8000; // ~ generous prompt length cap, prevents abuse

function validatePromptInput(req, res, next) {
  const { input, mode, provider } = req.body || {};

  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "`input` is required and must be a non-empty string." });
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: `\`input\` exceeds max length of ${MAX_INPUT_LENGTH} characters.` });
  }
  if (mode && !["optimize", "generate"].includes(mode)) {
    return res.status(400).json({ error: "`mode` must be 'optimize' or 'generate'." });
  }
  if (provider && typeof provider !== "string") {
    return res.status(400).json({ error: "`provider` must be a string." });
  }

  next();
}

module.exports = { validatePromptInput, MAX_INPUT_LENGTH };
