# Daily match notifications

The app supports signed-in opt-in searches, an in-app inbox, VIN/URL deduplication, exact filters, pause/remove, and optional account-email delivery through Resend. No shopper is subscribed by default. Existing search results seed the seen-car set. Email uses the authenticated account address, never an arbitrary submitted recipient.

## Activation still required

1. Provision a free scheduler (or mirror this repository to GitHub and enable the existing workflow). The current source host is not GitHub and does not run GitHub Actions. Run hourly: `POST https://motorscout-ai.reedjvanness.chatgpt.site/api/jobs/alerts`, with `Authorization: Bearer <SCHEDULER_SECRET>`. Configure the same strong random secret in Sites. Do not commit it or put it in a URL. A successful authenticated heartbeat unlocks the daily-active label for 26 hours.
2. For email, finish purchasing/connecting the domain, verify a sending subdomain in Resend, and configure `RESEND_API_KEY`, `ALERT_FROM_EMAIL`, and `ALERT_SITE_URL` in Sites. Use the free plan only. Verify sender setup with a consenting test recipient before enabling production delivery. Do not enable a paid plan or overage billing.
3. Sign in as a test user and save an exact search. Use Check now for a first controlled check. Verify a new matching fixture produces one inbox item, a repeat produces none, another user cannot read it, pause prevents scheduled checks, and unsubscribe stops email.
4. Trigger the scheduled endpoint and inspect its count and heartbeat. A workflow file by itself is not an active schedule. Never claim daily delivery is live until this succeeds and the scheduler is actually enabled.

## Bounds and coverage

One inventory batch (up to 50 matches) per search per 24 hours. The job handles three due searches per invocation, oldest due first. Search errors retry after an hour. Maximum 10 inventory checks per UTC day across the site, sharing existing free inventory credentials/quotas; excess requests stay queued. This capacity may delay checks with more than 10 active searches. No Apify jobs or AI calls run in the background. Daily coverage is the connected MarketCheck/Auto.dev feeds, not all interactive marketplace scrapers or every page of inventory.

Email is capped at 90 attempts/day, with at most three attempts per notification and a stable Resend idempotency key. Retries expire after 23 hours to avoid sending a duplicate beyond Resend's 24-hour idempotency window. In-app notices remain if email fails. The job never emails paused/unsubscribed searches. Email includes an unsubscribe endpoint; GET only shows confirmation, POST performs the unsubscribe.

Readiness is shown honestly: without a scheduler heartbeat the UI says activation pending; without email configuration it disables email opt-in. Check now remains available without a scheduler. No paid service was activated for this implementation.
