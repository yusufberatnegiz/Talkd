import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useTheme } from '@/hooks/useTheme';
import { REVENUECAT_ENTITLEMENT_ID, type RevenueCatPlan } from '@/lib/revenueCat';
import { useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Crown, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLANS: { key: RevenueCatPlan; title: string; detail: string }[] = [
  { key: 'monthly', title: 'Monthly', detail: 'Flexible access to Talkd Premium.' },
  { key: 'yearly', title: 'Yearly', detail: 'Best for regular listeners and talkers.' },
  { key: 'lifetime', title: 'Lifetime', detail: 'One purchase for lasting access.' },
];

export default function PremiumScreen() {
  const t = useTheme();
  const router = useRouter();
  const {
    loading,
    actionLoading,
    isConfigured,
    isPremium,
    error,
    getPlanPackage,
    purchasePlan,
    restorePurchases,
    openCustomerCenter,
  } = useRevenueCat();
  const availablePlans = useMemo(() => {
    return PLANS
      .map(plan => ({ ...plan, package: getPlanPackage(plan.key) }))
      .filter(plan => !!plan.package);
  }, [getPlanPackage]);
  const fallbackPlan = availablePlans[0]?.key ?? 'monthly';
  const [selectedPlan, setSelectedPlan] = useState<RevenueCatPlan>('monthly');
  const selectedAvailablePlan = availablePlans.find(plan => plan.key === selectedPlan) ?? availablePlans[0] ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        <View style={{ paddingTop: 14, paddingBottom: 22 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              height: 42,
              width: 42,
              borderRadius: 12,
              backgroundColor: t.bg3,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 0.5,
              borderColor: t.line,
            }}
          >
            <ArrowLeft size={20} color={t.ink} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingBottom: 24 }}>
          <View style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            backgroundColor: t.amberDim,
            borderWidth: 0.5,
            borderColor: t.amber + '55',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}>
            <Crown size={25} color={t.amber} strokeWidth={2.2} />
          </View>
          <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: 0, color: t.ink }}>
            Talkd Premium
          </Text>
          <Text style={{ marginTop: 10, fontSize: 14, lineHeight: 21, color: t.ink3 }}>
            Support safer anonymous conversations and keep Premium access tied to your private account.
          </Text>
        </View>

        <View style={{ gap: 10, marginBottom: 18 }}>
          {[
            'Private premium access on this account',
            'Restore purchases anytime',
            'Helps keep Talkd moderated and reliable',
          ].map(benefit => (
            <View key={benefit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: t.amber,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: t.amber, fontSize: 14, fontWeight: '700', lineHeight: 16 }}>
                  ✓
                </Text>
              </View>
              <Text style={{ flex: 1, color: t.ink2, fontSize: 14, lineHeight: 20 }}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View style={{
          borderRadius: 12,
          backgroundColor: isPremium ? t.amberSoft : t.bg3,
          borderWidth: 0.5,
          borderColor: isPremium ? t.amber + '55' : t.line,
          padding: 16,
          marginBottom: 18,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BadgeCheck size={19} color={isPremium ? t.amber : t.ink3} strokeWidth={2.2} />
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: t.ink }}>
              {isPremium ? 'Talkd Premium is active' : 'Talkd Premium is not active'}
            </Text>
          </View>
          <Text style={{ marginTop: 8, fontSize: 12.5, lineHeight: 18, color: t.ink3 }}>
            Entitlement checked: {REVENUECAT_ENTITLEMENT_ID}
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator color={t.amber} />
          </View>
        ) : (
          <>
            <View style={{ gap: 10, marginTop: 6 }}>
              {availablePlans.map(plan => {
                const price = plan.package?.product.priceString ?? '';
                const selected = selectedAvailablePlan?.key === plan.key;
                return (
                  <TouchableOpacity
                    key={plan.key}
                    onPress={() => setSelectedPlan(plan.key)}
                    disabled={actionLoading}
                    style={{
                      borderRadius: 12,
                      backgroundColor: selected ? t.amberSoft : t.bg3,
                      borderWidth: selected ? 1 : 0.5,
                      borderColor: selected ? t.amber + '70' : t.line,
                      padding: 16,
                    }}
                    activeOpacity={0.78}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: t.ink }}>
                        {plan.title}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: t.amber }}>
                        {price}
                      </Text>
                    </View>
                    <Text style={{ marginTop: 5, fontSize: 12.5, lineHeight: 18, color: t.ink3 }}>
                      {plan.detail}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!availablePlans.length && (
              <View style={{
                borderRadius: 12,
                backgroundColor: t.bg3,
                borderWidth: 0.5,
                borderColor: t.line,
                padding: 16,
              }}>
                <Text style={{ fontSize: 14, lineHeight: 20, color: t.ink3 }}>
                  No purchase options are available yet. Check the RevenueCat offering setup for the current app.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => void purchasePlan(selectedAvailablePlan?.key ?? fallbackPlan)}
              disabled={actionLoading || !isConfigured || !selectedAvailablePlan}
              style={{
                paddingVertical: 16,
                borderRadius: 99,
                alignItems: 'center',
                backgroundColor: actionLoading || !isConfigured || !selectedAvailablePlan ? t.bg3 : t.amber,
                marginTop: 16,
              }}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator color={t.ink4} />
              ) : (
                <Text style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: isConfigured && selectedAvailablePlan ? t.onAccent : t.ink4,
                  letterSpacing: 0,
                }}>
                  Continue
                </Text>
              )}
            </TouchableOpacity>

            <Text style={{ marginTop: 10, textAlign: 'center', fontSize: 12, lineHeight: 17, color: t.ink4 }}>
              Apple will confirm before you subscribe.
            </Text>

            {!isConfigured && (
              <Text style={{ marginTop: 14, fontSize: 12.5, lineHeight: 18, color: t.red }}>
                RevenueCat is available in the iOS development build or TestFlight. Expo Go only previews purchase UI behavior.
              </Text>
            )}

            {!!error && (
              <Text style={{ marginTop: 14, fontSize: 12.5, lineHeight: 18, color: t.red }}>
                {error}
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => void restorePurchases()}
                disabled={actionLoading || !isConfigured}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: t.bg3,
                  borderWidth: 0.5,
                  borderColor: t.line,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <RefreshCw size={15} color={t.ink3} strokeWidth={2} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: t.ink }}>
                  Restore
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => void openCustomerCenter()}
                disabled={actionLoading || !isConfigured}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: t.bg3,
                  borderWidth: 0.5,
                  borderColor: t.line,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <ShieldCheck size={15} color={t.ink3} strokeWidth={2} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: t.ink }}>
                  Manage
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
