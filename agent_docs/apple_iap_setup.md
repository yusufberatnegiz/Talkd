# Apple IAP Setup - Talkd

Talkd uses direct Apple in-app purchases for premium access.

## Product Identifiers

The app-owned product identifiers are:

```txt
talkd_premium_monthly
talkd_premium_yearly
```

Configured App Store pricing:

```txt
talkd_premium_monthly: $2.99
talkd_premium_yearly: $14.99
```

## Current App State

The Talkd Premium screen uses `expo-iap` for direct Apple StoreKit purchases.

Implemented:

1. Fetch products from App Store Connect by the product identifiers above.
2. Purchase the selected product through Apple's native purchase sheet.
3. Finish successful StoreKit transactions.
4. Restore purchases through Apple's restore flow.
5. Open Apple subscription management.
6. Share one guarded StoreKit connection and entitlement state across the app.
7. Verify Apple transaction identifiers through a Supabase Edge Function before finishing transactions.
8. Enforce premium matchmaking and listen-back bypass from Supabase entitlement metadata.

Premium feature contract:

1. Talk anytime without the free listen-back requirement.
2. Preferred listener matching using anonymous rating aggregates.
3. One +15 minute chat extension when both people agree.
4. Custom theme colors.

## Server Verification Setup

1. In App Store Connect, open **Users and Access > Integrations > In-App Purchase**.
2. Generate an In-App Purchase API key and download its `.p8` private key. Apple only offers the download once.
3. Copy the key ID and issuer ID shown by App Store Connect.
4. Set the Edge Function secrets without adding the private key to this repository:

```bash
npx supabase secrets set \
  APPLE_IAP_ISSUER_ID="YOUR_ISSUER_ID" \
  APPLE_IAP_KEY_ID="YOUR_KEY_ID" \
  APPLE_BUNDLE_ID="com.yusufberatnegiz.talkd" \
  APPLE_IAP_PRIVATE_KEY="$(cat /path/to/SubscriptionKey_KEY_ID.p8)"
```

5. Apply and deploy the server-authoritative entitlement code:

```bash
npx supabase db push
npx supabase functions deploy verify-apple-purchase
```

The function uses Apple's production transaction endpoint first and retries the sandbox endpoint only when Apple reports that the transaction is not present in production.

Apple references:

- https://developer.apple.com/documentation/appstoreserverapi/creating-api-keys-to-authorize-api-requests
- https://developer.apple.com/documentation/appstoreserverapi/get-transaction-info
- https://developer.apple.com/documentation/storekit/transaction/appaccounttoken

## Release TODO

1. Configure the four Apple Edge Function secrets.
2. Apply `20260813000000_server_authoritative_premium.sql`.
3. Deploy `verify-apple-purchase` with JWT verification enabled.
4. Test monthly and yearly purchases in TestFlight with a sandbox Apple account.
5. Test restore, cancellation, expiration, refund/revocation, and reinstall behavior.
6. Configure App Store Server Notifications so renewal/refund state can update before the next app launch.

Do not store chat messages while implementing premium access.
