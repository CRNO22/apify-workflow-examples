# Validation notes — 12 November 2026

- 38 Actor regression tests passed, including URL normalization, preservation of existing history scopes, duplicate board inputs, fixed API targets and rejection of untrusted URL hosts/credentials/ports/encoded traversal.
- 12 workflow tests passed: graph references, inactive schedules, no embedded credentials, bounded run spending, no POST retries, failed/partial/budget-limited output rejection, stable Sheets retry keys, preservation of zero/false values, optional email and baseline suppression.
- Workflow Code nodes were executed against controlled fixtures. JSON request expressions were parsed and evaluated against representative settings.
- Google Sheets appendOrUpdate, RAW values and resource-mapper settings were checked against n8n's official node source. HTTP Request and SMTP settings were likewise checked against official node definitions.
- Live read-only checks returned three jobs each from Greenhouse (Figma), Lever (Palantir) and Ashby (OpenAI) on 12 November 2026.
- Both Actors were deployed as build 1.0.5 on 12 November 2026. Direct job-board URL input passed a cloud run; repeating with the legacy input reused its history and delivered/charged zero unchanged records.
- Olive Young collected 100 rows with a successful summary and 100 matching product events. A 3-row limit correctly yielded partial output; the comparison template now requires maxItems=100 before starting a run.
- The workflow projection code processed the real cloud datasets (100 products and 3 jobs) and produced unique, complete Sheets rows.
- Samples come from successful historical Actor runs on 7 November 2026; the dates are labelled explicitly.

## Setup still belongs to each workflow user

These are templates, not a connected hosted automation service. The recipient must import them into their n8n instance and select their own Apify Header Auth, Google Sheets and optional SMTP credentials. A live write to the recipient's Google Sheet and SMTP delivery cannot be verified before that setup. Publishing a template does not activate a schedule.

## Remaining operational limits

The Actor can save its comparison baseline before a downstream integration fails. Recover the same run's saved dataset before starting another run. Sheets upserts are idempotent for that run's recordKey; SMTP email delivery is not exactly-once. Avoid overlapping workflows using the same history store. Review source and result-window limits in each guide.

## References

- https://n8n.io/integrations/apify/
- https://docs.n8n.io/workflows/export-import/
- https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Google/Sheet/v2/actions/sheet
- https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/HttpRequest/V3
- https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/EmailSend/v2
