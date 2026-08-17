# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sixth-form students preparing for the TMUA on their own, typically because paid question banks were too expensive to justify. They arrive mid-revision, often on a phone or a school laptop, wanting to attempt a hard problem and immediately see whether their reasoning held.

Teachers setting practice and contributors writing questions are welcome and supported, but they are secondary — no decision should be made for them at the expense of the self-studying candidate.

## Product Purpose

A free, open-source bank of original TMUA-style questions with detailed worked solutions.

It exists because TMUA prep was priced beyond what it should cost. The counter-position is total absence of friction: no account, no paywall, no email capture, nothing to dismiss before practising.

Success is a personal project done genuinely well — a polished, correct, useful tool the author is proud of. Reach and growth are welcome side effects, not targets. Decisions should not trade craft or the no-friction stance for audience metrics.

## Positioning

Original, human-authored questions concentrated at TMUA grade **6.0 and above** — deliberately the band where free resources are thin and AI-generated practice is least reliable. Easier questions are abundant elsewhere and are not this bank's job.

Every question is written for this bank and released under CC BY-SA 4.0, so the content itself can be reused and adapted with credit. A competitor could copy the site in a weekend; they could not truthfully copy an openly licensed bank of original hard questions.

## Operating Context

- **Practice session:** a student opens the practice page, optionally filters to one topic, works a question on paper, picks an option, and reads the worked solution. Feedback is immediate; there is no scoring ceremony and no timer today.
- **Progress:** answered state persists in the browser only (`localStorage`, key `opentmua.answers.v1`). It is never transmitted. Clearing site data loses it, and that trade is accepted.
- **Working on paper:** the screen is not the workspace. Questions are read on screen and solved off it, which makes stem legibility and maths rendering matter more than input affordances.
- **Contribution:** a question author uses the hidden builder page (`builder.html`) to compose and preview, copies the JSON, appends it to `data/questions.json`, and opens a PR. CI validates the file.

## Capabilities and Constraints

As of 2026-08-17:

- **Bank:** 25 questions — 16 Paper 1, 9 Paper 2. Topics: Number (6), Algebra (6), Calculus (3), Series (3), Geometry (3), Logic (3), Graphs (1). Difficulty spans 5.9–9.0, median 7.6. 10 questions carry SVG diagrams.
- **Three surfaces:** landing page, practice app, and an unlinked builder page for contributors.
- **Maths rendering** via vendored KaTeX, through a single renderer that also handles `\diagram{path}{alt}` image tokens. Question data is never passed through `innerHTML` — that is a security property, not a style preference, since the bank accepts contributor-submitted JSON.
- **No build step, no dependencies, no package manager.** One validator script is the entire test suite.
- **Must be served over HTTP.** Both content pages `fetch()` the question JSON, which browsers block over `file://`; both degrade with an explanation rather than breaking.
- **Deployed on GitHub Pages** from `main` at `an1001.github.io/openTMUA`.
- **Undecided:** timed mock mode, a homepage question counter, KaTeX pre-rendering, and a TypeScript migration are all on the roadmap as deliberately deferred, not committed.

### Binding commitments

These four are permanent, not current state. Future work must preserve them:

1. **Free forever, no accounts.** No payments, no sign-up, no gating, no email capture. Minimising friction is the product's identity.
2. **Static site, no backend.** Progress stays browser-local; nothing is transmitted anywhere. GitHub Pages is the whole infrastructure.
3. **No external requests at runtime.** KaTeX and all fonts are vendored on purpose. No CDNs, no analytics, no third-party calls — ever.
4. **Hard questions (6.0+).** The difficulty focus is a positioning decision, not an accident of what has been written so far.

## Brand Commitments

On 2026-08-17 the author released the visual and verbal identity explicitly — "ignore all sense of brand identity" — and pinned a replacement direction: light, extremely simple, functional, and as far from a generated-looking interface as possible. The retired identity (the `Open`+`TMUA` split wordmark, the "Education should be open." tagline, the grid-paper ground, Spectral and IBM Plex, the editorial voice of "Built by a student, for students") is history, not authority. Do not reinstate any of it as a default.

What survives is not brand and is not up for aesthetic revision:

- **Name:** OpenTMUA, set plainly.
- **Licensing, stated publicly:** code MIT, questions CC BY-SA 4.0, in the footer of every page.
- **Non-affiliation disclaimer:** the footer states the project is not affiliated with or endorsed by UAT-UK or Pearson VUE, who administer the TMUA. This is legally material and must survive any redesign.
- **Question originality:** questions must never be imported from past papers, textbooks, or other banks. AI assistance is acceptable; wholesale AI generation without human authorship is not.

## Evidence on Hand

- 25 original questions with detailed worked solutions at `data/questions.json`; 23 credited "Original · OpenTMUA", 2 to Kevin Hu.
- 10 hand-made SVG diagrams at `assets/diagrams/`, all referenced and all resolving.
- A live deployment and a public repository at `github.com/AN1001/openTMUA`.
- Contribution guide (`CONTRIBUTING.md`) and roadmap (`todo.md`).

**Absences future work must not fabricate:** there is no usage data, no analytics, no user count, no testimonials, no reviews, no institutional endorsement, and no evidence of outcomes. No claim of that kind may appear on any surface. There is also no social presence — Open Graph tags are deliberately deferred until there is somewhere to share to.

## Product Principles

1. **Friction is the enemy.** Every added step, gate, or prompt is a regression. If a feature requires an account, it is the wrong feature.
2. **Hard and correct beats plentiful.** One well-written 7.5 question with a real worked solution is worth more than ten easy ones. A wrong question is worse than a missing one.
3. **The working is the product.** Students come for the answer and stay for the explanation — solutions should teach technique, name common pitfalls, and show alternative routes, not just terminate.
4. **Nothing leaves the browser.** Privacy here is structural, not promised. Any feature that would require transmitting user data is out of scope by construction.
5. **Open enough to outlive the author.** Plain files, no build step, permissive licences — a stranger should be able to pick it up and add a question without setting anything up.

## Accessibility & Inclusion

No formal standard has been adopted. Existing commitments in the code: topic filters use `aria-pressed`, the question palette uses `aria-current`, feedback regions are `aria-live="polite"`, and diagrams take optional alt text via the `\diagram{path}{alt}` second argument, required whenever the image carries information the text does not.

Keyboard navigation through questions (left/right arrows) is supported and should be preserved.
