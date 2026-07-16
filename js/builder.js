// Question builder: form on the left, live preview on the right, and a
// copy-to-clipboard button producing the JSON object ready to paste into
// data/questions.json. Uses the same renderMath as the practice page, so
// the preview is exactly what visitors will see.
import { renderMath } from "./math.js";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8; // matches scripts/validate-questions.js

const els = {
  paper: document.getElementById("fPaper"),
  topic: document.getElementById("fTopic"),
  difficulty: document.getElementById("fDifficulty"),
  source: document.getElementById("fSource"),
  stem: document.getElementById("fStem"),
  optionRows: document.getElementById("optionRows"),
  addOption: document.getElementById("addOption"),
  correctTiles: document.getElementById("correctTiles"),
  working: document.getElementById("fWorking"),
  copyBtn: document.getElementById("copyBtn"),
  copyStatus: document.getElementById("copyStatus"),
  problems: document.getElementById("problems"),
  jsonOut: document.getElementById("jsonOut"),
  pLabel: document.getElementById("pLabel"),
  pDifficulty: document.getElementById("pDifficulty"),
  pSource: document.getElementById("pSource"),
  pStem: document.getElementById("pStem"),
  pOptions: document.getElementById("pOptions"),
  pWorking: document.getElementById("pWorking"),
};

// ---------- Option rows (LHS) ----------

function keyFor(i) {
  return String.fromCharCode(65 + i); // 0 → "A", 1 → "B", …
}

// Which option key is marked correct — driven by the "Correct answer" tiles.
let correctKey = "B";

function addOptionRow(text = "") {
  const row = document.createElement("div");
  row.className = "option-row";

  const key = document.createElement("span");
  key.className = "key";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "$…$";
  input.value = text;
  input.addEventListener("input", update);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-btn";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Remove option");
  remove.addEventListener("click", () => {
    if (els.optionRows.children.length > MIN_OPTIONS) {
      row.remove();
      update();
    }
  });

  row.append(key, input, remove);
  els.optionRows.appendChild(row);
}

// One tile per option, formatted like the practice page's question palette.
function buildCorrectTiles() {
  const count = els.optionRows.children.length;
  // If the selected option was removed, fall back to the last one.
  if (correctKey.charCodeAt(0) - 65 >= count) correctKey = keyFor(count - 1);
  els.correctTiles.replaceChildren();
  for (let i = 0; i < count; i++) {
    const key = keyFor(i);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "correct-tile mono";
    tile.textContent = key;
    tile.setAttribute("aria-pressed", key === correctKey ? "true" : "false");
    tile.addEventListener("click", () => {
      correctKey = key;
      update();
    });
    els.correctTiles.appendChild(tile);
  }
}

els.addOption.addEventListener("click", () => {
  if (els.optionRows.children.length < MAX_OPTIONS) {
    addOptionRow();
    update();
  }
});

function readOptions() {
  return [...els.optionRows.children].map((row, i) => ({
    key: keyFor(i),
    text: row.querySelector('input[type="text"]').value,
    correct: keyFor(i) === correctKey,
  }));
}

// ---------- Assemble the question object ----------

function readQuestion() {
  return {
    paper: els.paper.value,
    topic: els.topic.value.trim(),
    difficulty: parseFloat(els.difficulty.value),
    source: els.source.value.trim(),
    stem: els.stem.value.trim(),
    options: readOptions(),
    working: els.working.value.trim(),
  };
}

// Mirror scripts/validate-questions.js so problems surface before the PR.
function findProblems(q) {
  const problems = [];
  if (!q.topic) problems.push('"topic" is empty');
  if (!q.source) problems.push('"source" is empty');
  if (!q.stem) problems.push('"stem" is empty');
  if (!q.working) problems.push('"working" is empty');
  if (Number.isNaN(q.difficulty) || q.difficulty < 1 || q.difficulty > 9)
    problems.push('"difficulty" must be a number from 1.0 to 9.0');
  q.options.forEach((o) => {
    if (!o.text.trim()) problems.push(`option ${o.key} is empty`);
  });
  const correctCount = q.options.filter((o) => o.correct).length;
  if (correctCount !== 1)
    problems.push(`exactly one option must be correct (${correctCount} marked)`);
  return problems;
}

// Serialise to the same compact style as data/questions.json: 2-space
// indent, each option on one line. JSON.stringify handles all escaping.
function toJsonSnippet(q) {
  const s = JSON.stringify;
  const opts = q.options
    .map(
      (o, i) =>
        `    { "key": ${s(o.key)}, "text": ${s(o.text)}, "correct": ${o.correct} }` +
        (i < q.options.length - 1 ? "," : ""),
    )
    .join("\n");
  return [
    "{",
    `  "paper": ${s(q.paper)},`,
    `  "topic": ${s(q.topic)},`,
    `  "difficulty": ${Number.isNaN(q.difficulty) ? 0 : q.difficulty.toFixed(1)},`,
    `  "source": ${s(q.source)},`,
    `  "stem": ${s(q.stem)},`,
    '  "options": [',
    opts,
    "  ],",
    `  "working": ${s(q.working)}`,
    "}",
  ].join("\n");
}

// ---------- Live preview (RHS) ----------

function renderPreview(q) {
  els.pLabel.textContent = q.topic ? `Q. ${q.topic}` : "Q. —";
  els.pDifficulty.textContent = Number.isNaN(q.difficulty)
    ? ""
    : `Difficulty ${q.difficulty.toFixed(1)}`;
  els.pSource.textContent = q.source || "—";
  renderMath(q.stem || "Your question appears here…", els.pStem);

  els.pOptions.replaceChildren();
  for (const opt of q.options) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.disabled = true;
    if (opt.correct) btn.classList.add("correct");
    const tag = document.createElement("span");
    tag.className = "tag mono";
    tag.textContent = opt.key;
    const text = document.createElement("span");
    renderMath(opt.text, text);
    btn.append(tag, text);
    li.appendChild(btn);
    els.pOptions.appendChild(li);
  }

  renderMath(q.working, els.pWorking);
}

// ---------- Wire it all up ----------

function update() {
  relabelKeys();
  buildCorrectTiles();
  const q = readQuestion();
  renderPreview(q);
  els.jsonOut.textContent = toJsonSnippet(q);
  els.addOption.disabled = els.optionRows.children.length >= MAX_OPTIONS;
  const problems = findProblems(q);
  els.problems.replaceChildren(
    ...problems.map((p) => {
      const li = document.createElement("li");
      li.textContent = p;
      return li;
    }),
  );
}

for (const input of [els.paper, els.topic, els.difficulty, els.source, els.stem, els.working]) {
  input.addEventListener("input", update);
}

els.copyBtn.addEventListener("click", async () => {
  const snippet = toJsonSnippet(readQuestion());
  try {
    await navigator.clipboard.writeText(snippet);
    els.copyStatus.textContent = "Copied ✓";
  } catch {
    // Clipboard API unavailable (e.g. non-secure context): select the raw
    // JSON so a manual Ctrl/Cmd+C works.
    els.jsonOut.closest("details").open = true;
    window.getSelection().selectAllChildren(els.jsonOut);
    els.copyStatus.textContent = "Press Ctrl/Cmd+C to copy";
  }
  setTimeout(() => {
    els.copyStatus.textContent = "";
  }, 2500);
});

// Keys are assigned by position on every update, so removing a middle
// option re-letters the ones after it.
function relabelKeys() {
  [...els.optionRows.children].forEach((row, i) => {
    row.querySelector(".key").textContent = keyFor(i);
  });
}

// Start with five prefilled options matching the default stem ($1+1$),
// so the page loads showing a complete, valid question. correctKey starts
// on "B" ($2$) to match.
for (const text of ["$1$", "$2$", "$3$", "$4$", "$5$"]) addOptionRow(text);
update();
