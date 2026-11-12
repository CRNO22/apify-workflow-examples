# Posts for sharing the workflows

## K-beauty sourcing

I’ve published an n8n workflow that saves Olive Young Global’s top 100 products to Google Sheets, including prices, brands and ranks. After the first run, it also shows price and rank changes.

You can check a five-row CSV before running it. The template is free; collecting 100 results costs $0.20 at the current Actor rate. It covers the Global storefront. Bestseller ranks are not sales figures.

I’m the developer of the Actor. Sample and setup: [Olive Young → Sheets](https://github.com/CRNO22/apify-workflow-examples/blob/main/docs/oliveyoung-to-sheets.md).

## Job boards and automation

This n8n workflow follows company job boards on Greenhouse, Lever and Ashby. Paste the board URLs, connect a Google Sheet, and it saves new and changed postings on later runs. Email alerts are optional; the first run just sets the baseline.

The template and sample CSV are free. Actor runs cost $2 per 1,000 saved rows. “New” means first seen by the monitor, so it can include older postings.

I’m the developer of the Actor. Workflow and setup: [Job boards → Sheets and email](https://github.com/CRNO22/apify-workflow-examples/blob/main/docs/jobs-to-sheets.md).
