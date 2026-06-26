/**
 * History Store
 * --------------
 * Records every /api/process call so the dashboard can show real usage
 * over time. Backed by a single JSON file for now — zero setup, works
 * out of the box on any machine. Swap-out point for Postgres/Prisma
 * later: replace the 3 functions below, keep the same call sites.
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "history.json");
const MAX_RECORDS = 2000; // simple cap so the file doesn't grow forever

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readAll() {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(records) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

/** Append one optimization/generation event. */
function addRecord(record) {
  const records = readAll();
  records.push({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 8), ...record });
  // keep only the most recent MAX_RECORDS
  const trimmed = records.slice(-MAX_RECORDS);
  writeAll(trimmed);
  return trimmed[trimmed.length - 1];
}

/** Return all records, most recent first. */
function getAll() {
  return readAll().slice().reverse();
}

/** Aggregate stats across all history: total tokens/cost saved, counts, trend. */
function getSummary() {
  const records = readAll();

  let totalBeforeWords = 0;
  let totalAfterWords = 0;
  let totalCostSaved = 0;
  let totalOptimizations = 0;
  let totalGenerations = 0;
  let costSavedKnown = true;

  const byDay = {}; // 'YYYY-MM-DD' -> { wordsSaved, costSaved, count }

  for (const r of records) {
    if (r.mode === "optimize") {
      totalOptimizations++;
      totalBeforeWords += r.tokens?.before || 0;
      totalAfterWords += r.tokens?.after || 0;
      if (typeof r.costSaved === "number") {
        totalCostSaved += r.costSaved;
      } else {
        costSavedKnown = false;
      }

      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { wordsSaved: 0, costSaved: 0, count: 0 };
      byDay[day].wordsSaved += (r.tokens?.before || 0) - (r.tokens?.after || 0);
      byDay[day].costSaved += typeof r.costSaved === "number" ? r.costSaved : 0;
      byDay[day].count += 1;
    } else if (r.mode === "generate") {
      totalGenerations++;
    }
  }

  const wordsSaved = totalBeforeWords - totalAfterWords;
  const percentSaved = totalBeforeWords > 0 ? Math.round((wordsSaved / totalBeforeWords) * 100) : 0;

  const trend = Object.entries(byDay)
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => (a.day > b.day ? 1 : -1))
    .slice(-14); // last 14 days with activity

  return {
    totalOptimizations,
    totalGenerations,
    totalRequests: records.length,
    wordsSaved,
    percentSaved,
    costSaved: costSavedKnown ? totalCostSaved : null,
    costSavedPartial: !costSavedKnown,
    trend,
  };
}

module.exports = { addRecord, getAll, getSummary };
