# OpenTMUA — todo

## Noted, deliberately deferred

- [ ] **Accessibility pass** — `role="tab"`/`role="tablist"` misused on topic pills and question palette (no `aria-controls`/panels); feedback box needs `aria-live="polite"` so screen readers announce Correct/Not quite.
- [ ] **Normalize questions.json escapes** — first 6 entries use `\uXXXX`, later ones use literal Unicode (², −, ×). Pick literal Unicode for readability.
- [ ] **Favicon** — every page load currently 404s on `/favicon.ico`.
- [ ] **Open Graph / twitter-card meta** — skipped for now (no socials); add before sharing links anywhere.
- [ ] **Real README.md and CONTRIBUTING.md** — homepage "Contribute a question" button links to CONTRIBUTING.md, which is still a stub. CONTRIBUTING should document the question JSON schema (enforced by `scripts/validate-questions.js`).
- [ ] **Commit pending work** (persistence, progress bar, hero CTA, XSS fix, validator, random demo).

## Feature roadmap

- [ ] "Reset all progress" button on the practice page.
- [ ] Per-topic score summary ("Algebra: 5/12 correct").
- [ ] Grow the bank (~20 questions/topic), then Paper 2 (Mathematical Reasoning).
- [ ] Vendored (self-hosted) KaTeX for real maths notation — no CDN, keeping the no-build ethos.
- [ ] Timed mock mode: fixed set, 75 minutes, no instant feedback, results at the end.
- [ ] Past-attempt history from localStorage; difficulty tags.
- [ ] Confirm GitHub Pages deployment; optional custom domain.
