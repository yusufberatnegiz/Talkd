import Purchases, {
  PACKAGE_TYPE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { Platform } from 'react-native';
import { Sentry } from '@/lib/sentry';

export const REVENUECAT_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? 'test_HnnUJcqBNpWrlvcZqoofkikVEeF';
export const REVENUECAT_ENTITLEMENT_ID = 'Talkd Premium';
export const REVENUECAT_OFFERING_ID = 'default';

export const REVENUECAT_PRODUCTS = {
  lifetime: 'lifetime',
  yearly: 'talkd_premium_yearly',
  monthly: 'monthly',
} as const;

export type RevenueCatPlan = keyof typeof REVENUECAT_PRODUCTS;

export interface RevenueCatState {
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  isPremium: boolean;
}

let isConfigured = false;
let currentAppUserID: string | null = null;

export function isRevenueCatSupported(): boolean {
  return Platform.OS === 'ios';
}

export function isTalkdPremium(customerInfo: CustomerInfo | null): boolean {
  return customerInfo?.entitlements.active[REVENUECAT_ENTITLEMENT_ID]?.isActive === true;
}

export async function configureRevenueCat(appUserID: string | null): Promise<boolean> {
  if (!isRevenueCatSupported() || !REVENUECAT_API_KEY) return false;

  try {
    if (!isConfigured) {
      if (__DEV__) await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID,
      });
      isConfigured = true;
      currentAppUserID = appUserID;
      return true;
    }

    if (appUserID && appUserID !== currentAppUserID) {
      await Purchases.logIn(appUserID);
      currentAppUserID = appUserID;
    } else if (!appUserID && currentAppUserID) {
      await Purchases.logOut();
      currentAppUserID = null;
    }

    return true;
  } catch (error: unknown) {
    console.warn('Could not configure RevenueCat', error);
    Sentry.captureException(error);
    return false;
  }
}

export async function getRevenueCatState(): Promise<RevenueCatState> {
  const [customerInfo, offerings] = await Promise.all([
    Purchases.getCustomerInfo(),
    Purchases.getOfferings(),
  ]);

  return {
    customerInfo,
    currentOffering: offerings.current ?? offerings.all[REVENUECAT_OFFERING_ID] ?? null,
    isPremium: isTalkdPremium(customerInfo),
  };
}

export function getPackageForPlan(
  offering: PurchasesOffering | null,
  plan: RevenueCatPlan
): PurchasesPackage | null {
  if (!offering) return null;

  if (plan === 'lifetime') {
    return offering.lifetime ?? packageMatching(offering, plan, PACKAGE_TYPE.LIFETIME);
  }

  if (plan === 'yearly') {
    return offering.annual ?? packageMatching(offering, plan, PACKAGE_TYPE.ANNUAL);
  }

  return offering.monthly ?? packageMatching(offering, plan, PACKAGE_TYPE.MONTHLY);
}

export async function purchaseRevenueCatPackage(
  purchasePackage: PurchasesPackage
): Promise<CustomerInfo | null> {
  try {
    const result = await Purchases.purchasePackage(purchasePackage);
    return result.customerInfo;
  } catch (error: unknown) {
    if (isPurchaseCancelled(error)) return null;
    throw error;
  }
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function presentRevenueCatCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter();
}

export function getRevenueCatErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('underlyingErrorMessage' in error && typeof error.underlyingErrorMessage === 'string') {
      return error.underlyingErrorMessage;
    }
  }
  return 'The purchase request could not be completed.';
}

export function isPurchaseCancelled(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('userCancelled' in error && error.userCancelled === true) return true;
  if ('code' in error && error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
    return true;
  }
  return false;
}

function packageMatching(
  offering: PurchasesOffering,
  plan: RevenueCatPlan,
  packageType: PACKAGE_TYPE
): PurchasesPackage | null {
  const productID = REVENUECAT_PRODUCTS[plan];
  return offering.availablePackages.find(candidate =>
    candidate.identifier === productID ||
    candidate.product.identifier === productID ||
    candidate.packageType === packageType
  ) ?? null;
}
