# Billable Split v1 handoff

## What was built

Billable Split is a finished local-first PWA for capturing a supplier receipt, manually entering its lines, splitting each line across jobs, classifying allocations as billable/non-billable/reimbursable, and exporting source-linked job packets.

Key behavior:

- Stores original receipt images and records in IndexedDB; no receipt data leaves the device.
- Computes SHA-256 at capture. The source image cannot be replaced in-app, the hash appears in the UI and every CSV/PDF, and backup restoration recomputes it before accepting a record.
- Supports multiple allocations per line, balance feedback at line and receipt level, editable lines/allocations, visible history, and confirmed permanent deletion.
- Produces per-job CSV and direct PDF downloads. PDFs contain receipt metadata, a source-image preview when the browser can decode it, the full source hash, line/status/amount details, and job total.
- Exports and restores password-encrypted `.billsplit` backups (PBKDF2-SHA-256, 250,000 iterations; AES-256-GCM).
- Provides a five-receipt free archive. A $19 one-time Sociobot license unlocks unlimited receipts. Checkout, returned-token capture, daily cached verification, optimistic offline unlock, revocation handling, and paste-to-restore are implemented. Core exports, backup, deletion, and accessibility are never gated. The factory still needs to register/switch the billing product for release.
- Includes responsive 390px layouts, keyboard/focus behavior, empty/error/offline/update states, legal pages, install manifest, 192/512/maskable icons, and a versioned service worker that precaches both the shell and lazy PDF chunks.
- Implements the original “job ledger terminal” pixel/demoscene system documented in `.factory/design.md`, with generated-asset prompt and provenance in `assets/src/`.

## Run and deploy

```sh
npm install
npm test
npm run build
npm run test:e2e
```

The exact production build command is `npm run build`. Static output is `dist/`, with `dist/index.html` at its root. Deploy that directory and use an SPA fallback for unknown routes; `/privacy/` and `/terms/` are physical static paths.

## Verification completed on 2026-08-28

- `npm test`: 3/3 unit assertions passed.
- `npm run test:e2e`: 3/3 Playwright tests passed on the Pixel 7 mobile profile (Chromium 1.58.2). The suite creates/persists/splits a receipt, downloads CSV, reloads offline, downloads PDF while offline, downloads and restores an encrypted backup, checks keyboard entry and legal links, and runs Axe.
- Axe: zero serious or critical violations on the home screen.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200; 520ms load in its local run; title and `lang` present; one h1; main landmark present; 0 missing alt attributes; 0 unlabeled buttons; 0 console/page errors.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.1s; LCP 1.4s; CLS 0; total blocking time 0ms; interactive 1.4s.
- Production build: initial JS 33.30 KB (11.46 KB gzip), CSS 18.71 KB (4.71 KB gzip). PDF libraries are lazy chunks and precached after service-worker installation. Hero sources are 11.5 KB mobile and 24.8 KB desktop WebP.
- `npm audit`: 0 known vulnerabilities.
- Visual inspection completed at 390×844 and 1440×1000.

## Known gaps / release notes

- The Sociobot paid product is intentionally not registered or hardcoded beyond the required slug. Factory release must confirm the hosted checkout price and production license response.
- OCR, bank feeds, bookkeeping/tax automation, cloud sync, and native wrappers are explicit non-goals for v1.
- Some browser/OS image formats (notably unsupported HEIC variants) may not render in the PDF preview; their original Blob, fingerprint, allocations, and CSV evidence remain intact. Standard JPEG, PNG, and WebP receipts include the preview.
- Offline use begins after one successful online visit has installed and precached the PWA.
