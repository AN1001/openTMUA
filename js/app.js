(function () {
  var options = document.querySelectorAll(".option");
  var feedback = document.getElementById("feedback");
  var feedbackTitle = document.getElementById("feedbackTitle");
  var feedbackBody = document.getElementById("feedbackBody");
  var tryAgain = document.getElementById("tryAgain");
  var answered = false;

  function reveal(selectedBtn) {
    answered = true;
    options.forEach(function (btn) {
      btn.disabled = true;
      var isCorrect = btn.dataset.correct === "true";
      if (isCorrect) {
        btn.classList.add("correct");
      } else if (btn === selectedBtn) {
        btn.classList.add("incorrect");
      } else {
        btn.classList.add("dim");
      }
    });

    var gotItRight = selectedBtn.dataset.correct === "true";
    feedbackTitle.textContent = gotItRight ? "Correct. " : "Not quite. ";
    feedbackBody.textContent = gotItRight
      ? "The answer is B — here's the working:"
      : "The answer is B, not " +
        selectedBtn.dataset.key +
        ". Here's the working:";
    feedback.classList.add("show");
    tryAgain.classList.add("show");
  }

  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (answered) return;
      reveal(btn);
    });
  });

  tryAgain.addEventListener("click", function () {
    answered = false;
    options.forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove("correct", "incorrect", "dim");
    });
    feedback.classList.remove("show");
    tryAgain.classList.remove("show");
  });
})();
