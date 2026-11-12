# Olive Young prices and ranks in Google Sheets

Keep a daily record of Olive Young Global’s top 100 products. Each run adds the current prices and ranks, with changes from the previous complete run.

[Workflow JSON](../workflows/oliveyoung-to-sheets.json) · [Sample CSV](../samples/oliveyoung-sample.csv) · [Apify Actor](https://apify.com/cemented_jest/oliveyoung-global-bestsellers)

## Setup

Follow the [account and spreadsheet setup](setup.md). Use the tab name `OliveYoungHistory` and these [column headers](../samples/oliveyoung-sheet-headers.csv).

Keep `maxItems=100`. A smaller limit leaves the ranking incomplete, so the template rejects it before starting a paid run. Set a history store name and keep it unchanged for later comparisons. The template collects the overall ranking (`categoryIds: ["all"]`).

The first run saves a baseline. Later runs compare against the previous complete snapshot. Change columns are blank when there is no usable comparison. Run a manual test before enabling the daily schedule.

## Reading the sheet

| Column | Meaning |
| --- | --- |
| `price`, `previousPrice` | Current and previous USD listing prices |
| `priceChange` | Current minus previous price; negative means cheaper |
| `rankChange` | Previous minus current rank; positive means a rise |
| `comparisonStatus` | `noBaseline` on the first run, `compared` when a previous snapshot is usable |
| `isNewEntry` | First appearance in this ranking, not necessarily a new product |
| `isSoldOut` | The source site’s sold-out flag |

Prices exclude shipping, tax and personal discounts. Stock flags are not independently verified. Rankings do not tell you units sold. A smaller or incomplete source ranking can prevent comparisons.

## Cost

At the current rate, **100 saved rows cost $0.20**. The template’s run cap is $0.25. n8n hosting and later account storage/API use are separate.

If a sheet write fails, recover that run’s saved dataset before starting another collection. See [recovery steps](setup.md#if-something-fails).
