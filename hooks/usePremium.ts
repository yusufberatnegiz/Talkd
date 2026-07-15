import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  deepLinkToSubscriptions,
  purchaseUpdatedListener,
  showManageSubscriptionsIOS,
  useIAP,
  type ExpoPurchaseError,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';
import { Sentry } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { PREMIUM_PLANS, type PremiumPlan } from '@/lib/premium';

interface UsePremiumResult {
  loading: boolean;
  actionLoading: boolean;
  isPurchaseAvailable: boolean;
  isPremium: boolean;
  error: string;
  getPlanProduct: (plan: PremiumPlan) => ProductSubscription | null;
  purchasePlan: (plan: PremiumPlan) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openManageSubscriptions: () => Promise<void>;
  refresh: () => Promise<void>;
}

const PREMIUM_PRODUCT_IDS = PREMIUM_PLANS.map(plan => plan.productId);

export function usePremium(): UsePremiumResult {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    connected,
    subscriptions,
    activeSubscriptions,
    fetchProducts,
    finishTransaction,
    getActiveSubscriptions,
    getAvailablePurchases,
    hasActiveSubscriptions,
    requestPurchase,
    restorePurchases: restoreStorePurchases,
  } = useIAP({
    onPurchaseError: (purchaseError: ExpoPurchaseError) => {
      const message = getPremiumErrorMessage(purchaseError);
      if (!isPurchaseCancelled(purchaseError)) {
        console.warn('Apple purchase failed', purchaseError);
        Sentry.captureException(purchaseError);
      }
      setError(message);
    },
    onError: (iapError: Error) => {
      console.warn('Apple IAP failed', iapError);
      Sentry.captureException(iapError);
      setError(getPremiumErrorMessage(iapError));
    },
    onSubscriptionBillingIssue: () => {
      setError('Your Apple subscription needs attention. Open Manage to update it.');
    },
  });

  const productByPlan = useMemo(() => {
    return PREMIUM_PLANS.reduce<Record<PremiumPlan, ProductSubscription | null>>((next, plan) => {
      next[plan.key] = subscriptions.find(product => product.id === plan.productId) ?? null;
      return next;
    }, {
      monthly: null,
      yearly: null,
    });
  }, [subscriptions]);

  const isPremium = useMemo(() => {
    return activeSubscriptions.some(subscription =>
      subscription.isActive && PREMIUM_PRODUCT_IDS.includes(subscription.productId)
    );
  }, [activeSubscriptions]);

  const refresh = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setLoading(false);
      setError('Talkd Premium is available on iOS.');
      return;
    }

    if (!connected) return;

    setLoading(true);
    setError('');
    try {
      await fetchProducts({ skus: PREMIUM_PRODUCT_IDS, type: 'subs' });
      await getAvailablePurchases();
      await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
    } catch (refreshError: unknown) {
      console.warn('Could not refresh Apple subscriptions', refreshError);
      Sentry.captureException(refreshError);
      setError(getPremiumErrorMessage(refreshError));
    } finally {
      setLoading(false);
    }
  }, [connected, fetchProducts, getActiveSubscriptions, getAvailablePurchases]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const finishPremiumPurchases = useCallback(async (purchases: Purchase[]): Promise<boolean> => {
    let hasPremiumPurchase = false;
    for (const purchase of purchases) {
      if (!PREMIUM_PRODUCT_IDS.includes(purchase.productId)) continue;
      hasPremiumPurchase = true;
      await finishTransaction({ purchase, isConsumable: false });
    }
    await getAvailablePurchases();
    await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
    return hasPremiumPurchase;
  }, [finishTransaction, getActiveSubscriptions, getAvailablePurchases]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;

    const subscription = purchaseUpdatedListener(purchase => {
      void finishPremiumPurchases([purchase]).catch((purchaseUpdateError: unknown) => {
        console.warn('Could not finish Apple purchase update', purchaseUpdateError);
        Sentry.captureException(purchaseUpdateError);
        setError(getPremiumErrorMessage(purchaseUpdateError));
      });
    });

    return () => subscription.remove();
  }, [finishPremiumPurchases]);

  const purchasePlan = useCallback(async (plan: PremiumPlan): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      setError('Talkd Premium subscriptions are available on iOS.');
      return false;
    }

    if (!connected) {
      setError('Apple subscriptions are not ready yet. Try again in a moment.');
      return false;
    }

    const product = productByPlan[plan];
    if (!product) {
      setError('This Talkd Premium option is not available from Apple yet.');
      return false;
    }

    setActionLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const purchaseResult = await requestPurchase({
        type: 'subs',
        request: {
          apple: {
            sku: product.id,
            appAccountToken: user?.id ?? null,
          },
        },
      });
      return finishPremiumPurchases(normalizePurchases(purchaseResult));
    } catch (purchaseError: unknown) {
      if (!isPurchaseCancelled(purchaseError)) {
        console.warn('Could not complete Apple purchase', purchaseError);
        Sentry.captureException(purchaseError);
        setError(getPremiumErrorMessage(purchaseError));
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [connected, finishPremiumPurchases, productByPlan, requestPurchase]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      setError('Talkd Premium subscriptions are available on iOS.');
      return false;
    }

    setActionLoading(true);
    setError('');
    try {
      await restoreStorePurchases();
      await getAvailablePurchases();
      await getActiveSubscriptions(PREMIUM_PRODUCT_IDS);
      return hasActiveSubscriptions(PREMIUM_PRODUCT_IDS);
    } catch (restoreError: unknown) {
      console.warn('Could not restore Apple purchases', restoreError);
      Sentry.captureException(restoreError);
      setError(getPremiumErrorMessage(restoreError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [getActiveSubscriptions, getAvailablePurchases, hasActiveSubscriptions, restoreStorePurchases]);

  const openManageSubscriptions = useCallback(async (): Promise<void> => {
    setActionLoading(true);
    setError('');
    try {
      if (Platform.OS === 'ios') {
        await showManageSubscriptionsIOS();
      } else {
        await deepLinkToSubscriptions();
      }
      await refresh();
    } catch (manageError: unknown) {
      console.warn('Could not open Apple subscription management', manageError);
      Sentry.captureException(manageError);
      setError('Could not open Apple subscription settings on this device.');
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const getPlanProduct = useCallback((plan: PremiumPlan): ProductSubscription | null => {
    return productByPlan[plan];
  }, [productByPlan]);

  return {
    loading,
    actionLoading,
    isPurchaseAvailable: Platform.OS === 'ios' && connected && subscriptions.length > 0,
    isPremium,
    error,
    getPlanProduct,
    purchasePlan,
    restorePurchases,
    openManageSubscriptions,
    refresh,
  };
}

function normalizePurchases(purchaseResult: Purchase | Purchase[] | null | undefined): Purchase[] {
  if (!purchaseResult) return [];
  return Array.isArray(purchaseResult) ? purchaseResult : [purchaseResult];
}

function getPremiumErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('debugMessage' in error && typeof error.debugMessage === 'string') return error.debugMessage;
  }
  return 'The Apple subscription request could not be completed.';
}

function isPurchaseCancelled(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && typeof error.code === 'string') {
    return error.code === 'user-cancelled' || error.code === 'purchase-cancelled';
  }
  return false;
}
