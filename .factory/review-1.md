# Adversarial first-read review 1 — Billable Split

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against <https://billable-receipt-split.sociobot.in> from fresh Chromium contexts at 390 × 844 and 1440 × 1000. This review did not modify product code.

## Cold first read

The first screen says the product splits a receipt's lines across jobs and makes CSV/PDF output. The available first click is **“Add a receipt”**. It does **not** say that it is for contractors (or any other person) on the first screen, and it offers no way to try the result without supplying a personal receipt image.

Therefore, within 30 seconds I could answer *roughly* what it does and what I could click, but not **for whom**. The exact headline that failed this test was: **“One receipt. Every job accounted for.”** The supporting sentence, **“Keep the source photo, split every line across jobs, then hand over clean CSV and PDF evidence.”**, still names neither contractors nor the material-purchase situation.

The mobile presentation is responsive, has no observed console error, and uses the distinct job-ledger/receipt visual system described in the design thesis. This is not a generic SaaS-template finding.

## Findings

### Blocking

#### F-1-1 — The first screen does not identify the intended visitor

**Location / quote:** landing `<h1>`, “One receipt. Every job accounted for.”

**Why this fails:** This is a slogan, not a job headline. A cold visitor cannot tell that this is for a contractor who bought materials for several jobs. The supporting text explains some mechanics but not the person or situation. This failed at both 390 px and desktop before scrolling.

**Concrete fix:** Use a single plain headline and one audience sentence, for example: **“Split one supplier receipt by job”** and **“For contractors who buy materials for several jobs and need billable cost records.”** Keep the primary action beside it as **“Try it with sample data”**, followed by “See a completed split and exports.”

#### F-1-2 — There is no one-click, isolated sample-data demo

**Location / quote:** landing has “Add a receipt” and “Capture first receipt”; `/demo` renders the same empty archive, “No receipts on this device.”

**Why this fails:** There is no “Try it with sample data” control, no realistic populated receipt, no persistent **“Demo — sample data, nothing is saved”** banner, no **“Reset demo”**, no **“Start for real”**, and no `.factory/demo.md`. Directly opening `/demo` on a fresh context showed the ordinary `billable-split` IndexedDB database, not a `demo:` namespace, and no sample data. The reviewer cannot verify that a demo never reads or writes real storage, nor can a visitor see value before providing private receipt data.

**Concrete fix:** Implement `/demo` (and `?demo=1`) as a separately named storage namespace seeded with a credible materials receipt, several line allocations, classifications, and ready CSV/PDF exports. The first demo screen must already show the populated allocation. Add the required persistent banner and controls; make Reset discard/reseed only demo data; make Start for real discard demo data. Document the URL, sample, reset behaviour, and namespace in `.factory/demo.md`. Add Playwright tests proving the demo never reads/writes the real namespace and survives offline after its first visit.

#### F-1-3 — The required claims registry and claim tests do not exist

**Location / quote:** `.factory/claims.json` is absent.

**Why this fails:** The required claims inventory is missing, so there are no `@claim:<id>` tests and no listed command to run from a clean state. Consequently the required claim-test pass cannot be established. There were zero listed claim commands to execute; `npm ci`, `npm test`, `npm run build`, and the repository E2E suite passed, but none substitutes for the absent per-claim registry.

**Concrete fix:** Add `.factory/claims.json`, one observable demo-entry test per claim, and tag each test exactly once. Tests for privacy/offline must start from the demo entry point in a fresh browser context and retain request-log evidence.

#### F-1-4 — The landing's export/workflow promise is an unlisted claim

**Location / quote:** landing hero, “Keep the source photo, split every line across jobs, then hand over clean CSV and PDF evidence.”

**Why this fails:** It promises source retention, job splitting, CSV export, and PDF export. No `claims.json` entry or demo-based observable test covers any of those visitor-reliance claims.

**Concrete fix:** Add separately testable entries such as `source-retention`, `job-allocation`, `csv-export`, and `pdf-export`; each test should start at `/demo` and assert the resulting stored fingerprint or downloaded content, not merely a visible button.

#### F-1-5 — The free-capacity promise is an unlisted claim

**Location / quote:** landing hero, “5 FREE RECEIPT SLOTS LEFT.”

**Why this fails:** A visitor can rely on this limit, but it has no listed claim and no demo test of the five-receipt boundary and recovery path.

**Concrete fix:** Add a `free-receipt-limit` claim/test that creates five demo receipts, verifies that a sixth is blocked with a clear recovery action, and verifies that exports/deletion remain available.

#### F-1-6 — The local/offline persistence promise is an unlisted claim

**Location / quote:** empty state, “Its image and every split stay in your browser, even offline.”

**Why this fails:** This makes storage and offline guarantees, but neither has a registry entry or a fresh-demo test. The initial request log showed only same-origin shell assets, but that is not proof of the complete workflow or offline reload.

**Concrete fix:** Add `local-storage` and `offline-reload` claims. From `/demo`, log requests through capture/allocation/export, assert only allowed same-origin requests, set the context offline after first load, reload, and assert the seeded receipt and export remain usable.

#### F-1-7 — The privacy promise is an unlisted claim

**Location / quote:** footer, “Private by design · data stays on this device.”

**Why this fails:** This is a material privacy claim and the slogan itself supplies no scope or proof. It is absent from the required registry and cannot be verified through the absent demo sandbox.

**Concrete fix:** Replace it with **“Receipt data stays in this browser. Purchase and license checks contact Sociobot only when you choose them.”** Add a `receipt-data-local` request-log claim test using `/demo`, including an assertion that no receipt bytes leave the origin.

#### F-1-8 — Routes, back navigation, route focus, and the designed 404 are absent

**Location / evidence:** `/demo` and `/404` each return the landing application with title “Billable Split — receipt costs, job by job” and `<h1>` “One receipt. Every job accounted for.” Clicking **“Data & license”** changes the content while keeping the URL and title at `/`; browser Back then returned to `about:blank` rather than the receipts view. Focus remained on `body` after the view change.

**Why this fails:** The application has no real `/demo`, `/settings`, receipt, or 404 place. Deep links cannot express state, the Back button is broken for in-app navigation, screen-reader users get neither a focus move nor a route announcement, and an unknown URL is silently presented as a normal landing page. Broken routing is a blocking site-structure failure.

**Concrete fix:** Implement History API routes for `/`, `/demo`, `/settings`, and a receipt detail URL; update title per route, restore the correct state on popstate, move focus to the new `<h1>`, and announce the change. Supply a styled `/404.html` plus the required Static Web Apps 404 `responseOverrides` configuration. Ensure `/demo` has title `Demo — Billable Split` and `/404` has a page-not-found title and a home action.

### Major and minor

#### F-1-9 — Required metadata is incomplete on every public route

**Location / evidence:** root HTML has a description and favicon, but no canonical link, Open Graph fields, Twitter fields, Apple touch icon, or 1200 × 630 social image. `/privacy/` and `/terms/` have only a title; they lack description, canonical, OG/Twitter, favicon, and theme color.

**Why this fails:** Shared/search results have no route-specific representation and the routes do not meet the required metadata contract.

**Concrete fix:** Add route-specific descriptions, canonical URLs, OG/Twitter title/description/image fields, `apple-touch-icon`, and a product-derived 1200 × 630 image. Use, for example, `Billable Split — split receipt costs by job` on the landing route and update SPA titles on view changes.

#### F-1-10 — The header/footer skeleton is incomplete and inconsistent

**Location / quote:** app header has only “Receipts” and “Data & license”; app footer has “Private by design · data stays on this device” and “Privacy · Terms · Generated illustration.” Legal-page headers/footers do not contain the shared navigation/footer content.

**Why this fails:** There is no Demo entry point in the header, no Privacy navigation item, no “Built by Param Factory,” and no version/build identifier. The privacy/terms pages do not share the application skeleton required for predictable navigation.

**Concrete fix:** Use the same header on all routes: wordmark home link, Receipts, Demo, Data & license, Privacy, plus skip link. Use the same footer on all routes with one plain product line, Privacy, Terms, “Built by Param Factory,” and a build/version label.

#### F-1-11 — “Offline job-cost desk” is unexplained jargon rather than a useful heading

**Location / quote:** landing eyebrow, “OFFLINE JOB-COST DESK.”

**Why this fails:** “Desk” is a metaphor and “job-cost” is not explained before the user knows the product. It does not name a section or help answer the first-read questions.

**Concrete fix:** Replace it with **“Receipt costs for several jobs”** or remove it once the headline and audience sentence are in place.

#### F-1-12 — The landing privacy footer is a slogan, not usable information

**Location / quote:** “Private by design · data stays on this device.”

**Why this fails:** “Private by design” carries no specific information, and the sentence omits the stated purchase/license exception. It is also the privacy claim covered by F-1-7.

**Concrete fix:** Use the exact scoped rewrite in F-1-7 and link it to the Privacy page.

#### F-1-13 — “Local archive / 00” does not name the empty-state section plainly

**Location / quote:** receipt-list eyebrow, “LOCAL ARCHIVE / 00.”

**Why this fails:** “Archive” and a bare `00` force the reader to infer that this is the receipt count. The following “Recent receipts” heading is clearer, so the eyebrow adds unexplained instrument language.

**Concrete fix:** Replace it with **“Saved receipts: 0”** or omit it.

#### F-1-14 — README opening uses unexplained product jargon

**Location / quote:** README first paragraph, “Billable Split is an offline-first receipt allocation desk for contractors who buy materials for several jobs at once.” (18 words)

**Why this fails:** “Offline-first” and “receipt allocation desk” are implementation/product jargon in the first sentence.

**Concrete fix:** **“Billable Split helps contractors split one supplier receipt across several jobs.”**

#### F-1-15 — README opening sentence exceeds 22 words and bundles several claims

**Location / quote:** README first paragraph, “It keeps the original receipt image, fingerprints it with SHA-256, lets each receipt line be split across jobs as billable, non-billable, or reimbursable, and exports per-job CSV and PDF evidence packets.” (31 words)

**Why this fails:** It exceeds the hard cap, mixes four actions, and requires readers to know “SHA-256” and “evidence packets.”

**Concrete fix:** **“It keeps the receipt photo. Assign each line to a job and mark it billable, reimbursable, or non-billable. Export a CSV or PDF for each job.”**

#### F-1-16 — README feature copy exposes a hash term without explaining its use

**Location / quote:** README “What v1 includes” item, “Local receipt capture with source-image filename and immutable SHA-256 fingerprint.” (10 words)

**Why this fails:** “Immutable SHA-256 fingerprint” is jargon, not a visitor outcome.

**Concrete fix:** **“Keeps the receipt photo and a tamper-check value with each export.”** Put the algorithm in a technical note if needed.

#### F-1-17 — README feature copy uses unexplained allocation terminology

**Location / quote:** README item, “Manual receipt lines with multiple job allocations and balance feedback.” (10 words)

**Why this fails:** “Allocations” and “balance feedback” do not tell a first-time reader what they do.

**Concrete fix:** **“Add each purchased item, split its amount between jobs, and see what remains.”**

#### F-1-18 — README export copy uses the unexplained phrase “evidence packets”

**Location / quote:** README item, “Per-job CSV and PDF downloads; PDF packets include a receipt preview and source hash.” (14 words)

**Why this fails:** “Packets” and “source hash” are not plain descriptions of the output.

**Concrete fix:** **“Download a CSV or PDF for each job. The PDF includes the receipt image and its tamper-check value.”**

#### F-1-19 — README storage copy uses implementation jargon

**Location / quote:** README item, “IndexedDB persistence, visible edit history, permanent deletion, and offline reload.” (10 words)

**Why this fails:** “IndexedDB persistence” is browser-engine terminology.

**Concrete fix:** **“Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload.”**

#### F-1-20 — README backup copy is algorithm-heavy rather than outcome-led

**Location / quote:** README item, “Password-encrypted full-workspace backups using PBKDF2-SHA-256 and AES-256-GCM.” (7 words)

**Why this fails:** It is almost entirely unexplained cryptography terminology.

**Concrete fix:** **“Download one password-protected backup of your receipts and images.”** Link technical encryption details separately.

#### F-1-21 — README install copy is implementation jargon

**Location / quote:** README item, “Installable PWA manifest, responsive icons, service-worker updates, and offline fallback.” (10 words)

**Why this fails:** It describes implementation names, not user value.

**Concrete fix:** **“Install it on a phone or computer and reopen it without a connection.”**

#### F-1-22 — README scope copy uses the unexplained acronym “OCR”

**Location / quote:** README, “Billable Split does not perform OCR, bank reconciliation, bookkeeping automation, or tax advice.” (13 words)

**Why this fails:** The limitation is useful, but “OCR” is unexplained.

**Concrete fix:** **“It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice.”**

#### F-1-23 — README privacy copy refers to “that origin” instead of the user's browser

**Location / quote:** README local-development section, “Receipt data stays in that origin’s browser storage.” (9 words)

**Why this fails:** “Origin” is web-platform jargon in user-facing privacy copy.

**Concrete fix:** **“Receipt data stays in the browser profile that opened the app.”**

#### F-1-24 — README data/privacy copy uses browser implementation names and an acronym

**Location / quote:** “Receipt records and images are stored in IndexedDB.” (8 words); “No receipt data is sent to an application server, and there are no analytics, tracking scripts, remote fonts, or CDN dependencies.” (21 words); and “Restoring a backup verifies every stored source image against its recorded SHA-256 hash before replacing local data.” (17 words)

**Why this fails:** “IndexedDB,” “CDN,” and “SHA-256 hash” make the privacy promise harder to understand. The middle sentence also compresses several important assurances into one long sentence.

**Concrete fix:** **“Receipt data stays in your browser. The app has no ads, tracking, remote fonts, or third-party downloads. Before restoring a backup, it checks that every saved receipt image still matches.”**

## Copy audit

Word counts use visible words; headings, labels, and button labels are audited separately below because they are not grammatical sentences. No landing prose sentence exceeds 22 words. README sentence 2 is the only one over the hard cap. Flags map to findings above.

### Landing prose

| # | Copy | Words | Result |
| --- | --- | ---: | --- |
| 1 | One receipt. | 2 | F-1-1: slogan fragment |
| 2 | Every job accounted for. | 4 | F-1-1: slogan; audience absent |
| 3 | Keep the source photo, split every line across jobs, then hand over clean CSV and PDF evidence. | 17 | F-1-4: unlisted functional claim; “evidence” is vague |
| 4 | 5 free receipt slots left. | 5 | F-1-5: unlisted capacity claim |
| 5 | No receipts on this device. | 5 | Clear |
| 6 | Start with a supplier receipt. | 5 | Clear |
| 7 | Its image and every split stay in your browser, even offline. | 11 | F-1-6: unlisted storage/offline claim |
| 8 | Private by design · data stays on this device. | 8 | F-1-7, F-1-12: unlisted, slogan-like privacy claim |

### Landing headings and controls

| Copy | Words | Result |
| --- | ---: | --- |
| BILLABLE SPLIT | 2 | Brand; clear as wordmark |
| Receipts | 1 | Clear nav label |
| Data & license | 2 | Clear enough, but not a real route (F-1-8) |
| OFFLINE JOB-COST DESK | 4 | F-1-11 |
| Add a receipt | 3 | Result-naming verb, but not a try-first action (F-1-2) |
| SOURCE / ALLOCATE / EVIDENCE | 3 total | “Evidence” is unexplained; supporting, not a substitute for the headline |
| LOCAL ARCHIVE / 00 | 3 | F-1-13 |
| Recent receipts | 2 | Clear heading |
| Capture first receipt | 3 | Result-naming verb, but not a try-first action (F-1-2) |
| Privacy / Terms / Generated illustration | 4 total | Legal links work; “Generated illustration” is provenance, not a user-facing footer purpose |

### README prose and feature items

| # | Copy | Words | Result |
| --- | --- | ---: | --- |
| 1 | Billable Split is an offline-first receipt allocation desk for contractors who buy materials for several jobs at once. | 18 | F-1-14 |
| 2 | It keeps the original receipt image, fingerprints it with SHA-256, lets each receipt line be split across jobs as billable, non-billable, or reimbursable, and exports per-job CSV and PDF evidence packets. | 31 | F-1-15 (>22, jargon) |
| 3 | Local receipt capture with source-image filename and immutable SHA-256 fingerprint. | 10 | F-1-16 |
| 4 | Manual receipt lines with multiple job allocations and balance feedback. | 10 | F-1-17 |
| 5 | Billable, non-billable, and reimbursable cost classifications. | 6 | Clear enough in context |
| 6 | Per-job CSV and PDF downloads; PDF packets include a receipt preview and source hash. | 14 | F-1-18 |
| 7 | IndexedDB persistence, visible edit history, permanent deletion, and offline reload. | 10 | F-1-19 |
| 8 | Password-encrypted full-workspace backups using PBKDF2-SHA-256 and AES-256-GCM. | 7 | F-1-20 |
| 9 | Installable PWA manifest, responsive icons, service-worker updates, and offline fallback. | 10 | F-1-21 |
| 10 | Free use for five complete receipts; a $19 one-time Sociobot license removes the archive limit. | 15 | Clear, but its visitor-facing equivalent needs F-1-5 claim coverage |
| 11 | Billable Split does not perform OCR, bank reconciliation, bookkeeping automation, or tax advice. | 13 | F-1-22 |
| 12 | Requires Node.js 20 or newer. | 5 | Clear in developer context |
| 13 | The development server prints its local URL. | 7 | Clear in developer context |
| 14 | Receipt data stays in that origin’s browser storage. | 9 | F-1-23 |
| 15 | Playwright is pinned to 1.58.2. | 5 | Clear in test-tool context |
| 16 | Its Chromium browser must be available; in the factory worker it is supplied through PLAYWRIGHT_BROWSERS_PATH. | 17 | Technical setup instruction; acceptable in that labelled context |
| 17 | The static deployment root is dist/, with dist/index.html at its root. | 12 | Technical deployment instruction; acceptable in that labelled context |
| 18 | Serve that folder with SPA fallback to index.html; /privacy/ and /terms/ are also emitted as real static pages. | 18 | Technical deployment instruction; acceptable in that labelled context |
| 19 | Receipt records and images are stored in IndexedDB. | 8 | F-1-24 |
| 20 | No receipt data is sent to an application server, and there are no analytics, tracking scripts, remote fonts, or CDN dependencies. | 21 | F-1-24 |
| 21 | License purchase and verification are the only networked product operations and use https://api.sociobot.in/api/v1/products/billable-receipt-split/. | 18 | Clear enough as technical disclosure; still needs claim coverage if relied on |
| 22 | Encrypted backup passwords never leave the browser and cannot be recovered. | 11 | Clear; needs a claims test once the registry exists |
| 23 | Restoring a backup verifies every stored source image against its recorded SHA-256 hash before replacing local data. | 17 | F-1-24 |
| 24 | See the privacy page and the terms. | 7 | Clear |
| 25 | MIT — see LICENSE. | 3 | Clear |

## Demo, privacy, and claim-test evidence

- A fresh 390 px and desktop context loaded only the app origin for the initial shell/image/JS/CSS requests and logged no console errors.
- `/demo` and `?demo=1` provide no demo UI or seeded content. The required privacy and offline claim verification could not be performed from an isolated sample flow.
- `.factory/claims.json` is missing. Therefore there were no claim commands to run from a clean state and no claim test is marked `@claim:`.
- Baseline repository checks were run after `npm ci`: `npm test` passed (10 tests), `npm run build` produced `dist/`, `npm run test:e2e -- --reporter=line` passed (12 tests; recorded status `passed`), and `npm run test:release` passed. These do not close F-1-2 through F-1-7.

## Route, structure, and link checks

- Root has one `<h1>`, a `<main>`, `lang="en"`, description, favicon, robots, sitemap, and a distinct visual identity. The main landing title is present but should be rewritten as specified in F-1-9.
- `/privacy/` and `/terms/` return 200 and their titles follow `Privacy — Billable Split` / `Terms — Billable Split`, but their metadata and skeleton are incomplete (F-1-9, F-1-10).
- `/demo` and `/404` return 200 but render the normal landing state rather than their required views (F-1-2, F-1-8). The sitemap has no `/demo` entry.
- The internal Privacy and Terms links resolve. No internal dead link was observed. The external `sociobot.in` contact endpoint did not respond within this sandbox's ten-second curl limit, so its availability is unconfirmed rather than treated as a product-route result.

## Earlier-history recheck

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the earlier verification reports and every historical handoff. Their substantive earlier defects were checked rather than accepted from their “fixed” labels:

| Earlier finding | Current confirmation |
| --- | --- |
| Checkout unavailable | `npm run test:release` passed live catalog/checkout verification. |
| Editing a line could undercut allocations | Current code rejects `nextAmount < allocated`; the E2E regression passed. |
| Unsafe large money values | `MAX_AMOUNT` is `90071992547409.91`; decimal parsing is `BigInt`; utility tests passed. |
| Non-image sources accepted | `validateReceiptImage` validates MIME/signature and has passing regression tests. |
| Sub-44 px targets | Current E2E suite passed its target/accessibility checks. |
| Backup fingerprint mismatch blamed the password | The backup regression passed and asserts a separate fingerprint-mismatch message. |
| CSP/cache/service-worker cleanup defects | Live root headers include CSP/Permissions-Policy; current service-worker cleanup regression passed. |
| License verification had no rate limit | Fresh 35-way live burst: 30 × 200, then 5 × 429. A subsequent limited response carried `Retry-After: 0`. |

No historical finding is re-raised under an earlier identifier. The newly found demo/claims/routing defects are independent gaps in this review's required contract.

## Missed leverage

No additional AI, import, or sync feature is required by the researched brief. The brief expressly scopes manual line items, local-first storage, and per-job CSV/PDF exports; adding OCR or cloud sync would expand that scope and weaken the stated privacy model. The missing sample-data demo is mandatory usability infrastructure, not an optional feature expansion.

## What would make this perfect

1. Let a contractor understand the use case and open a completed, realistic split in one click.
2. Make that demo completely isolated, resettable, offline-capable, and proven by request-log tests.
3. Register and test every visitor-facing promise in `claims.json`.
4. Turn views into accessible real URLs with correct titles, Back behaviour, focus, metadata, and a real 404.
5. Apply the proposed plain-language rewrites so the landing and README are useful without financial/web-platform jargon.

