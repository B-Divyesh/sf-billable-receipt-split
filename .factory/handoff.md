# Billable Split — polish 1 handoff

## Result

Delivered and deployed repair commit `70124d3dab40201c06fc162589188846c9d70fe8` for work order `billable-receipt-split-polish-1`.

The landing now names the contractor job, has a one-click isolated demo, documented claim registry/tests, real routes and 404, complete route metadata, shared legal navigation, plain-language README, and responsive demo controls. Demo data uses `demo:billable-split`; real data remains in `billable-split`.

Live: <https://billable-receipt-split.sociobot.in> · Demo: <https://billable-receipt-split.sociobot.in/demo>

## Verification

- Fresh clone `/tmp/billable-clean.sg2X7K`: `npm ci`, `npm test` (10/10), `npm run build`, then every individual command from `.factory/claims.json` passed on desktop and 390 px.
- Local: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run test:e2e -- --reporter=line` — 26/26 Playwright tests passed. The suite includes Axe serious/critical checks, keyboard/dialog behavior, responsive targets, privacy requests, offline reload, PDF/CSV, encryption, limits, routing, and service-worker cleanup.
- Live: `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line` — 26/26 passed.
- Live smoke: `/opt/fleet/lib/verify-url.sh` produced `.factory/evidence/polish-1/verify.json` with 701 ms cold load, zero console errors, title/lang/main/one-h1/alt checks all passing. Screenshots: `.factory/evidence/polish-1/screenshot-desktop.png`, `.factory/evidence/polish-1/screenshot-mobile.png`, and `.factory/evidence/polish-1/live-demo-mobile.png`.
- Live production billing contract: `npm run test:release` passed.
- Lighthouse mobile report: `.factory/evidence/polish-1/lighthouse.json` recorded 100 performance, 100 accessibility, 100 best practices, and 100 SEO. (Chrome exited after writing the report; all category scores are present.)

## How to run

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

## Known gaps / next steps

None. The product is static and deploys from `dist/`; no server-side product endpoint is owned by this repository.
