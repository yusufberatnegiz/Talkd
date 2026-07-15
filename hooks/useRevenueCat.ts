import { useCallback, useEffect, useState } from 'react';
import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Linking } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Sentry } from '@/lib/sentry';
import {
  configureRevenueCat,
  getPackageForPlan,
  getRevenueCatErrorMessage,
  getRevenueCatState,
  isRevenueCatSupported,
  isTalkdPremium,
  presentRevenueCatCustomerCenter,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
  type RevenueCatPlan,
} from '@/lib/revenueCat';

interface UseRevenueCatResult {
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  loading: boolean;
  actionLoading: boolean;
  isConfigured: boolean;
  isPremium: boolean;
  error: string;
  refresh: () => Promise<void>;
  purchasePlan: (plan: RevenueCatPlan) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openCustomerCenter: () => Promise<void>;
  getPlanPackage: (plan: RevenueCatPlan) => PurchasesPackage | null;
}

export function useRevenueCat(): UseRevenueCatResult {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    const configured = await configureRevenueCat(user?.id ?? null);
    setIsConfigured(configured);

    if (!configured) {
      setCustomerInfo(null);
      setCurrentOffering(null);
      return;
    }

    const nextState = await getRevenueCatState();
    setCustomerInfo(nextState.customerInfo);
    setCurrentOffering(nextState.currentOffering);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let listener: CustomerInfoUpdateListener | null = null;

    async function load() {
      setLoading(true);
      try {
        await refresh();
        listener = (nextCustomerInfo: CustomerInfo) => {
          if (!isMounted) return;
          setCustomerInfo(nextCustomerInfo);
        };
        if (isRevenueCatSupported()) Purchases.addCustomerInfoUpdateListener(listener);
      } catch (loadError: unknown) {
        console.warn('Could not load RevenueCat customer info', loadError);
        Sentry.captureException(loadError);
        if (isMounted) setError(getRevenueCatErrorMessage(loadError));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
      if (listener) Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [refresh]);

  const runPurchaseAction = useCallback(async (
    action: () => Promise<CustomerInfo | null>
  ): Promise<boolean> => {
    setActionLoading(true);
    setError('');
    try {
      const nextCustomerInfo = await action();
      if (nextCustomerInfo) setCustomerInfo(nextCustomerInfo);
      return nextCustomerInfo ? isTalkdPremium(nextCustomerInfo) : false;
    } catch (purchaseError: unknown) {
      console.warn('RevenueCat purchase action failed', purchaseError);
      Sentry.captureException(purchaseError);
      setError(getRevenueCatErrorMessage(purchaseError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const purchasePlan = useCallback(async (plan: RevenueCatPlan): Promise<boolean> => {
    const planPackage = getPackageForPlan(currentOffering, plan);
    if (!planPackage) {
      setError('This Talkd Premium option is not available yet. Check the RevenueCat offering setup.');
      return false;
    }
    return runPurchaseAction(() => purchaseRevenueCatPackage(planPackage));
  }, [currentOffering, runPurchaseAction]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    return runPurchaseAction(restoreRevenueCatPurchases);
  }, [runPurchaseAction]);

  const openCustomerCenter = useCallback(async () => {
    setActionLoading(true);
    setError('');
    try {
      await presentRevenueCatCustomerCenter();
      await refresh();
    } catch (customerCenterError: unknown) {
      const managementURL = customerInfo?.managementURL;
      if (managementURL) {
        await Linking.openURL(managementURL);
      } else {
        console.warn('RevenueCat Customer Center failed', customerCenterError);
        Sentry.captureException(customerCenterError);
        setError(getRevenueCatErrorMessage(customerCenterError));
      }
    } finally {
      setActionLoading(false);
    }
  }, [customerInfo?.managementURL, refresh]);

  const getPlanPackage = useCallback((plan: RevenueCatPlan): PurchasesPackage | null => {
    return getPackageForPlan(currentOffering, plan);
  }, [currentOffering]);

  return {
    customerInfo,
    currentOffering,
    loading,
    actionLoading,
    isConfigured,
    isPremium: isTalkdPremium(customerInfo),
    error,
    refresh,
    purchasePlan,
    restorePurchases,
    openCustomerCenter,
    getPlanPackage,
  };
}
