# Public launch copy

These drafts are written by the Actor developer and make no customer or revenue claims.

## K-beauty sourcing and brand research

I made a small workflow for teams tracking Olive Young Global bestseller prices and ranks. It saves dated snapshots to Google Sheets and includes previous/current prices and rank changes after the first baseline run.

There is a 5-row CSV to inspect before signing up and an importable n8n template. Global storefront only; rankings are not sales volume. The template is free to download; the default 100-row Actor run has $0.20 in result fees at the current rate.

Guide and sample: https://github.com/CRNO22/apify-workflow-examples/blob/main/docs/oliveyoung-to-sheets.md

## Job-board operators and automation builders

I published an n8n workflow for monitoring selected Greenhouse, Lever and Ashby job boards. Paste board URLs, save baseline/new/changed postings to Google Sheets, and optionally email a digest after later changes.

The first run establishes the baseline and sends no email. The sample and template are free to download; Actor runs are usage-priced. New means newly seen in the monitored selection, not a guarantee that a job was just posted.

Guide and sample: https://github.com/CRNO22/apify-workflow-examples/blob/main/docs/jobs-to-sheets.md
