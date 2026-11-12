# Job-board changes in Sheets and email

Follow selected employers on Greenhouse, Lever or Ashby. Save their job postings to Google Sheets, then collect new and changed postings on later runs.

[Workflow JSON](../workflows/jobs-to-sheets.json) · [Sample CSV](../samples/jobs-sample.csv) · [Apify Actor](https://apify.com/cemented_jest/ats-jobs-change-monitor)

## Setup

Follow the [account and spreadsheet setup](setup.md). Use the tab name `JobsHistory` and these [column headers](../samples/jobs-sheet-headers.csv).

In **Settings**, put one company board URL per line in `boardUrls`. For example:

```text
https://job-boards.greenhouse.io/figma
https://jobs.lever.co/palantir
https://jobs.ashbyhq.com/openai
```

Supported hosts are `boards.greenhouse.io`, `job-boards.greenhouse.io`, `jobs.lever.co`, `jobs.eu.lever.co` and `jobs.ashbyhq.com`. Use a direct board URL rather than a Greenhouse embed URL. Custom company domains are not supported. A job-detail link selects its company’s whole board. Existing `provider:slug` inputs also work.

`keyword` filters title, location and department. `maxItems` limits the total jobs compared across boards in input order; an earlier board can fill the limit. Keep the boards, keyword, limit and history store name unchanged when comparing runs.

## What gets saved

The first run saves `baseline` rows. Later runs save `new` and `changed` jobs and omit unchanged ones. “New” means first seen in your selection, not necessarily just published. Missing jobs are not marked closed. Changing the search inputs starts a separate comparison baseline.

## Email alerts

Email is off by default (`sendEmail: false`). To enable it, choose your SMTP credential on **Send optional email**, fill in `emailFrom` and `emailTo`, and set `sendEmail: true`. Test with an address you control.

After a successful sheet write, one email lists up to 50 new or changed jobs and links to the full sheet. The first baseline run and runs with no changes send no email.

## Cost and retries

**100 saved rows cost $0.20** at the current rate. Defaults are `maxItems=100` and a $0.25 run cap. The template rejects a cap below `maxItems × $0.002`. Raising the result limit can increase costs; n8n, email and later account storage/API use are separate.

If Sheets fails, recover the existing dataset before collecting again. If email delivery is uncertain, check the mail provider before retrying. See [recovery steps](setup.md#if-something-fails).
