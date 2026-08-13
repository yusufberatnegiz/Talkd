export const PREMIUM_ENTITLEMENT_LABEL = 'Talkd Premium';
export const PREMIUM_SESSION_EXTENSION_LABEL = '+15 minutes';

export const PREMIUM_PRODUCTS = {
  monthly: 'talkd_premium_monthly',
  yearly: 'talkd_premium_yearly',
} as const;

export type PremiumPlan = keyof typeof PREMIUM_PRODUCTS;

export interface PremiumPlanDetails {
  key: PremiumPlan;
  productId: string;
  title: string;
  detail: string;
  badge?: string;
}

export interface PremiumFeature {
  key: string;
  label: string;
  detail: string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    key: 'talk-anytime',
    label: 'Talk anytime',
    detail: 'Skip the free listen-back requirement after a talk session.',
  },
  {
    key: 'preferred-listeners',
    label: 'Helpful listener preference',
    detail: 'When you need a listener, Talkd looks first for people with recent helpful ratings.',
  },
  {
    key: 'session-extension',
    label: 'Extend once per chat',
    detail: 'Add 15 minutes when both people agree.',
  },
  {
    key: 'theme-colors',
    label: 'Custom theme colors',
    detail: 'Personalize Talkd with premium accent colors.',
  },
];

export const PREMIUM_PLANS: PremiumPlanDetails[] = [
  {
    key: 'monthly',
    productId: PREMIUM_PRODUCTS.monthly,
    title: 'Monthly',
    detail: 'Flexible access to Talkd Premium.',
  },
  {
    key: 'yearly',
    productId: PREMIUM_PRODUCTS.yearly,
    title: 'Yearly',
    detail: 'Best value for regular listeners and talkers.',
    badge: 'Best value',
  },
];
