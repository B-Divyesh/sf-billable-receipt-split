# Independent product verification 5 — PASS

**Verdict:** PASS  
**Candidate:** `3193740ba65dfa51a4cbea95bb3b42d74c8f24e9`  
**Live URL:** <https://billable-receipt-split.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Work order:** `billable-receipt-split-verify-5`  
**Artifact:** offline-first PWA

## Release decision

The candidate meets the researched brief and acceptance contract. The contractor workflow works end to end, the production deployment byte-matches the candidate build, the PWA reloads and exports offline, privacy and response-policy checks pass, and the production license-verification endpoint now rate-limits correctly.

The S1 defect in verification 4 is fixed in the external Sociobot API. In a fresh 150-request concurrent burst, the endpoint accepted 30 requests, then returned 120 `HTTP 429` responses. The first 429 was request 31 and every limited response carried `Retry-After: 4`.

## Clean checkout and repository gates

Testing ran from a clean detached worktree at the exact candidate; it remained clean after verification.

| Check | Fresh result |
| --- | --- |
| `npm ci` | PASS — 86 packages installed; audit reported 0 vulnerabilities |
| `npm run lint` | PASS — oxlint returned no findings |
| `npx tsc --noEmit` | PASS |
| `npm test` | PASS — 3 files, 10/10 tests |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — exact production build created `dist/` |
| `npm run test:e2e -- --reporter=line` | PASS — 12/12, Chromium desktop and 390×844 mobile |
| `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line` | PASS — 12/12 against production |
| `npm run test:release` | PASS — catalog, checkout redirect, and invalid-license policy |

The initial application bundle is 36.91 kB JS raw / 12.53 kB gzip and 18.98 kB CSS raw / 4.76 kB gzip. There are no font downloads; the mobile hero is 11.46 kB. PDF dependencies remain lazy chunks and are not part of first load.

## Functional acceptance

An independent live-browser scenario used a CAD 100.00 receipt with two source lines and four allocations across three jobs, covering billable, reimbursable, and non-billable classifications. A CAD 1.00 over-allocation was rejected with a specific message, correction to the balanced value succeeded, and the receipt reached “Ready to export.” State and the exact source-image SHA-256 (`431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460`) survived reload.

- The Oak Street CSV contained only that job's two rows, both classifications and amounts, supplier/date/currency/source total, and the full source hash; another job's row was absent.
- The generated 4,703-byte PDF was valid, had one embedded image object, and its decompressed content contained the supplier, job, both selected source lines, and full hash.
- The encrypted backup declared AES-GCM with 250,000 PBKDF2 iterations. Supplier, job, line, and source hash were absent from plaintext. Wrong-password restore failed safely; the repository suite also passed successful restore, integrity rejection, cancellation, and permanent deletion.
- Zero value was invalid. A 20 MiB + 1 byte upload was rejected, then a valid image succeeded without reopening the flow. Unsafe money and non-image/signature mismatch cases pass regression coverage.
- Exactly five free receipts were accepted; the sixth capture action routed to the unlock screen with the archive-full recovery message. Export, backup, deletion, and accessibility remain available without a license.
- A mocked successful `?license=` return stored `sb_license:billable-receipt-split`, stripped only the license parameter, unlocked optimistically, and made one verification request across the initial load plus reload because the daily verdict was cached.

No sign-in exists, so the Microsoft Entra tenant requirement is not applicable. This is not a library, CLI, or product backend, so consumer packaging, backend concurrency, server persistence, health, and server build-identity checks are not applicable.

## PWA, offline, privacy, and network behavior

- The manifest has standalone display, a versioned start URL, matching theme/background colors, 192/512 icons, and a maskable 512 icon.
- Live and local E2E retained the receipt in IndexedDB after reload, then reloaded and generated a PDF while Chromium was offline with no console/page errors.
- A controlled candidate-worker `v11`→`v14` update while the page remained open showed “Update ready. Reload to use it,” changed controller, removed seeded old `billable-split-*` caches within 1.2 seconds, and reloaded offline from only the new cache.
- The normal capture, allocation, CSV/PDF, backup, restore, deletion, and offline workflow made no cross-origin requests. Source review found no analytics, trackers, CDN scripts, remote fonts, or receipt-upload path. The only cross-origin product paths are the disclosed Sociobot checkout and license verification calls.
- Receipt records and blobs use IndexedDB. License token/verdict use localStorage as disclosed. Backups are encrypted before download and restore verifies the immutable image fingerprint.

## Accessibility, responsive behavior, and visual QA

- Axe serious/critical findings: **0** on home, settings, privacy, terms, and the populated receipt workspace across desktop and 390 px mobile.
- The live smoke checker found the correct title, `lang=en`, one `h1`, one `main`, no missing image alternative text, no unlabeled buttons, and zero console/page errors.
- Fresh keyboard traversal from the page start gave each interactive stop a visible 3 px mint focus ring. Enter opens the capture dialog, focus moves inside, Escape closes it, and focus returns to the opener.
- Every visible interactive target in the populated 390 px workspace measured at least 44×44 CSS px. The page had no horizontal overflow (`scrollWidth = innerWidth = 390`).
- `prefers-reduced-motion: reduce` changed transitions to 0.01 ms and smooth scrolling to `auto`.
- Fresh desktop and 390 px screenshots of the representative populated workflow were visually inspected: no overlap, clipping, obscured action, or illegible state was found. The product-specific job-ledger visual thesis is implemented consistently.

## Deployment, response policy, performance, and billing

- Every publicly served production artifact from the candidate build matched byte-for-byte: **27 matched, 0 mismatched, 0 missing**. Root SHA-256 locally and live was `9093c2146b7af9087b26e7d9f6044c11756378629fd661e82c6f7c663ce38aef`. `staticwebapp.config.json` is deployment configuration and is not a public artifact.
- `/`, `/privacy/`, and `/terms/` return HTTPS 200 with HSTS, CSP, Permissions-Policy, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. HTML revalidates; hashed JS/CSS/images use one-year immutable caching; `/sw.js` is `no-cache, no-store, must-revalidate`; the manifest MIME is `application/manifest+json`.
- Lighthouse 12.8.2 mobile: **100 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 1.2 s, LCP 1.2 s, TBT 70 ms, maximum potential input delay 140 ms, CLS 0, total transfer 46 KiB.
- The production catalog has Billable Split at USD 19.00 one-time. Checkout returns `HTTP 303` to `https://checkout.dodopayments.com/session/cks_…`. Invalid verification is origin-specific CORS-readable and returns `Cache-Control: no-store` with `{valid:false,reason:"invalid",expires_at:null}`.
- Rate-limit evidence: 150 concurrent invalid-license GETs completed in 1,270 ms: 30 × 200, then 120 × 429; observed threshold 30 accepted requests, first 429 at request 31, `Retry-After: 4` on all 429 responses. A later request returned 200 after the retry window.

## Defects by severity

| Severity | Findings |
| --- | --- |
| S1 | None |
| S2 | None |
| S3 | None |

A real-money charge/refund was intentionally not created. Hosted checkout-session creation, catalog identity, invalid-license behavior, returned-license handling, verification caching, and throttling were exercised.

## Reproduction commands

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm audit --audit-level=low
npm run build
npm run test:e2e -- --reporter=line
PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line
npm run test:release
/opt/fleet/lib/verify-url.sh https://billable-receipt-split.sociobot.in <evidence-dir>
```
