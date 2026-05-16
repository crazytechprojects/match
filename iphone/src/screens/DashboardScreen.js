import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, AGENT_NAME_KEY } from '../context/AuthContext';
import * as api from '../api';
import Glyph from '../components/Glyph';
import StatusDot from '../components/StatusDot';
import Button from '../components/Button';
import Card from '../components/Card';
import theme from '../theme';

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d`;
}

const TAB_CONFIG = [
  { key: 'green', label: 'Green', color: theme.palette.green },
  { key: 'yellow', label: 'Yellow', color: theme.palette.yellow },
  { key: 'red', label: 'Red', color: theme.palette.red },
];

export default function DashboardScreen({ navigation }) {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('green');
  const [conversations, setConversations] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [agentName, setAgentName] = useState(user?.name || 'Your agent');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [convData, statusData] = await Promise.all([
        api.listConversations(token),
        api.getAgentStatus(token),
      ]);
      setConversations(convData.conversations || []);
      setAgentStatus(statusData);
    } catch (err) {
      console.warn('Failed to fetch dashboard data', err);
    }
  }, [token]);

  useEffect(() => {
    AsyncStorage.getItem(AGENT_NAME_KEY).then((n) => {
      if (n) setAgentName(n);
    });
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const counts = {
    green: agentStatus?.green_count ?? conversations.filter((c) => c.status === 'green').length,
    yellow: agentStatus?.yellow_count ?? conversations.filter((c) => c.status === 'yellow').length,
    red: agentStatus?.red_count ?? conversations.filter((c) => c.status === 'red').length,
  };

  const filtered = conversations.filter((c) => c.status === tab);
  const isNew = !user?.onboarded;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {isNew ? (
              <>Hi <Text style={styles.titleItalic}>{user?.name || 'there'}.</Text></>
            ) : (
              <>Your <Text style={styles.titleItalic}>conversations.</Text></>
            )}
          </Text>
          <Text style={styles.subtitle}>
            {isNew
              ? 'Build your agent to start seeing conversations.'
              : 'Greens are mutual. Yellows are theirs to refuse. Reds are archived.'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.palette.coral}
          />
        }
      >
        {/* Stat tiles */}
        <View style={styles.statGrid}>
          <TouchableOpacity
            style={[styles.statCard, { borderColor: theme.palette.greenBorder }]}
            onPress={() => !isNew && setTab('green')}
            activeOpacity={0.7}
          >
            <View style={styles.statHeader}>
              <StatusDot status="green" />
              <Text style={styles.statLabel}>Green · matched</Text>
            </View>
            <Text style={styles.statNum}>{counts.green}</Text>
            <Text style={styles.statSub}>Both said yes. Your move.</Text>
          </TouchableOpacity>

          <View style={styles.statRow}>
            <TouchableOpacity
              style={[styles.statCard, styles.statHalf, { borderColor: theme.palette.yellowBorder }]}
              onPress={() => !isNew && setTab('yellow')}
              activeOpacity={0.7}
            >
              <View style={styles.statHeader}>
                <StatusDot status="yellow" />
                <Text style={styles.statLabel}>Yellow</Text>
              </View>
              <Text style={[styles.statNum, styles.statNumSmall]}>{counts.yellow}</Text>
              <Text style={styles.statSub}>Rejected</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, styles.statHalf, { borderColor: theme.palette.redBorder }]}
              onPress={() => !isNew && setTab('red')}
              activeOpacity={0.7}
            >
              <View style={styles.statHeader}>
                <StatusDot status="red" />
                <Text style={styles.statLabel}>Red</Text>
              </View>
              <Text style={[styles.statNum, styles.statNumSmall]}>{counts.red}</Text>
              <Text style={styles.statSub}>Mutual no</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isNew ? (
          /* Empty / new user state */
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="sparkles" size={28} color={theme.palette.coral} />
            </View>
            <Text style={styles.emptyTitle}>
              Your agent is <Text style={styles.titleItalic}>waiting.</Text>
            </Text>
            <Text style={styles.emptyDesc}>
              Build your agent to start showing up in conversations. It does the talking — you see what matters.
            </Text>
            <Button
              title="Create my agent"
              size="lg"
              onPress={() => navigation.navigate('Onboarding')}
            />

            <View style={styles.infoGrid}>
              {[
                { big: '~5 min', desc: 'to build your agent' },
                { big: '~36 hrs', desc: 'before first conversations' },
                { big: '0 swipes', desc: 'required, ever' },
              ].map((item) => (
                <Card key={item.big} style={styles.infoCard}>
                  <Text style={styles.infoBig}>{item.big}</Text>
                  <Text style={styles.infoDesc}>{item.desc}</Text>
                </Card>
              ))}
            </View>
          </View>
        ) : (
          /* Conversation list */
          <View style={styles.listSection}>
            {/* Tabs */}
            <View style={styles.tabRow}>
              {TAB_CONFIG.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                  onPress={() => setTab(t.key)}
                  activeOpacity={0.7}
                >
                  <StatusDot status={t.key} size={6} />
                  <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
                    {t.label}
                  </Text>
                  <View style={[styles.tabCount, tab === t.key && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, tab === t.key && styles.tabCountTextActive]}>
                      {counts[t.key]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.activeInfo}>
              {agentName} is chatting with{' '}
              <Text style={{ color: theme.palette.text, fontWeight: '600' }}>
                {agentStatus?.active_count ?? 0}
              </Text>{' '}
              agents right now
            </Text>

            {/* List */}
            {filtered.length === 0 ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>
                  Nothing here yet. Your agent is still working.
                </Text>
              </View>
            ) : (
              filtered.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.convRow}
                  onPress={() => navigation.navigate('Conversation', { id: c.id })}
                  activeOpacity={0.7}
                >
                  <Glyph seed={c.match_name || '?'} letter={(c.match_name || '?')[0]} />
                  <View style={styles.convInfo}>
                    <View style={styles.convTop}>
                      <Text style={styles.convName} numberOfLines={1}>
                        {c.match_name}
                      </Text>
                      {c.match_age && (
                        <Text style={styles.convAge}>· {c.match_age}</Text>
                      )}
                      <Text style={styles.convMsgCount}>· {c.message_count} msgs</Text>
                    </View>
                    <Text style={styles.convLast} numberOfLines={1}>
                      {c.last_message}
                    </Text>
                  </View>
                  <View style={styles.convRight}>
                    {c.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{c.unread}</Text>
                      </View>
                    )}
                    <Text style={styles.convTime}>{relativeTime(c.last_message_time)}</Text>
                  </View>
                  <StatusDot status={c.status} size={8} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
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
    lineHeight: 18,
  },
  scroll: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 40,
  },
  statGrid: {
    marginTop: 20,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    backgroundColor: theme.palette.bgCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 16,
    ...theme.shadow.sm,
  },
  statHalf: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.palette.textMuted,
    letterSpacing: 0.3,
  },
  statNum: {
    fontFamily: theme.font.serif,
    fontSize: 36,
    color: theme.palette.text,
    lineHeight: 42,
  },
  statNumSmall: {
    fontSize: 28,
    lineHeight: 34,
  },
  statSub: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.palette.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: theme.font.serif,
    fontSize: 24,
    color: theme.palette.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  infoBig: {
    fontFamily: theme.font.serif,
    fontSize: 18,
    color: theme.palette.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 11,
    color: theme.palette.textMuted,
    textAlign: 'center',
  },
  listSection: {
    marginTop: 24,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.palette.bgElevated,
  },
  tabBtnActive: {
    backgroundColor: theme.palette.text,
  },
  tabLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.palette.textMuted,
  },
  tabLabelActive: {
    color: theme.palette.white,
  },
  tabCount: {
    backgroundColor: theme.palette.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.palette.textMuted,
  },
  tabCountTextActive: {
    color: theme.palette.white,
  },
  activeInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
    marginBottom: 16,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.palette.bgCard,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.palette.borderLight,
    ...theme.shadow.sm,
  },
  convInfo: {
    flex: 1,
    gap: 3,
  },
  convTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  convName: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.palette.text,
  },
  convAge: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textDim,
  },
  convMsgCount: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textDim,
  },
  convLast: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
  },
  convRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  convTime: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
  },
  unreadBadge: {
    backgroundColor: theme.palette.coral,
    borderRadius: theme.radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.palette.textOnCoral,
  },
});
