# Copy audit — 2026-08-29

## Landing prose

| Copy | Words | Result |
| --- | ---: | --- |
| Split one supplier receipt by job | 6 | Plain job headline |
| For contractors who buy materials for several jobs and need billable cost records. | 13 | Names audience and situation |
| See a completed split and exports. | 6 | Explains the sample action |
| Receipt data stays in this browser. | 6 | `receipt-data-local` |
| Works offline after the first visit. | 7 | `offline-reload` |
| Five receipts are free; $19 removes the limit. | 8 | `free-receipt-limit`, `license-removes-limit` |
| Add a supplier receipt to split its lines between jobs. | 10 | Clear empty-state instruction |
| Keep the supplier photo with every split. | 7 | `source-retention` |
| Enter each item, then divide its amount between jobs. | 9 | `job-allocation` |
| Download a CSV or PDF for each job. | 8 | `csv-export`, `pdf-export` |
| Enter receipt lines yourself. | 4 | Manual-entry instruction |
| It does not read receipt text automatically. | 7 | `manual-receipt-entry` |
| Review each amount before using an export for bookkeeping or tax work. | 12 | Scope and safety instruction |
| Purchase and license checks contact Sociobot only when you choose them. | 11 | `receipt-data-local` |
| Five receipts are free. | 4 | `free-receipt-limit` |
| A $19 one-time license removes only the receipt limit. | 9 | `license-removes-limit` |

All visible landing sentences are 22 words or fewer. None contains a banned marketing word. The first screen names the task, contractor audience, next action, sample outcome, privacy, offline behavior, and price boundary.

## README prose

The README was rechecked against the same rules. Its feature and privacy promises map to the entries in `.factory/claims.json`; developer-only setup and deployment text is labelled by its headings.

## Terminology

| Concept | One term used |
| --- | --- |
| Purchased document | receipt |
| Work destination | job |
| Divide an item amount | split |
| Downloaded output | CSV or PDF |
| Proof value for image | tamper-check value |
| Trial records | sample data |
