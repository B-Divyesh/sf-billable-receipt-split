# Billable Split — visual thesis

## Direction: job ledger terminal

Billable Split uses a pixel/demoscene language that feels like a purpose-built field instrument, not retro decoration. A receipt moves through a visible three-stage rail — **Capture → Split → Export** — while tiny square pixels, hard one-pixel rules, tabular money, and a phosphor status light make the allocation state legible at a glance. The source record stays visually “under” the ledger, reinforcing that every exported cost remains tied to evidence.

The interface is deliberately single-mode. A dark workshop desk surrounds receipt-paper work surfaces; this avoids a generic theme switch and gives the product a stable, installable-tool identity in trucks, stores, and offices.

## Tokens

- **Workbench / background** `#0b0d0c`: near-black ink, not blue SaaS charcoal.
- **Raised surface** `#151917`: split panes and instrument chrome.
- **Receipt paper** `#f4efd9`: warm source-document field.
- **Primary text** `#f6f3e7`; **ink text** `#151917`.
- **Muted text** `#aab3aa` on dark; `#596159` on paper.
- **Phosphor / accent** `#8df5b2` with `#092515` contrast: saved, balanced, billable.
- **Amber** `#ffc857` with `#241600` contrast: money still unallocated or offline notice.
- **Danger** `#ff7d70`: deletion and invalid state.
- **Info** `#8ec5ff`: reimbursable status.

All ordinary text/background pairings target WCAG AA (4.5:1 or better); state is always repeated in words or symbols.

## Type and spacing

- UI and reading copy: system sans (`Inter`-like platform stack) at 16px minimum. No font download.
- Instrument labels, money, hashes, and receipt metadata: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`; tabular numerals.
- Scale: 12 / 14 / 16 / 20 / 28 / clamp(36–64) px. Small 12px text is reserved for supplementary uppercase labels with high contrast, never body copy.
- Spacing follows a 4px base: 4, 8, 12, 16, 24, 32, 48, 64. Controls are at least 44px tall with 8px between adjacent targets.

## Interaction grammar

- The step rail shows location and completeness before content.
- Primary actions are phosphor-filled rectangles with a 2px ink shadow; pressed controls move 2px toward that shadow.
- Receipt line rows behave like ledger strips. Allocation opens inline below the line so the edit emerges from its source.
- Status chips combine color, a pixel glyph, and plain language.
- Focus is a high-contrast 3px phosphor outline with a 3px offset.
- Empty and error states explain the next physical action, not merely the absence of data.

## Motion policy

- 160–220ms transforms and opacity only. New ledger rows enter from their insertion edge; toast messages rise from the bottom edge.
- No ambient loops, flashing, parallax, or decorative animation. The tiny “signal” mark is static.
- Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling become instant; hierarchy remains through borders, position, labels, and contrast.

## Asset plan and provenance

### `receipt-split-hero-768-64af65b0.webp`

- Purpose: a compact, explanatory landing/empty-state illustration showing one physical supplier receipt resolving into three job-cost lanes.
- Prompt sheet / final prompt: “Use case: stylized-concept. Asset type: PWA landing-page hero illustration. A single long cream thermal-paper hardware supplier receipt on a near-black workshop desk breaks into three precise luminous allocation lanes ending in small job folders, seen in clean isometric view. Pixel/demoscene aesthetic, chunky 16-bit pixel clusters, crisp hard edges, limited palette of ink black, receipt cream, phosphor mint, construction amber, and a small amount of cool blue. Practical field-tool mood, subtle bolts and grid marks, no people. Composition leaves calm dark negative space around the object. No readable text, no letters, no numbers, no logos, no watermark, no brands, no gradients, no photorealism, no neon cyberpunk city.”
- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`, generated 2026-08-28. Original for this product; no reference image or third-party asset.
- Review checklist: reject readable pseudo-text, logos, branded hardware, muddy edges, extra receipts, or colors outside the palette.
- Delivery: source PNG and prompt sidecar in `assets/src/`; content-hashed 768px and 480px responsive WebP files in `public/assets/` (25 KB and 12 KB), explicit dimensions in markup.

App icons and UI glyphs are hand-authored SVG/geometric CSS using the same pixel grid. No stock art, third-party icons, CDN fonts, or external runtime assets.

### `north-yard-sample-receipt-d45ecb57.png`

- Purpose: the fictional source receipt shown in the isolated demo and embedded in sample PDF exports.
- Method: hand-authored SVG rendered deterministically to a 720 × 1100 PNG in Chromium on 2026-08-29.
- Content: North Yard Supply, three material lines, and a $501.75 total matching the demo data. It is visibly marked “Sample receipt — not for payment.”
- Provenance: original for this product; no model, stock asset, brand, or third-party source. The editable SVG and metadata sidecar live in `assets/src/`.
