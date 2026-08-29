# Copy audit — 2026-08-29

Whitespace-delimited counts include every visible landing sentence. Repeated footer disclosures are listed because they are visible copy.

## Landing prose

| # | Copy | Words | Result |
| ---: | --- | ---: | --- |
| 1 | For contractors who buy materials for several jobs and need billable cost records. | 13 | Clear audience and situation |
| 2 | See a completed split and exports. | 6 | Clear sample outcome |
| 3 | Receipt data stays in this browser. | 6 | `receipt-data-local` |
| 4 | Works offline after the first visit. | 6 | `offline-reload` |
| 5 | Five receipts are free; $19 removes the limit. | 8 | `free-receipt-limit`, `license-removes-limit` |
| 6 | Add a supplier receipt to split its lines between jobs. | 10 | Clear empty-state instruction |
| 7 | Keep the supplier photo with every split. | 7 | `source-retention` |
| 8 | Enter each item, then divide its amount between jobs. | 9 | `job-allocation` |
| 9 | Download a CSV or PDF for each job. | 8 | `csv-export`, `pdf-export` |
| 10 | Enter receipt lines yourself. | 4 | Clear manual-entry instruction |
| 11 | It does not read receipt text automatically. | 7 | `manual-receipt-entry` |
| 12 | Review each amount before using an export for bookkeeping or tax work. | 12 | Safety instruction, not a capability claim |
| 13 | Receipt data stays in this browser. | 6 | Scope section; `receipt-data-local` |
| 14 | Purchase and license checks contact Sociobot only when you choose them. | 11 | Scope section; `receipt-data-local`, `demo-isolation` |
| 15 | Five receipts are free. | 4 | `free-receipt-limit` |
| 16 | A $19 one-time license removes only the receipt limit. | 9 | `license-removes-limit` |
| 17 | Receipt data stays in this browser. | 6 | Footer; `receipt-data-local` |
| 18 | Purchase and license checks contact Sociobot only when you choose them. | 11 | Footer; `receipt-data-local`, `demo-isolation` |

No sentence exceeds 22 words or contains a banned marketing word.

## Landing headings and actions

| Copy | Words | Result |
| --- | ---: | --- |
| Split one supplier receipt by job | 6 | Verb-first job headline |
| Receipt costs for several jobs | 5 | Plain context label |
| Try it with sample data | 5 | One-click sample action |
| How it works | 3 | Names the section |
| What Billable Split does not do | 6 | Names the scope section |
| Free and paid use | 4 | Names the price section |
| Add a receipt | 3 | Result-naming action |
| Read the privacy details | 4 | Result-naming link |
| View data and license options | 5 | Result-naming link |

## README and catalog

The README sentences remain at or below 22 words. Every functional promise maps to `.factory/claims.json`; developer-only setup and deployment terms appear under technical headings.

Catalog description: “Split supplier receipts across jobs and export billable records offline.” (10 words, 72 characters, verb-first).

## Terminology

| Concept | One term used |
| --- | --- |
| Purchased document | receipt |
| Work destination | job |
| Divide an item amount | split |
| Downloaded output | CSV or PDF |
| Proof value for image | tamper-check value |
| Trial records | sample data |

User-facing workspace copy now uses “job split,” “job cost record,” and “tamper-check value.” Technical identifiers retain `allocation` and SHA-256 where implementation precision is needed.
