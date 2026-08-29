# Billable Split — review 3 handoff

## Result

Reviewer-only pass. No product code was changed. The review is **FAIL**; see `.factory/review-3.md`.

## Verification

- Local checkout: `npm test`, `npm run lint`, `npm run build`, and `npm run test:release` passed.
- Fresh clone `/tmp/billable-review-3`: `npm ci` and every command in `.factory/claims.json` passed individually (`test-results/.last-run.json` reports `passed`).
- Live Chromium checks covered 390 px and desktop first read, `/demo`, reset/start-for-real isolation with seeded real data, request logging, metadata, deep links, link crawl, headers, console errors, and mobile Axe serious/critical checks.

## Known gaps

- `/demo` publishes a supplier-detail title/metadata instead of Demo metadata.
- `/404.html` has a reduced header rather than the shared navigation shell.
- The landing lacks the required how-it-works, scope/privacy, and paid-use sections.
- Settings uses the non-descriptive h1 “Your data, your key.”
