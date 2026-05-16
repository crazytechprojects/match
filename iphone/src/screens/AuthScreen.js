import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import theme from '../theme';

export default function AuthScreen({ navigation }) {
  const { login, signup } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.palette.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <View style={styles.brandDot} />
        </View>

        <Text style={styles.title}>
          {mode === 'signin' ? 'Welcome ' : 'Get an '}
          <Text style={styles.titleItalic}>
            {mode === 'signin' ? 'back.' : 'agent.'}
          </Text>
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signin'
            ? 'Sign in to your agent.'
            : 'Takes a minute. Your agent is waiting.'}
        </Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={theme.palette.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.palette.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passWrap}>
              <TextInput
                style={[styles.input, { flex: 1, paddingRight: 44 }]}
                placeholder="••••••••"
                placeholderTextColor={theme.palette.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass(!showPass)}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.palette.textDim}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title={loading
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
              : (mode === 'signin' ? 'Sign in' : 'Create my account')
            }
            onPress={submit}
            loading={loading}
            disabled={!email.trim() || !password.trim()}
          />

          <TouchableOpacity
            style={styles.toggle}
            onPress={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            <Text style={styles.toggleText}>
              {mode === 'signin' ? 'New here? ' : 'Already have an agent? '}
              <Text style={styles.toggleLink}>
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: 32,
    paddingBottom: 60,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.coral,
  },
  title: {
    fontFamily: theme.font.serif,
    fontSize: 32,
    fontWeight: '400',
    color: theme.palette.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: theme.palette.coral,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.palette.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.palette.redSoft,
    borderWidth: 1,
    borderColor: theme.palette.redBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.palette.red,
  },
  form: {
    gap: 18,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.palette.textSecondary,
    letterSpacing: 0.2,
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
  passWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  toggle: {
    alignItems: 'center',
    paddingTop: 8,
  },
  toggleText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
  },
  toggleLink: {
    color: theme.palette.coral,
    fontWeight: '500',
  },
});
