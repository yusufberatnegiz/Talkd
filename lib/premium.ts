export const PREMIUM_ENTITLEMENT_LABEL = 'Talkd Premium';
export const PREMIUM_SESSION_EXTENSION_LABEL = '+15 minutes';

export const PREMIUM_PRODUCTS = {
  monthly: 'monthly',
  yearly: 'talkd_premium_yearly',
} as const;

export type PremiumPlan = keyof typeof PREMIUM_PRODUCTS;

export interface PremiumPlanDetails {
  key: PremiumPlan;
  productId: string;
  title: string;
  detail: string;
  price: string;
  compareAtPrice: string;
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
    key: 'priority-matching',
    label: 'Priority matching',
    detail: 'Get placed ahead in the queue when someone compatible is available.',
  },
  {
    key: 'preferred-listeners',
    label: 'Preferred listeners',
    detail: 'When you need a listener, Talkd looks first for people with recent helpful ratings.',
  },
  {
    key: 'session-extension',
    label: 'Extend once per chat',
    detail: 'Add 15 minutes when both people agree.',
  },
  {
    key: 'instant-translation',
    label: 'Instant translation',
    detail: 'Translate messages during a chat when language gets in the way.',
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
    price: '$2.99',
    compareAtPrice: '$5.99',
  },
  {
    key: 'yearly',
    productId: PREMIUM_PRODUCTS.yearly,
    title: 'Yearly',
    detail: 'Best value for regular listeners and talkers.',
    price: '$14.99',
    compareAtPrice: '$35.99',
    badge: 'Best value',
  },
];
