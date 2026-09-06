# Billable Split — review 6 repair handoff

## Result

**PASS — the F-6-1 contrast defect is fixed, every declared claim passes, and no repository-owned finding remains open.**

The implementation candidate is `8c1b90c1f066f977161e7d86b55b90ca154713c6`. The final documentation SHA is recorded in `/work/.evidence/qa-report.md` after this handoff commit.

## Repair

- The transparent **Add receipt** control on receipt paper now uses `#151917` ink over `#f4efd9` paper, a 15.38:1 contrast ratio.
- Its hover state switches immediately to paper text on dark ink. It no longer passes through a low-contrast animated state.
- A Playwright regression opens `/demo/list`, runs Axe on the receipt section, and measures the rendered contrast at rest and on hover. It runs at 1440 × 1000 and 390 × 844.
- The PWA is v1.3.2. Cache v15 replaces v14 so existing installs receive the corrected stylesheet; the installed start URL is versioned to v6.

## Clean verification

Final clean checkout: `/tmp/billable-repair4-final.IVO8YQ/repo` at the implementation SHA.

- `npm ci`: passed; 86 packages; zero vulnerabilities.
- All 16 exact commands in `.factory/claims.json`: passed independently, 32/32 desktop and phone executions.
- `npm run lint`, `npx tsc --noEmit`, `npm test` (11/11), `npm audit --audit-level=low`, `npm run build`, and `npm run test:release`: passed.
- `npm run test:e2e -- --reporter=line`: passed 54/54.
- Initial build: 15.00 kB gzip JavaScript and 5.30 kB gzip CSS. PDF code remains deferred.

## Deployment and live verification

- Deployment ID: `1e4cdf3e-3f20-4e3c-8fc2-e980c9c8ba47`.
- Live URL: <https://billable-receipt-split.sociobot.in>.
- All 30 public build files byte-match the implementation build.
- The live full browser suite passed 54/54 across desktop and phone.
- The cold verifier returned HTTPS 200 in 555 ms with the correct title, `lang=en`, one `h1`, one `main`, no missing image text, no unnamed buttons, and no console errors.
- Fresh desktop and phone contexts showed the job, contractor audience, and **Try it with sample data** before scrolling.
- One click opened the completed North Yard Supply sample with three jobs, the source receipt, persistent demo label, Reset demo, and Start for real.
- The live demo-isolation test edited and reset the sample, then returned to untouched seeded real data. It made no cross-origin demo request.
- Live `/demo/list` uses ink on paper and has zero serious or critical Axe findings at both widths.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.05 s, TBT 0 ms, CLS 0.

## Earlier findings

- F-1-1 through F-1-24 remain fixed: first-read copy, isolated sample, claim coverage, routes, metadata, shared shell, privacy wording, and plain documentation all pass.
- F-2-1 through F-2-10 remain fixed: demo controls and license isolation, route focus, paid-limit proof, cost classes, PDF source evidence, history, deletion, backup checks, and manual entry all pass.
- F-3-1 through F-3-4 remain fixed: demo metadata, static 404 navigation, landing sections, and settings heading pass.
- F-4-1 remains fixed: both free-limit setup paths wait for and validate the complete sample; their independent and full-suite runs pass.
- Earlier verification defects remain fixed: allocation integrity, safe money bounds, image validation, 44 px targets, accurate restore errors, response policies, service-worker cleanup, checkout registration, and API throttling all pass current checks.
- F-6-1 is fixed by the paper-surface control colors and the new rendered-outcome regression.

## Billing and remaining limits

The public catalog still lists Billable Split at USD 19.00 one time. Checkout returns a 303 hosted-payment redirect. Invalid-license verification is uncached, and a 35-request check returned six 429 responses; all six included `Retry-After: 4`.

No product backend, shared database, tenant state, health endpoint, or server replica is part of this static local-first PWA. A real-money payment and refund were not created; checkout creation, catalog identity, invalid-license behavior, browser return handling, verification caching, and throttling are covered. No repository-owned gap remains.
