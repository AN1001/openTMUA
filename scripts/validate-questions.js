// Validates data/questions.json — run with: node scripts/validate-questions.js
// No dependencies; exits non-zero (fails CI) if any problem is found.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "questions.json");
const KEYS = ["A", "B", "C", "D", "E"];
const REQUIRED = ["id", "paper", "topic", "source", "stem", "working"];
const PAPERS = ["Paper 1", "Paper 2"];
// Kebab-case ids like p1-alg-03 (see CONTRIBUTING.md).
const ID_FORMAT = /^p[12]-[a-z]+(-[a-z]+)*-\d{2,}$/;
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

const seenIds = new Set();
questions.forEach((q, i) => {
  const where =
    `question ${i + 1}` + (q && typeof q.id === "string" ? ` (${q.id})` : "");
  const err = (msg) => errors.push(`${where}: ${msg}`);

  for (const field of REQUIRED) {
    if (typeof q[field] !== "string" || !q[field].trim())
      err(`missing or empty "${field}"`);
  }

  if (typeof q.id === "string") {
    if (seenIds.has(q.id)) err(`duplicate id "${q.id}"`);
    seenIds.add(q.id);
    if (!ID_FORMAT.test(q.id))
      err(
        `id "${q.id}" must be kebab-case like "p1-alg-03" (p<paper>-<topic-abbrev>-<number>)`,
      );
  }

  if (typeof q.paper === "string" && !PAPERS.includes(q.paper))
    err(`"paper" must be one of ${PAPERS.join(", ")} (got "${q.paper}")`);

  if (!Array.isArray(q.options) || q.options.length !== KEYS.length) {
    err(`"options" must be an array of exactly ${KEYS.length} entries`);
    return;
  }

  let correctCount = 0;
  q.options.forEach((opt, j) => {
    if (opt.key !== KEYS[j])
      err(`option ${j + 1} key must be "${KEYS[j]}" (got "${opt.key}")`);
    if (typeof opt.text !== "string" || !opt.text.trim())
      err(`option ${KEYS[j]} has missing or empty "text"`);
    if (typeof opt.correct !== "boolean")
      err(`option ${KEYS[j]} "correct" must be a boolean`);
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
