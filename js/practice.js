(function () {
  var allQuestions = [];
  var filtered = [];
  var currentIndex = 0;
  var currentTopic = 'All';
  // answers[id] = 'correct' | 'incorrect' — persists in memory only, resets on page reload.
  var answers = {};

  var els = {
    pills: document.getElementById('topicPills'),
    palette: document.getElementById('palette'),
    statusLine: document.getElementById('statusLine'),
    progressFill: document.getElementById('progressFill'),
    qLabel: document.getElementById('qLabel'),
    qSource: document.getElementById('qSource'),
    qStem: document.getElementById('qStem'),
    options: document.getElementById('options'),
    feedback: document.getElementById('feedback'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackBody: document.getElementById('feedbackBody'),
    feedbackWorking: document.getElementById('feedbackWorking'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  fetch('data/questions.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      allQuestions = data;
      buildPills();
      applyFilter('All');
    })
    .catch(function (err) {
      // Common cause: opening practice.html directly via file:// — fetch() of a local
      // JSON file is blocked by the browser's CORS policy in that case.
      // Serve the folder locally instead, e.g. `python3 -m http.server`, or via GitHub Pages.
      els.qStem.textContent = 'Could not load questions.json (' + err.message + '). ' +
        'If you\'re opening this file directly from disk, run a local server instead — ' +
        'fetch() can\'t read local files over file://.';
    });

  function buildPills() {
    var topics = ['All'];
    allQuestions.forEach(function (q) {
      if (topics.indexOf(q.topic) === -1) topics.push(q.topic);
    });
    els.pills.innerHTML = '';
    topics.forEach(function (topic) {
      var btn = document.createElement('button');
      btn.className = 'topic-pill';
      btn.textContent = topic;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', topic === currentTopic ? 'true' : 'false');
      btn.addEventListener('click', function () { applyFilter(topic); });
      els.pills.appendChild(btn);
    });
  }

  function applyFilter(topic) {
    currentTopic = topic;
    filtered = topic === 'All' ? allQuestions.slice() : allQuestions.filter(function (q) { return q.topic === topic; });
    currentIndex = 0;
    Array.prototype.forEach.call(els.pills.children, function (btn) {
      btn.setAttribute('aria-selected', btn.textContent === topic ? 'true' : 'false');
    });
    buildPalette();
    renderQuestion();
  }

  function buildPalette() {
    els.palette.innerHTML = '';
    filtered.forEach(function (q, i) {
      var btn = document.createElement('button');
      btn.className = 'palette-item';
      btn.textContent = String(i + 1);
      btn.setAttribute('role', 'tab');
      if (answers[q.id]) btn.setAttribute('data-state', answers[q.id]);
      btn.addEventListener('click', function () { currentIndex = i; renderQuestion(); });
      els.palette.appendChild(btn);
    });
  }

  function refreshPaletteState() {
    Array.prototype.forEach.call(els.palette.children, function (btn, i) {
      btn.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
      var q = filtered[i];
      if (answers[q.id]) {
        btn.setAttribute('data-state', answers[q.id]);
      } else {
        btn.removeAttribute('data-state');
      }
    });
  }

  function renderQuestion() {
    if (!filtered.length) {
      els.qStem.textContent = 'No questions in this topic yet.';
      els.options.innerHTML = '';
      els.qLabel.textContent = 'Q. —';
      els.qSource.textContent = '—';
      els.statusLine.textContent = 'Question 0 of 0';
      els.progressFill.style.width = '0%';
      return;
    }

    var q = filtered[currentIndex];
    els.qLabel.textContent = 'Q. ' + q.topic;
    els.qSource.textContent = q.source;
    els.qStem.textContent = q.stem;
    els.statusLine.textContent = 'Question ' + (currentIndex + 1) + ' of ' + filtered.length +
      (currentTopic !== 'All' ? ' · ' + currentTopic : '');
    els.progressFill.style.width = (((currentIndex + 1) / filtered.length) * 100) + '%';

    els.options.innerHTML = '';
    q.options.forEach(function (opt) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.className = 'option';
      btn.dataset.key = opt.key;
      btn.dataset.correct = opt.correct;
      btn.innerHTML = '<span class="tag mono">' + opt.key + '</span><span>' + opt.text + '</span>';
      btn.addEventListener('click', function () { handleAnswer(q, btn); });
      li.appendChild(btn);
      els.options.appendChild(li);
    });

    els.feedback.classList.remove('show');
    els.resetBtn.style.display = 'none';

    var wasAnswered = !!answers[q.id];
    if (wasAnswered) lockOptions(q);

    els.prevBtn.disabled = currentIndex === 0;
    els.nextBtn.disabled = currentIndex === filtered.length - 1;

    refreshPaletteState();
  }

  function handleAnswer(q, selectedBtn) {
    var correct = selectedBtn.dataset.correct === 'true';
    answers[q.id] = correct ? 'correct' : 'incorrect';
    lockOptions(q, selectedBtn);
    showFeedback(q, correct, selectedBtn);
    refreshPaletteState();
  }

  function lockOptions(q, selectedBtn) {
    var buttons = els.options.querySelectorAll('.option');
    var selectedKey = selectedBtn ? selectedBtn.dataset.key : null;
    buttons.forEach(function (btn) {
      btn.disabled = true;
      var isCorrect = btn.dataset.correct === 'true';
      if (isCorrect) {
        btn.classList.add('correct');
      } else if (selectedKey && btn.dataset.key === selectedKey) {
        btn.classList.add('incorrect');
      } else {
        btn.classList.add('dim');
      }
    });
    if (!selectedBtn) showFeedback(q, answers[q.id] === 'correct', null);
    els.resetBtn.style.display = 'inline-block';
  }

  function showFeedback(q, wasCorrect, selectedBtn) {
    els.feedbackTitle.textContent = wasCorrect ? 'Correct. ' : 'Not quite. ';
    var correctOpt = q.options.filter(function (o) { return o.correct; })[0];
    els.feedbackBody.textContent = wasCorrect
      ? 'Here\'s the working:'
      : 'The answer is ' + correctOpt.key + (selectedBtn ? ', not ' + selectedBtn.dataset.key : '') + '. Here\'s the working:';
    els.feedbackWorking.textContent = q.working;
    els.feedback.classList.add('show');
  }

  els.resetBtn.addEventListener('click', function () {
    var q = filtered[currentIndex];
    delete answers[q.id];
    renderQuestion();
  });

  function goPrev() {
    if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); }
  }
  function goNext() {
    if (currentIndex < filtered.length - 1) { currentIndex += 1; renderQuestion(); }
  }

  els.prevBtn.addEventListener('click', goPrev);
  els.nextBtn.addEventListener('click', goNext);

  // Left/Right arrows step through questions, mirroring the Prev/Next buttons.
  // No text inputs live on this page, so claiming the arrow keys is safe.
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === 'ArrowLeft') { goPrev(); }
    else if (e.key === 'ArrowRight') { goNext(); }
  });
})();