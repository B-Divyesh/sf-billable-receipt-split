# Split receipt costs by job — independent verification 6

**Verdict:** FAIL  
**Finding count:** 1  
**Untested claim count:** 0  
**Implementation candidate:** `8c1b90c1f066f977161e7d86b55b90ca154713c6`  
**Documentation baseline:** `327c2a258b8445161741cedda8e7c561a90dab06`  
**Live URL:** <https://billable-receipt-split.sociobot.in>  
**Verified:** 2026-09-06 UTC  
**Work order:** `billable-receipt-split-verify-6`

## Decision

The receipt-splitting workflow, all 16 declared claims, the F-6-1 contrast repair, and every earlier defect pass current local and live checks. One new accessibility finding remains: the inline Terms link in the settings license panel is smaller than the required touch target. A PASS requires zero findings, so this candidate fails verification.

## Finding

### S2 — V6-1: The settings-panel Terms link is too small to tap reliably

**Routes:** `/settings` and `/demo/settings`  
**Widths checked:** 390 px phone and 1440 px desktop

The inline **Terms** link in `.license-panel > small` measures 37.7 × 15 CSS pixels. It has no padding and uses `display: inline`. The accessibility contract requires every touch target to be at least 44 × 44 CSS pixels.

The link is keyboard reachable and receives the designed 3 px mint focus ring. It resolves to the working Terms page, so this is a target-size defect, not a dead-link or focus defect. The footer Terms link and all other visible controls on the audited routes meet the 44 px floor.

**Required repair:** Give the license-panel Terms link a 44 × 44 minimum clickable area without changing the surrounding sentence. Add a phone regression that measures every interactive target in `/settings` and `/demo/settings`.

## First screen and sample

Fresh 1440 × 1000 desktop and 390 × 844 phone contexts opened the live home page at scroll position zero.

- Job: **Split one supplier receipt by job**.
- Audience: contractors buying materials for several jobs who need billable cost records.
- First action: **Try it with sample data**. The action is visible before scrolling at both widths and says the next screen shows a completed split and exports.
- The three first-screen facts state local browser storage, offline reload, and the five-receipt/$19 limit.

One click opened `/demo` with North Yard Supply, a $501.75 receipt, three material lines, Oak Street kitchen, Pine Avenue repair, Workshop stock, and the 720 × 1100 source image. The persistent banner says **Demo — sample data, nothing is saved** and contains Reset demo and Start for real.

The isolation claim changed a sample line, reset it to the original value, seeded a separate real receipt, and selected Start for real. The real receipt and real license keys remained unchanged, the demo database was empty on exit, and no cross-origin request occurred. This proves reset and exit do not change real data.

## Claims

A fresh clone at documentation commit `327c2a2` was installed with `npm ci`. Every exact command in `.factory/claims.json` then passed independently in both configured browsers: 16 commands, 32 executions, 0 failed, 0 untested.

| Claim | Result |
| --- | --- |
| source-retention | PASS — 2/2 |
| job-allocation | PASS — 2/2 |
| csv-export | PASS — 2/2 |
| pdf-export | PASS — 2/2 |
| free-receipt-limit | PASS — 2/2 |
| receipt-data-local | PASS — 2/2 |
| offline-reload | PASS — 2/2 |
| license-removes-limit | PASS — 2/2 |
| cost-classification | PASS — 2/2 |
| pdf-source-evidence | PASS — 2/2 |
| receipt-history | PASS — 2/2 |
| permanent-deletion | PASS — 2/2 |
| encrypted-backup | PASS — 2/2 |
| backup-image-check | PASS — 2/2 |
| manual-receipt-entry | PASS — 2/2 |
| demo-isolation | PASS — 2/2 |

The registry contains 16 unique IDs and exactly one matching `@claim:<id>` test for each. The live landing page, workspace, settings, legal pages, README, demo notes, and copy audit were cross-checked. No public claim is missing from the registry.

## Clean checkout and runtime checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 86 packages; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm test` | PASS — 11/11 |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — `dist/index.html` created |
| `npm run test:release` | PASS — catalog, $19 checkout redirect, invalid-license policy |
| Local `npm run test:e2e -- --reporter=line` | PASS — 54/54 |
| Live full browser suite | PASS — 54/54 |

The initial application bundle is 15.00 kB gzip JavaScript and 5.30 kB gzip CSS. The PDF code is deferred. The mobile hero is 11.46 kB. These meet the static PWA budgets.

The full suites cover normal receipt creation, manual lines, multi-job splits, all three cost classes, reload persistence, CSV/PDF, encrypted backup/restore, permanent deletion, invalid image input, unsafe money, over-allocation prevention, corrupt legacy data, the five-receipt boundary and recovery, keyboard dialog focus, reduced motion, offline reload/export, and old service-worker cache removal.

## Live deployment, routes, and links

- All 30 public files from the clean candidate build byte-match production. The documentation-only commit after `8c1b90c` does not change runtime files.
- The cold verifier loaded HTTPS 200 in 611 ms with the correct title, `lang=en`, one `h1`, one `main`, no missing image text, no unnamed buttons, and no console errors.
- `/`, `/demo`, `/demo/list`, `/demo/settings`, `/settings`, `/privacy/`, `/terms/`, `/404.html`, and an unknown route have distinct correct titles, one `h1`, one `main`, no horizontal overflow at normal phone size, and no Axe violations.
- The unknown route intentionally uses the SPA fallback and renders the designed **Page not found** screen. `/404.html` renders the same product shell with a route back. Their successful fallback responses are not defects.
- All discovered product links return 200. `sociobot.in` returns 200. The product checkout returns the expected 303 redirect to the hosted Dodo checkout origin.
- Root responses include CSP, Permissions-Policy, HSTS, strict-origin referrer policy, and `nosniff`. Hashed assets are one-year immutable; the worker is `no-cache, no-store, must-revalidate`.

## Accessibility, PWA, privacy, and performance

- Independent Axe scans found zero violations at either width on all nine audited routes. The new V6-1 finding comes from the stricter 44 px factory target rule, which Axe does not report here.
- F-6-1 is fixed: **Add receipt** measures 15.38:1 at rest and 15.38:1 on hover on desktop and phone.
- The first Tab stop is the visible skip link at 8,8 with a 198.6 × 48 box and a 3 px focus outline. Dialog focus entry, Escape closure, opener restoration, route-heading focus, and Back announcements pass.
- Reduced motion changes transitions and animations to 0.01 ms and smooth scrolling to `auto`. At 200% text size, the audited content and actions remain present and operable.
- Offline reload and PDF export pass in fresh contexts. The worker uses cache v15, removes old product caches, and the app contains an announced update-ready toast.
- Receipt and image data remain in separate real/demo IndexedDB databases. Normal use, demo, export, backup, restore, deletion, and offline checks send no receipt data cross-origin. The only external paths are the disclosed Sociobot purchase and license actions.
- Lighthouse 13 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 60 ms, CLS 0, total transfer 49 KiB.

This is a static, local-first PWA. It has no product backend, tenant service, server data, restart persistence, or health endpoint, so those backend checks do not apply. The external product-license endpoint accepted 30 of 40 concurrent invalid requests and returned 10 HTTP 429 responses; every 429 included `Retry-After: 4`.

## Earlier findings

All earlier review, verification, and polish reports were inspected.

- F-1-1 through F-1-24 remain fixed: the first screen, demo, claims, routes, metadata, shared shell, privacy wording, plain copy, exports, and local/offline statements pass.
- F-2-1 through F-2-10 remain fixed: reset/start isolation, real-license separation, route focus, paid-limit proof, cost classes, PDF evidence, history, deletion, backup checks, and manual entry pass.
- F-3-1 through F-3-4 remain fixed: demo metadata, static 404 shell, required landing sections, and settings heading pass.
- F-4-1 remains fixed: both free-limit setup paths validate the complete sample and pass independently and in both full suites.
- F-6-1 is fixed by the paper-surface control colors and rendered contrast regression.
- Earlier verification defects remain fixed: checkout availability, allocation integrity, safe money bounds, image validation, the earlier wordmark/footer touch targets, accurate restore errors, response policy, cache cleanup, checkout registration, and API throttling pass current checks.

V6-1 is a new target-size gap in the settings license panel. It was not one of the earlier small wordmark/footer targets and is not covered by the current target-size regression.

## Final verdict

**FAIL — 1 finding, 0 untested claims.** Repair V6-1 and redeploy before declaring PASS.
