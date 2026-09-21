# MotorScout connections

Provider credentials are stored per signed-in user or supplied through server settings. The owner’s Sources screen was verified on September 17, 2026: MarketCheck, Auto.dev, and OpenAI personal connections are configured. This does not grant inventory access to other visitors. No sample cars are inserted in production.

## AI
An existing OpenAI API key can be verified and connected from Sources. It uses the same per-user encrypted credential storage as inventory. Server-only OPENAI_API_KEY and optional OPENAI_MODEL (default gpt-4.1-mini) remain supported. Verification makes one small inference request and rejects authentication, quota, and model-access failures. Uses the Chat Completions function-calling API to interpret filters. The server validates filters, requires confirmation of relaxed constraints, executes search adapters itself, and renders provider-derived listings. Without the key, explicitly labeled basic parsing works for the supplied BMW example and common follow-ups.

## Inventory
A personal MarketCheck key can now be entered in Sources. It is verified against the inventory endpoint, encrypted using AES-GCM with a server-held CONNECTION_ENCRYPTION_KEY and user-bound associated data, and stored in D1. The key is never returned. Alternatively use server-only MARKETCHECK_API_KEY. Calls documented active dealer and FSBO inventory endpoints on api.marketcheck.com, each capped at 50 results. Subscription entitlements vary. Direct Facebook, Craigslist, and newspaper adapters are not connected. Returned listing source domains identify the original publishers; broad internet coverage is never claimed.

MarketCheck adapter needs credentialed integration testing before calling it verified. Missing title and history fields remain unknown. Price is treated as provider-reported asking price, with seller confirmation required, and payment-only headings are excluded. Unknown fees remain unknown and are not represented as an all-in price. Hard clean-title filters exclude vehicles whose titles are unknown.

Comparables require at least five unique vehicles with same make/model/trim/state/seller/condition/title/history, year within one, mileage within 10,000. Current adapter leaves history unknown, so it conservatively produces no deal score or savings claim. Broader unbiased comparable retrieval and a history provider are needed before market-relative valuation can be enabled reliably. Results without adequate evidence sort by known subtotal, not an unsupported value score.

## Alerts
Saved searches are durable and default off. The authenticated alert runner is POST /api/jobs/alerts. It claims at most ten due enabled searches and schedules the next check 24 hours later. Results are delivered in the Alerts view. An hourly GitHub Actions workflow is included but inactive until the source is hosted in GitHub with MOTORSCOUT_URL and SCHEDULER_SECRET secrets configured. The corresponding Site runtime SCHEDULER_SECRET must match.

A private Sites deployment may block unauthenticated external scheduler calls before the application sees them. Keep alerts disabled unless an approved scheduler can reach this endpoint under the existing access policy; do not make the Site public to bypass this. The UI requires a successful runner heartbeat within 26 hours before enabling alerts. No scheduler is currently provisioned, and no searches run automatically.

## Limits and data
D1 stores workspaces, saved listings, searches, and atomic per-user daily usage (30). UI serializes actions; concurrent browser sessions are last-write-wins. Preserve production migrations. All user operations require the platform-provided signed-in user ID, and saved-search ownership is enforced server-side. OpenAI context is bounded to six messages, each request to 2,000 characters, and response output to 800 tokens.

## Documentation
https://docs.marketcheck.com/docs/get-started/api/introduction
https://www.marketcheck.com/apis/cars/
https://platform.openai.com/docs/api-reference/chat/create

Both AI and manual search use the same backend and active filters. Saved-search actions now explicitly capture the visible draft filters. No external provider accounts, subscriptions, or keys are provisioned automatically.

## Additional inventory and source directory
Auto.dev v2 uses GET https://api.auto.dev/listings with server-side Bearer authentication. A per-user AUTODEV key is encrypted in the existing connections table; AUTODEV_API_KEY is an optional server default. Verification requests one used-car record. Searches request 20 used dealer records sorted by price and push make/model/trim/state/year/price/mileage filters to the provider. All hard filters are reapplied locally; private-only searches skip this dealer-only feed. Missing title/history/fees remain unknown. Results lacking a cash price, used flag, or original VDP URL are excluded. Records are deduplicated with MarketCheck results by VIN or canonical URL before ranking. This adapter still needs credentialed integration testing; no user key or account was created.

Auto.dev reference: https://docs.auto.dev/v2/reference/searchVehicleListings
Free-plan information: https://docs.auto.dev/v2/getting-started

The source directory lists every named website requested by the user, plus direct dealer categories. It is explicitly a directory, not a claim of API connectivity. Only original result URLs establish whether a domain is represented in the latest search. External links do not carry filters. Shift's supplied domain now hosts a browser product, and Vroom's site says used-car retail stopped; both are inactive in the directory. Auction sources are unconnected; bids are not treated as purchase prices. No bulk scraper, login bypass, or fabricated availability is included.

## September 17 search improvements

- Search now advances independent MarketCheck offsets and Auto.dev pages/cursors. Exhausted feeds are skipped; failed pages retain their position for retry. Requests to all configured feeds run concurrently. Every eligible result in a fetched batch is retained and displayed in local increments before fetching the next batch. Source totals are provider matches before local filtering, not unique cross-provider counts. Batch sorting is not global market ranking. MarketCheck's 10,000-record offset ceiling and plan limits remain explicit.
- Query builders apply year, drivetrain, clean-title, location, mileage, and budget filters supported by each API, and still recheck requirements locally. MarketCheck requests use lowest-price-first sorting and suppress appended API credentials. Redirects cannot forward provider credentials to another destination.
- Duplicate VINs preserve alternate original links and prefer usable offers. URL-based deduplication retains identifying query parameters. Disclosed additional fees count against budget; included fees are not double-counted. Clean title requires an explicit provider disclosure.
- Amounts below $1,000, or below $3,000 for cars from the last seven model years, receive a review flag. This is a heuristic, not a valuation or assertion that the seller is fraudulent. Such amounts cannot satisfy a maximum budget and do not receive deal scores. Unrestricted searches retain them with an unconfirmed-price label. Existing stored records receive the same review when loaded.
- Tests use synthetic provider fixtures for multiple pages, complete result retention, partial outages, retries, duplicate offers, pricing, and cursor credential boundaries. Production provider testing still needs a new search after publication.

Still required for the original goal: verify each major marketplace's actual coverage and data rights, connect missing feeds, establish reliable comparable/history evidence, enable visitor-accessible inventory, configure alert scheduling, and verify public access before a public launch. A source directory is not a substitute for these connections.
