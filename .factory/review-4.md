# Adversarial first-read review 4 — Billable Split

**Verdict: FAIL** — reviewed 2026-08-29 UTC against <https://billable-receipt-split.sociobot.in> at 390 × 844 and 1440 × 1000, using fresh Chromium contexts. This review did not modify product code.

## Cold first read

Before scrolling, I understood this as: a contractor can split a single supplier receipt among several jobs and export each job's costs. It is for contractors who buy materials for more than one job. The first thing to click is **“Try it with sample data”**; it says this will show a completed split and exports.

This passes at both viewport sizes. The exact first-screen text is:

- `<h1>`: **“Split one supplier receipt by job”**
- Audience: **“For contractors who buy materials for several jobs and need billable cost records.”**
- Action/outcome: **“Try it with sample data”** / **“See a completed split and exports.”**

The 390 px page had no horizontal overflow or console errors. The receipt-paper/job-ledger visual system is distinct and does not resemble a generic SaaS template.

## Finding

### Blocking

#### F-4-1 — The free-receipt claim test is nondeterministic on production

**Location / evidence:** `.factory/claims.json` entry `free-receipt-limit`; `tests/e2e/claims.spec.ts`, test **`@claim:free-receipt-limit blocks a sixth receipt and offers recovery`**.

**Reproduction:** The production full suite was run with:

```sh
PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line
```

It failed this tagged claim. The captured page showed the demo banner followed by `<h1>Local storage is unavailable</h1>` and **“Cannot read properties of undefined (reading 'reduce')”**. `.last-run.json` recorded `status: failed` with that claim as the only failed test. The test calls `page.goto('/demo?free=1')` and immediately reads and clones the seed record from IndexedDB; it does not first wait for **“North Yard Supply”** or otherwise establish that the async demo seed is ready. This permits a record without `lines` to be inserted when the store is still empty.

A serial retry passed (2/2), and a four-repeat two-worker retry passed (8/8). That establishes nondeterminism, not a cleared defect. A claim test that sometimes cannot enter the promised sample flow is not reliable proof of **“Five receipts are free.”** The review instruction requires every failing claim test to block acceptance.

**Concrete fix:** Before the IndexedDB setup, wait for the visible seeded receipt, for example `await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible()`, then assert `items[0]` exists and has an array `lines` before cloning it. Add this readiness assertion to both free-limit setup paths, run the complete production suite repeatedly, and retain an assertion that the app never shows its storage-error page during this claim.

## Copy audit

Counts are whitespace-delimited. Every landing and README sentence is listed. No sentence exceeds 22 words. No banned marketing adjective, unexplained jargon, inconsistent product term, mood heading, or non-result-naming landing button was found. Functional statements map to the relevant registry entries; the caution to review exports is advice rather than a product promise.

### Landing sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 13 | For contractors who buy materials for several jobs and need billable cost records. | Clear. |
| 6 | See a completed split and exports. | Clear. |
| 6 | Receipt data stays in this browser. | `receipt-data-local`. |
| 6 | Works offline after the first visit. | `offline-reload`. |
| 8 | Five receipts are free; $19 removes the limit. | `free-receipt-limit`, `license-removes-limit`; F-4-1 affects its proof. |
| 10 | Add a supplier receipt to split its lines between jobs. | Clear empty-state instruction. |
| 7 | Keep the supplier photo with every split. | `source-retention`. |
| 9 | Enter each item, then divide its amount between jobs. | `job-allocation`. |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export`. |
| 4 | Enter receipt lines yourself. | `manual-receipt-entry`. |
| 7 | It does not read receipt text automatically. | `manual-receipt-entry`. |
| 12 | Review each amount before using an export for bookkeeping or tax work. | Useful caution, not a product claim. |
| 6 | Receipt data stays in this browser. | `receipt-data-local`. |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | `receipt-data-local`, `demo-isolation`. |
| 4 | Five receipts are free. | `free-receipt-limit`; F-4-1. |
| 9 | A $19 one-time license removes only the receipt limit. | `license-removes-limit`. |
| 6 | Receipt data stays in this browser. | Footer; `receipt-data-local`. |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | Footer; `receipt-data-local`, `demo-isolation`. |

Landing headings checked: **Receipt costs for several jobs**, **How it works**, **What Billable Split does not do**, and **Free and paid use** all name their sections. Buttons/links checked: **Try it with sample data**, **Add a receipt**, **Read the privacy details**, and **View data and license options** all name a result.

### README sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 11 | Billable Split helps contractors split one supplier receipt across several jobs. | Clear. |
| 7 | Keep the receipt photo with each split. | `source-retention`. |
| 13 | Assign each item to a job and mark it billable, reimbursable, or non-billable. | `job-allocation`, `cost-classification`. |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export`. |
| 8 | Open https://billable-receipt-split.sociobot.in/demo to see a completed materials receipt. | Clear demo instruction. |
| 6 | The demo uses separate sample storage. | `demo-isolation`. |
| 7 | Reset demo replaces only its sample data. | `demo-isolation`. |
| 5 | Start for real discards it. | `demo-isolation`. |
| 11 | Keeps the receipt photo and a tamper-check value with each export. | `source-retention`, `pdf-source-evidence`. |
| 13 | Add each purchased item, split its amount between jobs, and see what remains. | `job-allocation`. |
| 7 | Mark costs as billable, reimbursable, or non-billable. | `cost-classification`. |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export`. |
| 10 | The PDF includes the receipt image and its tamper-check value. | `pdf-source-evidence`. |
| 18 | Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload. | `receipt-data-local`, `receipt-history`, `permanent-deletion`, `offline-reload`. |
| 9 | Download one password-protected backup of your receipts and images. | `encrypted-backup`. |
| 5 | Store five receipts for free. | `free-receipt-limit`; F-4-1. |
| 10 | A $19 one-time Sociobot license removes only the receipt limit. | `license-removes-limit`. |
| 16 | It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice. | `manual-receipt-entry`; remaining scope exclusions are disclaimers. |
| 5 | Requires Node.js 20 or newer. | Clear developer requirement. |
| 11 | Receipt data stays in the browser profile that opened the app. | `receipt-data-local`. |
| 5 | Playwright is pinned to 1.58.2. | Clear developer note. |
| 11 | The static deployment root is `dist/`, with `dist/index.html` at its root. | Clear deployment instruction. |
| 17 | The deployment serves application routes with SPA fallback and serves `/privacy/`, `/terms/`, and `/404.html` as static pages. | Clear deployment instruction. |
| 6 | Receipt data stays in your browser. | `receipt-data-local`. |
| 11 | The app has no ads, tracking, remote fonts, or third-party downloads. | Verified by request-log coverage in `receipt-data-local`. |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | `receipt-data-local`, `demo-isolation`. |
| 9 | Backup passwords protect the downloaded file in this browser. | `encrypted-backup`. |
| 14 | Before restoring a backup, the app checks that every saved receipt image still matches. | `backup-image-check`. |
| 8 | See the privacy page, terms, and demo notes. | Clear reference. |
| 4 | MIT — see LICENSE. | Clear reference. |

The standalone **“Live product:”** label is a two-word label followed by a URL, not a sentence; it is clear.

## Demo, privacy, claims, and structure

- Direct `/demo` immediately rendered the populated North Yard Supply receipt, source image, three job splits, and CSV/PDF actions on mobile and desktop. The persistent banner says **“Demo — sample data, nothing is saved”** and provides **Reset demo** and **Start for real**.
- The local clean-clone run executed all 16 exact commands in `.factory/claims.json` independently. All passed (desktop and 390 px): source retention, allocation, CSV/PDF, free limit, local data, offline reload, licensed limit removal, classifications, PDF evidence, history, deletion, encrypted backup, backup image check, manual entry, and demo isolation.
- Claim tags were checked statically: each of the 16 registry IDs appears exactly once as `@claim:<id>`.
- Fresh demo request logging showed only same-origin assets during the sample flow. The registry exercises no external request during demo isolation and an offline reload followed by PDF export. The blocking result above means the free-limit claim still needs a deterministic test run.
- `/`, `/demo`, `/settings`, `/privacy/`, `/terms/`, `/404.html`, an unknown app route, `robots.txt`, `sitemap.xml`, and the manifest returned 200. All discovered internal links and `https://sociobot.in/` resolved successfully.
- Root response headers include CSP, HSTS, referrer policy, nosniff, and permissions policy. Root, demo, settings, legal, and static 404 metadata/routes are present. Direct `/404.html` uses the shared navigation shell. The production route-focus, back-button, title, and h1 checks passed in the live suite except for F-4-1.
- No missed leverage finding: the brief calls for manual local-first receipt entry and per-job CSV/PDF exports. It does not imply AI, OCR, importing, or sync; adding AI would be decorative.

## Earlier-history recheck

| Earlier finding | Live and code confirmation |
| --- | --- |
| F-1-1 | Fixed: plain job headline, contractor audience, and sample action appear before scroll. |
| F-1-2 | Fixed: direct seeded demo, banner, Reset, Start for real, and `demo:` namespace exist. |
| F-1-3 | Fixed: claims registry and one tagged test per ID exist. |
| F-1-4 | Fixed: source, split, CSV, and PDF claims/tests exist. |
| F-1-5 | **Regressed as F-4-1:** the five-free claim test is not deterministic in the full production suite. |
| F-1-6 | Fixed: local-data/offline statements and request/offline tests exist. |
| F-1-7 | Fixed: scoped privacy copy and demo request isolation exist. |
| F-1-8 | Fixed: real routes, back/forward, h1 focus, announcement, and designed 404 exist. |
| F-1-9 | Fixed: canonical, OG/Twitter, social image, touch icon, and route metadata are present. |
| F-1-10 | Fixed: app, legal, and static-404 shells share navigation/footer. |
| F-1-11 | Fixed: first-screen eyebrow is plain and contextual. |
| F-1-12 | Fixed: scoped privacy disclosure replaces the slogan. |
| F-1-13 | Fixed: receipt count is labelled plainly. |
| F-1-14 | Fixed: README opens with the contractor/job outcome. |
| F-1-15 | Fixed: README feature prose is short and separated. |
| F-1-16 | Fixed: tamper-check wording replaces hash jargon. |
| F-1-17 | Fixed: item/job split wording replaces allocation jargon. |
| F-1-18 | Fixed: CSV/PDF wording replaces evidence-packet jargon. |
| F-1-19 | Fixed: storage wording is browser-focused. |
| F-1-20 | Fixed: backup wording is outcome-led. |
| F-1-21 | Fixed: unsupported installation promise is absent. |
| F-1-22 | Fixed: automatic-text-reading language replaces OCR jargon. |
| F-1-23 | Fixed: browser-profile wording replaces origin jargon. |
| F-1-24 | Fixed: backup and restore privacy wording is plain. |
| F-2-1 | Fixed: demo reset/reseed and Start-for-real flows are covered by isolation. |
| F-2-2 | Fixed: demo keeps away from real license state and Sociobot requests. |
| F-2-3 | Fixed: route h1 is focusable and receives focus after navigation/Back. |
| F-2-4 | Fixed: $19 limit removal has a dedicated sample claim. |
| F-2-5 | Fixed: all three classifications have CSV evidence. |
| F-2-6 | Fixed: PDF source image and tamper-check value are inspected. |
| F-2-7 | Fixed: history and permanent deletion have claims. |
| F-2-8 | Fixed: encrypted backup and image-integrity claims exist. |
| F-2-9 | Fixed: unsupported installation/relaunch wording is removed. |
| F-2-10 | Fixed: manual-entry/no-extraction claim exists. |
| F-3-1 | Fixed: cold demo metadata is `Demo — Billable Split`. |
| F-3-2 | Fixed: static 404 has the complete shared header. |
| F-3-3 | Fixed: landing has workflow, scope/privacy, and paid-use sections. |
| F-3-4 | Fixed: settings h1 says `Back up or restore receipt data`. |

## What would make this perfect

Make the free-receipt claim test wait for the demonstrated sample state before touching IndexedDB, add a no-storage-error assertion, and show repeated clean local and production full-suite passes. No other finding remains from this review.
