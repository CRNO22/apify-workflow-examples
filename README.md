# Apify workflows for K-beauty research and job-board monitoring

Two importable n8n workflows from CRNO, the developer of the linked Apify Actors. Preview dated output samples before creating or running anything. The workflow files contain no API keys, account credentials or recipient addresses.

| Your task | What you get | Start here |
| --- | --- | --- |
| Track Olive Young Global bestseller prices and ranks | Dated Google Sheets history with previous/current prices and ranks | [Setup guide](docs/oliveyoung-to-sheets.md) · [Workflow JSON](workflows/oliveyoung-to-sheets.json) · [5-row CSV](samples/oliveyoung-sample.csv) |
| Monitor selected Greenhouse, Lever and Ashby boards | New/changed postings in Sheets, plus an optional email digest | [Setup guide](docs/jobs-to-sheets.md) · [Workflow JSON](workflows/jobs-to-sheets.json) · [5-row CSV](samples/jobs-sample.csv) |

## What it costs

The workflow templates and dated samples are free to download. Running the linked Actors is priced at **$2 per 1,000 delivered rows** as of 12 November 2026. The default template selects at most 100 rows and sets a **$0.25 maximum Actor charge**. At the stated rate, 100 delivered rows have $0.20 in result fees. Account-level storage/API usage, n8n hosting and email services can have separate costs. Check each Actor's pricing tab before running.

- [Olive Young Global Actor](https://apify.com/cemented_jest/oliveyoung-global-bestsellers)
- [Greenhouse, Lever & Ashby Actor](https://apify.com/cemented_jest/ats-jobs-change-monitor)

## How these workflows behave

1. You configure your spreadsheet and credentials, then run a manual test.
2. The workflow starts one bounded Actor run and polls that same run until it finishes.
3. Only successful runs with a complete `SUMMARY` proceed to Sheets.
4. Rows use a stable `recordKey` for **the same run**, so retrying the Sheets write updates those rows instead of inserting a second copy. New runs intentionally add dated history.
5. The first comparison run is a baseline. The job template sends no baseline email. Later `new` and `changed` rows can trigger one digest, after Sheets succeeds.
6. Schedules are inactive until you enable the workflow. The included schedule is daily at 09:00 UTC. Avoid overlapping runs using the same history store.

## Data scope

Olive Young covers **Global bestseller rankings**, up to 100 rows per selected category. It does not provide Korean-store sales, units sold, full catalogs or review text. Job collection covers the boards you select and a bounded result window; newly seen is not necessarily newly published, and disappearance does not prove a job closed.

The sample files were collected on **7 November 2026 UTC** and illustrate field layout. They are not current prices or live job availability. This project is independent of Olive Young, Greenhouse, Lever and Ashby.

## Credentials and incident recovery

Create a credential in n8n of type **Header Auth** with header name `Authorization` and value `Bearer YOUR_APIFY_TOKEN`. Select that credential on all four HTTP Request nodes. Never paste the token into the shared workflow JSON. Connect your own Google Sheets credential; SMTP is needed only if you enable optional job emails.

After an Apify token rotation, update that n8n credential once. Reconnect any revoked OAuth integration in its own account settings. These templates contain placeholders only and do not distribute the maintainer's tokens.

## Validation and support

See [validation notes](docs/validation.md) for what has and has not been tested. Report template problems in this repository's Issues. Report Actor data problems in the Actor's Issues with a run link and non-sensitive input; do not include tokens.

Templates and documentation are released under the MIT license. Source-site records remain attributed to their sources; the code license does not grant rights over third-party data.
