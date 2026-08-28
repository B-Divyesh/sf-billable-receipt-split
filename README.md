# Billable Split

Billable Split is an offline-first receipt allocation desk for contractors who buy materials for several jobs at once. It keeps the original receipt image, fingerprints it with SHA-256, lets each receipt line be split across jobs as billable, non-billable, or reimbursable, and exports per-job CSV and PDF evidence packets.

Live product: <https://billable-receipt-split.sociobot.in>

## What v1 includes

- Local receipt capture with source-image filename and immutable SHA-256 fingerprint
- Manual receipt lines with multiple job allocations and balance feedback
- Billable, non-billable, and reimbursable cost classifications
- Per-job CSV and PDF downloads; PDF packets include a receipt preview and source hash
- IndexedDB persistence, visible edit history, permanent deletion, and offline reload
- Password-encrypted full-workspace backups using PBKDF2-SHA-256 and AES-256-GCM
- Installable PWA manifest, responsive icons, service-worker updates, and offline fallback
- Free use for five complete receipts; a $19 one-time Sociobot license removes the archive limit

Billable Split does not perform OCR, bank reconciliation, bookkeeping automation, or tax advice.

## Local development

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

The development server prints its local URL. Receipt data stays in that origin’s browser storage.

## Test and build

```sh
npm test          # unit tests
npm run lint      # static lint checks
npx tsc --noEmit  # strict type check
npm run build     # exact production build command; writes dist/
npm run test:e2e  # production build + Playwright desktop/390px/offline/Axe tests
```

Playwright is pinned to 1.58.2. Its Chromium browser must be available; in the factory worker it is supplied through `PLAYWRIGHT_BROWSERS_PATH`.

The static deployment root is `dist/`, with `dist/index.html` at its root. Serve that folder with SPA fallback to `index.html`; `/privacy/` and `/terms/` are also emitted as real static pages.

## Data and privacy

Receipt records and images are stored in IndexedDB. No receipt data is sent to an application server, and there are no analytics, tracking scripts, remote fonts, or CDN dependencies. License purchase and verification are the only networked product operations and use `https://api.sociobot.in/api/v1/products/billable-receipt-split/...`.

Encrypted backup passwords never leave the browser and cannot be recovered. Restoring a backup verifies every stored source image against its recorded SHA-256 hash before replacing local data.

See [the privacy page](public/privacy/index.html) and [the terms](public/terms/index.html).

## Project notes

- Product scope: [.factory/brief.json](.factory/brief.json)
- Visual system and image provenance: [.factory/design.md](.factory/design.md)
- Verification and handoff: [.factory/handoff.md](.factory/handoff.md)

## License

MIT — see [LICENSE](LICENSE).
