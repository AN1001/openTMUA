import { renderMath } from "./math.js";

// A small, stable FNV-ish string hash → short base-36 id, used to key each
// question's saved progress in localStorage without hand-numbering the JSON.
function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return "q" + (h >>> 0).toString(36);
}

let allQuestions = [];
let filtered = [];
let currentIndex = 0;
let currentTopic = "All";
// answers[id] = { state: 'correct' | 'incorrect', key: 'A'..'E' } — the outcome and
// which option was picked, so a reload can restore the exact selection. Persisted to
// localStorage; stays entirely in the visitor's own browser — nothing is transmitted.
const STORAGE_KEY = "opentmua.answers.v1";
const answers = loadAnswers();

function loadAnswers() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Migrate legacy entries that stored only the state string.
    for (const id of Object.keys(parsed)) {
      if (typeof parsed[id] === "string")
        parsed[id] = { state: parsed[id], key: null };
    }
    return parsed;
  } catch {
    // localStorage can throw (private mode, disabled storage, corrupt JSON).
    // Fall back to in-memory only rather than breaking the page.
    return {};
  }
}

function saveAnswers() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // Storage unavailable/full — progress simply won't persist this session.
  }
}

const els = {
  pills: document.getElementById("topicPills"),
  palette: document.getElementById("palette"),
  statusLine: document.getElementById("statusLine"),
  progressFill: document.getElementById("progressFill"),
  qLabel: document.getElementById("qLabel"),
  qDifficulty: document.getElementById("qDifficulty"),
  qSource: document.getElementById("qSource"),
  qStem: document.getElementById("qStem"),
  options: document.getElementById("options"),
  feedback: document.getElementById("feedback"),
  feedbackTitle: document.getElementById("feedbackTitle"),
  feedbackBody: document.getElementById("feedbackBody"),
  feedbackWorking: document.getElementById("feedbackWorking"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

fetch("data/questions.json")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    // Derive a stable id from each question's stem so the JSON doesn't have to
    // carry hand-written ids. The id is only ever a localStorage progress key
    // (never shown), so it just needs to stay constant across loads — which it
    // does unless a stem is materially rewritten, when resetting its saved
    // state is reasonable anyway.
    for (const q of data) q.id = hashId(q.stem);
    allQuestions = data;
    buildPills();
    applyFilter("All");
  })
  .catch((err) => {
    // Common cause: opening practice.html directly via file:// — fetch() of a local
    // JSON file is blocked by the browser's CORS policy in that case.
    // Serve the folder locally instead, e.g. `python3 -m http.server`, or via GitHub Pages.
    els.qStem.textContent =
      `Could not load questions.json (${err.message}). ` +
      "If you're opening this file directly from disk, run a local server instead — " +
      "fetch() can't read local files over file://.";
  });

function buildPills() {
  const topics = ["All"];
  for (const q of allQuestions) {
    if (!topics.includes(q.topic)) topics.push(q.topic);
  }
  els.pills.replaceChildren();
  for (const topic of topics) {
    const btn = document.createElement("button");
    btn.className = "topic-pill";
    btn.textContent = topic;
    btn.dataset.topic = topic;
    btn.setAttribute("aria-pressed", topic === currentTopic ? "true" : "false");
    btn.addEventListener("click", () => {
      applyFilter(topic);
    });
    els.pills.appendChild(btn);
  }
}

function applyFilter(topic) {
  currentTopic = topic;
  filtered =
    topic === "All"
      ? allQuestions.slice()
      : allQuestions.filter((q) => q.topic === topic);
  currentIndex = 0;
  for (const btn of els.pills.children) {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.topic === topic ? "true" : "false",
    );
  }
  buildPalette();
  renderQuestion();
}

function buildPalette() {
  els.palette.replaceChildren();
  filtered.forEach((q, i) => {
    const btn = document.createElement("button");
    btn.className = "palette-item";
    btn.textContent = String(i + 1);
    setAnsweredState(btn, q);
    btn.addEventListener("click", () => {
      currentIndex = i;
      renderQuestion();
    });
    els.palette.appendChild(btn);
  });
}

function countCompleted() {
  return filtered.filter((q) => answers[q.id]).length;
}

// Reflect a question's saved outcome on its palette button (or clear it).
function setAnsweredState(btn, q) {
  if (answers[q.id]) {
    btn.setAttribute("data-state", answers[q.id].state);
  } else {
    btn.removeAttribute("data-state");
  }
}

function refreshPaletteState() {
  [...els.palette.children].forEach((btn, i) => {
    btn.setAttribute("aria-current", i === currentIndex ? "true" : "false");
    setAnsweredState(btn, filtered[i]);
  });
}

function renderQuestion() {
  if (!filtered.length) {
    els.qStem.textContent = "No questions in this topic yet.";
    els.options.replaceChildren();
    els.qLabel.textContent = "Q. —";
    els.qDifficulty.textContent = "";
    els.qSource.textContent = "—";
    els.statusLine.textContent = "Question 0 of 0";
    els.progressFill.style.width = "0%";
    return;
  }

  const q = filtered[currentIndex];
  els.qLabel.textContent = `Q. ${q.topic}`;
  els.qDifficulty.textContent =
    typeof q.difficulty === "number" ? `Difficulty ${q.difficulty}` : "";
  els.qSource.textContent = q.source;
  renderMath(q.stem, els.qStem);

  // Progress reflects how many questions in this view have been completed
  // (answered either way), not the current position.
  const completed = countCompleted();
  const pct = Math.round((completed / filtered.length) * 100);
  els.statusLine.textContent = `${pct}%`;
  els.progressFill.style.width = `${pct}%`;

  els.options.replaceChildren();
  for (const opt of q.options) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "option";
    btn.dataset.key = opt.key;
    btn.dataset.correct = opt.correct;
    // Build spans without innerHTML so question data is never parsed as HTML;
    // renderMath handles any $…$ LaTeX safely.
    const tag = document.createElement("span");
    tag.className = "tag mono";
    tag.textContent = opt.key;
    const text = document.createElement("span");
    renderMath(opt.text, text);
    btn.append(tag, text);
    btn.addEventListener("click", () => {
      handleAnswer(q, btn);
    });
    li.appendChild(btn);
    els.options.appendChild(li);
  }

  els.feedback.classList.remove("show");
  els.resetBtn.style.display = "none";

  const saved = answers[q.id];
  if (saved) {
    lockOptions(saved.key);
    showFeedback(q, saved.state === "correct", saved.key);
  }

  els.prevBtn.disabled = currentIndex === 0;
  els.nextBtn.disabled = currentIndex === filtered.length - 1;

  refreshPaletteState();
}

function handleAnswer(q, selectedBtn) {
  const correct = selectedBtn.dataset.correct === "true";
  answers[q.id] = {
    state: correct ? "correct" : "incorrect",
    key: selectedBtn.dataset.key,
  };
  saveAnswers();
  lockOptions(selectedBtn.dataset.key);
  showFeedback(q, correct, selectedBtn.dataset.key);
  refreshPaletteState();
}

function lockOptions(selectedKey) {
  for (const btn of els.options.querySelectorAll(".option")) {
    btn.disabled = true;
    const isCorrect = btn.dataset.correct === "true";
    if (isCorrect) {
      btn.classList.add("correct");
    } else if (selectedKey && btn.dataset.key === selectedKey) {
      btn.classList.add("incorrect");
    } else {
      btn.classList.add("dim");
    }
  }
  els.resetBtn.style.display = "inline-block";
}

function showFeedback(q, wasCorrect, selectedKey) {
  els.feedbackTitle.textContent = wasCorrect ? "Correct. " : "Not quite. ";
  const correctOpt = q.options.find((o) => o.correct);
  els.feedbackBody.textContent = wasCorrect
    ? "Here's the working:"
    : `The answer is ${correctOpt.key}` +
      (selectedKey && selectedKey !== correctOpt.key
        ? `, not ${selectedKey}`
        : "") +
      ". Here's the working:";
  renderMath(q.working, els.feedbackWorking);
  els.feedback.classList.add("show");
}

els.resetBtn.addEventListener("click", () => {
  const q = filtered[currentIndex];
  delete answers[q.id];
  saveAnswers();
  renderQuestion();
});

function goPrev() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
}
function goNext() {
  if (currentIndex < filtered.length - 1) {
    currentIndex += 1;
    renderQuestion();
  }
}

els.prevBtn.addEventListener("click", goPrev);
els.nextBtn.addEventListener("click", goNext);

// Left/Right arrows step through questions, mirroring the Prev/Next buttons.
// No text inputs live on this page, so claiming the arrow keys is safe.
document.addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key === "ArrowLeft") {
    goPrev();
  } else if (e.key === "ArrowRight") {
    goNext();
  }
});
