# Billable Split — review 2 handoff

## Result

Completed the adversarial first-read review without modifying product code. The verdict is **FAIL**. Full evidence is in [review-2.md](review-2.md).

## Verification

- Fresh production checks at 390 px and desktop: cold first read, demo, requests, metadata, links, 404, and Back behaviour.
- Fresh clone `/tmp/billable-review-2.rvOGi5`: `npm ci`, `npm test` (10/10), `npm run build`, `npm run lint`, `npx tsc --noEmit`, and every individual `.factory/claims.json` command passed.
- Production full Playwright also passed. Direct review found cases absent from that suite: demo Reset/Start, pre-existing real localStorage during demo, and route-change focus.

## Known gaps / next steps

Blocking: demo controls do not complete their stated actions; demo reads/writes real license localStorage and sends verification traffic; route changes do not focus the new h1.

Major: paid-limit, classification, PDF-evidence, receipt-history/deletion, backup/integrity, installation, and automatic-text-reading claims are not registered/tested as visitor claims.

No source/product code changed in this work order.
