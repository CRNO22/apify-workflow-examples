# Test results

Checked on **12 November 2026**.

| Check | Result |
| --- | --- |
| Actor regression tests | 38 passed: URL parsing, history compatibility, duplicate inputs and rejection of unsupported URLs |
| Workflow tests | 12 passed: connections, settings, charge limits, failed-run handling, sheet rows and optional alerts |
| Public provider APIs | Three jobs collected from each of Greenhouse/Figma, Lever/Palantir and Ashby/OpenAI |
| Actor runtime | Build 1.0.5 passed cloud collection checks; 1.0.6 changes the README only |
| Job URL compatibility | URL run collected 3 jobs; a repeat with the old input reused history and saved/charged 0 unchanged jobs |
| Olive Young | 100 products saved, successful summary and 100 matching result events |
| Data sent to Sheets | Projection code processed the actual 100-product and 3-job cloud datasets with unique row keys |

A 3-product Olive Young run correctly reported partial results. The comparison template now requires the full 100-row limit before starting. Sample CSVs are dated 7 November 2026.

The copy edit also passed checks for local links, JSON examples and both five-row preview tables. Workflow changes are limited to the setup note; executable nodes and connections are unchanged.

## Not yet tested

The templates have not been tested end to end in a recipient’s n8n instance with live Google Sheets and SMTP credentials. Import and test them with your accounts before enabling a schedule. Node settings were checked against the official n8n source; Code nodes and request expressions were tested locally.

The Actor can update its comparison baseline before a later sheet or email failure. Recover the saved dataset in that case. Sheet retries use the same row keys; email retries may send duplicates. [Setup and recovery](setup.md).

## References

- [Importing n8n workflows](https://docs.n8n.io/workflows/export-import/)
- [Google Sheets node source](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Google/Sheet/v2/actions/sheet)
- [HTTP Request node source](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/HttpRequest/V3)
- [Email node source](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/EmailSend/v2)
