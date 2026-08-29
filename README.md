# Billable Split

Billable Split helps contractors split one supplier receipt across several jobs.

Keep the receipt photo with each split. Assign each item to a job and mark it billable, reimbursable, or non-billable. Download a CSV or PDF for each job.

Live product: <https://billable-receipt-split.sociobot.in>

## Try the sample

Open <https://billable-receipt-split.sociobot.in/demo> to see a completed materials receipt. The demo uses separate sample storage. Reset demo replaces only its sample data. Start for real discards it.

## What it includes

- Keeps the receipt photo and a tamper-check value with each export.
- Add each purchased item, split its amount between jobs, and see what remains.
- Mark costs as billable, reimbursable, or non-billable.
- Download a CSV or PDF for each job. The PDF includes the receipt image and its tamper-check value.
- Keeps receipts in this browser, shows changes, lets you delete them permanently, and works after an offline reload.
- Download one password-protected backup of your receipts and images.
- Store five receipts for free. A $19 one-time Sociobot license removes only the receipt limit.

It does not read receipt text automatically, reconcile bank accounts, do bookkeeping, or give tax advice.

## Local development

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Receipt data stays in the browser profile that opened the app.

## Test and build

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
npm run test:release
```

Run every visitor-facing claim from a clean checkout:

```sh
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
```

Playwright is pinned to 1.58.2. The static deployment root is `dist/`, with `dist/index.html` at its root. The deployment serves application routes with SPA fallback and serves `/privacy/`, `/terms/`, and `/404.html` as static pages.

## Data and privacy

Receipt data stays in your browser. The app has no ads, tracking, remote fonts, or third-party downloads. Purchase and license checks contact Sociobot only when you choose them.

Backup passwords protect the downloaded file in this browser. Before restoring a backup, the app checks that every saved receipt image still matches.

See the [privacy page](public/privacy/index.html), [terms](public/terms/index.html), and [demo notes](.factory/demo.md).

## Project notes

- Product scope: [.factory/brief.json](.factory/brief.json)
- Visual system and image provenance: [.factory/design.md](.factory/design.md)
- Claims: [.factory/claims.json](.factory/claims.json)
- Verification and handoff: [.factory/handoff.md](.factory/handoff.md)

## License

MIT — see [LICENSE](LICENSE).
