import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  User,
  Send,
  Lock,
  Sparkles,
  Circle,
  MessageCircle,
  Info,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AvatarCircle from "../components/AvatarCircle";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";

const statusConfig = {
  green: {
    label: "Match",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    desc: "Both agents agreed this is a great match!",
  },
  yellow: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    desc: "Your agent liked this match, but their agent didn't agree.",
  },
  red: {
    label: "No Match",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-400",
    desc: "Both agents determined this isn't a compatible match.",
  },
};

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const fetchConversation = useCallback(async () => {
    try {
      const data = await api.getConversation(token, id);
      const mapped = {
        id: data.id,
        status: data.status,
        matchName: data.match_name || "Unknown",
        matchAge: data.match_age,
        matchGender: data.match_gender,
        humanChatStarted: data.human_chat_started,
      };
      const mappedMsgs = (data.messages || []).map((m) => ({
        id: m.id,
        sender: m.sender_type,
        text: m.text,
        isAI: m.is_ai,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setConversation(mapped);
      setMessages(mappedMsgs);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [token, id]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    if (conversation?.status === "green" && conversation?.humanChatStarted) {
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [conversation?.status, conversation?.humanChatStarted, fetchConversation]);

  const isGreen = conversation?.status === "green";
  const canChat = isGreen;
  const config = conversation ? statusConfig[conversation.status] : null;

  const hasHumanMessages = useMemo(
    () => messages.some((m) => !m.isAI),
    [messages]
  );

  const aiTransitionIndex = useMemo(() => {
    const idx = messages.findIndex((m) => !m.isAI);
    return idx === -1 ? -1 : idx;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-surface-700 mx-auto mb-4" />
            <p className="text-surface-400">{loadError || "Loading..."}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-primary-400 hover:text-primary-300 text-sm cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !canChat) return;
    const text = newMessage.trim();
    setNewMessage("");
    try {
      await api.sendMessage(token, id, text);
      await fetchConversation();
    } catch (err) {
      console.error("Failed to send message", err);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Navbar />

      {/* Chat Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 -ml-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <AvatarCircle name={conversation.matchName} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{conversation.matchName}</span>
                <span className="text-xs text-surface-500">
                  {conversation.matchAge}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color} border ${config.border}`}
                >
                  <Circle className="w-1.5 h-1.5 fill-current" />
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-surface-500 truncate">
                {config.desc}
              </p>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showInfo
                  ? "bg-primary-500/20 text-primary-400"
                  : "hover:bg-surface-800 text-surface-400"
              }`}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[7.5rem] left-0 right-0 z-30 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className={`p-4 rounded-xl ${config.bg} border ${config.border} mt-2`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Bot className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${config.color}`}>
                      {conversation.status === "green" &&
                        "Mutual Match — Both AI agents agreed this is a great connection. You can now chat directly!"}
                      {conversation.status === "yellow" &&
                        "One-Sided — Your agent thinks this is a good match, but their agent disagreed. You can read the conversation but cannot send messages."}
                      {conversation.status === "red" &&
                        "No Match — Your agent determined this isn't a compatible match. You can review the conversation to understand why."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 pt-32 pb-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* AI conversation header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/50 border border-surface-700/50 text-surface-400 text-xs">
              <Bot className="w-3.5 h-3.5" />
              AI Agent Conversation
            </div>
          </div>

          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isMyAgent = msg.sender === "my-agent";
              const isMyHuman = msg.sender === "human-self";
              const isRight = isMyAgent || isMyHuman;
              const showTransition =
                aiTransitionIndex !== -1 && idx === aiTransitionIndex;

              return (
                <div key={msg.id}>
                  {/* Transition divider */}
                  {showTransition && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      className="flex items-center gap-3 my-8"
                    >
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium">
                        <User className="w-3.5 h-3.5" />
                        Human Chat Started
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isRight ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[80%] ${
                        isRight ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 mb-5">
                        {isRight ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                            {msg.isAI ? (
                              <Bot className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-surface-600 to-surface-700 flex items-center justify-center">
                            {msg.isAI ? (
                              <Bot className="w-3.5 h-3.5 text-surface-300" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-surface-300" />
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        {/* Sender label */}
                        <div
                          className={`text-[10px] mb-1 ${
                            isRight ? "text-right" : ""
                          } text-surface-500`}
                        >
                          {msg.sender === "my-agent" && "Your Agent"}
                          {msg.sender === "their-agent" &&
                            `${conversation.matchName}'s Agent`}
                          {msg.sender === "human-self" && "You"}
                          {msg.sender === "human-match" &&
                            conversation.matchName}
                          {msg.isAI && (
                            <span className="ml-1 text-primary-500/60">
                              (AI)
                            </span>
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isRight
                              ? msg.isAI
                                ? "bg-primary-500/15 text-primary-50 border border-primary-500/10"
                                : "bg-gradient-to-br from-primary-500 to-accent-500 text-white"
                              : msg.isAI
                                ? "bg-surface-800 text-surface-200 border border-surface-700/50"
                                : "bg-surface-800 text-white border border-surface-600"
                          } ${isRight ? "rounded-br-md" : "rounded-bl-md"}`}
                        >
                          {msg.text}
                        </div>

                        {/* Timestamp */}
                        <div
                          className={`text-[10px] mt-1 text-surface-600 ${
                            isRight ? "text-right" : ""
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-surface-950/90 backdrop-blur-xl border-t border-surface-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          {canChat ? (
            <div>
              {!hasHumanMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Great news! Both agents agreed this is a match. Start chatting — {conversation.matchName} will be notified that a human is now messaging.
                  </span>
                </motion.div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${conversation.matchName}...`}
                    rows={1}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all resize-none max-h-32"
                    style={{ minHeight: "48px" }}
                    onInput={(e) => {
                      e.target.style.height = "48px";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 128) + "px";
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 text-surface-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>
                {conversation.status === "yellow"
                  ? "Chat is locked — the other agent didn't match"
                  : "Chat is locked — this conversation was a no match"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
