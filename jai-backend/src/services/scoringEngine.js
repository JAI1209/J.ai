/**
 * Prompt Scoring Engine
 * ----------------------
 * Computes deterministic quality scores for a prompt WITHOUT calling an LLM.
 * This means scoring is instant, free, and explainable — good for a live demo
 * and good for an interview ("how did you compute this?" has a real answer).
 *
 * Five sub-scores (0-100 each), combined into a weighted final score.
 */

const VAGUE_WORDS = [
  "something", "stuff", "things", "good", "nice", "better", "some",
  "maybe", "kind of", "sort of", "etc", "and so on", "various",
];

const STRUCTURE_MARKERS = [
  /^#{1,3}\s/m,              // markdown headers
  /^\s*[-*]\s/m,             // bullet lists
  /^\s*\d+\.\s/m,            // numbered lists
  /```/,                     // code blocks
  /<[a-z_]+>/i,               // xml-style tags (e.g. <context>, <task>)
];

const CONSTRAINT_KEYWORDS = [
  "must", "should", "do not", "don't", "never", "always", "only",
  "exactly", "format", "constraint", "limit", "within", "no more than",
  "no less than", "required", "mandatory", "strictly",
];

const CONTEXT_KEYWORDS = [
  "context", "background", "for example", "e.g.", "given that",
  "audience", "purpose", "goal", "objective", "tone", "style",
  "who", "what", "when", "where", "why",
];

const DELIVERABLE_KEYWORDS = [
  "return", "output", "respond with", "provide", "generate", "create",
  "produce", "deliver", "give me", "write", "format as",
];

function countMatches(text, list) {
  const lower = text.toLowerCase();
  return list.reduce((acc, w) => acc + (lower.split(w.toLowerCase()).length - 1), 0);
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text) {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 1;
}

/** Clarity: penalize vague words, overly long sentences, ambiguous pronouns without referents */
function scoreClarity(text) {
  const words = wordCount(text);
  if (words === 0) return 0;

  const vagueHits = countMatches(text, VAGUE_WORDS);
  const sentences = sentenceCount(text);
  const avgSentenceLen = words / sentences;

  let score = 100;
  score -= Math.min(40, vagueHits * 8);                 // vague words hurt
  if (avgSentenceLen > 35) score -= 20;                  // run-on sentences
  if (avgSentenceLen > 50) score -= 15;
  if (words < 6) score -= 30;                            // too terse to be clear

  return clamp(score);
}

/** Specificity: rewards concrete nouns, numbers, named entities, explicit detail */
function scoreSpecificity(text) {
  const words = wordCount(text);
  if (words === 0) return 0;

  const numberHits = (text.match(/\d+/g) || []).length;
  const properNounHits = (text.match(/\b[A-Z][a-z]{2,}\b/g) || []).length;
  const deliverableHits = countMatches(text, DELIVERABLE_KEYWORDS);

  let score = 30;
  score += Math.min(25, numberHits * 6);
  score += Math.min(20, properNounHits * 3);
  score += Math.min(25, deliverableHits * 10);

  return clamp(score);
}

/** Constraint Quality: are there explicit rules, boundaries, must/never statements? */
function scoreConstraints(text) {
  const hits = countMatches(text, CONSTRAINT_KEYWORDS);
  let score = 20 + hits * 12;
  return clamp(score);
}

/** Context Quality: background info, audience, purpose, examples present? */
function scoreContext(text) {
  const hits = countMatches(text, CONTEXT_KEYWORDS);
  const hasExample = /for example|e\.g\.|such as|like this/i.test(text);
  let score = 25 + hits * 10 + (hasExample ? 15 : 0);
  return clamp(score);
}

/** Structure: headers, lists, code blocks, XML tags, paragraph breaks */
function scoreStructure(text) {
  let score = 20;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  score += Math.min(20, paragraphs * 5);

  STRUCTURE_MARKERS.forEach((re) => {
    if (re.test(text)) score += 15;
  });

  return clamp(score);
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Main entry point. Returns all sub-scores + weighted final score + a
 * human-readable breakdown the frontend can render directly.
 */
function scorePrompt(text) {
  if (!text || !text.trim()) {
    return {
      clarity: 0,
      specificity: 0,
      constraintQuality: 0,
      contextQuality: 0,
      structure: 0,
      llmReadiness: 0,
      final: 0,
      breakdown: [],
    };
  }

  const clarity = scoreClarity(text);
  const specificity = scoreSpecificity(text);
  const constraintQuality = scoreConstraints(text);
  const contextQuality = scoreContext(text);
  const structure = scoreStructure(text);

  // LLM Readiness = how "machine parseable" this is — weighted blend
  // favoring structure and constraints, since that's what actually
  // reduces ambiguity for a downstream model.
  const llmReadiness = clamp(
    structure * 0.35 + constraintQuality * 0.35 + clarity * 0.3
  );

  const weights = {
    clarity: 0.25,
    specificity: 0.2,
    constraintQuality: 0.2,
    contextQuality: 0.15,
    structure: 0.1,
    llmReadiness: 0.1,
  };

  const final = clamp(
    clarity * weights.clarity +
    specificity * weights.specificity +
    constraintQuality * weights.constraintQuality +
    contextQuality * weights.contextQuality +
    structure * weights.structure +
    llmReadiness * weights.llmReadiness
  );

  const breakdown = [
    { label: "Clarity", score: clarity, note: clarity < 60 ? "Reduce vague terms, shorten run-on sentences." : "Clear and direct." },
    { label: "Specificity", score: specificity, note: specificity < 60 ? "Add concrete details, numbers, or named examples." : "Sufficiently concrete." },
    { label: "Constraint Quality", score: constraintQuality, note: constraintQuality < 60 ? "State explicit rules (must/never/only) to reduce ambiguity." : "Constraints well defined." },
    { label: "Context Quality", score: contextQuality, note: contextQuality < 60 ? "Add background, audience, or purpose." : "Good contextual grounding." },
    { label: "Structure", score: structure, note: structure < 60 ? "Use headers, lists, or tags to organize." : "Well organized." },
    { label: "LLM Readiness", score: llmReadiness, note: llmReadiness < 60 ? "Tighten structure + constraints for better model parsing." : "Model-friendly format." },
  ];

  return { clarity, specificity, constraintQuality, contextQuality, structure, llmReadiness, final, breakdown };
}

/**
 * Lightweight diff: word-level comparison between original and optimized
 * prompt. Returns added / removed / preserved word groups.
 * Uses a simple LCS-based approach — good enough for prompt-length text.
 */
function diffPrompts(original, optimized) {
  const a = original.trim().split(/\s+/).filter(Boolean);
  const b = optimized.trim().split(/\s+/).filter(Boolean);

  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const removed = [];
  const added = [];
  const preserved = [];

  let i = m, j = n;
  const ops = [];
  while (i > 0 && j > 0) {
    if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
      ops.push({ type: "preserved", word: a[i - 1] });
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: "removed", word: a[i - 1] });
      i--;
    } else {
      ops.push({ type: "added", word: b[j - 1] });
      j--;
    }
  }
  while (i > 0) { ops.push({ type: "removed", word: a[i - 1] }); i--; }
  while (j > 0) { ops.push({ type: "added", word: b[j - 1] }); j--; }

  ops.reverse();

  // Collapse consecutive same-type words into groups for cleaner display
  const groups = [];
  for (const op of ops) {
    const last = groups[groups.length - 1];
    if (last && last.type === op.type) {
      last.text += " " + op.word;
    } else {
      groups.push({ type: op.type, text: op.word });
    }
  }

  groups.forEach((g) => {
    if (g.type === "added") added.push(g.text);
    if (g.type === "removed") removed.push(g.text);
    if (g.type === "preserved") preserved.push(g.text);
  });

  return { groups, added, removed, preserved };
}

module.exports = { scorePrompt, diffPrompts };
