# Adversarial first-read review 5 — Billable Split

**Verdict: PASS** — reviewed 2026-08-29 UTC against <https://billable-receipt-split.sociobot.in> in fresh Chromium contexts at 390 × 844 and 1440 × 1000. This review did not modify product code.

## Findings

None. There are zero blocking, major, or minor findings and no untested listed claim.

## Cold first read

This passes before scrolling at both widths.

- What it does: splits one supplier receipt between jobs and produces job cost records.
- For whom: contractors who buy materials for several jobs.
- First action: **Try it with sample data**; the adjacent text says **See a completed split and exports.**

The exact first-screen copy is:

- H1: **Split one supplier receipt by job**
- Audience: **For contractors who buy materials for several jobs and need billable cost records.**
- Primary action: **Try it with sample data**
- Three facts: **Receipt data stays in this browser.** / **Works offline after the first visit.** / **Five receipts are free; $19 removes the limit.**

The mobile first screen exposed all of that copy, the action, and the start of the product-specific receipt illustration without horizontal overflow. The desktop first screen also exposed the empty real archive and its **Add a receipt** action. Neither cold context logged a console error.

## Copy audit

Counts are whitespace-delimited. Every visible landing-page and README sentence is listed. No sentence exceeds 22 words. No banned marketing adjective, jargon in visitor copy, inconsistent product term, metaphor or mood heading, empty slogan, or non-result-naming landing action was found.

### Landing-page sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 13 | For contractors who buy materials for several jobs and need billable cost records. | Clear audience and situation. |
| 6 | See a completed split and exports. | Clear sample outcome. |
| 6 | Receipt data stays in this browser. | Covered by receipt-data-local. |
| 6 | Works offline after the first visit. | Covered by offline-reload. |
| 8 | Five receipts are free; $19 removes the limit. | Covered by free-receipt-limit and license-removes-limit. |
| 10 | Add a supplier receipt to split its lines between jobs. | Clear empty-state instruction. |
| 7 | Keep the supplier photo with every split. | Covered by source-retention. |
| 9 | Enter each item, then divide its amount between jobs. | Covered by job-allocation. |
| 8 | Download a CSV or PDF for each job. | Covered by csv-export and pdf-export. |
| 4 | Enter receipt lines yourself. | Clear manual-entry instruction. |
| 7 | It does not read receipt text automatically. | Covered by manual-receipt-entry. |
| 12 | Review each amount before using an export for bookkeeping or tax work. | Useful safety instruction, not a capability promise. |
| 6 | Receipt data stays in this browser. | Covered by receipt-data-local. |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | Covered by receipt-data-local, demo-isolation, and the release check. |
| 4 | Five receipts are free. | Covered by free-receipt-limit. |
| 9 | A $19 one-time license removes only the receipt limit. | Covered by license-removes-limit. |
| 6 | Receipt data stays in this browser. | Footer repetition; covered by receipt-data-local. |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | Footer repetition; covered as above. |

Landing headings checked: **Split one supplier receipt by job**, **Recent receipts**, **No receipts saved yet**, **How it works**, **Capture the source receipt**, **Split each item by job**, **Export records by job**, **What Billable Split does not do**, and **Free and paid use**. Each names its page or section without depending on brand lore.

Landing actions checked: **Try it with sample data**, **Add a receipt**, **Read the privacy details**, and **View data and license options**. Each names the resulting action or destination. Navigation labels are place names and remain consistent across routes.

### README sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 11 | Billable Split helps contractors split one supplier receipt across several jobs. | Clear. |
| 7 | Keep the receipt photo with each split. | source-retention. |
| 13 | Assign each item to a job and mark it billable, reimbursable, or non-billable. | job-allocation and cost-classification. |
| 8 | Download a CSV or PDF for each job. | csv-export and pdf-export. |
| 8 | Open https://billable-receipt-split.sociobot.in/demo to see a completed materials receipt. | Clear demo instruction. |
| 6 | The demo uses separate sample storage. | demo-isolation. |
| 7 | Reset demo replaces only its sample data. | demo-isolation. |
| 5 | Start for real discards it. | demo-isolation. |
| 11 | Keeps the receipt photo and a tamper-check value with each export. | source-retention and pdf-source-evidence. |
| 13 | Add each purchased item, split its amount between jobs, and see what remains. | job-allocation. |
| 7 | Mark costs as billable, reimbursable, or non-billable. | cost-classification. |
| 8 | Download a CSV or PDF for each job. | csv-export and pdf-export. |
| 10 | The PDF includes the receipt image and its tamper-check value. | pdf-source-evidence. |
| 18 | Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload. | receipt-data-local, receipt-history, permanent-deletion, and offline-reload. |
| 9 | Download one password-protected backup of your receipts and images. | encrypted-backup. |
| 5 | Store five receipts for free. | free-receipt-limit. |
| 10 | A $19 one-time Sociobot license removes only the receipt limit. | license-removes-limit. |
| 16 | It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice. | manual-receipt-entry covers the observable first clause; the rest states scope. |
| 5 | Requires Node.js 20 or newer. | Clear developer requirement. |
| 11 | Receipt data stays in the browser profile that opened the app. | receipt-data-local. |
| 8 | Run every visitor-facing claim from a clean checkout. | Clear test instruction. |
| 5 | Playwright is pinned to 1.58.2. | Clear developer note. |
| 11 | The static deployment root is dist/, with dist/index.html at its root. | Clear deployment instruction. |
| 17 | The deployment serves application routes with SPA fallback and serves /privacy/, /terms/, and /404.html as static pages. | Clear deployment instruction. |
| 6 | Receipt data stays in your browser. | receipt-data-local. |
| 11 | The app has no ads, tracking, remote fonts, or third-party downloads. | Confirmed by the request logs and source/build inspection supporting receipt-data-local. |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | receipt-data-local, demo-isolation, and release check. |
| 9 | Backup passwords protect the downloaded file in this browser. | encrypted-backup. |
| 14 | Before restoring a backup, the app checks that every saved receipt image still matches. | backup-image-check. |
| 8 | See the privacy page, terms, and demo notes. | Clear reference. |
| 4 | MIT — see LICENSE. | Clear reference. |

**Live product:** is a label followed by a URL, not a sentence. README headings — **Billable Split**, **Try the sample**, **What it includes**, **Local development**, **Test and build**, **Data and privacy**, **Project notes**, and **License** — all name their section.

Terminology remains consistent: receipt, job, split, CSV or PDF, tamper-check value, and sample data. Implementation terms appear only in developer material.

## Demo and sandbox

The first-screen action opened /demo in one click. The first demo screen already showed a completed North Yard Supply record: a $501.75 source receipt, three realistic material lines, three named jobs, the original 720 × 1100 sample receipt, and a ready-to-export state.

The persistent banner read **Demo — sample data, nothing is saved** and exposed **Reset demo** and **Start for real**. In a fresh context, the review:

1. seeded a real receipt and real license keys;
2. entered the demo and changed a sample line;
3. reset the demo and confirmed the original line returned;
4. selected Start for real;
5. confirmed the real receipt and license values were untouched; and
6. confirmed the demo receipt store was empty.

The demo used demo:billable-split while the real archive used billable-split. The complete demo request log contained no cross-origin request. The live offline test reloaded the seeded demo and exported a PDF after the browser context was switched offline.

## Claims

The clean clone was /tmp/billable-review5.srOMyI/repo at 63f2ff893530c5c41e0922488fe3c41dd51965bf. Every exact command in .factory/claims.json ran independently. Each command exercised both configured projects: desktop and 390 px mobile.

| Claim ID | Clean result |
| --- | --- |
| source-retention | PASS — 2/2 |
| job-allocation | PASS — 2/2 |
| csv-export | PASS — 2/2 |
| pdf-export | PASS — 2/2 |
| free-receipt-limit | PASS — 2/2 |
| receipt-data-local | PASS — 2/2 |
| offline-reload | PASS — 2/2 |
| license-removes-limit | PASS — 2/2 |
| cost-classification | PASS — 2/2 |
| pdf-source-evidence | PASS — 2/2 |
| receipt-history | PASS — 2/2 |
| permanent-deletion | PASS — 2/2 |
| encrypted-backup | PASS — 2/2 |
| backup-image-check | PASS — 2/2 |
| manual-receipt-entry | PASS — 2/2 |
| demo-isolation | PASS — 2/2 |

A static tag audit found each of the 16 IDs exactly once. No landing-page or README capability/privacy statement lacks registry and observable-test coverage. The exact production build then passed the entire browser suite twice: 104/104. That repeated run includes both formerly nondeterministic free-limit paths.

## Structure, accessibility, and links

- Titles: root is **Billable Split — split receipt costs by job**; demo, settings, privacy, terms, receipt detail, and both not-found views set route-specific titles within the required pattern.
- Every checked route has lang=en, one h1, one main landmark, a description, canonical, OG/Twitter metadata, favicon, Apple touch icon, shared header/footer, legal links, and no console error.
- The social image is a real 1200 × 630 product-derived image. The bundled sample receipt is 720 × 1100.
- /, /demo, /demo/list, /demo/settings, /settings, /privacy/, /terms/, /404.html, and an unknown deep link opened. Browser Back restored the route, focused the new h1, and updated the polite route announcement.
- The complete discovered-link crawl returned 200 for every product/internal and Param Factory link. Checkout returned its expected 303 hosted-payment redirect.
- The live response includes CSP, HSTS, Permissions-Policy, Referrer-Policy, and nosniff. CSP frame-ancestors is delivered as a header, not a meta element.
- The direct static 404 and the SPA unknown-route view are designed in the same job-ledger identity and provide a route back.
- Axe serious/critical checks passed on the tested application, legal, demo, and not-found routes. The smoke verifier reported one h1, a main landmark, no missing image alternatives, no unlabeled buttons, and no console/page errors.
- The 390 px route had no horizontal overflow. Keyboard dialog focus, Escape restoration, visible focus, 44 px targets, and reduced-motion behavior passed the production suite.
- The cold smoke load completed in 563 ms. Initial application JS is 15.00 kB gzip and CSS is 5.28 kB gzip; the PDF dependencies remain deferred.
- The dark workshop/receipt-paper palette, pixel ledger rail, tabular money, hard rules, original receipt-splitting art, and mint/amber status system implement .factory/design.md. This is not a generic centered SaaS hero or feature-card template.

## Earlier-history recheck

All four earlier reviews, all four polish reports, and the prior handoff were read. Each earlier finding was checked in the live site and current code rather than accepted from its closure label.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: the cold first screen names the task, contractors, and the sample action. |
| F-1-2 | Fixed: /demo and ?demo=1 seed a realistic receipt in separate storage with the required banner, Reset, and Start for real. |
| F-1-3 | Fixed: 16 registry entries exist and each has one tagged observable test. |
| F-1-4 | Fixed: source retention, job splitting, CSV, and PDF outcomes pass independently. |
| F-1-5 | Fixed: the five-receipt boundary and recovery pass locally and in the repeated live suite. |
| F-1-6 | Fixed: same-origin request logging and offline reload/export pass. |
| F-1-7 | Fixed: privacy copy is scoped and demo/export request logs show no receipt transfer. |
| F-1-8 | Fixed: real routes, deep links, Back, h1 focus, announcements, and designed not-found views work. |
| F-1-9 | Fixed: route metadata, canonical, social image, favicon, and touch icon are present. |
| F-1-10 | Fixed: app, legal, demo, and static-404 pages use the shared header/footer contract. |
| F-1-11 | Fixed: **Receipt costs for several jobs** is concrete context, not the earlier desk metaphor. |
| F-1-12 | Fixed: scoped browser/Sociobot disclosure replaces the privacy slogan. |
| F-1-13 | Fixed: **Saved receipts: 0** plainly names the count. |
| F-1-14 | Fixed: README opens with the contractor/job outcome. |
| F-1-15 | Fixed: every README sentence is at most 22 words. |
| F-1-16 | Fixed: visitor copy uses **tamper-check value**, with implementation detail kept out of the feature copy. |
| F-1-17 | Fixed: visitor copy consistently says item/job split. |
| F-1-18 | Fixed: visitor copy names CSV and PDF rather than evidence packets. |
| F-1-19 | Fixed: storage copy names the browser rather than IndexedDB. |
| F-1-20 | Fixed: backup copy names the password-protected result. |
| F-1-21 | Fixed: the unsupported installation/relaunch promise remains absent. |
| F-1-22 | Fixed: copy says the app does not read receipt text automatically. |
| F-1-23 | Fixed: README uses browser-profile language rather than origin jargon. |
| F-1-24 | Fixed: privacy and restore wording is plain; backup integrity passes independently. |
| F-2-1 | Fixed: reset/reseed and Start-for-real transitions complete in the repeated production suite. |
| F-2-2 | Fixed: demo receipt/license state stays isolated and makes no Sociobot request. |
| F-2-3 | Fixed: h1 focus and polite announcements pass after navigation and Back. |
| F-2-4 | Fixed: the $19 sample-license path proves free export at the cap and acceptance of a sixth receipt after unlock. |
| F-2-5 | Fixed: billable, reimbursable, and non-billable values appear in the sample CSV evidence. |
| F-2-6 | Fixed: the PDF bytes contain the source image and tamper-check value. |
| F-2-7 | Fixed: edit history and permanent deletion survive reload checks. |
| F-2-8 | Fixed: encrypted backup and mismatched-image rejection pass without replacing sample data. |
| F-2-9 | Fixed: unsupported install/relaunch copy remains absent; only tested offline reload is claimed. |
| F-2-10 | Fixed: image upload produces manual empty-line state and no extraction request. |
| F-3-1 | Fixed: a cold /demo load uses **Demo — Billable Split** metadata and /demo canonical. |
| F-3-2 | Fixed: direct /404.html contains Receipts, Demo, Data & license, and Privacy in the shared shell. |
| F-3-3 | Fixed: landing includes How it works, scope/privacy, and exact free/paid sections. |
| F-3-4 | Fixed: settings h1 is **Back up or restore receipt data**. |
| F-4-1 | Fixed: both free-limit setup paths validate the complete seed; the exact live suite passed twice, including both desktop and mobile repetitions. |

## Missed leverage

No missed-leverage finding. The researched brief deliberately specifies manual receipt lines, local-first data, encrypted backup, permanent deletion, and per-job CSV/PDF export. Those capabilities exist. OCR, AI classification, or cloud sync would expand the stated scope and privacy boundary rather than complete an implied step.

## Verification summary

- npm ci: PASS, 0 vulnerabilities reported during install.
- All 16 claim commands: PASS independently, 32/32 project executions.
- npm test: PASS, 11/11.
- npm run lint: PASS.
- npx tsc --noEmit: PASS.
- npm run build: PASS; dist/index.html produced.
- npm run test:release: PASS; catalog, $19 checkout redirect, and invalid-license policy confirmed.
- Production Playwright repeat: PASS, 104/104.
- /opt/fleet/lib/verify-url.sh: PASS; 563 ms, zero errors.

## What would make this perfect

Nothing remains within the reviewed brief, product contract, copy, demo, claims, privacy, accessibility, routing, or visual-identity requirements. Future OCR, AI, or sync work would be a scope change, not a repair.
