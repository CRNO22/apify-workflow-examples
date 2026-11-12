# Connect a workflow and run it

Both workflows need an Apify account, n8n, and a Google spreadsheet you can edit. They contain no credentials and are inactive when imported.

## Connect your accounts

1. Download the workflow JSON and import it into n8n.
2. Create a spreadsheet tab: `OliveYoungHistory` or `JobsHistory`. Copy the matching [Olive Young](../samples/oliveyoung-sheet-headers.csv) or [jobs](../samples/jobs-sheet-headers.csv) headers into row 1. Split on commas if needed; keep every header, including `recordKey`.
3. In **Settings**, enter the spreadsheet ID from the URL between `/d/` and `/edit`, plus the tab name and history store name.
4. Create an n8n **Header Auth** credential with name `Authorization` and value `Bearer YOUR_APIFY_TOKEN`. Select it on **Start Actor**, **Read existing run**, **Read run summary** and **Read saved dataset**. Keep the token in the credential, not the shared JSON.
5. Select your Google Sheets credential on **Save history in Sheets**. Email setup is covered in the [jobs guide](jobs-to-sheets.md#email-alerts).
6. Run **Manual test** and check the sheet. Then enable the schedule if wanted. The default is daily at **09:00 UTC / 18:00 Korea time**; change the schedule and timezone for your location.

Use a different history store for each independent monitor. Avoid overlapping runs that share a history store.

## If something fails

The workflow starts one Actor run and polls that same run. It writes to Sheets only when the run and its `SUMMARY` both report success. A failed, partial or budget-limited result stops there; inspect it in Apify before trying again.

**If collection succeeded but Sheets failed, recover the existing dataset first.** The Actor may already have saved its comparison baseline. Starting another run can skip job changes that never reached the sheet.

Find the dataset ID in the saved execution’s run data. Recover the data from that dataset and resume the write from **Read saved dataset**. Rows are matched by `recordKey`, so retrying the same run’s output updates those rows. A new Actor run creates a new set of dated rows. Do not use a full workflow rerun to recover a failed sheet write.

The sheet uses RAW values so source text is not interpreted as a formula. Keep the generated record keys unchanged.

If an email may already have been sent, check the mail provider before retrying that node. A retry can send it twice. Enable execution saving and failure alerts in your n8n instance.

The initial request to start an Actor is not automatically retried; read-only requests can retry. After an Apify token rotation, update the Header Auth credential. Reconnect revoked OAuth accounts separately.
