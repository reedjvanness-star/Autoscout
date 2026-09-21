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

## September 21 follow-up evidence

- GitHub copy: https://github.com/reedjvanness-star/Autoscout. Source files are mirrored through explicit updates; automatic deployment or ongoing automatic synchronization has not been configured. The local `github` remote points there while Sites remains `origin`.
- Live asking-price correction: VIN 5TFAZ5CN6HX041878 was incorrectly displayed at $1,998, the dealer's optional accessory charge. The seller page showed $26,999 plus a $225 document fee ($27,224). The correction was published, and a refreshed live $10,000 Tacoma search no longer showed it among the cheapest results. This is evidence for that listing, not proof that all upstream prices are accurate.
- Price descriptions are checked for the exact reported amount labeled as savings, deposits, monthly payments, fees or accessories. Missing or ambiguous source evidence remains a limitation. Marketplace imports and cached/collected search results must run price review before match filtering and counts.
- J.D. Power offers partner integration; an inquiry is prepared outside this repository but is not sent or approved. No access or free production pilot is established. Official contact: https://www.jdpowervalues.com/customer-service-representative.
- Edmunds' published FAQ says its open API is retired and new applicants are not accepted: https://developer.edmunds.com/faq.html. Old API documentation is not evidence of available access.
- Public-user inventory credentials, provider permission/allowance, notification scheduler/email activation, and fresh-account end-to-end verification remain incomplete. No paid services were authorized or purchased.
