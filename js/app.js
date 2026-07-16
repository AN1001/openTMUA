import { renderMath } from "./math.js";

const optionsList = document.getElementById("options");
const demoLabel = document.getElementById("demoLabel");
const demoStem = document.getElementById("demoStem");
const demoWorking = document.getElementById("demoWorking");
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
    ? `The answer is ${correctKey} — here's the working:`
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
  demoLabel.textContent = `Q. ${q.topic}`;
  renderMath(q.stem, demoStem);
  renderMath(q.working, demoWorking);
  optionsList.innerHTML = "";
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
  })
  .catch(() => {
    /* keep the static demo question */
  });
