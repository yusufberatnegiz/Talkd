export const PREMIUM_ENTITLEMENT_LABEL = 'Talkd Premium';

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
