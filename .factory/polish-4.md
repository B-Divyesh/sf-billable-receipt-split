# Polish round 4 — cumulative finding closure

Completed 2026-08-29. Final product commit before this evidence file: `5983d8437c91d9ba4e2ef9c73eb3a369818811d5`. Repair commits: `05e3748`, `6fb2134`, and `5983d84`. Final deployment: `c6090a42-7b1d-40b9-b8d0-e10c1b8da575` at <https://billable-receipt-split.sociobot.in>.

Evidence shorthand used below:

- **clean claims** — every one of the 16 exact commands in `.factory/claims.json` passed independently in the remote fresh clone `/tmp/billable-polish4-final.5AiEB9/repo` at `6fb2134`; every command passed on desktop and 390 px mobile.
- **final live suite** — the exact deployed product at `5983d84` passed all 52 Playwright tests across desktop and 390 px mobile.
- **repeated live suite** — the complete production suite passed 104/104 after the F-4-1 repair; the final exact deployment then passed 52/52 again.
- **live cold check** — `.factory/evidence/polish-4/live/verify.json`: 707 ms load, no console errors, one h1, `lang=en`, main landmark, no missing image alternatives, and no unlabeled buttons.

## Finding matrix

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the verb-first “Split one supplier receipt by job” headline, named contractors and their multi-job purchase situation, and put the sample action before scroll. | `explains the workflow, scope, and license on the landing page`; [live root](https://billable-receipt-split.sociobot.in/); `.factory/evidence/polish-4/live/screenshot-mobile.png`. |
| F-1-2 | Kept both `/demo` and `?demo=1`; added a realistic matching source receipt; preserved the populated sample, `demo:` database, persistent banner, Reset demo, and Start for real. | `@claim:demo-isolation`, `@claim:source-retention`; [live demo](https://billable-receipt-split.sociobot.in/demo); `.factory/evidence/polish-4/live/demo-mobile.png`, `.factory/evidence/polish-4/live/demo-query-desktop.png`. |
| F-1-3 | Kept the 16-entry claims registry and checked that each id has exactly one tagged observable test. | Static tag check: 16/16 unique; clean claims; `.factory/claims.json`. |
| F-1-4 | Kept source-image, job-split, CSV, and PDF promises paired with outcome tests. | `@claim:source-retention`, `@claim:job-allocation`, `@claim:csv-export`, `@claim:pdf-export`; clean claims. |
| F-1-5 | Made both free-limit setup paths wait for and validate the complete seed before creating the five-record boundary. | `@claim:free-receipt-limit`, `@claim:license-removes-limit`; repeated live suite; final live suite. |
| F-1-6 | Kept local persistence and offline wording scoped to tested behavior; cached the real demo source image. | `@claim:receipt-data-local`, `@claim:offline-reload`; clean claims and final live suite. |
| F-1-7 | Kept privacy wording explicit about browser storage and user-chosen Sociobot license checks. | `@claim:receipt-data-local`, `@claim:demo-isolation`; [live privacy](https://billable-receipt-split.sociobot.in/privacy/). |
| F-1-8 | Kept History API routes, Back handling, h1 focus, polite announcements, deep links, and the designed unknown-page route. | `moves focus and announces the destination on route navigation and browser Back`; `keeps the static 404 in the shared navigation shell`; final live suite. |
| F-1-9 | Kept route titles, descriptions, canonical and social metadata, 1200 × 630 preview, favicon, and touch icon; route changes now also update `og:url`. Long receipt titles are bounded to 60 characters. | `uses Demo metadata for a cold sample route`; live cold check; Lighthouse 100 accessibility. |
| F-1-10 | Kept the same wordmark, navigation, legal links, Param Factory credit, and build label in app, legal, offline, and static-404 shells. | `has keyboard-visible landmarks and legal links`; [live 404](https://billable-receipt-split.sociobot.in/404.html); `.factory/evidence/polish-4/live/404-mobile.png`. |
| F-1-11 | Kept the plain first-screen label “Receipt costs for several jobs.” | `.factory/copy-audit.md`; [live root](https://billable-receipt-split.sociobot.in/). |
| F-1-12 | Kept the concrete browser-storage and optional-license disclosure instead of a privacy slogan. | `@claim:receipt-data-local`; live root and privacy page. |
| F-1-13 | Kept the archive state labelled “Saved receipts: n.” | Landing/dashboard regression in final live suite. |
| F-1-14 | Kept the README opening contractor-focused and outcome-led. | `README.md`; `.factory/copy-audit.md`. |
| F-1-15 | Kept README ideas in short separate sentences; the complete landing audit has no sentence over 22 words. | `.factory/copy-audit.md`. |
| F-1-16 | Kept “tamper-check value” as the visitor term and reserved SHA-256 for implementation detail. | `@claim:pdf-source-evidence`; README and live demo. |
| F-1-17 | Removed the final visible “allocation ledger/allocated” remnants in favor of “job split ledger/split.” | `@claim:job-allocation`; `.factory/copy-audit.md`; `.factory/evidence/polish-4/live/demo-mobile.png`. |
| F-1-18 | Kept concrete CSV/PDF wording instead of “evidence packets.” | `@claim:csv-export`, `@claim:pdf-export`; clean claims. |
| F-1-19 | Kept storage wording about this browser rather than IndexedDB implementation terms. | `@claim:receipt-data-local`; README and privacy page. |
| F-1-20 | Kept backup wording outcome-led and password-focused. | `@claim:encrypted-backup`; live `/demo/settings`. |
| F-1-21 | Kept the unsupported installation/relaunch promise removed; only tested offline reload remains. | `@claim:offline-reload`; README and claims registry. |
| F-1-22 | Kept “does not read receipt text automatically” instead of OCR jargon. | `@claim:manual-receipt-entry`; live scope section. |
| F-1-23 | Kept “browser profile” wording instead of origin jargon. | `@claim:receipt-data-local`; README and privacy page. |
| F-1-24 | Kept backup/restore privacy and image-check outcomes in plain words. | `@claim:encrypted-backup`, `@claim:backup-image-check`; clean claims. |
| F-2-1 | Reset now clears and reseeds only the demo; Start for real clears only demo state and returns to untouched real data. | `@claim:demo-isolation` now edits, resets, verifies the original line, exits, and checks both databases; final live suite. |
| F-2-2 | Demo never reads, writes, verifies, or retains real license state and makes no Sociobot request. | `@claim:demo-isolation`, `@claim:receipt-data-local`; final live suite. |
| F-2-3 | Every route h1 is focusable and receives focus after link navigation and browser Back; changes are announced. | `moves focus and announces the destination on route navigation and browser Back`; final live suite. |
| F-2-4 | Kept the isolated $19 sample-license proof, including free CSV at the cap and acceptance of the sixth receipt only after the sample license. | `@claim:license-removes-limit`; clean claims. |
| F-2-5 | Kept billable, reimbursable, and non-billable values in the sample and its CSV exports. | `@claim:cost-classification`; `.factory/evidence/polish-4/live/demo-mobile.png`. |
| F-2-6 | Kept the receipt image and tamper-check value inside generated PDF output; the sample image now has real 720 × 1100 content. | `@claim:pdf-source-evidence`, `@claim:source-retention`; clean claims. |
| F-2-7 | Kept visible edit history and permanent deletion across reload. | `@claim:receipt-history`, `@claim:permanent-deletion`; clean claims. |
| F-2-8 | Kept encrypted backup proof and rejection of a mismatched image without replacing existing data; hardened the setup to validate a complete seed. | `@claim:encrypted-backup`, `@claim:backup-image-check`; final live suite. |
| F-2-9 | Kept unsupported install/relaunch copy absent while retaining the tested offline behavior. | `@claim:offline-reload`; README and copy audit. |
| F-2-10 | Kept manual image upload with no automatic line extraction and no extraction request. | `@claim:manual-receipt-entry`; clean claims. |
| F-3-1 | Kept cold `/demo` and `?demo=1` metadata fixed to “Demo — Billable Split,” the demo description, canonical `/demo`, and matching social URL. | `uses Demo metadata for a cold sample route`; final live suite. |
| F-3-2 | Kept the complete shared header/footer and usable mobile link spacing on direct `/404.html`. | `keeps the static 404 in the shared navigation shell`; `.factory/evidence/polish-4/live/404-mobile.png`. |
| F-3-3 | Kept product-specific How it works, scope/privacy, and exact free/$19 sections in ledger form. | `explains the workflow, scope, and license on the landing page`; `.factory/evidence/polish-4/live/screenshot-mobile.png`. |
| F-3-4 | Kept the settings h1 “Back up or restore receipt data.” | Route-focus regression and final live suite; live `/settings`. |
| F-4-1 | Added `fillFreeSampleArchive`: it waits for North Yard Supply, rejects the storage-error page, validates the seed id and `lines` array, then fills to five. Both free and licensed-limit paths use it and recheck after reload. | Targeted local repeat 24/24; repeated live suite 104/104; clean-clone individual claim commands; final live suite 52/52. |

## Additional acceptance work

- Replaced the demo's 1 × 1 placeholder with an original, fictional 720 × 1100 receipt matching the three sample lines and $501.75 total. Its PNG SHA-256 is `d45ecb57009b87820bcc409c60e5321f5feaa6bef88661f5fc5975f46416691f`; the editable SVG and provenance sidecar are in `assets/src/`.
- Updated the service-worker cache to v14, manifest start URL to v5, and product/build labels to v1.3.1.
- Updated the catalog line to “Split supplier receipts across jobs and export billable records offline.” It is verb-first and 72 characters.
- Preserved the product's single-mode job-ledger terminal identity and documented the new original asset in `.factory/design.md`.

## Final verification

- Clean remote clone: `npm ci` (0 vulnerabilities); all 16 claim commands; `npm test` (11/11); lint; TypeScript; build; `npm run test:e2e` (52/52); release contract.
- Exact final local tree: unit 11/11, lint, TypeScript, build, and release contract passed. Build output: initial JS 15.00 KB gzip and CSS 5.28 KB gzip.
- Exact final deployment: Playwright 52/52; all checked routes and assets returned 200; live sample PNG matched its committed SHA-256.
- Lighthouse mobile: Performance 100, Accessibility 100, LCP 1,059 ms, CLS 0, TBT 0. Report: `evidence/polish-4/live/lighthouse.json`.
- Live cold verification and final screenshots are in `evidence/polish-4/live/`.

No finding remains open.
