import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useTheme } from '@/hooks/useTheme';
import { REVENUECAT_ENTITLEMENT_ID, type RevenueCatPlan } from '@/lib/revenueCat';
import { useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Crown, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLANS: { key: RevenueCatPlan; title: string; detail: string }[] = [
  { key: 'monthly', title: 'Monthly', detail: 'Flexible access to Talkd Pro.' },
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
    isPro,
    error,
    getPlanPackage,
    presentPaywall,
    purchasePlan,
    restorePurchases,
    openCustomerCenter,
  } = useRevenueCat();

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
            Talkd Pro
          </Text>
          <Text style={{ marginTop: 10, fontSize: 14, lineHeight: 21, color: t.ink3 }}>
            Support Talkd and unlock Pro access tied to your private account.
          </Text>
        </View>

        <View style={{
          borderRadius: 12,
          backgroundColor: isPro ? t.amberSoft : t.bg3,
          borderWidth: 0.5,
          borderColor: isPro ? t.amber + '55' : t.line,
          padding: 16,
          marginBottom: 18,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BadgeCheck size={19} color={isPro ? t.amber : t.ink3} strokeWidth={2.2} />
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: t.ink }}>
              {isPro ? 'Talkd Pro is active' : 'Talkd Pro is not active'}
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
            <TouchableOpacity
              onPress={() => void presentPaywall()}
              disabled={actionLoading || !isConfigured}
              style={{
                paddingVertical: 16,
                borderRadius: 99,
                alignItems: 'center',
                backgroundColor: actionLoading || !isConfigured ? t.bg3 : t.amber,
                marginBottom: 12,
              }}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator color={t.ink4} />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: '700', color: isConfigured ? t.onAccent : t.ink4, letterSpacing: 0 }}>
                  {isPro ? 'View Pro options' : 'Open Pro paywall'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ gap: 10, marginTop: 6 }}>
              {PLANS.map(plan => {
                const planPackage = getPlanPackage(plan.key);
                const price = planPackage?.product.priceString ?? 'Not configured';
                return (
                  <TouchableOpacity
                    key={plan.key}
                    onPress={() => void purchasePlan(plan.key)}
                    disabled={actionLoading || !planPackage}
                    style={{
                      borderRadius: 12,
                      backgroundColor: t.bg3,
                      borderWidth: 0.5,
                      borderColor: t.line,
                      padding: 16,
                      opacity: planPackage ? 1 : 0.62,
                    }}
                    activeOpacity={0.78}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: t.ink }}>
                        {plan.title}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: planPackage ? t.amber : t.ink4 }}>
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
