# Contributing to OpenTMUA

Thanks for helping build a free TMUA question bank. The most valuable thing you can contribute is **one good question** — this guide shows you exactly how.

No build step, no dependencies: the site is plain HTML/CSS/JS and the questions live in one JSON file.

## Contributing a question

### 1. The quality bar

- **Original.** Written by you, in the style of the TMUA — never copied from past papers, textbooks, or other question banks.
- **One unambiguous answer.** Exactly one of the five options is correct, and a well-prepared candidate should be able to defend why.
- **Plausible distractors.** Wrong options should be the result of realistic mistakes (sign slips, off-by-one, misread conditions) — not obvious filler.
- **Working shown.** The `working` field should let a student who got it wrong understand the solution without outside help.
- **Verified arithmetic.** Check every number by hand (or script) before opening a PR.

### 2. The format

Questions live in [`data/questions.json`](data/questions.json), a flat array. Add yours **to the end of the array** — never renumber or edit existing `id`s, as they key saved progress in visitors' browsers.

```json
{
  "id": "p1-alg-03",
  "paper": "Paper 1",
  "topic": "Algebra",
  "source": "Original · OpenTMUA",
  "stem": "x and y are positive integers such that x² − y² = 45. How many possible values of x are there?",
  "options": [
    { "key": "A", "text": "2", "correct": false },
    { "key": "B", "text": "3", "correct": true },
    { "key": "C", "text": "4", "correct": false },
    { "key": "D", "text": "5", "correct": false },
    { "key": "E", "text": "6", "correct": false }
  ],
  "working": "x² − y² = (x−y)(x+y) = 45. Factor pairs of 45: (1,45), (3,15), (5,9) — each gives an integer (x,y). That's 3 values of x."
}
```

Field rules (enforced by CI — see below):

| Field | Rule |
|---|---|
| `id` | Unique, kebab-case: `p<paper>-<topic-abbrev>-<number>`, e.g. `p1-geo-03`. Next free number for that topic. |
| `paper` | `"Paper 1"` (Mathematical Thinking) or `"Paper 2"` (Mathematical Reasoning). |
| `topic` | One of the existing topics where possible: `Algebra`, `Functions`, `Sequences`, `Number`, `Probability`, `Geometry`. New topics are welcome — mention it in the PR. |
| `source` | `"Original · OpenTMUA"` for new questions. |
| `stem` | The question text, plain text. Use Unicode maths characters directly: `²`, `−`, `×`, `√`, `≤`, `π`. |
| `options` | Exactly 5, keyed `"A"`–`"E"` in order, each with non-empty `text` and boolean `correct`. Exactly one `correct: true`. |
| `working` | Full solution a student can follow. |

### 3. Check it locally

```sh
node scripts/validate-questions.js
```

This is the same check CI runs on your PR. To see your question rendered, serve the folder and open the practice page:

```sh
python3 -m http.server
# then visit http://localhost:8000/practice.html
```

(Opening `practice.html` directly from disk won't work — browsers block `fetch()` over `file://`.)

### 4. Open a PR

- One question (or one coherent set) per PR — easier to review.
- In the description, state the intended answer and a one-line justification, plus why each distractor is plausible if it isn't obvious.
- By contributing you agree your work is released under the [MIT License](LICENSE).

## Contributing code

Bug fixes and improvements are welcome. Ground rules:

- **No frameworks, no build step, no npm.** Plain HTML/CSS/JS is a deliberate choice.
- Match the existing style: ES5-flavoured JS in IIFEs, CSS custom properties from `css/styles.css`'s `:root`, and `textContent` (never `innerHTML`) for anything derived from question data.
- For anything bigger than a small fix, open an issue first so we can agree on the approach.

## Questions?

Open an issue at [AN1001/openTMUA](https://github.com/AN1001/openTMUA/issues).
