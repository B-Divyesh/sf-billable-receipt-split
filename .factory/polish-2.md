# Polish 2 — Billable Split

Repair commit: `3befbd53a95a79c473c2a2422cdb78ddffd0fef9`. Deployed with `/opt/fleet/lib/deploy-static.sh billable-receipt-split dist` (deployment `8cddd1fe-3642-4d73-b1ca-3bdfcd817325`). Live URL: <https://billable-receipt-split.sociobot.in>.

| Finding IDs | Change made | Evidence |
| --- | --- | --- |
| F-1-1, F-1-11 | Kept the plain contractor/job headline, audience sentence, and result-naming sample action. | Cold live root check; `evidence/polish-2/screenshot-mobile.png`. |
| F-1-2, F-2-1 | Made Reset await clear/reseed and made Start for real clear only demo state, replace the URL with `/`, and load the real archive. Demo deletion now persists until Reset. | `@claim:demo-isolation`, `@claim:permanent-deletion`; live `/demo`. |
| F-1-3, F-1-4, F-1-5, F-1-6, F-1-7, F-2-4–F-2-10 | Expanded `claims.json` from 7 to 16 claims and added exactly one observable demo-entry test per claim. Removed the unsupported install/relaunch promise. | All 16 clean-clone registry commands; `tests/e2e/claims.spec.ts`. |
| F-1-8, F-2-3 | Made replacement navigation actually replace the route; focused each subsequent route h1 with `tabindex=-1`, including Back navigation. | `moves focus and announces the destination on route navigation and browser Back`; live `/settings` then Back. |
| F-1-9, F-1-10 | Preserved the repaired per-route metadata, shared shell, legal links, static 404, and navigation. | Live smoke report `evidence/polish-2/verify.json`; E2E accessibility route coverage. |
| F-1-12, F-1-13, F-1-14–F-1-24 | Preserved prior scoped privacy wording and plain README terms; removed the unproven installation sentence and audited new demo/license wording. | `.factory/copy-audit.md`; live root/demo check. |
| F-2-2 | Demo now never reads, writes, verifies, or retains real license state. It uses a demo-only marker and a canned sample license view. | `@claim:demo-isolation` preloads real keys and records no external request; live `/demo`. |
| F-2-4 | Added a canned, isolated licensed sample that accepts a sixth receipt and states the $19 limit removal plainly. | `@claim:license-removes-limit`. |
| F-2-5 | Asserted billable, reimbursable, and non-billable values in the three job CSV exports. | `@claim:cost-classification`. |
| F-2-6 | Kept PDF source-image evidence and made its tamper-check text inspectable in the generated local PDF. | `@claim:pdf-source-evidence`. |
| F-2-7 | Added receipt-history and permanent-deletion claims, including reload evidence. | `@claim:receipt-history`, `@claim:permanent-deletion`. |
| F-2-8 | Added encrypted-backup and source-image-check claims; a mismatched encrypted backup is rejected without replacing demo data. | `@claim:encrypted-backup`, `@claim:backup-image-check`. |
| F-2-9 | Removed the untested installation/relaunch promise; the tested offline-reload claim remains. | `.factory/claims.json`; `@claim:offline-reload`. |
| F-2-10 | Added a manual-entry claim that uploads an image, proves no lines were extracted, and records no extraction request. | `@claim:manual-receipt-entry`. |

## Final evidence

- Clean clone `/tmp/billable-clean-yNWT0C`: `npm ci` and every command in `.factory/claims.json` passed (16 commands, both desktop and 390px projects).
- Local: `npm run lint`, `npx tsc --noEmit`, `npm test` (10/10), `npm run build`, `npm run test:release`, and the full browser suite (46/46) passed.
- Live: `/opt/fleet/lib/verify-url.sh` passed with zero console errors; root screenshots are in `evidence/polish-2/`, and the cold `/demo` mobile capture is `evidence/polish-2/live-demo-mobile.png`.
