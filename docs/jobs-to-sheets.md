# Monitor Greenhouse, Lever and Ashby job changes with n8n, Sheets and email

For small job-board teams, recruiting operations and automation builders tracking selected employers. Paste public job-board URLs, save newly seen or changed postings and optionally send one email digest after a successful Sheets write.

[Download workflow JSON](../workflows/jobs-to-sheets.json) · [Preview sample CSV](../samples/jobs-sample.csv) · [Run Actor](https://apify.com/cemented_jest/ats-jobs-change-monitor)

**Default tab: `JobsHistory`.** [Copy these column headers](../samples/jobs-sheet-headers.csv).

## Before running

You need an Apify account, an n8n instance, and a Google account that can edit your target spreadsheet. Import the workflow JSON into n8n. It arrives **inactive**. No schedule is enabled by importing it.

1. Create a blank Google spreadsheet and the tab named below. Copy the matching header CSV into row 1, splitting on commas if necessary. All headers must match exactly.
2. Open **Settings**. Paste only the spreadsheet ID from its URL (the part between `/d/` and `/edit`), set the tab name, history-store name and limits.
3. Create an n8n **Header Auth** credential: name `Authorization`, value `Bearer YOUR_APIFY_TOKEN`. Select the same credential on **Start Actor**, **Read existing run**, **Read run summary**, and **Read saved dataset**. The token goes in the credential, not a URL, Code node or workflow JSON.
4. Select your Google Sheets OAuth credential on **Save history in Sheets**. This is your own Google connection; the downloaded template does not contain one.
5. Save and run **Manual test**. Confirm the run succeeded and the expected rows reached the correct sheet. Only then activate the schedule if wanted. Its default is **09:00 UTC daily** (18:00 Korea time); change the workflow timezone and schedule for your needs.

Google Sheets writes use RAW cell values. Source strings are not interpreted as spreadsheet formulas. Rows are matched by `recordKey`; keep that header and do not edit generated keys.

## Costs and safe retries

Default `maxItems=100` and `maxChargeUsd=0.25`; at the current $0.002 per delivered row, 100 rows have $0.20 in result fees. The configuration check rejects a budget below `maxItems × $0.002`. Increasing limits increases potential cost. n8n hosting and later account storage/API usage have separate pricing.

The POST that starts a run is **not automatically retried**. Read-only requests may retry. A successful Actor run can advance its change baseline before a downstream Sheets or email failure. In that case, recover the **existing run's dataset** using its run ID from execution data; retry/replay from **Read saved dataset** with that dataset ID instead of starting a new Actor run. The same `recordKey` is upserted. Do not rerun the whole workflow as a substitute for recovering unsaved results.

If email was sent but the execution status is uncertain, inspect the email provider before retrying its node: exactly-once email delivery is not guaranteed. Enable n8n execution saving/error alerts in your own instance as appropriate. Avoid overlapping executions sharing one history store.

A failed, timed-out, aborted, partial or budget-limited run stops before writing Sheets. Inspect `SUMMARY` and the existing dataset in Apify. Fix the cause before another run. Source access or schemas can change.

## Choose boards

Put one URL per line in `boardUrls`, for example:

```text
https://job-boards.greenhouse.io/figma
https://jobs.lever.co/your-company-slug
https://jobs.ashbyhq.com/your-company-slug
```

Replace placeholder company slugs with real boards. Supported hosts are `boards.greenhouse.io`, `job-boards.greenhouse.io`, `jobs.lever.co`, `jobs.eu.lever.co` and `jobs.ashbyhq.com`. Existing `provider:slug` inputs also work. The workflow converts these URLs to canonical `provider:slug` values before calling the Actor, so it also works with the earlier Actor input format. Use a direct board URL rather than a Greenhouse embed URL. Custom company domains are not automatically discovered. A job-detail URL on a supported host selects its whole board; use `keyword` and `maxItems` to limit the returned selection.

`keyword` matches title, location and department. The result limit is shared across boards in input order; earlier boards can fill the limit. Keep the board list, keyword, limit and history name stable for comparable runs.

## First run and optional emails

The first run saves `baseline` rows and sends no alert. Later `new` and `changed` rows are saved; unchanged rows are omitted by the Actor. New means first seen in the selected window, not necessarily a new publication. Missing rows are not labelled closed.

Email is **off by default** (`sendEmail: false`). To enable it, select your SMTP credential on **Send optional email**, fill `emailFrom` and your intended `emailTo`, and set `sendEmail: true`. Test with an address you control. One plain-text digest contains up to 50 new/changed rows and a link to the full sheet. Baseline and empty results do not send a message. Sheets must succeed first.

If you change the search inputs, treat the resulting selection as a new baseline. This template does not add unsupported salary extraction, discover all employers or contact job applicants.
