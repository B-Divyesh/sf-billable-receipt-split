# Adversarial first-read review 3 — Billable Split

**Verdict: FAIL** — reviewed 2026-08-29 UTC against <https://billable-receipt-split.sociobot.in>. This review did not modify product code.

## Cold first read

This passes at 390 × 844 and 1440 × 1000 before scrolling. The product splits one supplier receipt between jobs, is for contractors buying materials for several jobs, and the first action is **“Try it with sample data.”** The exact copy is:

- `<h1>`: **“Split one supplier receipt by job”**
- Audience: **“For contractors who buy materials for several jobs and need billable cost records.”**
- Action/outcome: **“Try it with sample data”** / **“See a completed split and exports.”**

The mobile view has no horizontal overflow or console errors. The job-ledger visual language is distinct and product-specific, not a generic SaaS template.

## Findings

### Blocking

#### F-3-1 (re-raises F-1-9) — `/demo` has the wrong route title and social metadata

**Location / evidence:** A cold load of `/demo` renders the demo route at `https://billable-receipt-split.sociobot.in/demo`, but sets `<title>`, canonical social title, and Twitter title to **“North Yard Supply — Billable Split.”** The required title for this public route is **“Demo — Billable Split.”**

**Why this fails:** The browser tab, history entry, and shared preview identify a supplier record rather than the demo. It breaks the required per-route title pattern and leaves a first-time visitor with an ambiguous history entry.

**Concrete fix:** In `applyMetadata()`, prioritize `demoMode` over the seeded receipt detail for the `/demo` route. Set title/OG/Twitter title to **“Demo — Billable Split”** and description to **“Try a completed supplier receipt split with sample data.”** Add a route-metadata test for a cold `/demo` load.

#### F-3-2 (re-raises F-1-10) — The direct static 404 does not use the shared header

**Location / evidence:** `/404.html` has only **“Demo”** and **“Privacy”** in its header. The header on the app and legal routes also exposes **“Receipts”** and **“Data & license.”**

**Why this fails:** A visitor who lands on the static designed 404 gets a different navigation shell from every other public route. This is a half-fixed recurrence of the shared-shell finding: the normal unknown-route SPA view is consistent, but the actual static 404 artifact is not.

**Concrete fix:** Make `/404.html` use the same wordmark, `Receipts`, `Demo`, `Data & license`, and `Privacy` links as the application/legal header. Add `/404.html` to the shared-shell route test, rather than testing only the SPA unknown-route view.

### Minor

#### F-3-3 — The landing omits required explanatory sections

**Location / evidence:** The landing jumps from the hero and receipt archive to the footer. It has no section named **“How it works”**, no plain section explaining what the tool does not do/privacy boundary, and no dedicated paid-use section naming what the $19 license unlocks.

**Why this matters:** The first screen is clear, but a visitor who scrolls has no compact explanation of the three-step workflow, the manual-entry/no-bookkeeping boundary, or the exact free-versus-paid offer. This misses the required landing skeleton.

**Concrete fix:** Between the live preview and footer, add: (1) **“How it works”** with Capture, Split, and Export steps; (2) **“What Billable Split does not do”** with the tested manual-entry, no-bookkeeping, and privacy boundary; and (3) **“Free and paid use”** stating five receipts free and that a $19 one-time license removes only the receipt limit. Keep each statement listed in `claims.json` or add its observable test.

#### F-3-4 — The settings page h1 is a slogan, not a screen name

**Location / quote:** `/settings` and `/demo/settings` use `<h1>“Your data, your key.”</h1>` below the label **“Device control panel.”**

**Why this matters:** “Key” is ambiguous here (backup password, license token, or encryption key), and the heading does not say that the screen backs up or restores receipt data. It fails the plain-words requirement that a heading name its section out of context.

**Concrete fix:** Replace the h1 with **“Back up or restore receipt data”**. Retain the existing supporting sentence, and update the route-focus assertion to expect the replacement heading.

## Copy audit

Visible landing and README sentences were counted with URLs as one word. No sentence exceeds 22 words. The landing headings are contextual and its buttons are result-naming verbs; README headings are functional. No landing/README jargon, marketing adjective, inconsistent term, metaphor heading, or button-label finding was found.

### Landing sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 13 | For contractors who buy materials for several jobs and need billable cost records. | Clear |
| 6 | See a completed split and exports. | Clear |
| 6 | Receipt data stays in this browser. | `receipt-data-local` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 8 | Five receipts are free; $19 removes the limit. | `free-receipt-limit`, `license-removes-limit` |
| 10 | Add a supplier receipt to split its lines between jobs. | Clear empty-state instruction |
| 6 | Receipt data stays in this browser. | `receipt-data-local` |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | `receipt-data-local` |

Checked labels/buttons: **Receipt costs for several jobs** (5), **Split one supplier receipt by job** (6), **Try it with sample data** (5), **Source receipt** (2), **Split by job** (3), **Export records** (2), **Saved receipts: 0** (3), **Recent receipts** (2), **No receipts saved yet** (4), and **Add a receipt** (3). No flag.

### README sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 11 | Billable Split helps contractors split one supplier receipt across several jobs. | Clear |
| 7 | Keep the receipt photo with each split. | `source-retention` |
| 13 | Assign each item to a job and mark it billable, reimbursable, or non-billable. | `cost-classification` |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export` |
| 8 | Open https://billable-receipt-split.sociobot.in/demo to see a completed materials receipt. | Clear |
| 6 | The demo uses separate sample storage. | `demo-isolation` |
| 7 | Reset demo replaces only its sample data. | `demo-isolation` |
| 5 | Start for real discards it. | `demo-isolation` |
| 11 | Keeps the receipt photo and a tamper-check value with each export. | `pdf-source-evidence` |
| 13 | Add each purchased item, split its amount between jobs, and see what remains. | `job-allocation` |
| 7 | Mark costs as billable, reimbursable, or non-billable. | `cost-classification` |
| 8 | Download a CSV or PDF for each job. | `csv-export`, `pdf-export` |
| 10 | The PDF includes the receipt image and its tamper-check value. | `pdf-source-evidence` |
| 18 | Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload. | `receipt-history`, `permanent-deletion`, `offline-reload` |
| 9 | Download one password-protected backup of your receipts and images. | `encrypted-backup` |
| 5 | Store five receipts for free. | `free-receipt-limit` |
| 8 | A $19 one-time Sociobot license removes the limit. | `license-removes-limit` |
| 16 | It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice. | `manual-receipt-entry` for the observable first clause; remaining scope is a disclaimer |
| 5 | Requires Node.js 20 or newer. | Clear developer requirement |
| 11 | Receipt data stays in the browser profile that opened the app. | `receipt-data-local` |
| 8 | Run every visitor-facing claim from a clean checkout. | Clear developer instruction |
| 5 | Playwright is pinned to 1.58.2. | Clear developer instruction |
| 11 | The static deployment root is `dist/`, with `dist/index.html` at its root. | Clear deployment instruction |
| 17 | The deployment serves application routes with SPA fallback and serves `/privacy/`, `/terms/`, and `/404.html` as static pages. | Clear deployment instruction |
| 6 | Receipt data stays in your browser. | `receipt-data-local` |
| 11 | The app has no ads, tracking, remote fonts, or third-party downloads. | `receipt-data-local` request-log coverage |
| 11 | Purchase and license checks contact Sociobot only when you choose them. | `receipt-data-local` |
| 9 | Backup passwords protect the downloaded file in this browser. | `encrypted-backup` |
| 14 | Before restoring a backup, the app checks that every saved receipt image still matches. | `backup-image-check` |
| 8 | See the privacy page, terms, and demo notes. | Clear |
| 3 | MIT — see LICENSE. | Clear |

## Demo, claims, sandbox, and structure checks

- `/demo` immediately showed the completed North Yard Supply receipt, three named jobs, source image, balances, and CSV/PDF controls at desktop and 390 px. The persistent banner read **“Demo — sample data, nothing is saved”** and included Reset demo and Start for real.
- In a fresh live context I seeded `billable-split` with a real receipt, entered `/demo`, Reset demo, then selected Start for real. The app returned to `/`, removed demo controls, and showed the seeded real receipt after the async route transition. No external request or console error occurred; the real license key was retained.
- Live request logs for the demo flow contained only same-origin shell/assets/blob URLs. Offline reload/export, storage namespace, deletion, backup, and manual-entry behavior have tagged claim coverage.
- Live routes `/`, `/demo`, `/settings`, `/privacy/`, `/terms/`, the SPA unknown route, and `/404.html` returned 200. Crawled header/footer links and the external Param Factory link returned 200. CSP, referrer policy, and `X-Content-Type-Options` headers were present. Mobile Axe checks found no serious or critical violations on those application/legal/unknown routes.
- Root, settings, legal, and unknown routes have one h1, description, canonical, OG/Twitter metadata, favicon, language, main landmark, and no cold-load console error. The `/demo` metadata exception is F-3-1.

## Earlier-history recheck

| Earlier finding(s) | Confirmed state in live product and code |
| --- | --- |
| F-1-1, F-1-11, F-1-13 | Fixed: the first screen names the task and audience; labels are plain. |
| F-1-2, F-2-1, F-2-2 | Fixed: the populated demo, persistent controls, isolated receipt/license state, reset, and Start for real all work. |
| F-1-3 through F-1-7; F-2-4 through F-2-10 | Fixed: `claims.json` has 16 entries with one tagged observable test each; copy maps to those claims. |
| F-1-8, F-2-3 | Fixed: app route navigation and browser Back move focus to the new h1 and update the live announcement. |
| F-1-9 | **Half-fixed; re-raised as F-3-1.** `/demo` has supplier-detail metadata rather than demo-route metadata. |
| F-1-10 | **Half-fixed; re-raised as F-3-2.** The direct static 404 lacks the shared full header. |
| F-1-12, F-1-14 through F-1-24 | Fixed in the landing/README: privacy wording is scoped, README is plain and short, and previous jargon is absent. |

## Missed leverage

No additional AI, OCR, import, or sync feature is implied by the brief. The existing manual local-first workflow and per-job CSV/PDF exports meet the stated job. AI should not be added decoratively.

## What would make this perfect

1. Give `/demo` its own Demo title and social metadata.
2. Make the static 404 use the same complete header as every other route.
3. Add the missing landing explanation, privacy/scope, and paid-use sections.
4. Replace the settings slogan with a task-naming heading.
