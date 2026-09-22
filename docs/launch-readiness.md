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
- KBB access was declined according to Reed. Its valuation UI and references have been removed; MotorScout comparisons remain independent.

## Current improvements

- Follow-up chat is accepted once results are loaded, between inventory batches.
- Matching collected cars survive follow-up filters.
- Marketplace credit is reconciled with actual usage instead of permanently charging every reservation.
- Source labels distinguish connected-but-unchecked marketplaces, regional coverage, actual results, missing connections, and provider limits.
- Identical inventory queries reuse recent server results for up to five minutes (five minutes for HTTP 429 quota errors; 30 seconds for other errors). Credential and full-filter isolation, expiry and cleanup are covered by a SQLite integration test. Live quota savings still need measurement.

Passing local tests does not establish all of the launch checks above. Record live evidence for each before declaring launch ready.

## September 21 follow-up evidence

- GitHub copy: https://github.com/reedjvanness-star/motorscout. Source files are mirrored through explicit updates; automatic deployment or ongoing automatic synchronization has not been configured. The local `github` remote points there while Sites remains `origin`.
- Live asking-price correction: VIN 5TFAZ5CN6HX041878 was incorrectly displayed at $1,998, the dealer's optional accessory charge. The seller page showed $26,999 plus a $225 document fee ($27,224). The correction was published, and a refreshed live $10,000 Tacoma search no longer showed it among the cheapest results. This is evidence for that listing, not proof that all upstream prices are accurate.
- Price descriptions are checked for the exact reported amount labeled as savings, deposits, monthly payments, fees or accessories. Missing or ambiguous source evidence remains a limitation. Marketplace imports and cached/collected search results must run price review before match filtering and counts.
- J.D. Power offers partner integration; an inquiry was sent September 21, but access is not approved. No access or free production pilot is established. Official contact: https://www.jdpowervalues.com/customer-service-representative.
- Edmunds' published FAQ says its open API is retired and new applicants are not accepted: https://developer.edmunds.com/faq.html. Old API documentation is not evidence of available access.
- Public-user inventory credentials, provider permission/allowance, notification scheduler/email activation, and fresh-account end-to-end verification remain incomplete. No paid services were authorized or purchased.

## Independent inventory checks — September 21

- Carvana: broad Toyota Camry trial returned three listings with VIN, asking price, mileage, trim and color. The provider's free-text keyword path caused a 404 for a detailed BMW request. Carvana discovery now uses make/model and structured limits; MotorScout retains strict local specification checks. Coverage is partial, capped at 40 records per search.
- Cars.com: the same broad trial returned three records. Previous exact M340i/color search returned none. This confirms retrieval for one query, not complete model/region coverage.
- CarMax: independent provider request returned HTTP 403; AutoTrader returned upstream HTTP 400. Disabled automatic independent attempts and associated connection claims; existing MarketCheck paths remain quota-blocked.
- These retrieval checks do not establish public redistribution rights. Auto.dev production-use inquiry remains unanswered in the checked thread.
- Direct dealer-authorized exports are the durable alternative. See `docs/dealer-inventory-plan.md`; no dealer feed has been received or connected.

- Version 51 live import confirmed 40 Carvana listings. The four-center Facebook request returned usable listings too, without proving results from every center.
- Regional automotive startup regression identified: the live actor accepts Craigslist region slugs, while its public schema page gives hostname examples. Full domains rejected the entire Cars.com/CarGurus/TrueCar/Craigslist request. Changed requests to slugs and added a regression test; no source is considered verified merely because input validation passes.

- Corrected regional provider trial returned 12 Craigslist cars across multiple regions outside Denver. Craigslist is now placed in subsequent batches so its fast regional results cannot consume the entire first Cars.com/CarGurus/TrueCar result cap.

## Launch preparation — September 21

- Corrected Camry VIN 4T1BK1FK1CU510755: $1,028 was optional accessories. Seller shows $13,495 plus $225 document fee, $13,720 before tax/title/registration. Fresh audit expires after 24 hours; related dealer pricing is treated cautiously without verified evidence.
- Added public Help, Privacy and Terms pages and first-visit early-access guidance. Private support email remains unconfigured, pending owner choice.
- Saved-search controls no longer promise notifications when the scheduler is inactive. Scheduler/email remain unavailable for this release.
- Price regression, account-isolation, alerts and shortlist tests pass, along with TypeScript. Isolation tests cover fresh local workspaces, encrypted credentials and cross-user decryption rejection; production fresh-account end-to-end testing is still needed.
- Shared inventory access and provider production-use permission remain unresolved. No paid upgrades purchased. Scout API testing awaits the owner's existing-key versus new-key choice; no owner key was exposed to other accounts.

## Live Scout and scheduler check — September 21

- Owner approved reuse of their existing OpenAI connection. Live comparison request succeeded while preserving BMW M5, $30,000 budget and 80 existing results.
- Follow-up “lower the mileage” exposed an invented 50,000-mile default when no limit existed. Added a deterministic clarification guard and regression coverage; explicit mileage requests still execute. The test search was paused.
- MarketCheck dashboard still shows Free, 500 calls/month and 501 used. No upgrade or charge authorized.
- GitHub hourly workflow exists and has attempted scheduled runs, but the repository has no Actions secrets; scheduled checks fail before reaching MotorScout. SCHEDULER_SECRET and MOTORSCOUT_URL must be configured, then heartbeat verified. Browser security confirmation is required before creating scheduler access.
- Sites still has only its existing encryption secret. No shared inventory/AI, email, scheduler or support configuration added. Auto.dev/J.D. Power approval replies absent in the checked inbox.

## Scheduler activation implementation

Owner approved scheduler access. Replaced the missing static-secret dependency with short-lived GitHub OIDC credentials, constrained to the immutable MotorScout repository/owner IDs, main branch and saved-search workflow. Auth regression and existing alert tests pass. Live activation must be confirmed by a successful GitHub run and MotorScout heartbeat; email is still unconfigured.
