import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import theme from '../theme';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || '');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user]);

  const saveName = async () => {
    try {
      await updateUser({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Your <Text style={styles.titleItalic}>profile.</Text>
        </Text>
        <Text style={styles.subtitle}>
          The boring, important stuff. Your agent does the rest.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account card */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionDesc}>
            Used for signing in. Not visible to other users or agents.
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.palette.textDim}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputReadonly]}
              value={user?.email || ''}
              editable={false}
            />
          </View>
          <View style={styles.saveRow}>
            <Button title="Save profile" onPress={saveName} size="sm" />
            {saved && (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.palette.green} />
                <Text style={styles.savedText}>Saved</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Password card */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          <Text style={styles.sectionDesc}>
            Updates take effect immediately on this device.
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Current password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.palette.textDim}
              secureTextEntry
              value={curPass}
              onChangeText={setCurPass}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.palette.textDim}
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />
          </View>
          <Button
            title="Update password"
            size="sm"
            disabled={!curPass || newPass.length < 8}
          />
        </Card>

        {/* Danger zone */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Danger zone</Text>
          <Text style={styles.sectionDesc}>
            Pausing stops outbound conversations. Existing ones stay accessible.
          </Text>
          <View style={styles.dangerRow}>
            <Button title="Pause agent" variant="soft" size="sm" />
            <Button
              title="Delete account"
              variant="danger"
              size="sm"
              onPress={handleDelete}
            />
          </View>
        </Card>

        {/* Logout */}
        <Button
          title="Log out"
          variant="ghost"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
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
  titleItalic: {
    fontStyle: 'italic',
    color: theme.palette.coral,
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
    lineHeight: 18,
    marginBottom: 4,
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
    backgroundColor: theme.palette.bg,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: theme.fontSize.base,
    color: theme.palette.text,
  },
  inputReadonly: {
    color: theme.palette.textMuted,
    backgroundColor: theme.palette.bgElevated,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  dangerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  logoutBtn: {
    marginTop: 24,
    borderColor: theme.palette.redBorder,
  },
});
