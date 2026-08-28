# Independent product verification — FAIL

**Verdict:** FAIL  
**Tested candidate:** `89fc38aa383eee503639da2f14ff8cdd9ae7dab8`  
**Tested live URL:** <https://billable-receipt-split.sociobot.in>  
**Date:** 2026-08-28 UTC  
**Artifact:** offline-first PWA

The candidate is deployed and the free receipt-splitting workflow works end to end, but it is not release-ready. The paid checkout is unavailable in production, and an edit can create internally contradictory financial evidence that remains exportable.

## Severity scale

- **S1 — release blocker:** contracted core/revenue behavior is unavailable or can produce materially invalid evidence.
- **S2 — major:** important validation, accessibility, or integrity requirement is unmet but a normal workflow remains possible.
- **S3 — minor:** hardening, caching, or recovery-quality issue with limited immediate impact.

## Defects

### S1 — Production purchase flow is unavailable

The rendered “Buy once · $19” link correctly targets the required Sociobot URL, but the live endpoint is not registered/enabled:

```text
GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Impact: nobody can buy the advertised one-time unlimited-receipt unlock. The builder handoff called this a release task, but fresh production evidence confirms it is still broken.

### S1 — Editing a line can invalidate existing allocations and leave exports enabled

Reproduction on both the candidate build and live deployment:

1. Create a $100.00 receipt.
2. Add a $60.00 line split $40.00 billable and $20.00 reimbursable.
3. Add a $40.00 line allocated $40.00 non-billable. The receipt correctly becomes “Ready to export.”
4. Edit the first line total from $60.00 to $40.00.

Observed: the edit is accepted even though $60.00 remains allocated to that line. The line says `$20.00 over`, the receipt-level status simultaneously says `$0.00 left`, and every per-job CSV/PDF export button remains enabled. This can produce packets whose combined allocations exceed their source lines. New allocation and allocation-edit paths do reject over-allocation; the line-edit path does not.

### S2 — Accepted large monetary values silently lose cents

The money inputs have no safe upper bound. Entering the accepted value `90071992547409.93` creates and displays `$90,071,992,547,409.94`. JavaScript integer precision changes the source amount by one cent. Financial values must be rejected before conversion exceeds `Number.MAX_SAFE_INTEGER` cents, or use a decimal-safe representation.

### S2 — Non-image source files are accepted

Using the file control with `not-an-image.txt` (`text/plain`) successfully created a receipt. The `accept="image/*"` picker hint is not validation; `createReceipt` checks only existence and size. The result retains a hash but has a broken receipt-image preview and does not satisfy the promised image source record.

### S2 — Three mobile targets miss the required 44×44 CSS-pixel minimum

At 390×844, computed visible target boxes included:

- Home wordmark button: 116×38 px
- Privacy link: 46×15 px
- Terms link: 38×15 px

Axe reports no serious/critical findings, but the attached acceptance contract explicitly requires 44×44 targets.

### S3 — Fingerprint-corrupt backup error blames the password

A correctly encrypted backup was decrypted, its image bytes were changed while retaining the recorded SHA-256, and it was re-encrypted with the correct password. Restore safely rejected it before replacement, but reported “The backup could not be decrypted. Check the password and try again.” The actual failure was a source-image fingerprint mismatch, so the recovery instruction is misleading.

### S3 — Production cache and browser-policy hardening are incomplete

- `/`, `/assets/app.js`, `/assets/app.css`, the hashed PDF chunk, the hero image, `/sw.js`, and legal pages all return `Cache-Control: public, must-revalidate, max-age=30`; hashed assets are not served with long-lived immutable caching as required by the performance contract.
- Responses include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and DNS-prefetch protection, but no Content-Security-Policy or Permissions-Policy.
- In a controlled service-worker `v8`→`v9` update, the update toast appeared, the new worker took control, and offline reload still worked, but both complete `billable-split-v8` and `billable-split-v9` caches remained after activation instead of the old cache being removed.

## Evidence and acceptance results

### Clean checkout and repository gates

The supplied checkout began clean at the candidate commit, with `main`, `origin/main`, and `HEAD` all at `89fc38aa383eee503639da2f14ff8cdd9ae7dab8`.

| Check | Result |
|---|---|
| `npm ci` | PASS; 83 packages installed, audit clean |
| `npm test` | PASS; 1 file, 3/3 tests |
| `npx tsc --noEmit` | PASS |
| Lint | Not available; no lint script/config is present |
| `npm audit --audit-level=low` | PASS; 0 vulnerabilities |
| `npm run build` | PASS; exact production build created `dist/` |
| `npm run test:e2e` | PASS; 3/3 Chromium mobile tests in 30.8 s |

### Deployment identity and delivery

- Downloaded and SHA-256-compared all 27 files in the exact local `dist/` against the live origin: **27/27 matched, 0 mismatches**.
- Root, `assets/app.js`, and `sw.js` hashes also matched individually.
- Root and both legal routes returned HTTP 200 over HTTPS.
- `/opt/fleet/lib/verify-url.sh` passed locally and live. Live: 624 ms scripted network-idle load, correct title/lang, one h1, main landmark, no missing image alt, no unlabeled buttons, and no console/page errors.
- Chromium `Page.getAppManifest` reported no manifest errors despite the deployment serving `.webmanifest` as `application/octet-stream`.

### Functional workflow

PASS on desktop 1440×1000 and mobile 390×844 unless listed as a defect above:

- Empty state and receipt capture; zero-dollar receipt and line values are rejected with browser validation.
- 20 MB limit rejects a 20 MB + 1 byte upload with a recovery message.
- Manual lines, multi-job splits, billable/reimbursable/non-billable classifications, balance feedback, and over-allocation rejection.
- Persistence across reload with the same stored source SHA-256.
- Per-job CSV scopes rows correctly and includes supplier/date/currency, source total, line totals, classifications, and the full source hash.
- PDF downloaded (4,701 bytes in the representative case); decompressed content contained the supplier, both selected-job rows, job total, source-image preview, and full SHA-256.
- Encrypted backup used AES-256-GCM and PBKDF2-SHA-256 with 250,000 iterations; neither supplier nor receipt fields appeared in plaintext.
- Wrong-password and malformed-backup paths reject safely. Deletion cancellation preserves the record; confirmation removes it; encrypted restore recovers it.
- Free archive allows exactly five receipts and routes the sixth attempt to the unlock panel.
- Returned license token is saved under `sb_license:billable-receipt-split`, removed from the address bar, and verified once in a mocked successful response. The real verify endpoint returned a CORS-readable `valid:false, reason:"invalid"` for a test token.

### Privacy and network behavior

- During the normal capture, allocation, export, backup, delete, and restore workflow, all 21 observed requests stayed on the app origin.
- Static audit found no analytics, tracking, CDN scripts, remote fonts, or receipt upload request. The only application cross-origin code paths are the disclosed Sociobot checkout and license verification endpoints.
- Receipt state and image persistence were observed in IndexedDB; the license token/verdict uses localStorage as documented.

### PWA and offline behavior

- Manifest has a versioned start URL, standalone display, matching theme/background colors, 192/512 icons, and a 512 maskable icon.
- Live worker controlled the page with cache `billable-split-v8` and precached the shell plus all lazy PDF chunks.
- After creating and balancing a live receipt, Chromium was put offline. Reload showed the offline state and retained the receipt; an offline PDF download succeeded with no console/page errors.
- Controlled update simulation confirmed update detection/toast, `skipWaiting`, controller change, and successful offline reload. Old-cache cleanup has the S3 defect above.

### Accessibility, keyboard, responsive design, and motion

- Axe found **0 serious/critical violations** on home, capture dialog, populated receipt detail (desktop and mobile), settings, privacy, and terms.
- Keyboard traversal reached skip link, home, navigation, both receipt actions, privacy, and terms with a visible 3 px mint focus ring. Enter opened the capture dialog; initial focus moved to its close button; Escape closed it and restored focus to the opener.
- Exactly one h1 and one main landmark were present per tested page/view; images had alt text; labels were bound.
- No horizontal overflow at 390 px. Visual inspection at 1440×1000 and 390×844 found no clipping or overlap.
- With `prefers-reduced-motion: reduce`, smooth scrolling became `auto` and transition durations became 0.01 ms.
- Touch-size exception is recorded above.

### Performance and budgets

Fresh Lighthouse 12.8.2 mobile runs:

| Target | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Local production preview | 96 | 100 | 100 | 100 | 1.0 s | 1.4 s | 250 ms | 0 |
| Live deployment | 99 | 100 | 100 | 100 | 1.0 s | 1.1 s | 130 ms | 0 |

Build output meets route budgets: initial app JS 33.30 KB raw / 11.46 KB gzip, CSS 18.71 KB / 4.71 KB gzip, no font downloads, mobile hero WebP 11.46 KB, desktop hero WebP 24.78 KB. Lighthouse reported 44 KiB total initial transfer live. PDF libraries are lazy route chunks and service-worker precached.

## Release decision

**FAIL.** Do not release as complete until the S1 checkout and allocation-integrity defects are fixed and reverified. The S2 issues should also be resolved to meet the stated factory definition of done.
