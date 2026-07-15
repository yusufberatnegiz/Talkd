# Apple IAP Setup - Talkd

Talkd uses direct Apple in-app purchases for premium access.

## Product Identifiers

The app-owned product identifiers are:

```txt
monthly
talkd_premium_yearly
```

Launch pricing:

```txt
monthly: $2.99, shown as on sale from $5.99
talkd_premium_yearly: $14.99, shown as on sale from $35.99
```

## Current App State

The Talkd Premium screen uses `expo-iap` for direct Apple StoreKit purchases.

Implemented:

1. Fetch products from App Store Connect by the product identifiers above.
2. Purchase the selected product through Apple's native purchase sheet.
3. Finish successful StoreKit transactions.
4. Restore purchases through Apple's restore flow.
5. Open Apple subscription management.

Release TODO:

1. Verify Apple transactions server-side before trusting premium access.
2. Store only premium access metadata in Supabase.
3. Re-check premium access from Supabase on app launch after server verification exists.
4. Test purchases in an iOS development build or TestFlight with a sandbox Apple account.

Do not store chat messages while implementing premium access.
