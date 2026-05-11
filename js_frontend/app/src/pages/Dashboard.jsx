import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Bot,
  Search,
  Sparkles,
  Circle,
  ChevronRight,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AvatarCircle from "../components/AvatarCircle";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";

const TABS = [
  {
    id: "all",
    label: "All",
    color: "text-white",
    bg: "bg-surface-700",
    activeBg: "bg-surface-600",
  },
  {
    id: "green",
    label: "Matches",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  {
    id: "yellow",
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    activeBg: "bg-amber-500/20",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  {
    id: "red",
    label: "No Match",
    color: "text-red-400",
    bg: "bg-red-500/10",
    activeBg: "bg-red-500/20",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
];

const statusConfig = {
  green: {
    label: "Match",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    ringColor: "ring-emerald-500/20",
  },
  yellow: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    ringColor: "ring-amber-500/20",
  },
  red: {
    label: "No Match",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-400",
    ringColor: "ring-red-500/20",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [convData, statusData] = await Promise.all([
        api.listConversations(token),
        api.getAgentStatus(token),
      ]);
      const mapped = (convData.conversations || []).map((c) => ({
        id: c.id,
        status: c.status,
        matchName: c.match_name || "Unknown",
        matchAge: c.match_age,
        matchGender: c.match_gender,
        lastMessage: c.last_message || "",
        lastMessageTime: c.last_message_time
          ? new Date(c.last_message_time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : "",
        unread: c.unread,
        humanChatStarted: c.human_chat_started,
        messageCount: c.message_count,
      }));
      setConversations(mapped);
      setAgentStatus(statusData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredConversations = useMemo(() => {
    let convos = conversations;
    if (activeTab !== "all") {
      convos = convos.filter((c) => c.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      convos = convos.filter(
        (c) =>
          c.matchName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }
    return convos;
  }, [activeTab, search, conversations]);

  const counts = useMemo(
    () => ({
      all: conversations.length,
      green: agentStatus?.green_count ?? conversations.filter((c) => c.status === "green").length,
      yellow: agentStatus?.yellow_count ?? conversations.filter((c) => c.status === "yellow").length,
      red: agentStatus?.red_count ?? conversations.filter((c) => c.status === "red").length,
    }),
    [conversations, agentStatus]
  );

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">
                  Agent Dashboard
                </h1>
                <p className="text-surface-400 text-sm">
                  Your AI agent is actively searching for matches
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            {
              label: "Matches",
              count: counts.green,
              color: "from-emerald-500/20 to-emerald-500/5",
              border: "border-emerald-500/20",
              textColor: "text-emerald-400",
              icon: "💚",
            },
            {
              label: "Pending",
              count: counts.yellow,
              color: "from-amber-500/20 to-amber-500/5",
              border: "border-amber-500/20",
              textColor: "text-amber-400",
              icon: "💛",
            },
            {
              label: "No Match",
              count: counts.red,
              color: "from-red-500/20 to-red-500/5",
              border: "border-red-500/20",
              textColor: "text-red-400",
              icon: "❤️‍🩹",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`p-4 rounded-xl bg-gradient-to-b ${stat.color} border ${stat.border}`}
            >
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className={`font-display text-2xl font-bold ${stat.textColor}`}>
                {stat.count}
              </div>
              <div className="text-xs text-surface-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-900/50 border border-surface-800 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-surface-500 flex-shrink-0" />
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? `${tab.activeBg || tab.bg} ${tab.color} ${tab.border ? `border ${tab.border}` : "border border-surface-600"}`
                    : "bg-surface-800/50 text-surface-400 border border-transparent hover:bg-surface-800"
                }`}
              >
                {tab.dot && (
                  <span
                    className={`w-2 h-2 rounded-full ${tab.dot}`}
                  />
                )}
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-white/10"
                      : "bg-surface-700"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Conversation List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredConversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <MessageCircle className="w-12 h-12 text-surface-700 mx-auto mb-4" />
                <p className="text-surface-500 text-lg font-medium">
                  No conversations found
                </p>
                <p className="text-surface-600 text-sm mt-1">
                  {search
                    ? "Try a different search term"
                    : "Your agent is still looking for matches"}
                </p>
              </motion.div>
            ) : (
              filteredConversations.map((convo, i) => {
                const config = statusConfig[convo.status];
                return (
                  <motion.div
                    key={convo.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/chat/${convo.id}`)}
                    className={`group p-4 rounded-xl bg-surface-900/50 border border-surface-800 hover:border-surface-700 transition-all cursor-pointer`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <AvatarCircle name={convo.matchName} size="lg" />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${config.dot} ring-2 ring-surface-900`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {convo.matchName}
                            </span>
                            <span className="text-xs text-surface-500">
                              {convo.matchAge}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color} border ${config.border}`}
                            >
                              <Circle className="w-1.5 h-1.5 fill-current" />
                              {config.label}
                            </span>
                          </div>
                          <span className="text-xs text-surface-500">
                            {convo.lastMessageTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-sm text-surface-400 truncate flex-1">
                            {convo.humanChatStarted && (
                              <span className="text-primary-400">💬 </span>
                            )}
                            {convo.lastMessage}
                          </p>
                          {convo.unread && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-surface-500 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            {convo.messageCount} messages
                          </span>
                          {convo.status === "green" && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {convo.humanChatStarted
                                ? "Human chat active"
                                : "Ready to chat"}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-surface-600 group-hover:text-surface-400 transition-colors flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
