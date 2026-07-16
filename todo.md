# OpenTMUA — todo

## Noted, deliberately deferred

- [x] **Accessibility pass** — tab roles removed (pills use `aria-pressed`, palette uses `aria-current`); feedback boxes have `aria-live="polite"`.
- [ ] **Normalize questions.json escapes** — first 6 entries use `\uXXXX`, later ones use literal Unicode (², −, ×). Pick literal Unicode for readability.
- [x] **Favicon** — every page load currently 404s on `/favicon.ico`.
- [ ] **Open Graph / twitter-card meta** — skipped for now (no socials); add before sharing links anywhere.
- [ ] **Real README.md** — still a stub (description, screenshot, live link, how to run).

## Feature roadmap

- [ ] "Reset all progress" button on the practice page.
- [ ] Per-topic score summary ("Algebra: 5/12 correct").
- [ ] Grow the bank (~20 questions/topic), then Paper 2 (Mathematical Reasoning).
- [x] Vendored (self-hosted) KaTeX for real maths notation — `$…$` / `$$…$$` in question fields.
- [ ] Timed mock mode: fixed set, 75 minutes, no instant feedback, results at the end.
- [ ] Past-attempt history from localStorage; difficulty tags.
- [ ] Confirm GitHub Pages deployment; optional custom domain.
- [ ] Add a question counter on home page.
