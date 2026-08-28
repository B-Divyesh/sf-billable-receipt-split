# Billable Split — review 1 handoff

## Result

Independent adversarial first-read review completed for work order `billable-receipt-split-review-1`.

**Verdict: FAIL.** The review found 24 findings, including blocking failures for first-screen audience clarity, the absent sample-data demo and sandbox, the missing `.factory/claims.json`/claim tests, unlisted landing claims, and missing real routing/404/back/focus behaviour.

No product code was modified. The review report is in `.factory/review-1.md`.

## Verification performed

- Opened the live product from fresh Chromium contexts at 390 × 844 and 1440 × 1000; inspected initial visible content, console errors, requests, DOM metadata, controls, storage, and direct `/demo` behaviour.
- Checked `/`, `/demo`, `/privacy/`, `/terms/`, `/404`, manifest, robots, sitemap, headers, and source route implementation.
- Ran `npm ci`, `npm test` (10 passed), `npm run build`, `npm run test:e2e -- --reporter=line` (12 passed; Playwright status `passed`), and `npm run test:release` (passed).
- Read all earlier verification/handoff history. Rechecked every documented earlier defect in live behaviour and/or current regression coverage; none was found to be regressed.
- Confirmed the prior production verification rate-limit repair with a fresh 35-way burst: 30 × 200 and 5 × 429; a limited response included `Retry-After: 0`.

## Known gaps / next steps

Implement every finding in `.factory/review-1.md`, especially F-1-1 through F-1-8. Then create claim-tagged tests that begin at the isolated demo entry point and rerun this entire review checklist from a fresh browser context.
