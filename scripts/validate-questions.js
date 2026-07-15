// Validates data/questions.json — run with: node scripts/validate-questions.js
// No dependencies; exits non-zero (fails CI) if any problem is found.
var fs = require('fs');
var path = require('path');

var file = path.join(__dirname, '..', 'data', 'questions.json');
var KEYS = ['A', 'B', 'C', 'D', 'E'];
var REQUIRED = ['id', 'paper', 'topic', 'source', 'stem', 'working'];
var errors = [];
var questions;

try {
  questions = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error('questions.json is not valid JSON: ' + e.message);
  process.exit(1);
}

if (!Array.isArray(questions)) {
  console.error('questions.json must be a top-level array of questions.');
  process.exit(1);
}

var seenIds = {};
questions.forEach(function (q, i) {
  var where = 'question ' + (i + 1) + (q && typeof q.id === 'string' ? ' (' + q.id + ')' : '');
  function err(msg) { errors.push(where + ': ' + msg); }

  REQUIRED.forEach(function (field) {
    if (typeof q[field] !== 'string' || !q[field].trim()) err('missing or empty "' + field + '"');
  });

  if (typeof q.id === 'string') {
    if (seenIds[q.id]) err('duplicate id "' + q.id + '"');
    seenIds[q.id] = true;
  }

  if (!Array.isArray(q.options) || q.options.length !== KEYS.length) {
    err('"options" must be an array of exactly ' + KEYS.length + ' entries');
    return;
  }

  var correctCount = 0;
  q.options.forEach(function (opt, j) {
    if (opt.key !== KEYS[j]) err('option ' + (j + 1) + ' key must be "' + KEYS[j] + '" (got "' + opt.key + '")');
    if (typeof opt.text !== 'string' || !opt.text.trim()) err('option ' + KEYS[j] + ' has missing or empty "text"');
    if (typeof opt.correct !== 'boolean') err('option ' + KEYS[j] + ' "correct" must be a boolean');
    if (opt.correct === true) correctCount += 1;
  });
  if (correctCount !== 1) err('must have exactly one correct option (found ' + correctCount + ')');
});

if (errors.length) {
  console.error('✗ ' + errors.length + ' problem(s) in questions.json:');
  errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}

console.log('✓ questions.json valid — ' + questions.length + ' questions.');
