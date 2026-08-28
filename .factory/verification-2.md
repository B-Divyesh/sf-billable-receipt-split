# Independent product verification — FAIL

**Verdict:** **FAIL** — do not mark this one-time-purchase product release-ready until the production checkout is registered and redirects successfully.

- **Candidate commit:** `e952a2d5ebb6ca0de5cec1096f5e8aa85a9597ae`
- **Live URL:** <https://billable-receipt-split.sociobot.in>
- **Verified:** 2026-08-28 UTC, clean worktree at the candidate
- **Scope:** offline PWA receipt capture, allocation, evidence exports, local persistence/backup/deletion, accessibility, performance, browser policy, service worker, and deployed identity.

## Release blocker

### S1 — Required production checkout is unavailable

At 2026-08-28 05:56 UTC, the app’s advertised required checkout endpoint returned:

```text
GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The UI link is correctly formed as `https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout`, but a user cannot buy the advertised $19 one-time unlimited-archive unlock. This is an external billing-registration defect, not a repository code change permitted to this verifier. The invalid-token verification endpoint did respond `200 {"valid":false,"reason":"invalid","expires_at":null}` and the app’s offline-first/free flow did not make network calls without a license.

## Quality gates from this verification

| Check | Result |
|---|---|
| Clean checkout | PASS — clean tree, `HEAD` exactly `e952a2d5ebb6ca0de5cec1096f5e8aa85a9597ae` before verifier docs |
| `npm ci` | PASS — 86 packages; audit reported 0 vulnerabilities |
| `npm test` | PASS — 3 files, 10 tests |
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | PASS — 12/12 Chromium desktop 1440×1000 and mobile 390×844 scenarios |
| `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e` | PASS — 12/12 against production, including offline reload/PDF/cache tests |
| Live identity | PASS — all 27 publicly served `dist/` files byte-compare to live; asset manifest, shell, legal pages, worker, icons, JS/CSS, and images match |
| Live Lighthouse 13.4.1 mobile | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.2 s, TBT 20 ms, CLS 0, 46 KiB transfer |

## Product acceptance evidence

### Core contractor workflow — PASS

On both desktop and 390 px mobile, Playwright created a source-image receipt, recorded its SHA-256 fingerprint, added manual lines, split them into jobs, selected billable/reimbursable/non-billable classifications, reached the balanced **Ready to export** state, and downloaded per-job CSV and PDF evidence. CSV output includes the complete immutable 64-hex source-image hash and classification. PDF export is lazy-loaded and downloaded successfully. Receipt data persisted over reload; IndexedDB, encrypted AES-256-GCM/PBKDF2-SHA-256 backup, restore, confirmed permanent deletion, and recovery/error paths all passed.

Boundary and recovery coverage passed: invalid plain-text “image” inputs are rejected, unsafe money above `90071992547409.91` is rejected, lines cannot be reduced below their allocations, over-allocated legacy data is labelled invalid and disables both export types, and corrupt-backup fingerprint errors are distinct from wrong-password errors.

### Local-first privacy and network behavior — PASS

Repository and browser checks found no analytics, remote fonts, CDN runtime dependencies, or receipt-data upload route. During ordinary capture/allocation/export/backup/delete/restore, observed requests stayed on the application origin. The only cross-origin product code paths are the disclosed Sociobot checkout/verification URLs. Receipt images and records use IndexedDB; license token/verdict use localStorage. Backup tests confirm encrypted output and restore verifies stored source hashes before replacement.

### PWA, update, and offline — PASS

The manifest provides standalone display, versioned start URL, matching dark splash colors, 192/512 icons, and a maskable icon. The live `billable-split-v10` worker controls the page, precaches the app shell and PDF chunks, uses `skipWaiting`/`clientsClaim`, and removes superseded `billable-split-*` caches. After the production workflow was created, offline reload retained the receipt, displayed the offline indication, and permitted PDF export. The service-worker regression scenario also confirms old cache removal after an update.

### Accessibility, responsive interaction, and motion — PASS

Axe serious/critical findings: **0** on home, receipt, settings, privacy, and terms in the repository’s desktop/mobile coverage. Keyboard testing verified the skip link, visible 3 px mint focus ring, dialog initial focus, Escape closure, and focus restoration. `lang`, title, one `h1`, `main`, image alt text, labels, legal links, and 44 px tested targets pass. At 390 px the E2E suite passed without clipping/overflow; reduced-motion rules collapse transition/animation durations to `0.01ms` and disable smooth scrolling.

### Deployment policy, caching, and budget — PASS

Live root/legal responses are HTTPS 200 and include CSP, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options: nosniff`, and HSTS. HTML revalidates; hashed `/assets/*` responses are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache, no-store, must-revalidate`; manifest MIME is `application/manifest+json`.

Build output: initial app JS `36.91 kB` raw / `12.53 kB` gzip and CSS `18.98 kB` raw / `4.76 kB` gzip; the 480 px hero is `11.46 kB`; no downloaded fonts. The 390 kB raw jsPDF chunk is dynamically imported only for PDF export, so it is outside initial-load budget.

## Defects by severity

| Severity | Status | Defect |
|---|---|---|
| S1 | Open | Production Sociobot checkout returns 404; paid one-time unlock cannot be purchased. |
| S2 | None found | — |
| S3 | None found | — |

## Required next step

The billing owner must register/enable `billable-receipt-split` in the production Sociobot billing service, then a verifier must confirm that the exact checkout URL redirects to hosted checkout and that a real return token unlocks on the live origin. No product-code change is indicated by this verification.
