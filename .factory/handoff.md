# Split receipt costs by job — verification 6 handoff

## Result

**FAIL — independent verification found 1 S2 accessibility defect and 0 untested claims.**

The implementation candidate is `8c1b90c1f066f977161e7d86b55b90ca154713c6`. The documentation baseline reviewed is `327c2a258b8445161741cedda8e7c561a90dab06`. Production byte-matches all 30 public build files from that candidate.

## Open finding

V6-1: the inline **Terms** link in the license panel on `/settings` and `/demo/settings` measures 37.7 × 15 CSS pixels at both audited widths. The required minimum touch target is 44 × 44. Its destination and keyboard focus treatment work.

Repair the target size without changing the sentence, add a 390 px regression covering every visible settings control, deploy, and rerun verification.

## What passed

- All 16 exact claim commands passed independently: 32/32 desktop and phone executions, with no untested claim.
- `npm run lint`, `npx tsc --noEmit`, `npm test` (11/11), `npm audit --audit-level=low`, `npm run build`, and `npm run test:release` passed.
- The complete local and live Playwright suites passed 54/54 each.
- Fresh phone and desktop contexts showed the job, contractor audience, and sample action before scrolling.
- The one-click North Yard Supply sample, persistent demo label, reset, Start for real, and real-data isolation passed.
- F-6-1 is fixed: Add receipt contrast is 15.38:1 at rest and hover, with no Axe violation.
- Normal, invalid, boundary, recovery, keyboard, focus, reduced-motion, offline/update, privacy, link, route, legal, and designed not-found checks passed.
- All 30 public build files match production.
- Lighthouse mobile scored 100 in Performance, Accessibility, Best Practices, and SEO. LCP was 1.1 s, TBT 60 ms, and CLS 0.
- The product-license API returned 10 rate-limited responses in a 40-request burst; every 429 included `Retry-After: 4`.

## Reproduce

From a clean checkout:

```sh
npm ci
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
npm run lint
npx tsc --noEmit
npm test
npm audit --audit-level=low
npm run build
npm run test:e2e -- --reporter=line
PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line
npm run test:release
```

Full evidence and disposition are in `.factory/verification-6.md`. No product code was changed during verification.
