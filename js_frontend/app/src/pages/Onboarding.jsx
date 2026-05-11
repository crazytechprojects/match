import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Heart,
  SlidersHorizontal,
  Pencil,
  Bot,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GradientButton from "../components/GradientButton";
import DualRangeSlider from "../components/DualRangeSlider";

const STEPS = [
  { id: "gender", icon: User, title: "About You", subtitle: "What's your gender?" },
  { id: "matchGender", icon: Heart, title: "Your Match", subtitle: "Who are you looking for?" },
  { id: "dateOfBirth", icon: User, title: "Birthday", subtitle: "When were you born?" },
  { id: "ageRange", icon: SlidersHorizontal, title: "Age Range", subtitle: "Set your preferred age range" },
  { id: "selfDescription", icon: Pencil, title: "Describe Yourself", subtitle: "Help your AI agent represent you" },
  { id: "matchDescription", icon: Bot, title: "Ideal Match", subtitle: "What should your agent look for?" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male", emoji: "👨" },
  { value: "female", label: "Female", emoji: "👩" },
  { value: "nonbinary", label: "Non-binary", emoji: "🧑" },
  { value: "other", label: "Other", emoji: "✨" },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState({
    gender: "",
    matchGender: "",
    dateOfBirth: "",
    ageRange: [22, 35],
    selfDescription: "",
    matchDescription: "",
  });
  const [error, setError] = useState("");

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canProceed = () => {
    switch (currentStep.id) {
      case "gender":
        return form.gender !== "";
      case "matchGender":
        return form.matchGender !== "";
      case "dateOfBirth":
        return form.dateOfBirth !== "";
      case "ageRange":
        return true;
      case "selfDescription":
        return form.selfDescription.trim().length >= 20;
      case "matchDescription":
        return form.matchDescription.trim().length >= 20;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isLast) {
      setError("");
      try {
        await updateProfile(form);
        navigate("/dashboard");
      } catch (err) {
        setError(err.message || "Failed to save profile.");
      }
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-surface-400">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-surface-400">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  i <= step
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "bg-surface-800 text-surface-500 border border-surface-700"
                }`}
              >
                {i < step ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8 rounded-2xl bg-surface-900/50 border border-surface-800 backdrop-blur-sm overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
                  <currentStep.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-1">
                  {currentStep.title}
                </h2>
                <p className="text-surface-400">{currentStep.subtitle}</p>
              </div>

              {/* Gender Selection */}
              {currentStep.id === "gender" && (
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateField("gender", opt.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                        form.gender === opt.value
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{opt.emoji}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Match Gender */}
              {currentStep.id === "matchGender" && (
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateField("matchGender", opt.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                        form.matchGender === opt.value
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{opt.emoji}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Date of Birth */}
              {currentStep.id === "dateOfBirth" && (
                <div className="flex justify-center">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className="px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
              )}

              {/* Age Range */}
              {currentStep.id === "ageRange" && (
                <div className="px-2">
                  <div className="text-center mb-8">
                    <span className="font-display text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                      {form.ageRange[0]} — {form.ageRange[1]}
                    </span>
                    <p className="text-surface-500 text-sm mt-2">years old</p>
                  </div>
                  <DualRangeSlider
                    min={18}
                    max={65}
                    value={form.ageRange}
                    onChange={(val) => updateField("ageRange", val)}
                  />
                </div>
              )}

              {/* Self Description */}
              {currentStep.id === "selfDescription" && (
                <div>
                  <textarea
                    value={form.selfDescription}
                    onChange={(e) =>
                      updateField("selfDescription", e.target.value)
                    }
                    placeholder="Tell your AI agent about yourself — your appearance, personality, interests, how you communicate, what makes you unique. The more detail, the better your agent can represent you."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                  />
                  <p className="text-xs text-surface-500 mt-2 text-right">
                    {form.selfDescription.length} characters
                    {form.selfDescription.trim().length < 20 && (
                      <span className="text-amber-500">
                        {" "}
                        (minimum 20)
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Match Description */}
              {currentStep.id === "matchDescription" && (
                <div>
                  <textarea
                    value={form.matchDescription}
                    onChange={(e) =>
                      updateField("matchDescription", e.target.value)
                    }
                    placeholder="Describe your ideal match — their personality, appearance, values, interests, how they communicate, lifestyle. What matters most to you in a partner?"
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                  />
                  <p className="text-xs text-surface-500 mt-2 text-right">
                    {form.matchDescription.length} characters
                    {form.matchDescription.trim().length < 20 && (
                      <span className="text-amber-500">
                        {" "}
                        (minimum 20)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <GradientButton
              onClick={handleNext}
              disabled={!canProceed()}
              className="group"
            >
              <span className="flex items-center gap-2">
                {isLast ? (
                  <>
                    Launch My Agent
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </GradientButton>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
