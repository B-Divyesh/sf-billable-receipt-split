# Polish 3 — Billable Split

Repair commit: `1218cabdf42f6319c33dd06d0bd20e45d5198345` (`fix: complete round three review repairs`).

Deployment: `1d0b61f3-61e7-43e7-97a3-41bb32a90418` through `/opt/fleet/lib/deploy-static.sh billable-receipt-split dist`.

Live URL: <https://billable-receipt-split.sociobot.in>. Final live evidence: [verify report](evidence/polish-3/live/verify.json), [mobile root](evidence/polish-3/live/screenshot-mobile.png), [mobile demo](evidence/polish-3/live/demo-mobile.png), and [mobile static 404](evidence/polish-3/live/404-mobile.png).

The evidence shorthand below is deliberate: `Live full suite` is `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e` (52/52 passed); `clean claims` means every listed `claims.json` command passed independently from `/tmp/billable-split-r3-clean`.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Preserved the task-first headline, contractor audience sentence, and first-screen sample action. | Live `/`; `explains the workflow, scope, and license on the landing page`; `live/screenshot-mobile.png`. |
| F-1-2 | Preserved the direct `/demo` and `?demo=1` seed, separate `demo:billable-split` database, banner, Reset demo, and Start for real flow. | Live `/demo`; `@claim:demo-isolation`, `@claim:offline-reload`; `live/demo-mobile.png`. |
| F-1-3 | Preserved 16-entry claims registry with exactly one tagged observable test per id. | `clean claims`; registry/tag uniqueness check; live full suite. |
| F-1-4 | Preserved source-image, job-allocation, CSV, and PDF claims; added their landing How it works locations. | Live `/demo`; `@claim:source-retention`, `@claim:job-allocation`, `@claim:csv-export`, `@claim:pdf-export`. |
| F-1-5 | Preserved five-free boundary and made the paid wording precise: the license removes only the limit. | Live `/`; `@claim:free-receipt-limit`, `@claim:license-removes-limit`; `live/screenshot-mobile.png`. |
| F-1-6 | Preserved offline shell and separately cached demo route. | Live `/demo`; `@claim:offline-reload`; live full suite. |
| F-1-7 | Preserved scoped local-data copy and request-log isolation. | Live `/privacy/`; `@claim:receipt-data-local`, `@claim:demo-isolation`; `live/verify.json`. |
| F-1-8 | Preserved History API routes, Popstate route focus, announcement, and designed unknown-page route. | Live `/settings`, `/does-not-exist`, `/404.html`; `moves focus and announces the destination on route navigation and browser Back`; live full suite. |
| F-1-9 | Fixed demo metadata precedence; retained canonical, social, touch-icon, and route metadata. | Live `/demo`; `uses Demo metadata for a cold sample route`; `live/verify.json`. |
| F-1-10 | Completed direct static 404 header with Receipts, Demo, Data & license, and Privacy, matching the public shell links. | Live `/404.html`; `keeps the static 404 in the shared navigation shell`; `live/404-mobile.png`. |
| F-1-11 | Kept the plain “Receipt costs for several jobs” first-screen label. | Live `/`; landing regression; `live/screenshot-mobile.png`. |
| F-1-12 | Kept scoped footer privacy disclosure and Privacy link. | Live `/`; `@claim:receipt-data-local`; `live/verify.json`. |
| F-1-13 | Kept the plain “Saved receipts: n” label. | Live `/`; landing regression; `live/screenshot-mobile.png`. |
| F-1-14 | Kept the README’s plain contractor-focused opening. | `copy-audit.md`; live `/`; clean checkout review. |
| F-1-15 | Kept README feature statements short and separated by outcome. | `copy-audit.md`; clean checkout review. |
| F-1-16 | Kept “tamper-check value” wording instead of unexplained hash jargon. | README; `@claim:pdf-source-evidence`; live `/demo`. |
| F-1-17 | Kept item/job split wording instead of allocation jargon. | README; `@claim:job-allocation`; live `/demo`. |
| F-1-18 | Kept CSV/PDF wording instead of “evidence packets.” | README; `@claim:csv-export`, `@claim:pdf-export`; live `/demo`. |
| F-1-19 | Kept browser-focused storage wording. | README; `@claim:receipt-data-local`; live `/privacy/`. |
| F-1-20 | Kept password-protected backup wording. | README; `@claim:encrypted-backup`; live `/settings`. |
| F-1-21 | Kept the unsupported installation promise removed. | README and `copy-audit.md`; `@claim:offline-reload`; live `/`. |
| F-1-22 | Kept plain automatic-text-reading scope language. | README; `@claim:manual-receipt-entry`; live `/demo`. |
| F-1-23 | Kept browser-profile privacy language. | README; `@claim:receipt-data-local`; live `/privacy/`. |
| F-1-24 | Kept browser-focused backup and restore disclosures. | README; `@claim:encrypted-backup`, `@claim:backup-image-check`; live `/settings`. |
| F-2-1 | Preserved awaited Reset and Start for real actions that reseed/discard only demo data. | Live `/demo`; `@claim:demo-isolation`; live full suite. |
| F-2-2 | Preserved demo-only database/license state and no Sociobot request in demo. | Live `/demo`; `@claim:demo-isolation`, `@claim:receipt-data-local`; live full suite. |
| F-2-3 | Preserved focusable route h1 and polite route announcement after navigation and Back. | Live `/settings`; `moves focus and announces the destination on route navigation and browser Back`; live full suite. |
| F-2-4 | Strengthened the $19 test to prove free CSV remains available at the cap before the licensed sample accepts another receipt. | Live `/demo?free=1`; `@claim:license-removes-limit`; live full suite. |
| F-2-5 | Preserved all three classifications in per-job CSV output. | Live `/demo`; `@claim:cost-classification`; `live/demo-mobile.png`. |
| F-2-6 | Preserved source image and tamper-check value inside generated PDF output. | Live `/demo`; `@claim:pdf-source-evidence`; live full suite. |
| F-2-7 | Preserved receipt history and permanent deletion across reload. | Live `/demo`; `@claim:receipt-history`, `@claim:permanent-deletion`; live full suite. |
| F-2-8 | Preserved password-encrypted download and fingerprint rejection before restore. | Live `/demo/settings`; `@claim:encrypted-backup`, `@claim:backup-image-check`; live full suite. |
| F-2-9 | Kept the unsupported installation/relaunch promise removed; the tested offline claim remains. | README; `@claim:offline-reload`; live `/demo`. |
| F-2-10 | Preserved manual upload with no automatic line extraction or external request. | Live `/demo`; `@claim:manual-receipt-entry`; live full suite. |
| F-3-1 | Changed metadata order so cold `/demo` and `?demo=1` always publish “Demo — Billable Split,” the demo description, and `/demo` canonical. | Live `/demo`; `uses Demo metadata for a cold sample route`; live full suite. |
| F-3-2 | Added the missing Receipts and Data & license links to direct `/404.html`, then made the mobile link gaps legible. | Live `/404.html`; `keeps the static 404 in the shared navigation shell`; `live/404-mobile.png`. |
| F-3-3 | Added product-specific ledger sections for How it works, scope/privacy boundaries, and the exact free/$19 offer. | Live `/`; `explains the workflow, scope, and license on the landing page`; `live/screenshot-mobile.png`. |
| F-3-4 | Replaced the ambiguous settings slogan with “Back up or restore receipt data.” | Live `/settings`; route-focus regression; live full suite. |

## Final verification

- Clean clone `/tmp/billable-split-r3-clean` at repair commit `1218cab`: `npm ci`, all 16 individual claims commands, `npm test` (10/10), `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e` (52/52), and `npm run test:release` all passed.
- Live: `verify-url.sh` reported a 617 ms cold load, no console errors, one h1, language, main landmark, and zero missing image alt attributes. The final live Playwright run passed 52/52, including Axe serious/critical checks, keyboard route focus, offline reload/export, privacy request logs, demo isolation, and static 404 coverage.
- Mobile Lighthouse on the live root: Performance 100, Accessibility 100, LCP 1053 ms, CLS 0. Evidence: `evidence/polish-3/live/lighthouse.json`.
