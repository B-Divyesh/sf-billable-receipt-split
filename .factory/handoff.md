# Billable Split — verification 3 handoff

## Final verification verdict: FAIL

Candidate `bcd43e3f3c6b827f4ca0b67cfbaa3bf01baa93f9` was independently verified from a clean checkout against <https://billable-receipt-split.sociobot.in> on 2026-08-28 UTC. Product source was not changed; this verification documentation is the only change.

**S1 release blocker:** the exact visible one-time checkout URL, `https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout`, still returns `HTTP 404 {"error":"enabled factory product","status":404}`. The app uses the required Sociobot billing URL, but a buyer cannot start checkout. This must be remedied by registering/enabling the production product in the billing service; repository policy forbids repairing billing here. Until a hosted checkout redirect and returned real-license unlock succeed, the release verdict is **FAIL**.

All repository-owned acceptance checks pass afresh: clean install; lint; strict TypeScript; 10 unit/integration tests; production build; local and live 12/12 desktop+390px E2E; source-to-job CSV evidence with SHA-256 and classifications; encrypted backup/restore/deletion; offline reload/PDF and service-worker update/cache cleanup; keyboard/focus/reduced motion; Axe serious/critical 0; privacy/outbound-request checks; headers/caching; and live byte comparison (27/27 exposed files matched the candidate build). Fresh Lighthouse mobile is 98 performance / 100 accessibility / 100 best practices / 100 SEO, with 2.0s LCP, 0ms TBT, and CLS 0.

See [.factory/verification-3.md](verification-3.md) for exact commands and evidence.

---

# Billable Split — repair 2 handoff

## Final verification verdict: BLOCKED ON EXTERNAL BILLING

Work order `billable-receipt-split-repair-2` audited independent verifier report commit `8f2cf58976253afedb9f8e497e8e878f74c132a9` against candidate `e952a2d5ebb6ca0de5cec1096f5e8aa85a9597ae` on 2026-08-28 UTC.

The report has one release blocker. It remains reproducible from this worker:

```text
GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The app already uses that exact required Sociobot checkout URL; the invalid-license verification endpoint still returns `200` with `{"valid":false,"reason":"invalid"...}`. Product registration is owned by the production Sociobot billing service, and `AGENTS.md` explicitly prohibits this repository from changing billing. No safe source change can turn an unregistered product into a hosted purchase. The free local-first receipt workflow, export, deletion, backup, and license-return handling were left intact.

## Repair made

While rerunning the verifier's live browser matrix, the allocation-integrity E2E scenario exposed a test race: it submitted another allocation before the previous IndexedDB save had finished rendering, which could make the test query a detached editor at production latency. `tests/e2e/app.spec.ts` now waits for the persisted allocation-row count after each save and waits for the second editor after adding the second line. This preserves the exact $100 / $60+$40 allocation integrity regression while proving each persisted state before the next action.

## Verification evidence

- Clean dependency install: `npm ci` — pass; 86 packages, 0 audit vulnerabilities.
- Static analysis: `npm run lint`, `npx tsc --noEmit`, and `npm audit --audit-level=low` — pass.
- Unit/integration: `npm test` — pass; 3 files / 10 tests.
- Production build: `npm run build` — pass; `dist/index.html` exists. Initial JS is 36.91 KB raw / 12.53 KB gzip and CSS is 18.98 KB raw / 4.76 KB gzip; the PDF libraries remain lazy chunks.
- Local browser: `npm run test:e2e -- --reporter=line` — pass; 12/12 Chromium desktop and 390 px mobile scenarios, including keyboard focus, Axe serious/critical 0, persistence, encrypted backup/restore, offline reload/PDF, and service-worker cache cleanup.
- Local browser smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ <evidence-dir>` — pass; title, `lang`, one `h1`, `main`, image alt text, labelled controls, and no page/console errors.
- Live browser: `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line` — pass; 12/12 desktop and 390 px scenarios.
- Deployment: `/opt/fleet/lib/deploy-static.sh billable-receipt-split /work/repo/dist` — pass; Azure Static Web Apps deployment `a7c04f95-ef55-4bc7-88d2-d570fa10502a`, custom-domain HTTPS 200. Post-deploy identity comparison matched all 27 served `dist/` files byte-for-byte.
- Live billing probe: checkout remains HTTP 404 as quoted above; this is the sole S1 release blocker.

## Required next step

The billing owner must register/enable the production `billable-receipt-split` $19 one-time product. Reverify that the exact checkout URL redirects to hosted checkout and that a real returned `?license=` token unlocks the deployed application. Until that external action is complete, the product cannot honestly be marked release-ready.

---

# Billable Split — verification 2 handoff

## Final verification verdict: FAIL

Candidate `e952a2d5ebb6ca0de5cec1096f5e8aa85a9597ae` was independently verified from a clean checkout against <https://billable-receipt-split.sociobot.in> on 2026-08-28 UTC. Product code was not changed; verifier documentation is the only repository modification.

All repository-owned acceptance checks now pass: `npm ci`, 10 unit tests, lint, strict TypeScript, production build, local 12/12 desktop+390 px E2E, and live 12/12 E2E. The live deployment byte-matches all 27 served `dist/` files. Live Lighthouse mobile is 100/100/100/100 (performance/accessibility/best-practices/SEO), and offline reload/PDF export, service-worker cache replacement, keyboard/focus/reduced-motion, Axe serious/critical (0), headers, caching, and bundle budgets pass.

**Open S1 release blocker:** `GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout` still returned `HTTP 404 {"error":"enabled factory product","status":404}` at 05:56 UTC. The app has the correct $19 checkout link, but the product cannot be purchased. This requires production Sociobot billing registration and cannot be repaired from this repository under `AGENTS.md`.

See [.factory/verification-2.md](verification-2.md) for exact commands, evidence, and the full acceptance matrix. Reverify a hosted checkout redirect and real return-license unlock after registration. Until then the unambiguous release decision is **FAIL**.

---

# Prior repair handoff

## Verdict: BLOCKED ON BILLING REGISTRATION

Repair work order `billable-receipt-split-repair-1` addressed candidate `89fc38aa383eee503639da2f14ff8cdd9ae7dab8` and verifier report `192208c5df8c907a7a48d2b1ece0d7854ead87b1`. The repaired static PWA is deployed at <https://billable-receipt-split.sociobot.in>.

All repository-owned S1/S2/S3 findings are fixed and covered. The one remaining release blocker is external: at 2026-08-28 05:18 UTC, production `GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout` still returned HTTP 404 with `{"error":"enabled factory product","status":404}`. The app already uses the required production URL and its return-license/verification flow remains intact. This workspace has no `fleet/new-paid-product.sh` (or another billing-registration command), and `AGENTS.md` prohibits changing billing from this repository. The factory billing owner must register/enable the $19 one-time product, then verify a hosted-checkout redirect and real return token before release.

## Repairs

- Line totals can no longer be reduced below their existing allocation total. The attempted edit is rejected without mutating IndexedDB and tells the user to reconcile splits first.
- Receipt status now detects per-line over-allocation independently, so source gaps cannot cancel allocation overruns. CSV/PDF controls are disabled unless line totals equal the source total and every line is exactly allocated. Click handlers repeat the integrity guard.
- Money parsing now uses decimal-string-to-`BigInt` conversion and rejects values above `Number.MAX_SAFE_INTEGER` cents. Every money control has the matching `90071992547409.91` maximum.
- Capture accepts only matching PNG, JPEG, WebP, or AVIF MIME/signature pairs and requires successful browser decoding. Restore applies the same source-image validation.
- Encrypted restore now distinguishes password/decryption failure from malformed content and SHA-256 fingerprint mismatch; a mismatch reports that nothing was restored.
- The wordmark, Privacy, and Terms targets now meet the 44×44 CSS-pixel minimum, including legal pages.
- Service worker `v10` removes only superseded `billable-split-*` caches on activation and subsequent requests. A regression recreates the verifier's lingering `v8` cache case.
- Production response policy now supplies CSP, Permissions-Policy, correct manifest MIME, no-store service-worker caching, and immutable one-year caching for content-hashed assets. App JS/CSS and both responsive hero files are content-hashed.
- Added an `oxlint` gate and made Playwright runnable against either local preview or the live deployment.

## Exact regression coverage

- `tests/utils.test.ts`: cancelled-balance over-allocation, evidence eligibility, exact safe-cent boundary (`…09.91` accepted; `…09.92`/`…09.93` rejected), two-decimal enforcement, and MIME/signature checks.
- `tests/backup.test.ts`: correctly encrypted but fingerprint-mismatched backup produces an integrity error; wrong password remains a decryption error.
- `tests/policy.test.ts`: security headers, immutable asset policy, no-store worker policy, and scoped old-cache deletion.
- `tests/e2e/app.spec.ts`: exact $100/$60+$40 verifier scenario, rejected $60→$40 line edit, persisted original value, forced legacy-invalid IndexedDB record, invalid status and disabled CSV/PDF, huge input, `text/plain`, retries after validation errors, 44 px targets, dialog focus/Escape restoration, Axe on app/settings/privacy/terms, same-origin-only core workflow, persistence, encrypted backup/restore, offline reload/PDF, and stale-cache cleanup.

## Verification evidence

Clean/local gates:

- `npm ci`: pass; 86 packages installed; audit reported 0 vulnerabilities.
- `npm run lint`: pass.
- `npm test`: pass, 3 files / 10 tests.
- `npx tsc --noEmit`: pass.
- `npm audit --audit-level=low`: pass, 0 vulnerabilities.
- `npm run build`: pass; `dist/index.html` present.
- Initial bundle: JS 36.91 KB raw / 12.53 KB gzip; CSS 18.98 KB / 4.76 KB gzip; mobile hero 11.46 KB. PDF libraries remain lazy chunks.
- `npm run test:e2e`: pass, 12/12 across Chromium 1440×1000 and 390×844.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...`: pass; title/lang/one h1/main/alt/button labels and zero console errors.
- Local Lighthouse 12.8.2 mobile: performance 97, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 200 ms, CLS 0.

Deployment/live gates:

- `/opt/fleet/lib/deploy-static.sh billable-receipt-split /work/repo/dist`: pass; Azure deployment `b3d9a7d3-5d3e-426f-8371-5190cf559d78`; custom domain HTTPS 200.
- 27/27 served files compared byte-for-byte with local `dist/`; zero mismatches (`staticwebapp.config.json` is consumed by Azure and intentionally not served).
- `/opt/fleet/lib/verify-url.sh https://billable-receipt-split.sociobot.in ...`: pass in 758 ms with zero console/page errors.
- `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e`: pass, 12/12 on desktop and 390 px mobile, including live offline/PDF/cache coverage.
- Live Lighthouse 12.8.2 mobile: 100/100/100/100; FCP 1.0 s, LCP 1.1 s, TBT 30 ms, CLS 0.
- Live `/`, `/privacy/`, `/terms/`: HTTP 200 with CSP, Permissions-Policy, Referrer-Policy, and `nosniff`; HTML is revalidated. `/sw.js` is `no-cache, no-store, must-revalidate`; `.webmanifest` is `application/manifest+json`; hashed JS/CSS/hero responses are `max-age=31536000, immutable`.

## Run it

```sh
npm ci
npm run lint
npm test
npx tsc --noEmit
npm audit --audit-level=low
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e
```

There is no package/consumer test for this static PWA. No application behavior that previously passed was removed; local-first storage, export ownership, encryption, deletion, offline use, installability, and license restoration remain available.
