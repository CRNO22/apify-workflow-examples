# Olive Young and job-board workflows for n8n

Save Olive Young Global prices and ranks to Google Sheets, or follow job postings from selected Greenhouse, Lever and Ashby boards.

| Workflow | Files |
| --- | --- |
| Olive Young prices and ranks → Sheets | [Guide](docs/oliveyoung-to-sheets.md) · [Workflow JSON](workflows/oliveyoung-to-sheets.json) · [Sample CSV](samples/oliveyoung-sample.csv) |
| Job changes → Sheets and optional email | [Guide](docs/jobs-to-sheets.md) · [Workflow JSON](workflows/jobs-to-sheets.json) · [Sample CSV](samples/jobs-sample.csv) |

The templates are free to download. You’ll need your own Apify, n8n and Google Sheets accounts. Import a workflow, connect your credentials and run a manual test before enabling its daily schedule. [Setup and troubleshooting](docs/setup.md).

For a one-off export, choose a [ready-to-run Apify example](docs/examples.md): skincare ranks, suncare prices, Figma design roles or OpenAI jobs.

## Cost

Both Actors charge **$2 per 1,000 saved rows**: 100 results cost **$0.20**. The templates start with a $0.25 run cap. n8n hosting, email and later Apify account storage/API use may cost extra. Rates checked on 12 November 2026; the Actor pricing tabs show the current prices.

- [Olive Young Global Actor](https://apify.com/cemented_jest/oliveyoung-global-bestsellers)
- [Greenhouse, Lever & Ashby Actor](https://apify.com/cemented_jest/ats-jobs-change-monitor)

## What the samples show

The CSVs contain five rows collected on **7 November 2026 UTC**. They show the output format, not current prices or available jobs.

Olive Young data covers Global bestseller listings, not sales volume or the full catalog. Job data covers only the companies and result limit you select. A newly seen posting may be older; a missing one is not automatically a closed job.

## Testing and support

Actor collection and the workflow’s data-handling code have been tested. Live writes to your Google Sheet and SMTP delivery still need to be tested after you connect your accounts. See [test results](docs/validation.md).

Open a repository issue for template problems, or an Actor issue for collection problems. Include the run ID and relevant input, but no credentials.

Maintained by CRNO, the developer of the linked Actors. This project is independent of Olive Young and the job-board providers. Templates and docs use the MIT license; source data keeps its original rights.
