import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { type PremiumPlan } from '@/lib/premium';

interface UsePremiumResult {
  loading: boolean;
  actionLoading: boolean;
  isPurchaseAvailable: boolean;
  isPremium: boolean;
  error: string;
  purchasePlan: (plan: PremiumPlan) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openManageSubscriptions: () => Promise<void>;
}

const APPLE_SUBSCRIPTIONS_URL = 'itms-apps://apps.apple.com/account/subscriptions';
const NOT_AVAILABLE_MESSAGE =
  'Apple subscriptions are not connected yet. Direct StoreKit integration is the next premium setup step.';

export function usePremium(): UsePremiumResult {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const purchasePlan = useCallback(async (plan: PremiumPlan): Promise<boolean> => {
    setActionLoading(true);
    setError('');
    try {
      setError(`${plan === 'yearly' ? 'Yearly' : 'Monthly'} Premium is not available until Apple subscriptions are connected.`);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setActionLoading(true);
    setError('');
    try {
      setError(NOT_AVAILABLE_MESSAGE);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const openManageSubscriptions = useCallback(async (): Promise<void> => {
    setActionLoading(true);
    setError('');
    try {
      await Linking.openURL(APPLE_SUBSCRIPTIONS_URL);
    } catch {
      setError('Could not open Apple subscription settings on this device.');
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    loading: false,
    actionLoading,
    isPurchaseAvailable: false,
    isPremium: false,
    error,
    purchasePlan,
    restorePurchases,
    openManageSubscriptions,
  };
}
