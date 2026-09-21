# MotorScout direct inventory plan

Updated September 21, 2026. Proposed next route; no dealer partnership, feed, import endpoint or shared inventory database is live yet.

## Goal

Receive inventory directly from participating dealers so many user searches can use the same permitted, refreshed inventory without one MarketCheck request per search. This adds those dealers' cars, including vehicles they may also advertise on other marketplaces. It does not grant access to the marketplaces' complete inventory.

## Confirmed entry point

Dealer.com provides a third-party inventory request form for dealer imports/exports, with vAuto, HomeNet, VinSolutions and AutoTrader named on its support page. It requires the dealership's identity and contact plus the third-party contact. This is a dealership-specific export process, not an open nationwide API.

Official source: https://www.dealer.com/support/inventory/

Start with one dealer willing to list on MotorScout. Get written permission to display and retain that dealer's vehicle data and photos, the feed's update/removal terms, export availability and any fees. No paid service or contract is authorized. Do not submit invented dealership information or represent MotorScout as already partnered.

## Draft for a dealer to review — not sent

Subject: Add your used-car inventory to MotorScout

MotorScout helps shoppers find cars by make, model, trim, color, mileage and budget. Would you be interested in a small inventory pilot? We would show your actual asking prices, credit your dealership and link each vehicle to your listing page.

If you agree, could your inventory provider export your available used-car inventory to MotorScout? We need VIN or stable stock ID, vehicle details, full cash asking price, mileage, location, listing URL, permitted photos and availability updates. Please confirm permission for public display and storage, removal requirements, and whether there is any export fee before setup. We are not authorizing charges.

## Build once a permitted sample is available

1. Map the actual feed format. Prefer the dealer's existing supported CSV, XML or JSON export instead of requiring a new format.
2. Ingest through an authenticated dealer-specific connection. Keep credentials server-side. Reject unrecognized dealer IDs and untrusted download destinations.
3. Store dealer/stock ID, VIN, original source URL, full price, year/make/model/trim, colors, mileage, equipment evidence, timestamps and availability. Unknown values stay unknown.
4. Deduplicate the same VIN while retaining each dealer offer and its source. Never confuse savings, financing payments or deposits with the asking price.
5. Apply a completed full snapshot atomically. A failed or partial download must not mark a dealer's entire inventory sold. Require explicit status or a confirmed complete snapshot to remove missing vehicles.
6. Search the database first and apply exact specifications locally. Show honest source counts and freshness; exclude stale/sold inventory under the agreed policy.
7. Refresh on the feed's permitted schedule. Add alerts only after scheduler and delivery are verified. A database reduces upstream search calls but has storage, refresh and operating costs.
8. Test one real dealer end to end before adding more dealerships. Measure freshness, asking-price accuracy, duplicate handling, costs and a fresh user's ability to search without API keys.

## Current reachable inventory versus remaining gaps

- Auto.dev, CarGurus, TrueCar and Denver Facebook previously returned listings.
- September 21 trial `wvZFKQP8bYFcKTlL6`: three Carvana and three Cars.com Toyota Camrys returned; $0.013 of included Apify credit. Carvana's detailed-keyword URL issue is corrected in the follow-up release. A successful trial does not prove broad coverage or public redistribution permission.
- CarMax independent request: HTTP 403. AutoTrader independent request: upstream HTTP 400. Automatic independent attempts are disabled; do not try to evade access controls.
- MarketCheck quota still blocks its retailer and other feeds. AutoNation USA, Driveway and EchoPark have no verified independent path.
- Regional Craigslist and the additional Facebook cities still need successful live verification.
- The public inventory database remains proposed until authorized data is obtained and the integration is built. It cannot manufacture missing rare specifications or guarantee five exact matches.
