# Demo sandbox

Open [the demo](https://billable-receipt-split.sociobot.in/demo) or add `?demo=1` to enter it directly. It seeds one North Yard Supply materials receipt with plywood, fasteners, and safety supplies split across Oak Street kitchen, Pine Avenue repair, and workshop stock.

Demo receipts use the separate IndexedDB database `demo:billable-split`. Real receipts use `billable-split`; the demo does not read or write that database. The persistent demo banner includes **Reset demo**, which clears and reseeds only `demo:billable-split`, and **Start for real**, which discards only demo data and returns to the real archive.

The service worker caches the shell and demo route on first visit. Claim tests always start in a fresh browser context at `/demo`.
