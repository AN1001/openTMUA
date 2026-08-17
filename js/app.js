import { renderMath } from "./math.js";

const optionsList = document.getElementById("options");
const demoLabel = document.getElementById("demoLabel");
const demoPaper = document.getElementById("demoPaper");
const demoSource = document.getElementById("demoSource");
const demoStem = document.getElementById("demoStem");
const demoWorking = document.getElementById("demoWorking");
const bankSummary = document.getElementById("bankSummary");
const feedback = document.getElementById("feedback");
const feedbackTitle = document.getElementById("feedbackTitle");
const feedbackBody = document.getElementById("feedbackBody");
const tryAgain = document.getElementById("tryAgain");
let answered = false;

function optionButtons() {
  return optionsList.querySelectorAll(".option");
}

function reveal(selectedBtn) {
  answered = true;
  let correctKey = "";
  for (const btn of optionButtons()) {
    btn.disabled = true;
    const isCorrect = btn.dataset.correct === "true";
    if (isCorrect) {
      btn.classList.add("correct");
      correctKey = btn.dataset.key;
    } else if (btn === selectedBtn) {
      btn.classList.add("incorrect");
    } else {
      btn.classList.add("dim");
    }
  }

  const gotItRight = selectedBtn.dataset.correct === "true";
  feedbackTitle.textContent = gotItRight ? "Correct. " : "Not quite. ";
  feedbackBody.textContent = gotItRight
    ? `The answer is ${correctKey}.`
    : `The answer is ${correctKey}, not ${selectedBtn.dataset.key}. Here's the working:`;
  feedback.classList.add("show");
  tryAgain.classList.add("show");
}

function wireOptions() {
  for (const btn of optionButtons()) {
    btn.addEventListener("click", () => {
      if (answered) return;
      reveal(btn);
    });
  }
}

function renderQuestion(q) {
  demoLabel.textContent = q.topic;
  // The card used to sit under a hard-coded "PAPER 1" label while this function
  // swapped in a question drawn from the whole bank — so a Paper 2 question was
  // routinely shown labelled Paper 1. The paper now comes from the question.
  demoPaper.textContent = q.paper;
  demoSource.textContent = q.source;
  renderMath(q.stem, demoStem);
  renderMath(q.working, demoWorking);
  optionsList.replaceChildren();
  for (const opt of q.options) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "option";
    btn.dataset.key = opt.key;
    btn.dataset.correct = String(opt.correct);
    // Build spans without innerHTML so question data is never parsed as HTML;
    // renderMath handles any $…$ LaTeX safely.
    const tag = document.createElement("span");
    tag.className = "tag mono";
    tag.textContent = opt.key;
    const text = document.createElement("span");
    renderMath(opt.text, text);
    btn.append(tag, text);
    li.appendChild(btn);
    optionsList.appendChild(li);
  }
  wireOptions();
}

tryAgain.addEventListener("click", () => {
  answered = false;
  for (const btn of optionButtons()) {
    btn.disabled = false;
    btn.classList.remove("correct", "incorrect", "dim");
  }
  feedback.classList.remove("show");
  tryAgain.classList.remove("show");
});

// The markup ships with a hard-coded demo question so the page still works
// when fetch() is unavailable (e.g. opened via file://).
wireOptions();

// Swap in a random question from the bank so the demo varies per visit.
fetch("data/questions.json")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    if (!answered && data.length) {
      renderQuestion(data[Math.floor(Math.random() * data.length)]);
    }
    // Replace the hard-coded counts with the real ones so they can't drift as
    // questions are added. The markup ships with the current numbers as a
    // fallback for when this fetch can't run.
    if (bankSummary && data.length) {
      const p1 = data.filter((q) => q.paper === "Paper 1").length;
      const p2 = data.filter((q) => q.paper === "Paper 2").length;
      bankSummary.textContent =
        `${data.length} question${data.length === 1 ? "" : "s"} so far — ` +
        `${p1} for Paper 1 (Mathematical Thinking) and ` +
        `${p2} for Paper 2 (Mathematical Reasoning).`;
    }
  })
  .catch(() => {
    /* keep the static demo question and the fallback counts */
  });
