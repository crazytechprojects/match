import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth, AGENT_NAME_KEY } from '../context/AuthContext';
import * as api from '../api';
import Glyph from '../components/Glyph';
import StatusPill from '../components/StatusPill';
import theme from '../theme';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ConversationScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [agentName, setAgentName] = useState(user?.name || 'Your agent');

  useEffect(() => {
    AsyncStorage.getItem(AGENT_NAME_KEY).then((n) => {
      if (n) setAgentName(n);
    });
  }, []);

  const fetchConversation = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getConversation(token, id);
      setConv({
        id: data.id,
        status: data.status,
        matchName: data.match_name || 'Unknown',
        matchAge: data.match_age,
        matchGender: data.match_gender,
        humanChatStarted: data.human_chat_started,
      });

      const mapped = (data.messages || []).map((msg) => {
        let who, name;
        if (msg.sender_type === 'my-agent') {
          who = 'b';
          name = agentName;
        } else if (msg.sender_type === 'their-agent') {
          who = 'a';
          name = (data.match_name || 'Unknown') + "'s agent";
        } else if (msg.sender_type === 'human-self') {
          who = 'human';
          name = 'You';
        } else if (msg.sender_type === 'human-match') {
          who = 'them-human';
          name = data.match_name || 'Unknown';
        } else {
          who = 'a';
          name = 'Unknown';
        }
        return {
          id: msg.id || String(Math.random()),
          who,
          name,
          text: msg.text,
          time: formatTime(msg.created_at),
          isAi: msg.is_ai,
        };
      });

      const aiToHumanIdx = mapped.findIndex((m) => !m.isAi);
      if (aiToHumanIdx > 0 && data.status === 'green') {
        mapped.splice(aiToHumanIdx, 0, {
          id: 'system-handover',
          who: 'system',
          text: 'Both agents flagged this a match. Handing over to humans.',
        });
      }

      setMessages(mapped);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [token, id, agentName]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    if (conv?.status === 'green' && conv?.humanChatStarted) {
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [conv?.status, conv?.humanChatStarted, fetchConversation]);

  const send = async () => {
    if (!draft.trim() || conv?.status !== 'green') return;
    const text = draft.trim();
    setDraft('');
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await api.sendMessage(token, id, text);
      await fetchConversation();
    } catch (err) {
      console.warn('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  if (!conv) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>{loadError || 'Loading...'}</Text>
      </View>
    );
  }

  const status = conv.status;
  const isGreen = status === 'green';
  const matchName = conv.matchName;
  const matchFirst = matchName.split(' ')[0];

  const verdictBanner = () => {
    const bgColor = isGreen
      ? theme.palette.greenSoft
      : status === 'yellow'
      ? theme.palette.yellowSoft
      : theme.palette.redSoft;
    const borderCol = isGreen
      ? theme.palette.greenBorder
      : status === 'yellow'
      ? theme.palette.yellowBorder
      : theme.palette.redBorder;

    return (
      <View style={[styles.verdictCard, { backgroundColor: bgColor, borderColor: borderCol }]}>
        <Text style={styles.verdictTitle}>
          {isGreen && 'Both agents said yes.'}
          {status === 'yellow' && `${agentName} said yes. ${matchFirst}'s agent said no.`}
          {status === 'red' && 'Both agents said no.'}
        </Text>
        <Text style={styles.verdictSub}>
          {isGreen && "Your messages are clearly marked as you. The agents are out of the room."}
          {status === 'yellow' && "You can read the transcript. No replying — it wouldn't be welcome."}
          {status === 'red' && 'Kept for the curious. Read-only.'}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item: m }) => {
    if (m.who === 'system') {
      return (
        <View style={styles.systemMsg}>
          <Text style={styles.systemText}>{m.text}</Text>
        </View>
      );
    }

    const isMine = m.who === 'b' || m.who === 'human';
    const isHumanSelf = m.who === 'human';
    const isHumanMatch = m.who === 'them-human';

    return (
      <View style={[styles.msgRow, isMine && styles.msgRowRight]}>
        {!isMine && (
          <Glyph
            seed={isHumanMatch ? matchName : matchName + '-agent'}
            letter={(m.name || '?')[0]}
            size="sm"
          />
        )}
        <View style={[styles.msgContent, isMine && styles.msgContentRight]}>
          <View style={[styles.msgMeta, isMine && styles.msgMetaRight]}>
            {isHumanSelf && <View style={styles.youPill}><Text style={styles.youPillText}>YOU</Text></View>}
            {isHumanMatch && <View style={[styles.youPill, styles.humanPill]}><Text style={styles.youPillText}>HUMAN</Text></View>}
            {!isHumanSelf && !isHumanMatch && (
              <Text style={styles.metaAgent}>agent</Text>
            )}
            <Text style={styles.metaName}>{m.name}</Text>
          </View>
          <View
            style={[
              styles.bubble,
              isMine
                ? (isHumanSelf ? styles.bubbleHuman : styles.bubbleMine)
                : (isHumanMatch ? styles.bubbleThemHuman : styles.bubbleThem),
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                (isHumanSelf || isHumanMatch) && styles.bubbleTextHuman,
              ]}
            >
              {m.text}
            </Text>
          </View>
          {m.time && <Text style={styles.timeText}>{m.time}</Text>}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.palette.text} />
        </TouchableOpacity>
        <Glyph seed={matchName} letter={matchName[0]} size="sm" />
        <View style={styles.headerInfo}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName} numberOfLines={1}>{matchName}</Text>
            {conv.matchAge && (
              <Text style={styles.headerAge}>· {conv.matchAge}</Text>
            )}
            <StatusPill status={status} />
          </View>
          <Text style={styles.headerSub} numberOfLines={1}>
            {matchFirst}'s agent ↔ {agentName} · {messages.filter((m) => m.who !== 'system').length} messages
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        ListHeaderComponent={verdictBanner}
        contentContainerStyle={styles.feed}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      {/* Composer / Read-only bar */}
      {isGreen ? (
        <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.composerLabel}>
            <View style={styles.composerPill}>
              <Text style={styles.composerPillText}>YOU</Text>
            </View>
            <Text style={styles.composerHint}>
              Speaking as yourself — your agent is out of the room.
            </Text>
          </View>
          <View style={styles.composerRow}>
            <TextInput
              style={styles.composerInput}
              placeholder={`Message ${matchFirst}...`}
              placeholderTextColor={theme.palette.textDim}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
              onPress={send}
              disabled={!draft.trim() || sending}
            >
              <Ionicons
                name="arrow-up-circle"
                size={32}
                color={draft.trim() ? theme.palette.coral : theme.palette.textDim}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.readonlyBar,
            { paddingBottom: insets.bottom + 12 },
            status === 'yellow'
              ? { backgroundColor: theme.palette.yellowSoft }
              : { backgroundColor: theme.palette.redSoft },
          ]}
        >
          <Ionicons name="lock-closed" size={14} color={theme.palette.textMuted} />
          <Text style={styles.readonlyText}>
            {status === 'yellow'
              ? 'Read-only — the other agent declined this match.'
              : 'Read-only — both agents declined.'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.palette.textMuted,
    fontSize: theme.fontSize.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.palette.borderLight,
    backgroundColor: theme.palette.bgCard,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerName: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.palette.text,
    flexShrink: 1,
  },
  headerAge: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textDim,
  },
  headerSub: {
    fontSize: theme.fontSize.xs,
    color: theme.palette.textDim,
  },
  feed: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  verdictCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  verdictTitle: {
    fontFamily: theme.font.serif,
    fontSize: 18,
    color: theme.palette.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  verdictSub: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  systemMsg: {
    alignSelf: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.palette.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginVertical: 12,
  },
  systemText: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.palette.textDim,
    letterSpacing: 0.5,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    maxWidth: '85%',
  },
  msgRowRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgContent: {
    gap: 4,
    alignItems: 'flex-start',
  },
  msgContentRight: {
    alignItems: 'flex-end',
  },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  msgMetaRight: {
    flexDirection: 'row-reverse',
  },
  metaAgent: {
    fontSize: 11,
    color: theme.palette.textDim,
  },
  metaName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.palette.textSecondary,
  },
  youPill: {
    backgroundColor: theme.palette.coral,
    borderRadius: theme.radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  humanPill: {
    backgroundColor: theme.palette.text,
  },
  youPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.palette.white,
    letterSpacing: 0.5,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  bubbleMine: {
    backgroundColor: theme.palette.coralSoft,
    borderBottomRightRadius: 6,
  },
  bubbleThem: {
    backgroundColor: theme.palette.bgElevated,
    borderBottomLeftRadius: 6,
  },
  bubbleHuman: {
    backgroundColor: theme.palette.coral,
    borderBottomRightRadius: 6,
  },
  bubbleThemHuman: {
    backgroundColor: theme.palette.text,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: theme.fontSize.base,
    color: theme.palette.text,
    lineHeight: 20,
  },
  bubbleTextHuman: {
    color: theme.palette.white,
  },
  timeText: {
    fontSize: 10,
    color: theme.palette.textDim,
  },
  composer: {
    borderTopWidth: 0.5,
    borderTopColor: theme.palette.borderLight,
    backgroundColor: theme.palette.bgCard,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 10,
  },
  composerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  composerPill: {
    backgroundColor: theme.palette.coral,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  composerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.palette.textOnCoral,
    letterSpacing: 0.5,
  },
  composerHint: {
    fontSize: 11,
    color: theme.palette.textDim,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  composerInput: {
    flex: 1,
    backgroundColor: theme.palette.bgElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: theme.fontSize.base,
    color: theme.palette.text,
    maxHeight: 120,
  },
  sendBtn: {},
  sendBtnDisabled: {
    opacity: 0.4,
  },
  readonlyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
  },
  readonlyText: {
    fontSize: theme.fontSize.sm,
    color: theme.palette.textMuted,
  },
});
