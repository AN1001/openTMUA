// Validates data/questions.json — run with: node scripts/validate-questions.js
// No dependencies; exits non-zero (fails CI) if any problem is found.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "questions.json");
const REQUIRED = ["paper", "topic", "source", "stem", "working"];
const PAPERS = ["Paper 1", "Paper 2"];
const errors = [];
let questions;

try {
  questions = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
  console.error(`questions.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(questions)) {
  console.error("questions.json must be a top-level array of questions.");
  process.exit(1);
}

// Progress is keyed off a hash of the stem (see js/practice.js), so two
// questions sharing an identical stem would share saved progress — treat that
// as an error rather than a silent collision.
const seenStems = new Set();
questions.forEach((q, i) => {
  const where = `question ${i + 1}`;
  const err = (msg) => errors.push(`${where}: ${msg}`);

  for (const field of REQUIRED) {
    if (typeof q[field] !== "string" || !q[field].trim())
      err(`missing or empty "${field}"`);
  }

  // Difficulty mirrors the TMUA grade: a number from 1.0 to 9.0, shown next
  // to the topic on the practice page.
  if (typeof q.difficulty !== "number" || Number.isNaN(q.difficulty))
    err(`missing or invalid "difficulty" (must be a number)`);
  else if (q.difficulty < 1 || q.difficulty > 9)
    err(`"difficulty" must be between 1.0 and 9.0 (got ${q.difficulty})`);

  if (typeof q.stem === "string" && q.stem.trim()) {
    if (seenStems.has(q.stem)) err(`duplicate stem (must be unique)`);
    seenStems.add(q.stem);
  }

  if (typeof q.paper === "string" && !PAPERS.includes(q.paper))
    err(`"paper" must be one of ${PAPERS.join(", ")} (got "${q.paper}")`);

  if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8) {
    err(`"options" must be an array of 2 to 8 entries`);
    return;
  }

  let correctCount = 0;
  q.options.forEach((opt, j) => {
    // Keys must be sequential capitals starting at A (A, B, C, …).
    const expectedKey = String.fromCharCode(65 + j);
    if (opt.key !== expectedKey)
      err(`option ${j + 1} key must be "${expectedKey}" (got "${opt.key}")`);
    if (typeof opt.text !== "string" || !opt.text.trim())
      err(`option ${expectedKey} has missing or empty "text"`);
    if (typeof opt.correct !== "boolean")
      err(`option ${expectedKey} "correct" must be a boolean`);
    if (opt.correct === true) correctCount += 1;
  });
  if (correctCount !== 1)
    err(`must have exactly one correct option (found ${correctCount})`);
});

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in questions.json:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ questions.json valid — ${questions.length} questions.`);
