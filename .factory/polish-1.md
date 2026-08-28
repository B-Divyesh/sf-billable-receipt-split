# Polish 1 — Billable Split

Repair commit: `70124d3dab40201c06fc162589188846c9d70fe8` (deployed). Live URL: <https://billable-receipt-split.sociobot.in>.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the slogan with “Split one supplier receipt by job” and named contractors and their materials-purchase situation. | Live cold check; `live-demo-mobile.png` and `verify.json`. |
| F-1-2 | Added `/demo` and `?demo=1`, a seeded North Yard Supply split, isolated `demo:billable-split` storage, banner, reset, Start for real, and demo documentation. | `@claim:source-retention`, `@claim:receipt-data-local`, `@claim:offline-reload`; live `/demo`. |
| F-1-3 | Added the complete `.factory/claims.json` registry and exactly one tagged Playwright declaration for every entry. | Every listed claim command passed from clean clone `/tmp/billable-clean.sg2X7K`. |
| F-1-4 | Added observable source, split, CSV, and PDF claims/tests, all from the demo. | `@claim:source-retention`, `@claim:job-allocation`, `@claim:csv-export`, `@claim:pdf-export`. |
| F-1-5 | Rewrote the capacity fact and tested the five-receipt boundary plus settings recovery. | `@claim:free-receipt-limit`. |
| F-1-6 | Scoped the offline/storage facts and tested a service-worker-controlled offline reload and PDF export. | `@claim:offline-reload`. |
| F-1-7 | Replaced the privacy slogan with scoped browser/Sociobot language and tested the request log and separate demo database. | `@claim:receipt-data-local`; live footer/privacy page. |
| F-1-8 | Added History API routes for receipts, `/demo`, `/settings`, demo settings, focus/announcement, titles, Back support, and static styled 404 override. | Live 26/26 Playwright pass; live `/demo`, `/settings`, `/does-not-exist`. |
| F-1-9 | Added canonical, OG, Twitter, touch-icon, and derived 1200×630 social image metadata to app/legal/404 routes. | Live cold page check; `verify.json`. |
| F-1-10 | Added shared app/legal header/footer navigation, Demo/Privacy, Param Factory credit, and v1.1.0 build label. | Live root, Privacy, and Terms checks in E2E accessibility test. |
| F-1-11 | Replaced “Offline job-cost desk” with “Receipt costs for several jobs.” | Live root check. |
| F-1-12 | Replaced footer slogan with the scoped receipt-data disclosure. | Live footer check; `@claim:receipt-data-local`. |
| F-1-13 | Replaced “Local archive / 00” with “Saved receipts: n.” | Live root and dashboard check. |
| F-1-14 | Rewrote README opening in plain language. | `.factory/copy-audit.md`. |
| F-1-15 | Split README opening into short outcome-led sentences. | `.factory/copy-audit.md`. |
| F-1-16 | Rewrote hash feature copy as a tamper-check outcome. | README review. |
| F-1-17 | Rewrote allocation feature copy as an item/job action. | README review. |
| F-1-18 | Rewrote export copy as CSV/PDF outputs with receipt image. | README review. |
| F-1-19 | Rewrote browser storage feature copy without implementation names. | README review. |
| F-1-20 | Rewrote backup feature copy as a password-protected download. | README review. |
| F-1-21 | Rewrote installation copy around phone/computer offline use. | README review. |
| F-1-22 | Replaced OCR with “read receipt text automatically.” | README review. |
| F-1-23 | Replaced origin terminology with browser-profile language. | README review. |
| F-1-24 | Rewrote storage/privacy/restore disclosures as short browser-focused statements. | README review; `@claim:receipt-data-local`. |

## Evidence

- Fresh cloned checkout: `npm ci`, `npm test` (10/10), `npm run build`, and all seven individual registry commands passed.
- Local full browser suite: 26/26 passed on desktop and 390 px, including Axe serious/critical checks, keyboard, offline, PDF/CSV, backup, limits, and service-worker cleanup.
- Live full browser suite: `PLAYWRIGHT_BASE_URL=https://billable-receipt-split.sociobot.in npm run test:e2e -- --reporter=line` passed 26/26.
- `/opt/fleet/lib/verify-url.sh` live report: `.factory/evidence/polish-1/verify.json`; desktop/mobile screenshots are alongside it. Demo mobile screenshot: `.factory/evidence/polish-1/live-demo-mobile.png`.
