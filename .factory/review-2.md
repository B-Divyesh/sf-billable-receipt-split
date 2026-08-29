# Adversarial first-read review 2 — Billable Split

**Verdict: FAIL** — 2026-08-29 UTC, production URL reviewed in fresh Chromium contexts at 390 × 844 and 1440 × 1000. No product code was modified.

## Cold first read

This passes. Before scrolling, I understood that the tool splits one supplier receipt between jobs; it is for contractors buying materials for several jobs; and I should click **“Try it with sample data.”** The exact first-screen copy is:

- `<h1>`: **“Split one supplier receipt by job”**
- Audience: **“For contractors who buy materials for several jobs and need billable cost records.”**
- Action/outcome: **“Try it with sample data”** / **“See a completed split and exports.”**

The job-ledger/receipt visual system is distinct and not a generic SaaS template.

## Findings

### Blocking

#### F-2-1 (re-raised F-1-2) — Demo controls do not complete their promised action

**Location / quote:** `/demo` banner: **“Demo — sample data, nothing is saved”**, **“Reset demo”**, **“Start for real.”**

**Evidence:** In fresh production contexts, clicking either button left the URL at `/demo`, the banner visible, and `<h1>` **“North Yard Supply”** after ten seconds. No console error appeared. Thus Reset cannot be relied on to reseed sample data and Start for real does not discard sample data or return to the real archive.

**Fix:** Make both async handlers settle. Add E2E coverage that edits the sample, resets it, and proves a pre-existing real receipt survives; then click Start for real and assert `/`, no demo banner, an untouched real archive, and discarded demo data.

#### F-2-2 (re-raised F-1-2 and F-1-7) — Demo mode reads/writes real license storage and sends a real network request

**Location / quote:** `/demo` says **“Demo — sample data, nothing is saved”**. The footer says **“Purchase and license checks contact Sociobot only when you choose them.”**

**Evidence:** I preloaded `sb_license:billable-receipt-split=review-fake-license` and a stale cached verdict, then opened `/demo`. Production requested `https://api.sociobot.in/api/v1/products/billable-receipt-split/verify?license=review-fake-license`, then rewrote the real `sb_license_verdict:billable-receipt-split` value to an invalid verdict. [`src/license.ts`](../src/license.ts) always uses those real localStorage keys, and [`src/main.ts`](../src/main.ts) calls `verifyLicense()` after loading demo mode. The existing test starts with blank localStorage, so it misses this case.

**Why this fails:** Demo mode must not read or write real storage. It also contacts Sociobot without a demo action. Both visitor statements are misleading.

**Fix:** In demo mode do not capture, read, verify, or write real license state. Use demo-only keys and a canned demo verdict, or omit license operations. Add a claim test that preloads real receipt/license data, opens `/demo`, runs Reset/Start, and asserts no real-key mutation and no `api.sociobot.in` request.

#### F-2-3 (re-raised F-1-8) — SPA route changes leave focus on `BODY`, not the new `<h1>`

**Evidence:** From `/`, activating **“Data & license”** changed to `/settings`, title **“Data and license — Billable Split”**, and heading **“Your data, your key.”** Browser Back restored `/` and the landing heading. After both transitions, `document.activeElement` was `BODY`.

**Why this fails:** Keyboard and screen-reader users do not get the required route focus/reading position. The code calls `heading.focus()`, but the h1 is not focusable; only `<main>` has `tabindex="-1"`.

**Fix:** Render the route h1 with `tabindex="-1"`, focus it after render, and test link navigation plus browser Back/Forward for focused h1 and changed polite announcement.

### Major

#### F-2-4 — The paid-limit promise is unlisted

**Quote:** Landing: **“Five receipts are free; $19 removes the limit.”** README: **“A $19 one-time Sociobot license removes the limit.”**

`free-receipt-limit` only claims five are free. Its test injects records into IndexedDB and never proves the price or a verified license removes the limit.

**Fix:** Add `license-removes-limit` with a canned demo license verdict and a sixth-receipt assertion, or remove the untested paid detail.

#### F-2-5 — Cost classifications are unlisted

**Quote:** README: **“Assign each item to a job and mark it billable, reimbursable, or non-billable.”** / **“Mark costs as billable, reimbursable, or non-billable.”**

`job-allocation` proves named jobs, not these stored/exported classifications.

**Fix:** Add `cost-classification`, asserting all three demo statuses and their exported values, or remove this detail.

#### F-2-6 — PDF source evidence is unlisted

**Quote:** README: **“The PDF includes the receipt image and its tamper-check value.”**

`pdf-export` checks only a filename; `source-retention` checks only the on-screen panel.

**Fix:** Add `pdf-source-evidence` that inspects the generated PDF fixture for the image and recorded tamper-check value, or remove the promise.

#### F-2-7 — Receipt history and permanent deletion are unlisted

**Quote:** README: **“Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload.”**

Only offline reload has a claim entry.

**Fix:** Add `receipt-history` and `permanent-deletion` demo tests: edit a receipt, assert history, delete it, reload, and confirm absence.

#### F-2-8 — Backup/password/integrity promises are unlisted

**Quote:** README: **“Download one password-protected backup of your receipts and images.”** **“Backup passwords never leave the browser.”** **“Before restoring a backup, the app checks that every saved receipt image still matches.”**

There are general tests, but no registry entries or tagged demo-sandbox claim tests.

**Fix:** Add `encrypted-backup` and `backup-image-check`; verify password protection and a tampered image blocking restoration without replacing current demo data.

#### F-2-9 — Installation/reopen behaviour is unlisted

**Quote:** README: **“Install it on a phone or computer and reopen it without a connection.”**

`offline-reload` does not prove installation/relaunch.

**Fix:** Add an installation/relaunch claim test where supported, or replace this with the tested **“Works offline after the first visit.”**

#### F-2-10 — The automatic-text-reading limitation is unlisted scope behaviour

**Quote:** README: **“It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice.”**

The first clause is an observable product claim, but no test establishes that image import makes no extraction request and requires manual line entry.

**Fix:** Add `manual-receipt-entry`; upload an image, assert no lines are extracted and no extraction request occurs. Keep the legal/tax items as a labelled disclaimer.

## Copy audit

Whitespace-delimited word counts; URLs count as one word. No audited sentence exceeds 22 words. No banned marketing adjective, mood slogan, jargon problem, unclear heading, or non-result-naming landing button was found. Claim flags above remain findings.

### Landing sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 13 | For contractors who buy materials for several jobs and need billable cost records. | Clear |
| 6 | See a completed split and exports. | Clear |
| 6 | Receipt data stays in this browser. | `receipt-data-local`; F-2-2 limits demo truth |
| 6 | Works offline after the first visit. | `offline-reload` |
| 8 | Five receipts are free; $19 removes the limit. | F-2-4 |
| 10 | Add a supplier receipt to split its lines between jobs. | Clear empty-state instruction |

Headings/labels/buttons checked: **Receipt costs for several jobs** (5), **Split one supplier receipt by job** (6), **Try it with sample data** (5), **Source receipt** (2), **Split by job** (3), **Export records** (2), **Saved receipts: 0** (3), **Recent receipts** (2), **No receipts saved yet** (4), **Add a receipt** (3). All are plain, contextual, or result-naming.

### README sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 11 | Billable Split helps contractors split one supplier receipt across several jobs. | Clear |
| 7 | Keep the receipt photo with each split. | `source-retention` |
| 13 | Assign each item to a job and mark it billable, reimbursable, or non-billable. | F-2-5 |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export` |
| 8 | Open https://billable-receipt-split.sociobot.in/demo to see a completed materials receipt. | Clear |
| 6 | The demo uses separate sample storage. | F-2-2 |
| 7 | Reset demo replaces only its sample data. | F-2-1 |
| 5 | Start for real discards it. | F-2-1 |
| 11 | Keeps the receipt photo and a tamper-check value with each export. | F-2-6 |
| 13 | Add each purchased item, split its amount between jobs, and see what remains. | `job-allocation` |
| 7 | Mark costs as billable, reimbursable, or non-billable. | F-2-5 |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export` |
| 10 | The PDF includes the receipt image and its tamper-check value. | F-2-6 |
| 18 | Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload. | F-2-7 |
| 9 | Download one password-protected backup of your receipts and images. | F-2-8 |
| 13 | Install it on a phone or computer and reopen it without a connection. | F-2-9 |
| 5 | Store five receipts for free. | `free-receipt-limit` |
| 8 | A $19 one-time Sociobot license removes the limit. | F-2-4 |
| 16 | It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice. | F-2-10 |
| 5 | Requires Node.js 20 or newer. | Clear developer requirement |
| 5 | Playwright is pinned to 1.58.2. | Clear developer setup fact |
| 11 | The static deployment root is `dist/`, with `dist/index.html` at its root. | Clear deployment instruction |
| 17 | The deployment serves application routes with SPA fallback and serves `/privacy/`, `/terms/`, and `/404.html` as static pages. | Clear in context |
| 11 | Receipt data stays in the browser profile that opened the app. | F-2-2 qualification |
| 11 | The app has no ads, tracking, remote fonts, or third-party downloads. | Request log is consistent |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | F-2-2 |
| 6 | Backup passwords never leave the browser. | F-2-8 |
| 14 | Before restoring a backup, the app checks that every saved receipt image still matches. | F-2-8 |
| 8 | See the privacy page, terms, and demo notes. | Clear |
| 4 | MIT — see LICENSE. | Clear |

README headings are functional. SPA and Playwright appear only in labelled developer/deployment material.

## Demo, claims, structure, and test evidence

- `/demo` immediately shows a populated North Yard Supply receipt with three jobs, allocations, source image, and CSV/PDF controls at both sizes. Its first sample screen passes.
- Receipt IndexedDB namespaces are separate (`demo:billable-split` and `billable-split`). A raw real receipt record survived a demo Reset attempt. This does not fix the license localStorage breach in F-2-2.
- Cold-load request logs were same-origin shell/image/JS/CSS only; offline demo reload and CSV/PDF export passed in the live E2E suite.
- Fresh clone `/tmp/billable-review-2.rvOGi5`: `npm ci`, `npm test` (10/10), `npm run build`, `npm run lint`, `npx tsc --noEmit`, and each command from `.factory/claims.json` passed individually. The final clean-clone Playwright result was `{"status":"passed","failedTests":[]}`. Live full E2E also passed.
- The seven registry entries each have one `@claim:` declaration, but they do not cover the broken demo controls, pre-existing real localStorage, route focus, or F-2-4 through F-2-10.
- Root/demo/settings/privacy/terms/static 404/robots/sitemap/social image/checkout resolved. Metadata, one h1, main, lang, shared legal skeleton, skip link, 44px targets, no cold-load console errors, and serious/critical Axe checks passed. The designed unknown-route view renders; only route focus remains blocking.

## Earlier-history recheck

| Earlier IDs | Confirmation |
| --- | --- |
| F-1-1 | Fixed: the first screen names job, audience, and sample action. |
| F-1-2 | **Unfixed:** F-2-1 and F-2-2 re-raise its demo-reset/start/isolation requirements. |
| F-1-3 | Registry/tagged tests exist; new omissions are F-2-4 to F-2-10. |
| F-1-4 | Base source/split/CSV/PDF entries exist; PDF evidence detail remains F-2-6. |
| F-1-5 | Five-receipt boundary exists; paid-limit promise remains F-2-4. |
| F-1-6 | Ordinary storage/offline reload checks pass. |
| F-1-7 | **Unfixed in demo:** real license storage/network activity is F-2-2. |
| F-1-8 | **Unfixed:** route focus remains on BODY (F-2-3). |
| F-1-9 | Fixed: metadata/canonical/social/touch icon are present. |
| F-1-10 | Fixed: shared header/footer, legal links, Param Factory, version. |
| F-1-11 | Fixed: eyebrow is plain/contextual. |
| F-1-12 | Ordinary wording is fixed; demo exception is F-2-2. |
| F-1-13 | Fixed: `Saved receipts: 0` is clear. |
| F-1-14 | Fixed: README opening is plain/audience-specific. |
| F-1-15 | Fixed: README opening is short sentences. |
| F-1-16 | Fixed: tamper-check wording replaces hash jargon. |
| F-1-17 | Fixed: plain item/job split language. |
| F-1-18 | Fixed: plain CSV/PDF language. |
| F-1-19 | Fixed: plain browser-storage wording. |
| F-1-20 | Fixed: outcome-led backup wording. |
| F-1-21 | Wording fixed; installation proof is F-2-9. |
| F-1-22 | Fixed: automatic-reading wording replaces OCR. |
| F-1-23 | Fixed: browser-profile wording replaces origin. |
| F-1-24 | Wording fixed; backup integrity proof is F-2-8. |

## Missed leverage

The brief does not imply AI, OCR, import, or sync. Manual local-first entry and per-job CSV/PDF exports are the intended scope. The necessary leverage is reliable isolated demo behaviour and proof for the already advertised record, backup, license, and PDF behaviour.

## What would make this perfect

1. Make Reset and Start for real complete and test their real-data boundary.
2. Keep demo mode completely away from real license storage and Sociobot verification.
3. Focus the h1 after SPA and Back/Forward navigation.
4. Add claim entries/tests for every listed visitor promise, or remove unsupported detail.
