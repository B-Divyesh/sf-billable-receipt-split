# Billable Split — polish round 4 handoff

## Result

All findings from adversarial reviews 1–4 are closed. The final product commit before this documentation closeout is `5983d8437c91d9ba4e2ef9c73eb3a369818811d5`. The static production deployment is `c6090a42-7b1d-40b9-b8d0-e10c1b8da575` at <https://billable-receipt-split.sociobot.in>.

Billable Split remains a Vite + TypeScript offline PWA with its product-specific job-ledger terminal visual system. It is not replaced by a generic site template.

## What changed

- Fixed F-4-1 with one readiness helper used by both limit claims. It waits for the visible North Yard receipt, rejects the storage-error screen, validates the seeded receipt and line array, fills the archive, reloads, and checks again.
- Strengthened demo isolation proof: the test enters through `?demo=1`, edits and resets sample data, exits, proves real receipts and real license keys were untouched, and proves the demo database was discarded.
- Replaced the 1 × 1 demo placeholder with an original 720 × 1100 fictional North Yard receipt matching the sample's three lines and $501.75 total. The app and service worker load it from the same origin.
- Kept all 16 visitor claims paired one-to-one with observable Playwright tests. Backup and source-image setup now also wait for complete seeded data.
- Updated dynamic social URLs and bounded long receipt titles. Legal, offline, demo, app, and 404 pages retain real route metadata and the shared accessible shell.
- Replaced remaining visible allocation jargon with job-split wording and updated the complete copy audit.
- Updated the verb-first, 72-character catalog description to: “Split supplier receipts across jobs and export billable records offline.”
- Advanced the service-worker cache to v14, installed-app start URL to v5, and product label to v1.3.1.

The full finding-to-change-to-evidence matrix is in [polish-4.md](polish-4.md).

## Verification

Fresh remote clone: `/tmp/billable-polish4-final.5AiEB9/repo` at `6fb21343801a4adb7a280239739a476704fb0b66`. The later `5983d84` commit changed only visible terminology and the copy audit; the exact final deployment received a separate full browser pass.

- `npm ci` passed with 0 vulnerabilities.
- Every one of the 16 exact commands in `.factory/claims.json` passed independently in the clean clone, on desktop and 390 px mobile.
- Claim tag audit passed: exactly one `@claim:<id>` declaration for each of 16 registry entries.
- `npm test` passed 11/11; `npm run lint` and `npx tsc --noEmit` passed.
- `npm run build` passed and produced `dist/index.html`. Initial JS is 15.00 KB gzip; CSS is 5.28 KB gzip.
- Local `npm run test:e2e` passed 52/52 across desktop and 390 px mobile.
- The F-4-1 paths passed 24/24 in a targeted local repeat. The complete deployed suite passed 104/104 after that repair.
- `npm run test:release` passed the production catalog, $19 checkout redirect, and invalid-license policy.
- The exact final deployment passed all 52 Playwright tests. Coverage includes Axe serious/critical checks, keyboard focus and Back, route titles, static 404, legal links, offline reload/export, local-only requests, demo reset/exit isolation, CSV/PDF content, encrypted backup integrity, deletion, and service-worker cache cleanup.
- `/opt/fleet/lib/verify-url.sh` passed against the final live URL: 707 ms load, no console errors, correct title and language, one h1, main landmark, no missing alt text, and no unlabeled buttons.
- Live `/`, `/demo`, `/?demo=1`, `/settings`, `/privacy/`, `/terms/`, `/404.html`, `/does-not-exist`, `/offline.html`, `robots.txt`, `sitemap.xml`, the manifest, and the sample image all returned 200.
- Mobile Lighthouse: Performance 100; Accessibility 100; LCP 1,059 ms; CLS 0; TBT 0.
- The deployed sample PNG matched the committed SHA-256: `d45ecb57009b87820bcc409c60e5321f5feaa6bef88661f5fc5975f46416691f`.

## Evidence

- [Live verification report](evidence/polish-4/live/verify.json)
- [Lighthouse report](evidence/polish-4/live/lighthouse.json)
- [Live mobile root](evidence/polish-4/live/screenshot-mobile.png)
- [Live mobile demo](evidence/polish-4/live/demo-mobile.png)
- [Live desktop `?demo=1`](evidence/polish-4/live/demo-query-desktop.png)
- [Live mobile static 404](evidence/polish-4/live/404-mobile.png)
- [Copy audit](copy-audit.md)
- [Demo contract](demo.md)

## Run and verify

```sh
npm ci
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
npm run test:release
```

Use `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e` for the deployed suite. Run each command listed in `.factory/claims.json` independently for the claim gate.

## Known gaps and next steps

None. No infrastructure, DNS, billing configuration, tracking, or external runtime asset was added.
