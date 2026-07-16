(function () {
  var optionsList = document.getElementById("options");
  var demoLabel = document.getElementById("demoLabel");
  var demoStem = document.getElementById("demoStem");
  var demoWorking = document.getElementById("demoWorking");
  var feedback = document.getElementById("feedback");
  var feedbackTitle = document.getElementById("feedbackTitle");
  var feedbackBody = document.getElementById("feedbackBody");
  var tryAgain = document.getElementById("tryAgain");
  var answered = false;

  function optionButtons() {
    return optionsList.querySelectorAll(".option");
  }

  function reveal(selectedBtn) {
    answered = true;
    var correctKey = "";
    optionButtons().forEach(function (btn) {
      btn.disabled = true;
      var isCorrect = btn.dataset.correct === "true";
      if (isCorrect) {
        btn.classList.add("correct");
        correctKey = btn.dataset.key;
      } else if (btn === selectedBtn) {
        btn.classList.add("incorrect");
      } else {
        btn.classList.add("dim");
      }
    });

    var gotItRight = selectedBtn.dataset.correct === "true";
    feedbackTitle.textContent = gotItRight ? "Correct. " : "Not quite. ";
    feedbackBody.textContent = gotItRight
      ? "The answer is " + correctKey + " — here's the working:"
      : "The answer is " +
        correctKey +
        ", not " +
        selectedBtn.dataset.key +
        ". Here's the working:";
    feedback.classList.add("show");
    tryAgain.classList.add("show");
  }

  function wireOptions() {
    optionButtons().forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (answered) return;
        reveal(btn);
      });
    });
  }

  function renderQuestion(q) {
    demoLabel.textContent = "Q. " + q.topic;
    window.OpenTMUAMath.render(q.stem, demoStem);
    window.OpenTMUAMath.render(q.working, demoWorking);
    optionsList.innerHTML = "";
    q.options.forEach(function (opt) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.className = "option";
      btn.dataset.key = opt.key;
      btn.dataset.correct = String(opt.correct);
      // Build spans without innerHTML so question data is never parsed as HTML;
      // renderMath handles any $…$ LaTeX safely.
      var tag = document.createElement("span");
      tag.className = "tag mono";
      tag.textContent = opt.key;
      var text = document.createElement("span");
      window.OpenTMUAMath.render(opt.text, text);
      btn.appendChild(tag);
      btn.appendChild(text);
      li.appendChild(btn);
      optionsList.appendChild(li);
    });
    wireOptions();
  }

  tryAgain.addEventListener("click", function () {
    answered = false;
    optionButtons().forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove("correct", "incorrect", "dim");
    });
    feedback.classList.remove("show");
    tryAgain.classList.remove("show");
  });

  // The markup ships with a hard-coded demo question so the page still works
  // when fetch() is unavailable (e.g. opened via file://).
  wireOptions();

  // Swap in a random question from the bank so the demo varies per visit.
  fetch("data/questions.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!answered && data.length) {
        renderQuestion(data[Math.floor(Math.random() * data.length)]);
      }
    })
    .catch(function () {
      /* keep the static demo question */
    });
})();
