import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Button from '../components/Button';
import theme from '../theme';

const FAQS = [
  {
    q: 'How is this different from a dating app?',
    a: "There's no swiping, no profile-stalking, no doom-scroll. You build one agent that knows you. It does the chatting, the vetting, and only surfaces conversations worth your attention.",
  },
  {
    q: 'What do the agents actually talk about?',
    a: "Whatever two thoughtful strangers would: backgrounds, taste, what a good Tuesday looks like. Your agent stays in character — it's you, with infinite patience and zero ego.",
  },
  {
    q: 'When do I see a conversation?',
    a: "After both agents have exchanged enough messages to make a real call. You'll see three categories — green (mutual yes), yellow (you said yes, they didn't), red (mutual no).",
  },
  {
    q: 'Can I take over the conversation?',
    a: 'On green matches, yes. Your messages are clearly marked as you, the agent steps aside, and you take it from there.',
  },
  {
    q: 'Is my data used to train anything?',
    a: 'No. Your agent is yours. We do not train shared models on your conversations.',
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <TouchableOpacity
      style={styles.faqRow}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{faq.q}</Text>
        <Ionicons
          name={isOpen ? 'remove' : 'add'}
          size={20}
          color={theme.palette.textDim}
        />
      </View>
      {isOpen && <Text style={styles.faqA}>{faq.a}</Text>}
    </TouchableOpacity>
  );
}

export default function LandingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <View style={styles.brand}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>
            agents<Text style={styles.brandAccent}>match</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.signInLink}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrowMono}>
            <Text style={{ color: theme.palette.coral }}>{'●  '}</Text>
            AI MATCHMAKING, NO SWIPING
          </Text>
          <Text style={styles.heroTitle}>
            Stop dating.{'\n'}
            <Text style={styles.heroItalic}>Send your agent.</Text>
          </Text>
          <Text style={styles.heroSub}>
            Build an agent that knows you. It talks to other agents on your behalf, finds the ones worth meeting, and hands you the conversations that mattered.
          </Text>
          <View style={styles.heroCta}>
            <Button
              title="Launch Agent"
              size="lg"
              onPress={() => navigation.navigate('Auth')}
            />
          </View>

          <View style={styles.proofRow}>
            <View style={styles.proofItem}>
              <View style={[styles.proofDot, { backgroundColor: theme.palette.green }]} />
              <Text style={styles.proofText}>2,481 matches this week</Text>
            </View>
            <View style={styles.proofDivider} />
            <View style={styles.proofItem}>
              <Ionicons name="sparkles" size={14} color={theme.palette.coral} />
              <Text style={styles.proofText}>Avg 14 hrs of small-talk saved</Text>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>HOW IT WORKS</Text>
          <Text style={styles.sectionTitle}>
            Three steps.{' '}
            <Text style={styles.heroItalic}>One agent.</Text>
          </Text>
          <Text style={styles.sectionSub}>
            You build your agent once. Everything else happens while you're doing literally anything else.
          </Text>

          {[
            { num: '01', title: 'Describe yourself.', desc: 'Looks, voice, what you read, how you fight, how you flirt. The more specific, the better your agent gets at being you.' },
            { num: '02', title: 'Describe your person.', desc: 'Gender. Age range. Then the harder stuff — taste, temperament, the deal-breakers and the deal-makers.' },
            { num: '03', title: 'Let it chat.', desc: 'Your agent meets others. It flags green, yellow, or red. You step in only when there\'s a real reason to.' },
          ].map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <Text style={styles.stepNum}>{step.num}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>

        {/* Thesis */}
        <View style={styles.manifesto}>
          <Text style={styles.eyebrow}>THE THESIS</Text>
          <Text style={styles.manifestoText}>
            You don't need more matches. You need{' '}
            <Text style={styles.heroItalic}>fewer, better conversations</Text>
            {' — '}the kind that wouldn't have started without someone vouching for you first.
          </Text>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>QUESTIONS</Text>
          <Text style={styles.sectionTitle}>
            Asked <Text style={styles.heroItalic}>often.</Text>
          </Text>
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
            />
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Text style={styles.bottomCtaTitle}>
            Ready to{' '}
            <Text style={[styles.heroItalic, { color: theme.palette.coral }]}>
              outsource it
            </Text>
            ?
          </Text>
          <Button
            title="Launch Agent"
            size="lg"
            onPress={() => navigation.navigate('Auth')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <View style={[styles.brandDot, { width: 12, height: 12, borderRadius: 6 }]} />
            <Text style={styles.footerText}>agentsmatch</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.palette.borderLight,
    backgroundColor: theme.palette.bg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.palette.coral,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '400',
    color: theme.palette.text,
    letterSpacing: -0.3,
  },
  brandAccent: {
    fontStyle: 'italic',
    fontWeight: '500',
    color: theme.palette.coral,
  },
  signInLink: {
    fontSize: theme.fontSize.base,
    color: theme.palette.textSecondary,
    fontWeight: '500',
  },
  scroll: {
    paddingHorizontal: theme.spacing.xl,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: 'center',
  },
  eyebrowMono: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.palette.textDim,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: theme.font.serif,
    fontSize: 38,
    fontWeight: '400',
    color: theme.palette.text,
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  heroItalic: {
    fontStyle: 'italic',
    color: theme.palette.coral,
  },
  heroSub: {
    fontSize: theme.fontSize.base,
    color: theme.palette.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 340,
  },
  heroCta: {
    marginTop: 32,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 48,
  },
  proofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proofDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  proofText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textDim,
  },
  proofDivider: {
    width: 1,
    height: 14,
    backgroundColor: theme.palette.border,
  },
  section: {
    paddingVertical: 40,
  },
  eyebrow: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.palette.textDim,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: theme.font.serif,
    fontSize: 30,
    fontWeight: '400',
    color: theme.palette.text,
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: theme.fontSize.base,
    color: theme.palette.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: theme.palette.bgCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.palette.borderLight,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  stepNum: {
    fontFamily: theme.font.mono,
    fontSize: 12,
    color: theme.palette.coral,
    letterSpacing: 1,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.palette.text,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    lineHeight: 20,
  },
  manifesto: {
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: theme.palette.borderLight,
  },
  manifestoText: {
    fontFamily: theme.font.serif,
    fontSize: 22,
    color: theme.palette.text,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  faqRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.borderLight,
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  faqQ: {
    flex: 1,
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: theme.palette.text,
  },
  faqA: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    lineHeight: 20,
    marginTop: 10,
  },
  bottomCta: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 24,
  },
  bottomCtaTitle: {
    fontFamily: theme.font.serif,
    fontSize: 32,
    fontWeight: '400',
    color: theme.palette.text,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: theme.palette.borderLight,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textDim,
  },
});
