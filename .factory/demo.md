# Demo sandbox

Open [the demo](https://billable-receipt-split.sociobot.in/demo) or add `?demo=1` to enter it directly. It seeds one North Yard Supply materials receipt with plywood, fasteners, and safety supplies split across Oak Street kitchen, Pine Avenue repair, and workshop stock. The bundled 720 × 1100 source image is a fictional sample receipt whose lines and $501.75 total match the editable record.

Demo receipts use the separate IndexedDB database `demo:billable-split`. Real receipts use `billable-split`; the demo does not read or write that database. Demo mode does not read, write, verify, or retain a real license token or verdict. Its settings view uses a canned sample license state only.

The persistent demo banner includes **Reset demo**, which clears and reseeds only `demo:billable-split`, and **Start for real**, which clears only the demo database and returns to the untouched real archive.

The service worker caches the shell and demo route on first visit. Claim tests always start in a fresh browser context at `/demo`.
