# Pick an Apify example

These presets run directly in Apify. No n8n or Google Sheets setup is needed. Open an example, use its preset inputs and start a run. Export its output as CSV, Excel or JSON.

| Example | Last check | Result fee at preset limit | Sample |
| --- | --- | --- | --- |
| [Olive Young Global skincare ranks](https://apify.com/cemented_jest/oliveyoung-global-bestsellers/examples/export-olive-young-global-skincare-bestsellers) | 100 rows | $0.20 / 100 products | [5 rows](../samples/skincare-example.csv) |
| [Olive Young Global suncare prices](https://apify.com/cemented_jest/oliveyoung-global-bestsellers/examples/export-olive-young-global-suncare-prices) | 100 rows | $0.20 / 100 products | [5 rows](../samples/suncare-example.csv) |
| [Figma design-related jobs](https://apify.com/cemented_jest/ats-jobs-change-monitor/examples/export-figma-design-job-postings) | 17 rows | $0.04 / 20 jobs | [5 rows](../samples/figma-design-example.csv) |
| [OpenAI jobs to CSV](https://apify.com/cemented_jest/ats-jobs-change-monitor/examples/export-openai-job-postings-to-csv) | 20 rows | $0.04 / 20 jobs | [5 rows](../samples/openai-jobs-example.csv) |

All four presets ran successfully on **12 November 2026 UTC**. The linked CSVs contain five actual rows from those runs; they are dated samples, not live data. The presets have no schedule and do not track changes.

Olive Young examples cover Global bestseller categories and USD listing prices. Figma matches “design” in title, location or department, so related roles can appear. OpenAI is capped at 20 postings, not the whole board.

Result fees are $0.002 per saved row. The presets cap each run at $0.25 for products and $0.05 for jobs. Check current Actor pricing before running.

For repeated collection into Sheets, use the [workflow guides](../README.md).
