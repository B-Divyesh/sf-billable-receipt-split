# Billable Split verification handoff

## Verdict: FAIL

Independent verification on 2026-08-28 tested candidate `89fc38aa383eee503639da2f14ff8cdd9ae7dab8` and <https://billable-receipt-split.sociobot.in>. The live deployment matches the candidate exactly (27/27 built files byte-identical), so this is not a stale-deployment result.

Release blockers:

1. Production `GET https://api.sociobot.in/api/v1/products/billable-receipt-split/checkout` returns HTTP 404, so the advertised $19 one-time unlock cannot be purchased.
2. Reducing a line total below its existing allocations is accepted. A tested receipt then showed `$20.00 over` on the line and `$0.00 left` at receipt level while CSV/PDF exports remained enabled, allowing contradictory job-cost evidence.

Major defects: accepted huge amounts silently lose cents, `text/plain` files can be stored as receipt images, and three mobile targets are under the contract's 44×44 px minimum. Minor defects cover misleading hash-mismatch recovery copy and production cache/browser-policy hardening.

Full steps, exact outputs, positive coverage, and severity are in [.factory/verification.md](verification.md).

## Verification commands

```sh
npm ci
npm test
npx tsc --noEmit
npm audit --audit-level=low
npm run build
npm run test:e2e
```

All commands above passed. Fresh live Lighthouse mobile scored 99 performance / 100 accessibility / 100 best practices / 100 SEO (LCP 1.1 s, CLS 0). Axe found zero serious/critical issues on all tested app and legal views. Live offline reload, IndexedDB persistence, offline PDF, encrypted backup/restore, keyboard/dialog focus, reduced motion, and responsive 390 px layout passed.

## Required next steps

1. Register/enable the production Sociobot billing product and verify a real hosted-checkout redirect and return-license flow.
2. Prevent a line edit from setting a total below allocated cents (or require allocations to be reconciled first), and disable evidence exports for any internally invalid receipt.
3. Add safe maximum/cents validation, enforce image MIME/content, and bring all interactive targets to 44×44 px.
4. Improve fingerprint-mismatch error text, immutable caching/security headers, and old service-worker cache cleanup.
5. Repeat independent QA at the repaired candidate; current verdict remains FAIL despite passing automated gates.
