import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  SlidersHorizontal,
  Pencil,
  Bot,
  Save,
  Check,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import GradientButton from "../components/GradientButton";
import DualRangeSlider from "../components/DualRangeSlider";
import * as api from "../api";

const GENDER_OPTIONS = [
  { value: "male", label: "Male", emoji: "👨" },
  { value: "female", label: "Female", emoji: "👩" },
  { value: "nonbinary", label: "Non-binary", emoji: "🧑" },
  { value: "other", label: "Other", emoji: "✨" },
];

export default function Profile() {
  const { user, token, updateProfile, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [form, setForm] = useState({
    gender: user?.gender || "",
    matchGender: user?.match_gender || "",
    ageRange: [user?.age_range_min || 22, user?.age_range_max || 35],
    selfDescription: user?.self_description || "",
    matchDescription: user?.match_description || "",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError("");
    try {
      await updateUser({ name });
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save.");
    }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Profile & Agent Settings</h1>
              <p className="text-surface-400 text-sm">
                Update your info and agent criteria
              </p>
            </div>
          </div>

          {/* Agent Status */}
          <AgentStatusBanner token={token} />

          <div className="space-y-6">
            {/* Basic Info */}
            <Section title="Basic Information" icon={User}>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
            </Section>

            {/* Gender */}
            <Section title="Your Gender" icon={User}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateField("gender", opt.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                      form.gender === opt.value
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                    }`}
                  >
                    <span className="text-xl block mb-1">{opt.emoji}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Match Gender */}
            <Section title="Looking For" icon={Heart}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateField("matchGender", opt.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                      form.matchGender === opt.value
                        ? "border-accent-500 bg-accent-500/10"
                        : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                    }`}
                  >
                    <span className="text-xl block mb-1">{opt.emoji}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Age Range */}
            <Section title="Preferred Age Range" icon={SlidersHorizontal}>
              <div className="px-2">
                <div className="text-center mb-4">
                  <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    {form.ageRange[0]} — {form.ageRange[1]}
                  </span>
                  <span className="text-surface-500 text-sm ml-2">
                    years old
                  </span>
                </div>
                <DualRangeSlider
                  min={18}
                  max={65}
                  value={form.ageRange}
                  onChange={(val) => updateField("ageRange", val)}
                />
              </div>
            </Section>

            {/* Self Description */}
            <Section title="About You" icon={Pencil} subtitle="Your agent uses this to represent you in conversations">
              <textarea
                value={form.selfDescription}
                onChange={(e) =>
                  updateField("selfDescription", e.target.value)
                }
                placeholder="Describe your appearance, personality, interests, communication style..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
              />
            </Section>

            {/* Match Description */}
            <Section title="Ideal Match" icon={Sparkles} subtitle="Your agent looks for people matching this description">
              <textarea
                value={form.matchDescription}
                onChange={(e) =>
                  updateField("matchDescription", e.target.value)
                }
                placeholder="Describe your ideal match — personality, appearance, values, interests..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
              />
            </Section>

            {/* Save */}
            <div className="sticky bottom-6 pt-4">
              {error && (
                <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <GradientButton
                onClick={handleSave}
                className="w-full group"
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </span>
              </GradientButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AgentStatusBanner({ token }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    api.getAgentStatus(token).then(setStatus).catch(() => {});
  }, [token]);

  const isChatting = status?.status === "chatting";
  const label = isChatting ? "Agent is Chatting" : status?.is_active ? "Agent is Active" : "Agent Idle";
  const sub = isChatting
    ? `${status.active_count} conversation${status.active_count !== 1 ? "s" : ""} in progress`
    : "Your AI agent is ready to search for matches";

  return (
    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-8 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <p className="font-medium text-emerald-400 text-sm">{label}</p>
        <p className="text-xs text-emerald-400/60">{sub}</p>
      </div>
      <div className="ml-auto">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, subtitle, children }) {
  return (
    <div className="p-6 rounded-2xl bg-surface-900/50 border border-surface-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
          <Icon className="w-4 h-4 text-surface-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-surface-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
