# Review 6 — split receipt costs by job

**Verdict: FAIL**  
**Reviewed:** 2026-09-06 UTC  
**Live URL:** <https://billable-receipt-split.sociobot.in>  
**Implementation candidate:** `5983d8437c91d9ba4e2ef9c73eb3a369818811d5`  
**Documentation SHA:** `1238d03c2b6e46c00ade00cf656cbe792e263f9f`

## First screen

Fresh desktop (1440 × 1000) and phone (390 × 844) browser contexts opened the live home page before scrolling. Both showed:

- Job: split one supplier receipt by job.
- Audience: contractors who buy materials for several jobs and need billable cost records.
- First action: **Try it with sample data**; it says it will show a completed split and exports.

Both contexts had one `h1`, one `main`, no horizontal overflow, and no console or page error. One click opened `/demo`, already populated with North Yard Supply, three job splits, a 720 × 1100 source image, and the persistent **Demo — sample data, nothing is saved** banner with Reset demo and Start for real.

## Finding

### S2 — F-6-1: The demo receipt list has an unreadable Add receipt control

**Location:** <https://billable-receipt-split.sociobot.in/demo/list>, desktop and 390 px phone.

**Evidence:** An independent AxeBuilder 4.10.2 scan reports a serious `color-contrast` violation on `.button-quiet`, the **Add receipt** button in `.receipt-index`. Computed colors are foreground `#f6f3e7` over the receipt-paper background `#f4efd9`, a 1.03:1 ratio; normal text needs at least 4.5:1. The button remains transparent, so its light text is effectively invisible on the light surface.

**Why this fails:** A keyboard or low-vision user arriving at the populated demo list cannot reliably find the action to add another receipt. It violates the accessibility and contrast contract.

**Repair:** Give this quiet button a dark ink text color on receipt-paper surfaces, or put it on a dark/accent surface with a compliant foreground. Re-run Axe on `/demo/list` at desktop and phone widths.

## Claims and clean checkout

A clean clone at the documentation SHA was installed with `npm ci`. Every exact command in `.factory/claims.json` passed independently, each covering both configured desktop and 390 px projects: 16 claims, 32 claim executions, 0 untested claims.

| Claim | Result |
| --- | --- |
| source-retention | PASS |
| job-allocation | PASS |
| csv-export | PASS |
| pdf-export | PASS |
| free-receipt-limit | PASS |
| receipt-data-local | PASS |
| offline-reload | PASS |
| license-removes-limit | PASS |
| cost-classification | PASS |
| pdf-source-evidence | PASS |
| receipt-history | PASS |
| permanent-deletion | PASS |
| encrypted-backup | PASS |
| backup-image-check | PASS |
| manual-receipt-entry | PASS |
| demo-isolation | PASS |

The clean checkout also passed `npm run lint`, `npx tsc --noEmit`, `npm test` (11/11), `npm run build` (created `dist/`), and `npm run test:release`. The clean full browser suite passed 52/52. The same full suite passed against the live URL, 52/52; it covers normal creation/export, invalid money and image input, an over-allocation recovery path, free-limit boundary/recovery, demo reset/start isolation, offline reload/PDF export, keyboard dialog/focus, reduced-motion behavior, and static 404 structure.

There is no product backend or tenant state: this is a static, local-first PWA. Backend persistence, health, tenant isolation, and its own request throttling are not applicable. The release check confirmed the disclosed product billing catalog, checkout redirect, and invalid-license policy.

## Routes, privacy, accessibility, and links

- `/`, `/demo`, `/demo/list`, `/demo/settings`, `/settings`, `/privacy/`, `/terms/`, `/404.html`, and an unknown deep link loaded with the expected runtime title, one `h1`, one `main`, no console error, and no mobile overflow. The unknown deep link is a designed Page not found screen; its HTTP 200 navigation fallback is deliberate and not a broken page.
- The live smoke verifier passed: HTTPS 200, 568 ms load, title, `lang=en`, one `h1`, a main landmark, no missing image alternatives, no unlabeled buttons, and no console errors.
- Independent AxeBuilder checks found no serious or critical issue on every checked route except F-6-1 on `/demo/list`.
- The project suite's built-in Axe checks pass for home, settings, privacy, terms, and static 404. I also invoked `npx @axe-core/cli`; its bundled ChromeDriver is version 152 while the supplied Playwright Chromium is 145, so it cannot start that browser. This is a verifier-tool driver mismatch, not a public claim. The route scans above used the repository-pinned Axe Playwright integration with the supplied browser.
- All discovered product, legal, demo, unknown-page, factory, and checkout links resolved as expected. Product links returned 200; the checkout link returned its expected 303 hosted-checkout redirect.
- CSP, Referrer-Policy, and nosniff are present on the live responses. Privacy and terms pages load and have their own titles.

## Earlier findings

All earlier review, verification, and polish reports were inspected. The current live recheck confirms that F-1-1 through F-1-24, F-2-1 through F-2-10, F-3-1 through F-3-4, and F-4-1 remain repaired: clear contractor-first copy; one-click isolated demo; claims registry and tests; separate demo receipt/license state; reset and Start for real; route metadata, focus, Back navigation, and 404 shell; plain privacy and scope copy; source image, exports, history, deletion, encrypted backup and restore checking; manual entry; and deterministic free-limit testing.

Review 5 reported zero findings. Its closures remain in place, but it did not scan `/demo/list` with Axe. F-6-1 is a new accessibility finding, not a recurrence of an earlier open finding.

## Result

**FAIL — 1 finding, 0 untested claims.** Do not declare the product passed until F-6-1 is repaired and the live `/demo/list` Axe scan is clean.
