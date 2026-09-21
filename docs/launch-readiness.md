# MotorScout launch checks

Status: not yet verified for a public launch. Updated September 21, 2026.

## Verified external constraint

Auto.dev terms checked September 21, 2026: https://www.auto.dev/terms (updated September 16, 2026). Section 4.4 says the free allowance is not for production systems serving end users. Sections 4.2–4.3 restrict redistribution and describe internal-business use. Do not treat the public pricing page alone as permission for MotorScout's consumer-facing display. Obtain an applicable license or written clarification before enabling shared public use. Existing personal development access is not proof of launch permission.

Production environment revision 1 was inspected September 21: only CONNECTION_ENCRYPTION_KEY is configured. No shared inventory key, scheduler secret, or email service configuration is present. Secret values were not exposed.

## Required before inviting general users

- Verify a fresh account can search without supplying provider API keys. Current connection lookup uses per-user encrypted credentials or deployment environment keys; owner credentials do not automatically serve other users.
- Confirm the chosen inventory provider permits the intended public listing display and establish a sustainable allowance. MarketCheck currently returns quota errors in the owner's searches.
- Establish explicit service spending limits before enabling shared paid services. No paid plan is authorized.
- Exercise sign-in, search, follow-up filtering, source failures, save/remove, compare/remove, and mobile layouts with a new account.
- Verify accurate full asking prices and exclude payment/discount amounts from budget matches and deal ratings.
- Activate and verify scheduler and email delivery before promising automatic daily notifications. Current UI correctly identifies pending activation.
- KBB access remains pending. Independent MotorScout comparisons must remain labeled as not KBB.

## Current improvements

- Follow-up chat is accepted once results are loaded, between inventory batches.
- Matching collected cars survive follow-up filters.
- Marketplace credit is reconciled with actual usage instead of permanently charging every reservation.
- Source labels distinguish connected-but-unchecked marketplaces, regional coverage, actual results, missing connections, and provider limits.
- Identical inventory queries reuse recent server results for up to five minutes (30 seconds when a provider reported an error). Credential and full-filter isolation, expiry and cleanup are covered by a SQLite integration test. Live quota savings still need measurement.

Passing local tests does not establish all of the launch checks above. Record live evidence for each before declaring launch ready.
