# Independent product verification 3 — FAIL

**Candidate:** `bcd43e3f3c6b827f4ca0b67cfbaa3bf01baa93f9`  
**Live URL:** <https://billable-receipt-split.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Scope:** independent verifier; no product source was changed.

## Release decision

**FAIL — S1 release blocker.** The advertised $19 one-time purchase cannot be started. A fresh direct request to the exact checkout URL required by the work order returned:

```text
GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The application points to that exact required URL, so this is a production Sociobot billing-registration/enablement failure rather than a repository routing error. The brief defines a one-time product; buyers cannot currently complete that job. `AGENTS.md` prohibits changes to billing from this repository. The invalid-token verification endpoint is live and behaves correctly (`200`, `{"valid":false,"reason":"invalid","expires_at":null}`), but it does not make checkout available.

## What was verified

The checkout began clean at the requested commit (`git status --short` empty before verification).

| Area | Fresh evidence | Result |
| --- | --- | --- |
| Install and static gates | `npm ci` installed 86 packages; `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm audit --audit-level=low` all passed. Vitest: 3 files, 10 tests; audit: 0 vulnerabilities. | PASS |
| Production build | `npm run build` passed and produced `dist/`. Initial app JS is 36.91 KB raw / 12.53 KB gzip; CSS 18.98 KB raw / 4.76 KB gzip. PDF dependencies are deferred chunks. | PASS |
| Local browser workflow | `npm run test:e2e -- --reporter=line`: 12/12, Chromium desktop and 390x844 mobile. Covers capture, splits, persistence, CSV/PDF, encrypted backup/restore, deletion, unsafe money/image recovery, allocation integrity, keyboard dialog behavior, Axe, offline reload, and service-worker cache replacement. | PASS |
| Live browser workflow | `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line`: 12/12 with the same desktop/mobile coverage. | PASS |
| Independent live allocation/export smoke | Created a $100 receipt, split $60 reimbursable to Oak Job and $40 non-billable to Warehouse, then downloaded both CSVs. Both were job-scoped; each contains the immutable 64-hex source SHA-256 and its respective cost type. No page/console errors. | PASS |
| PWA/offline/update | Live test registered the worker, reloaded while offline, opened stored data, and created an offline PDF. It also seeded `billable-split-v8`; reload left only `billable-split-v10`. Manifest has standalone display, versioned start URL, 192/512/maskable icons, and matching colors. | PASS |
| Accessibility and responsive use | Axe serious/critical findings: 0 on app, settings, privacy, and terms in both projects. Keyboard skip link, Escape dialog restoration, labelled controls, 44px legal/wordmark targets, and 390px layout pass. Direct reduced-motion check found the visible 3px mint focus ring and reduced transition duration `1e-05s`, with no errors. | PASS |
| Performance and visual QA | Fresh Lighthouse 11.7.1 mobile: performance 98, accessibility 100, best practices 100, SEO 100; FCP 2.0s, LCP 2.0s, TBT 0ms, CLS 0. Desktop and 390px screenshots show the product-specific job-ledger visual system without clipping or overlap. | PASS |
| Privacy and outbound requests | The normal end-to-end workflow made no cross-origin requests; source review finds only the intentional Sociobot checkout/verification API. No CDN fonts, analytics, trackers, or remote runtime assets. Receipt data remains in IndexedDB; backups are AES-256-GCM encrypted; deletion and export/restore work. | PASS |
| Response policies and cache | Live `/`, `/privacy/`, `/terms/` return 200 with CSP, Permissions-Policy, Referrer-Policy, `nosniff`, and HSTS. `/sw.js` is `no-cache, no-store, must-revalidate`; manifest is `application/manifest+json`; hashed JS/CSS/assets are one-year immutable. | PASS |
| Candidate/live identity | Rebuilt candidate output was compared byte-for-byte to every exposed live artifact: 27 matched, 0 mismatched. `dist/staticwebapp.config.json` is intentionally consumed by Azure and is not publicly served (404). | PASS |

`/opt/fleet/lib/verify-url.sh` independently loaded the live root in 587ms with zero console/page errors and confirmed title, `lang=en`, one `h1`, `main`, and zero images missing `alt`.

## Defects

1. **S1 — production checkout endpoint is unregistered/disabled.** The visible “Buy once · $19” link reaches HTTP 404 rather than hosted checkout. This blocks the paid one-time product promised in the terms and acceptance contract. **Owner/next step:** the Sociobot billing owner must register and enable the production `billable-receipt-split` product, then re-run checkout redirect and a real returned-license unlock against the live PWA.

No repository-owned S2/S3 defects were found in this verification.

## Reproduction commands

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:e2e -- --reporter=line
PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line
curl -i https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout
```
