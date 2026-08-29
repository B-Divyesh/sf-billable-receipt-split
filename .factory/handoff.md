# Billable Split — perfection-loop round 3 handoff

## Result

All cumulative review findings are repaired. The deployed repair is `1218cabdf42f6319c33dd06d0bd20e45d5198345`; it was pushed to `main` and deployed as `1d0b61f3-61e7-43e7-97a3-41bb32a90418`.

The product remains a Vite + TypeScript offline PWA. The job-ledger terminal visual system remains intact. The landing now explains Capture → Split → Export, the manual-entry/privacy boundary, and the exact free/$19 limit rule without becoming a generic feature-card page.

## What changed

- `/demo` and `?demo=1` now always set title/social title to `Demo — Billable Split`, use the demo description, and canonicalize to `/demo` even though the seeded receipt is open.
- `/404.html` now has the complete shared navigation: Receipts, Demo, Data & license, and Privacy. Its mobile link spacing was adjusted for readable targets.
- Landing content now includes `How it works`, `What Billable Split does not do`, and `Free and paid use`. Every material product statement maps to the existing claim registry.
- Settings now opens with `Back up or restore receipt data`.
- The `$19` claim/test now proves CSV remains available at the five-receipt cap before the demo licensed workspace accepts another receipt.
- Service-worker and installed-app versions advance to v12 / `?v=3`; shared footer build label is v1.2.0.
- Catalog description: “Split supplier receipts by job and export billable cost records offline.”

The complete finding-by-finding repair matrix is [polish-3.md](polish-3.md).

## Verification

Fresh clone: `/tmp/billable-split-r3-clean` at `1218cabdf42f6319c33dd06d0bd20e45d5198345`.

- `npm ci` passed with 0 vulnerabilities.
- Every one of the 16 exact `test` commands in `.factory/claims.json` passed independently from the clean clone.
- `npm test` passed: 10/10.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed. Build produces `dist/index.html`.
- `npm run test:e2e` passed: 52/52 across desktop and 390 px. It includes Axe serious/critical checks, keyboard route focus, demo reset/real-data boundaries, offline reload/export, PDF/CSV, backup integrity, and privacy request logging.
- `npm run test:release` passed: production billing catalog, $19 checkout redirect, and invalid-license policy.
- Live `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e` passed 52/52 after deployment.
- `/opt/fleet/lib/verify-url.sh https://billable-receipt-split.sociobot.in .factory/evidence/polish-3/live` passed: 617 ms cold load, no console errors, title/lang/main, exactly one h1, and no images missing alt text.
- Live mobile Lighthouse: Performance 100; Accessibility 100; LCP 1053 ms; CLS 0. Report: [lighthouse.json](evidence/polish-3/live/lighthouse.json).

## Evidence

- [Live verification report](evidence/polish-3/live/verify.json)
- [Live mobile root](evidence/polish-3/live/screenshot-mobile.png)
- [Live mobile demo](evidence/polish-3/live/demo-mobile.png)
- [Live mobile static 404](evidence/polish-3/live/404-mobile.png)
- [Local mobile root](evidence/polish-3/local-root-390.png)
- [Local desktop demo](evidence/polish-3/local-demo-desktop.png)

## Known gaps and next steps

None. No external services, tracking, or infrastructure changes were made.
