import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import StatusDot from '../components/StatusDot';
import Button from '../components/Button';
import Card from '../components/Card';
import theme from '../theme';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', blurb: '1 active conversation' },
  { id: 'plus', name: 'Plus', price: '$24', blurb: 'Unlimited · priority' },
  { id: 'pro', name: 'Concierge', price: '$96', blurb: '+ human curation reviews' },
];

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState('plus');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing.</Text>
        <Text style={styles.subtitle}>
          Your plan and your payment method. Nothing else.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Current plan */}
        <Card style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planHeaderLeft}>
              <View style={styles.planTitleRow}>
                <Text style={styles.planName}>Plus</Text>
                <View style={styles.currentPill}>
                  <StatusDot status="green" size={5} />
                  <Text style={styles.currentPillText}>Current plan</Text>
                </View>
              </View>
              <Text style={styles.planFeatures}>
                Unlimited conversations · priority matching · agent memory
              </Text>
            </View>
            <View style={styles.planPriceWrap}>
              <Text style={styles.planPrice}>$24</Text>
              <Text style={styles.planPricePer}>/mo</Text>
            </View>
          </View>

          <Text style={styles.nextCharge}>Next charge May 28, 2026</Text>

          <View style={styles.divider} />

          {/* Plan selector */}
          {PLANS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.planOption, plan === p.id && styles.planOptionSelected]}
              onPress={() => {
                Haptics.selectionAsync();
                setPlan(p.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.planOptionHeader}>
                <Text style={styles.planOptionName}>{p.name}</Text>
                {plan === p.id && (
                  <Text style={styles.planSelectedLabel}>Selected</Text>
                )}
              </View>
              <Text style={styles.planOptionPrice}>
                {p.price}<Text style={styles.planOptionPer}>/mo</Text>
              </Text>
              <Text style={styles.planOptionBlurb}>{p.blurb}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.planActions}>
            <Button title="Cancel plan" variant="ghost" size="sm" />
            <Button title="Update plan" size="sm" />
          </View>
        </Card>

        {/* Payment method */}
        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <Text style={styles.sectionDesc}>
            Card on file. Billing receipts are sent by email.
          </Text>

          <View style={styles.cardRow}>
            <View style={styles.cardChip}>
              <Text style={styles.cardChipText}>VISA</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
              <Text style={styles.cardExpiry}>Expires 11/28 · Jordan A.</Text>
            </View>
            <Button title="Replace" variant="ghost" size="sm" />
          </View>

          <View style={styles.emailField}>
            <Text style={styles.fieldLabel}>Billing email</Text>
            <TextInput
              style={styles.input}
              defaultValue="jordan@agentsmatch.ai"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: theme.font.serif,
    fontSize: 28,
    fontWeight: '400',
    color: theme.palette.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 40,
  },
  planCard: {
    marginTop: 16,
    gap: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planHeaderLeft: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.palette.text,
  },
  currentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  currentPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.palette.textSecondary,
  },
  planFeatures: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  planPriceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontFamily: theme.font.serif,
    fontSize: 36,
    color: theme.palette.text,
    lineHeight: 40,
  },
  planPricePer: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
  },
  nextCharge: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.borderLight,
    marginVertical: 4,
  },
  planOption: {
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.radius.md,
    padding: 16,
    backgroundColor: theme.palette.bg,
  },
  planOptionSelected: {
    borderColor: theme.palette.coral,
    backgroundColor: theme.palette.coralSoft,
  },
  planOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planOptionName: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.palette.text,
  },
  planSelectedLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.coral,
    fontWeight: '600',
  },
  planOptionPrice: {
    fontFamily: theme.font.serif,
    fontSize: 24,
    color: theme.palette.text,
    marginTop: 4,
  },
  planOptionPer: {
    fontSize: 12,
    color: theme.palette.textDim,
  },
  planOptionBlurb: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginTop: 2,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  paymentCard: {
    marginTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.palette.text,
  },
  sectionDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    lineHeight: 18,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.palette.bg,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.radius.md,
    padding: 14,
  },
  cardChip: {
    width: 44,
    height: 28,
    borderRadius: 6,
    backgroundColor: theme.palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardChipText: {
    fontFamily: theme.font.mono,
    fontSize: 9,
    fontWeight: '700',
    color: theme.palette.textOnCoral,
    letterSpacing: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontFamily: theme.font.mono,
    fontSize: 14,
    color: theme.palette.text,
  },
  cardExpiry: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
    marginTop: 2,
  },
  emailField: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.palette.textSecondary,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: theme.palette.bg,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: theme.fontSize.base,
    color: theme.palette.text,
  },
});
