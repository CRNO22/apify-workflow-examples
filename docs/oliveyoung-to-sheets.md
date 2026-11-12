# Track Olive Young Global bestseller prices and ranks in Google Sheets

For K-beauty sourcing teams, brand operators and researchers who want a dated record of Global bestseller prices and ranks. The Actor provides the source data; this template saves it into your spreadsheet.

[Download workflow JSON](../workflows/oliveyoung-to-sheets.json) · [Preview sample CSV](../samples/oliveyoung-sample.csv) · [Run Actor](https://apify.com/cemented_jest/oliveyoung-global-bestsellers)

**Default tab: `OliveYoungHistory`.** [Copy these column headers](../samples/oliveyoung-sheet-headers.csv).

## Before running

You need an Apify account, an n8n instance, and a Google account that can edit your target spreadsheet. Import the workflow JSON into n8n. It arrives **inactive**. No schedule is enabled by importing it.

1. Create a blank Google spreadsheet and the tab named below. Copy the matching header CSV into row 1, splitting on commas if necessary. All headers must match exactly.
2. Open **Settings**. Paste only the spreadsheet ID from its URL (the part between `/d/` and `/edit`), set the tab name, history-store name and limits.
3. Create an n8n **Header Auth** credential: name `Authorization`, value `Bearer YOUR_APIFY_TOKEN`. Select the same credential on **Start Actor**, **Read existing run**, **Read run summary**, and **Read saved dataset**. The token goes in the credential, not a URL, Code node or workflow JSON.
4. Select your Google Sheets OAuth credential on **Save history in Sheets**. This is your own Google connection; the downloaded template does not contain one.
5. Save and run **Manual test**. Confirm the run succeeded and the expected rows reached the correct sheet. Only then activate the schedule if wanted. Its default is **09:00 UTC daily** (18:00 Korea time); change the workflow timezone and schedule for your needs.

Google Sheets writes use RAW cell values. Source strings are not interpreted as spreadsheet formulas. Rows are matched by `recordKey`; keep that header and do not edit generated keys.

## Costs and safe retries

Default `maxItems=100` and `maxChargeUsd=0.25`; at the current $0.002 per delivered row, 100 rows have $0.20 in result fees. The configuration check rejects a budget below `maxItems × $0.002`. Keep `maxItems=100`: stopping at a smaller number marks the ranking as partial and prevents a comparison baseline. The template rejects smaller limits before starting a billed run. n8n hosting and later account storage/API usage have separate pricing.

The POST that starts a run is **not automatically retried**. Read-only requests may retry. A successful Actor run can advance its change baseline before a downstream Sheets or email failure. In that case, recover the **existing run's dataset** using its run ID from execution data; retry/replay from **Read saved dataset** with that dataset ID instead of starting a new Actor run. The same `recordKey` is upserted. Do not rerun the whole workflow as a substitute for recovering unsaved results.

Enable n8n execution saving/error alerts in your own instance as appropriate. Avoid overlapping executions sharing one history store.

A failed, timed-out, aborted, partial or budget-limited run stops before writing Sheets. Inspect `SUMMARY` and the existing dataset in Apify. Fix the cause before another run. Source access or schemas can change.

## Read the comparison columns

- `price` and `previousPrice`: Global USD listing prices, excluding personalized discounts, shipping and tax.
- `priceChange`: current minus previous. Negative means the listing price fell.
- `rankChange`: previous rank minus current. Positive means the product moved up.
- `comparisonStatus`: first run is `noBaseline`; later comparable runs are `compared`. Smaller/incomplete rankings may suppress comparisons.
- `isNewEntry`: newly seen in the compared ranking selection, not a newly launched product.
- `isSoldOut`: source indicator, not independently verified stock or sales.

The template collects overall bestsellers (`categoryIds: ["all"]`) and saves dated rows on each run. Change fields can be blank on the first run. Keep `historyStoreName` unchanged to compare later complete snapshots. It does not infer units sold or collect review text.

## A practical weekly review

Filter to the latest `observedAt`, then inspect negative `priceChange` and positive `rankChange`. Open the source `productUrl` before relying on a price. Use the dated history to investigate changes, rather than treating a bestseller rank as sales volume.
