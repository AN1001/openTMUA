# Contributing questions to OpenTMUA

### If you are non-technical or can't be bothered to upload questions, don't read the rest, just send me a message on [LinkedIn](https://www.linkedin.com/in/arnav-nagpure/) (or open an issue) and I'll do it:  

It is however quite simple with AI read point (1)

(1) To do this the easy way:
- Paste this file into an LLM of your choice alongside your question
- Ask it to convert it into JSON for you
- Add that question into data/questions.json (at the end)

(2) No build step, no dependencies: the site is plain HTML/CSS/JS and the questions live in one JSON file.

(3) Thank you.

## Contributing a question

### 1. Overview

When making a question ensure it is **original.** written by you. Don't copy it from past papers, textbooks, other question banks, etc...


For the multiple choice answers make some of the choices plausibly wrong i.e wrong options should be the result of realistic mistakes (sign slips, off-by-one, misread conditions)


Working should be quite detailed, preferably not just a few lines but also an explaination of good techniques, multiple solutions, common pitfalls etc...


Using AI is fine as long as the question is correct and genuinely good. Please don't use only AI to make questions; Some human input should be done.

### 2. The format

Questions are all in one JSON file.
Find questions here: [`data/questions.json`](data/questions.json)


Add yours **to the end of the array**


A question looks like this (Field rules are enforced by CI.):
```json
{
  "paper": "Paper 1",
  "topic": "Algebra",
  "difficulty": 5.5,
  "source": "[Your name]",
  "stem": "x and y are positive integers such that $x^2 - y^2 = 45$. How many possible values of x are there?",
  "options": [
    { "key": "A", "text": "$2$", "correct": false },
    { "key": "B", "text": "$3$", "correct": true },
    { "key": "C", "text": "$4$", "correct": false },
    { "key": "D", "text": "$5$", "correct": false },
    { "key": "E", "text": "$6$", "correct": false }
  ],
  "working": "$x^2 − y^2 = (x−y)(x+y) = 45$ Factor pairs of $45$: $(1,45)$, $(3,15)$, $(5,9)$ — each gives an integer $(x,y)$. That's $3$ values of x."
}
```

A few field rules to keep in mind:

- **`difficulty`** mirrors the TMUA grade: a number from **1.0 to 9.0** (decimals are fine, e.g. `6.8`). It's shown next to the topic on the practice page.
- **`options`** can hold anywhere from **2 to 8** answers. Keys must be sequential capitals starting at `A` (`A`, `B`, `C`, …), and exactly one option must be `"correct": true`.
- Each question's stem must be unique — it's what identifies the question internally (progress is keyed off a hash of it).


### Maths notation

Here are some nuances:

(1) Wrap LaTeX (math) in delimiters ($ or $$):
- **Inline:** `"Solve $x^2 - 5x + 6 = 0$."`
- **Display** `"$$\\sum_{n=1}^{N} n = \\frac{N(N+1)}{2}$$"`

Because these are JSON strings, every LaTeX backslash must be **doubled**: write `\\frac`, `\\sqrt`, `\\pm`, `\\le`. Anything outside the delimiters is shown as plain text, so you can mix prose and maths freely. Simple expressions that don't need LaTeX can still use Unicode characters directly (`²`, `−`, `√`) — both work.

(2) For consitency make the multiple choice options LaTeX if they are math - even if they are standard numbers e.g. \$ 2 \$ instead of 2.

### 3. Check it locally ...or don't

```sh
node scripts/validate-questions.js
```

This is the same check CI runs on your PR. To see your question rendered, serve the folder and open the practice page:

```sh
python3 -m http.server
# then visit http://localhost:8000/practice.html
```

(Or you can use the common 'Live Server' VS Code extension)

### 4. Open a PR

- Not too many questions at once, maybe max 5.
- By contributing a question you agree it is released under the [CC BY-SA 4.0 License](LICENSE-CONTENT) — anyone may reuse it with credit to OpenTMUA, and adaptations must stay under the same license. Code contributions are released under the [MIT License](LICENSE).

## Contributing code

Bug fixes and improvements are welcome. Check the `todo.md` for todos.

## Questions?

Ask me on LinkedIn


or


open an issue at [AN1001/openTMUA](https://github.com/AN1001/openTMUA/issues).
