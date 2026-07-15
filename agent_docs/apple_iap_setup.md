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

The Talkd Premium screen is provider-free and shows the launch pricing, but Apple purchasing is intentionally disabled until direct StoreKit support is added.

Next implementation step:

1. Add a direct React Native Apple in-app purchase SDK that supports Expo development builds.
2. Fetch products from App Store Connect by the product identifiers above.
3. Purchase the selected product through Apple's native purchase sheet.
4. Restore purchases through Apple's restore flow.
5. Verify receipts server-side before granting premium access.
6. Store only premium access metadata in Supabase.

Do not store chat messages while implementing premium access.
