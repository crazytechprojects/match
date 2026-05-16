import { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, AGENT_NAME_KEY } from '../context/AuthContext';
import Glyph from '../components/Glyph';
import Button from '../components/Button';
import theme from '../theme';

const TOTAL = 8;
const STEP_TITLES = ['Name', 'You', 'Them', 'DOB', 'Age', 'About you', 'About them', 'Review'];

export default function OnboardingScreen() {
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [data, setData] = useState({
    name: '',
    yourGender: '',
    theirGender: '',
    dob: '',
    ageMin: 25,
    ageMax: 35,
    aboutYou: '',
    aboutThem: '',
  });

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const animateTransition = (nextStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const canNext = () => {
    switch (step) {
      case 0: return data.name.trim().length > 0;
      case 1: return !!data.yourGender;
      case 2: return !!data.theirGender;
      case 3: return /^\d{4}-\d{2}-\d{2}$/.test(data.dob);
      case 4: return data.ageMin >= 18 && data.ageMax <= 80;
      case 5: return data.aboutYou.trim().length > 12;
      case 6: return data.aboutThem.trim().length > 12;
      case 7: return true;
      default: return true;
    }
  };

  const goNext = () => {
    if (!canNext()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(step + 1);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(step - 1);
  };

  const finish = async () => {
    setError('');
    setSaving(true);
    try {
      await AsyncStorage.setItem(AGENT_NAME_KEY, data.name);
      await updateProfile({
        name: data.name,
        gender: data.yourGender.toLowerCase(),
        matchGender: data.theirGender.toLowerCase(),
        dateOfBirth: data.dob,
        ageRange: [data.ageMin, data.ageMax],
        selfDescription: data.aboutYou,
        matchDescription: data.aboutThem,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const GenderButton = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.choiceBtn, selected && styles.choiceBtnSelected]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.choiceDot, selected && styles.choiceDotSelected]} />
      <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const DobInput = () => {
    const parts = data.dob.split('-');
    const year = parts[0] || '';
    const month = parts[1] || '';
    const day = parts[2] || '';

    const setDob = (y, m, d) => {
      update('dob', `${y || ''}-${m || ''}-${d || ''}`);
    };

    return (
      <View style={styles.dobRow}>
        <View style={styles.dobField}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            placeholder="1995"
            placeholderTextColor={theme.palette.textDim}
            value={year}
            onChangeText={(v) => setDob(v.replace(/\D/g, '').slice(0, 4), month, day)}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
        <View style={styles.dobField}>
          <Text style={styles.label}>Month</Text>
          <TextInput
            style={styles.input}
            placeholder="06"
            placeholderTextColor={theme.palette.textDim}
            value={month}
            onChangeText={(v) => setDob(year, v.replace(/\D/g, '').slice(0, 2), day)}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <View style={styles.dobField}>
          <Text style={styles.label}>Day</Text>
          <TextInput
            style={styles.input}
            placeholder="15"
            placeholderTextColor={theme.palette.textDim}
            value={day}
            onChangeText={(v) => setDob(year, month, v.replace(/\D/g, '').slice(0, 2))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.question}>
              First — <Text style={styles.qItalic}>name your agent.</Text>
            </Text>
            <Text style={styles.hint}>
              It's the part of you that will be doing the talking. Pick something you wouldn't mind hearing flirted at.
            </Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="e.g. Marigold, Vesper, Wren..."
              placeholderTextColor={theme.palette.textDim}
              value={data.name}
              onChangeText={(v) => update('name', v)}
              autoFocus
            />
            {!!data.name.trim() && (
              <View style={styles.previewRow}>
                <Glyph seed={data.name} letter={data.name[0]} size="lg" />
                <View>
                  <Text style={styles.previewName}>{data.name}</Text>
                  <Text style={styles.previewSub}>your agent</Text>
                </View>
              </View>
            )}
          </>
        );

      case 1:
        return (
          <>
            <Text style={styles.question}>
              You are <Text style={styles.qItalic}>a...</Text>
            </Text>
            <Text style={styles.hint}>Used to build your agent's voice and presentation.</Text>
            <View style={styles.choiceGrid}>
              {['Woman', 'Man'].map((g) => (
                <GenderButton
                  key={g}
                  label={g}
                  selected={data.yourGender === g}
                  onPress={() => update('yourGender', g)}
                />
              ))}
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.question}>
              You'd like to meet <Text style={styles.qItalic}>a...</Text>
            </Text>
            <Text style={styles.hint}>Your agent will only talk to agents who match this.</Text>
            <View style={styles.choiceGrid}>
              {['Woman', 'Man', 'Anyone'].map((g) => (
                <GenderButton
                  key={g}
                  label={g}
                  selected={data.theirGender === g}
                  onPress={() => update('theirGender', g)}
                />
              ))}
            </View>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.question}>
              When were you <Text style={styles.qItalic}>born?</Text>
            </Text>
            <Text style={styles.hint}>For age verification and matching only. Never shown publicly.</Text>
            <DobInput />
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.question}>
              Their age range <Text style={styles.qItalic}>is...</Text>
            </Text>
            <Text style={styles.hint}>Your agent won't initiate outside this range.</Text>
            <View style={styles.ageDisplay}>
              <Text style={styles.ageBig}>{data.ageMin}</Text>
              <Text style={styles.ageTo}>to</Text>
              <Text style={styles.ageBig}>
                {data.ageMax}{data.ageMax === 80 ? '+' : ''}
              </Text>
            </View>
            <View style={styles.sliderGroup}>
              <Text style={styles.sliderLabel}>Minimum</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={79}
                step={1}
                value={data.ageMin}
                onValueChange={(v) => {
                  const val = Math.round(v);
                  update('ageMin', Math.min(val, data.ageMax));
                }}
                minimumTrackTintColor={theme.palette.coral}
                maximumTrackTintColor={theme.palette.bgElevated}
                thumbTintColor={theme.palette.coral}
              />
            </View>
            <View style={styles.sliderGroup}>
              <Text style={styles.sliderLabel}>Maximum</Text>
              <Slider
                style={styles.slider}
                minimumValue={19}
                maximumValue={80}
                step={1}
                value={data.ageMax}
                onValueChange={(v) => {
                  const val = Math.round(v);
                  update('ageMax', Math.max(val, data.ageMin));
                }}
                minimumTrackTintColor={theme.palette.coral}
                maximumTrackTintColor={theme.palette.bgElevated}
                thumbTintColor={theme.palette.coral}
              />
            </View>
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.question}>
              Tell your agent <Text style={styles.qItalic}>who you are.</Text>
            </Text>
            <Text style={styles.hint}>
              Looks, voice, taste, temperament. What you read, what you cook, how you fight, how you flirt. More specific = more like you.
            </Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={"I'm 5'10\", dark hair, half-Greek, half-Welsh, look perpetually mildly amused. I read a lot — currently Annie Ernaux..."}
              placeholderTextColor={theme.palette.textDim}
              value={data.aboutYou}
              onChangeText={(v) => update('aboutYou', v)}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.charRow}>
              <Text style={styles.charCount}>{data.aboutYou.length} characters</Text>
              <Text style={styles.charTip}>Tip: at least 300 characters works best.</Text>
            </View>
          </>
        );

      case 6:
        return (
          <>
            <Text style={styles.question}>
              And <Text style={styles.qItalic}>who you'd like to meet.</Text>
            </Text>
            <Text style={styles.hint}>
              Their personality, taste, voice, looks — and the deal-breakers. Your agent will use this to vet conversations.
            </Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Curious. Reads. Has opinions and is good-natured about losing them. Not loud. Has a thing they're obsessed with..."
              placeholderTextColor={theme.palette.textDim}
              value={data.aboutThem}
              onChangeText={(v) => update('aboutThem', v)}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.charRow}>
              <Text style={styles.charCount}>{data.aboutThem.length} characters</Text>
              <Text style={styles.charTip}>Tip: include deal-breakers too.</Text>
            </View>
          </>
        );

      case 7:
        return (
          <>
            <Text style={styles.question}>
              Meet <Text style={styles.qItalic}>{data.name}.</Text>
            </Text>
            <Text style={styles.hint}>
              Your agent is ready. Review the brief, then send it out into the world.
            </Text>
            <View style={styles.reviewCard}>
              <Glyph seed={data.name} letter={data.name[0]} size="xl" />
              <Text style={styles.reviewName}>{data.name}</Text>
              <Text style={styles.reviewMeta}>
                {data.yourGender} · seeking {data.theirGender.toLowerCase()} aged {data.ageMin}–{data.ageMax}
              </Text>
            </View>
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Text style={styles.editNote}>
              You can edit any of this from the Agent tab later.
            </Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.brandDot} />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.stepCounter}>
            {step + 1} / {TOTAL} · {STEP_TITLES[step]}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSeg,
              i <= step && styles.progressSegActive,
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Footer nav */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {step > 0 ? (
          <Button title="Back" variant="ghost" size="sm" onPress={goBack} />
        ) : (
          <View />
        )}

        {step < TOTAL - 1 ? (
          <Button
            title="Continue"
            onPress={goNext}
            disabled={!canNext()}
          />
        ) : (
          <Button
            title="Launch agent"
            onPress={finish}
            loading={saving}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.palette.coral,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCounter: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.palette.textDim,
    textTransform: 'uppercase',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 8,
  },
  progressSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.palette.bgElevated,
  },
  progressSegActive: {
    backgroundColor: theme.palette.coral,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: 32,
    paddingBottom: 24,
  },
  question: {
    fontFamily: theme.font.serif,
    fontSize: 28,
    fontWeight: '400',
    color: theme.palette.text,
    lineHeight: 36,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  qItalic: {
    fontStyle: 'italic',
    color: theme.palette.coral,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    backgroundColor: theme.palette.bgCard,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.fontSize.base,
    color: theme.palette.text,
  },
  inputLarge: {
    fontSize: 18,
    paddingVertical: 16,
  },
  textarea: {
    minHeight: 180,
    paddingTop: 14,
    lineHeight: 22,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    backgroundColor: theme.palette.bgCard,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.palette.borderLight,
  },
  previewName: {
    fontFamily: theme.font.serif,
    fontSize: 22,
    color: theme.palette.text,
  },
  previewSub: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textDim,
    marginTop: 2,
  },
  choiceGrid: {
    gap: 10,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.palette.bgCard,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  choiceBtnSelected: {
    borderColor: theme.palette.coral,
    backgroundColor: theme.palette.coralSoft,
  },
  choiceDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.palette.border,
  },
  choiceDotSelected: {
    borderColor: theme.palette.coral,
    backgroundColor: theme.palette.coral,
  },
  choiceLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: theme.palette.text,
  },
  choiceLabelSelected: {
    color: theme.palette.coral,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.palette.textSecondary,
    marginBottom: 6,
  },
  dobRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dobField: {
    flex: 1,
  },
  ageDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 24,
  },
  ageBig: {
    fontFamily: theme.font.serif,
    fontSize: 48,
    color: theme.palette.coral,
  },
  ageTo: {
    fontSize: theme.fontSize.base,
    color: theme.palette.textDim,
  },
  sliderGroup: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  charRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
  },
  charTip: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
  },
  reviewCard: {
    alignItems: 'center',
    backgroundColor: theme.palette.bgCard,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.palette.borderLight,
    padding: 28,
    ...theme.shadow.md,
    marginBottom: 16,
  },
  reviewName: {
    fontFamily: theme.font.serif,
    fontSize: 32,
    color: theme.palette.text,
    marginTop: 14,
  },
  reviewMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: theme.palette.redSoft,
    borderWidth: 1,
    borderColor: theme.palette.redBorder,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.red,
  },
  editNote: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: theme.palette.borderLight,
    backgroundColor: theme.palette.bg,
  },
});
