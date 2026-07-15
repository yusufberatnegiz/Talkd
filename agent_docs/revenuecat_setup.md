# RevenueCat Setup - Talkd

Talkd uses RevenueCat for iOS premium access.

## App Constants

The app expects these identifiers:

```txt
RevenueCat API key: test_HnnUJcqBNpWrlvcZqoofkikVEeF
Entitlement ID: Talkd Premium
Offering ID: default
Products/packages: monthly, yearly, lifetime
```

The public SDK key is configured in `lib/revenueCat.ts`. For production builds, prefer setting the same value through:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=test_HnnUJcqBNpWrlvcZqoofkikVEeF
```

## RevenueCat Dashboard

1. Create or open the Talkd project.
2. Add the iOS app with bundle ID:

```txt
com.yusufberatnegiz.talkd
```

3. Connect App Store Connect.
4. Add products:

```txt
monthly
yearly
lifetime
```

5. Create entitlement:

```txt
Talkd Premium
```

6. Attach all three products to `Talkd Premium`.
7. Create offering:

```txt
default
```

8. Add packages:

```txt
monthly -> product monthly
yearly -> product yearly
lifetime -> product lifetime
```

9. Configure Customer Center before showing the Manage button in production.

## App Store Connect

Create matching in-app purchases/subscriptions before App Review:

```txt
monthly: auto-renewable monthly subscription
yearly: auto-renewable yearly subscription
lifetime: non-consumable lifetime purchase
```

All products should unlock the same RevenueCat entitlement: `Talkd Premium`.

## Testing

RevenueCat native purchases do not fully run in Expo Go. Use a development build or TestFlight.

Test flow:

1. Sign in to Talkd.
2. Open Profile.
3. Tap Talkd Premium.
4. Select an available plan.
5. Tap Continue.
6. Purchase with a sandbox Apple account from the native Apple sheet.
7. Confirm Profile shows Talkd Premium as Active.
8. Test Restore.
9. Test Manage through RevenueCat Customer Center.
