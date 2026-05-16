import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth, AGENT_NAME_KEY } from '../context/AuthContext';
import * as api from '../api';
import Glyph from '../components/Glyph';
import StatusDot from '../components/StatusDot';
import Button from '../components/Button';
import Card from '../components/Card';
import theme from '../theme';

function capitalize(s) {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const GENDER_OPTIONS = ['woman', 'man'];

function GenderPicker({ value, onChange }) {
  return (
    <View style={styles.genderRow}>
      {GENDER_OPTIONS.map((g) => {
        const selected = value === g;
        return (
          <Button
            key={g}
            variant={selected ? 'primary' : 'soft'}
            size="sm"
            title={capitalize(g)}
            onPress={() => onChange(g)}
            style={[styles.genderBtn, selected && styles.genderBtnSelected]}
            textStyle={selected ? { color: theme.palette.textOnCoral } : { color: theme.palette.text }}
          />
        );
      })}
    </View>
  );
}

export default function AgentScreen({ navigation }) {
  const { user, token, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [agentStatus, setAgentStatus] = useState(null);
  const [agentName, setAgentName] = useState(user?.name || 'Your agent');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [gender, setGender] = useState(user?.gender || '');
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [selfDesc, setSelfDesc] = useState(user?.self_description || '');
  const [matchDesc, setMatchDesc] = useState(user?.match_description || '');

  const isNew = !user?.onboarded;

  useEffect(() => {
    AsyncStorage.getItem(AGENT_NAME_KEY).then((n) => {
      if (n) setAgentName(n);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setGender(user.gender || '');
      setDob(user.date_of_birth || '');
      setSelfDesc(user.self_description || '');
      setMatchDesc(user.match_description || '');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      api.getAgentStatus(token).then(setAgentStatus).catch(() => {});
    }
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: user?.name,
        gender: gender,
        matchGender: user?.match_gender,
        dateOfBirth: dob || undefined,
        ageRange: [user?.age_range_min ?? 18, user?.age_range_max ?? 80],
        selfDescription: selfDesc,
        matchDescription: matchDesc,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (isNew) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Your <Text style={styles.titleItalic}>agent.</Text>
          </Text>
          <Text style={styles.subtitle}>No agent yet.</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sparkles" size={28} color={theme.palette.coral} />
          </View>
          <Text style={styles.emptyTitle}>
            No agent <Text style={styles.titleItalic}>yet.</Text>
          </Text>
          <Text style={styles.emptyDesc}>
            Build your agent to start showing up in conversations.
          </Text>
          <Button
            title="Create my agent"
            size="lg"
            onPress={() => navigation.getParent()?.navigate('Onboarding')}
          />
        </View>
      </View>
    );
  }

  const age = user?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(user.date_of_birth).getTime()) /
          (365.25 * 24 * 3600 * 1000),
      )
    : '—';

  const ageMin = user?.age_range_min ?? 18;
  const ageMax = user?.age_range_max ?? 80;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Your <Text style={styles.titleItalic}>agent.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Edit your agent's brief. Changes apply to new conversations.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Agent identity card */}
        <Card style={styles.identityCard}>
          <View style={styles.identityRow}>
            <Glyph seed={agentName} letter={agentName[0]} size="xl" />
            <View style={styles.identityInfo}>
              <Text style={styles.agentName}>{agentName}</Text>
              <Text style={styles.agentMeta}>
                {capitalize(user?.gender)} · age {age} · seeking{' '}
                {(user?.match_gender || '').toLowerCase()} aged {ageMin}–
                {ageMax}
                {ageMax === 80 ? '+' : ''}
              </Text>
              <View style={styles.pillRow}>
                {agentStatus?.is_active ? (
                  <View style={styles.activePill}>
                    <StatusDot status="green" size={6} />
                    <Text style={styles.pillText}>Active</Text>
                  </View>
                ) : (
                  <View style={styles.idlePill}>
                    <View style={styles.idleDot} />
                    <Text style={styles.pillText}>Idle</Text>
                  </View>
                )}
                <View style={styles.convPill}>
                  <Text style={styles.pillText}>
                    {agentStatus?.total_conversations ?? 0} live conversations
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Editable fields */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>You</Text>
          <Text style={styles.sectionDesc}>
            How your agent describes you. Edit any field and hit save.
          </Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <GenderPicker value={gender} onChange={setGender} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date of birth</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.palette.textDim}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Self-portrait</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={selfDesc}
              onChangeText={setSelfDesc}
              placeholder="Describe yourself — looks, voice, taste, temperament..."
              placeholderTextColor={theme.palette.textDim}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{selfDesc.length} characters</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Who you'd like to meet</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={matchDesc}
              onChangeText={setMatchDesc}
              placeholder="Describe who you're looking for — personality, taste, deal-breakers..."
              placeholderTextColor={theme.palette.textDim}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{matchDesc.length} characters</Text>
          </View>

          <View style={styles.saveRow}>
            <Button
              title={saving ? 'Saving...' : 'Save changes'}
              onPress={handleSave}
              loading={saving}
            />
            {saved && (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.palette.green} />
                <Text style={styles.savedText}>Saved</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  titleItalic: {
    fontStyle: 'italic',
    color: theme.palette.coral,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  scroll: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 40,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: theme.spacing.xxl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.palette.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: theme.font.serif,
    fontSize: 24,
    color: theme.palette.text,
  },
  emptyDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  identityCard: {
    marginTop: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  identityInfo: {
    flex: 1,
  },
  agentName: {
    fontFamily: theme.font.serif,
    fontSize: 30,
    color: theme.palette.text,
    lineHeight: 34,
  },
  agentMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  idlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.palette.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  idleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.palette.textDim,
  },
  convPill: {
    backgroundColor: theme.palette.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  pillText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.palette.textSecondary,
  },
  section: {
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
    marginBottom: 4,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.palette.textSecondary,
    letterSpacing: 0.2,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
  },
  genderBtnSelected: {},
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
  textarea: {
    minHeight: 120,
    paddingTop: 12,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
    marginTop: 2,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.green,
    fontWeight: '500',
  },
});
