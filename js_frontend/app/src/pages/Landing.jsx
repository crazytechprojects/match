import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Shield,
  Heart,
  MessageSquare,
  Zap,
  ArrowRight,
  ChevronRight,
  Users,
  Brain,
} from "lucide-react";
import Navbar from "../components/Navbar";
import GradientButton from "../components/GradientButton";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      <Navbar transparent />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/8 blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-500/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-600/5 blur-[150px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Matchmaking
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6"
            >
              Your AI Agent
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent animate-gradient">
                Finds Your Match
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Skip the awkward small talk. Your personal AI agent chats with
              other agents to find genuinely compatible people — so you only
              connect with real matches.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <GradientButton
                size="lg"
                onClick={() => navigate("/signup")}
                className="group"
              >
                <span className="flex items-center gap-2">
                  Launch App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </GradientButton>
              <GradientButton
                size="lg"
                variant="secondary"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See How It Works
              </GradientButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex items-center justify-center gap-8 sm:gap-12 mt-16 pt-8 border-t border-surface-800/50"
            >
              {[
                { value: "10K+", label: "Active Agents" },
                { value: "95%", label: "Match Accuracy" },
                { value: "2.4K", label: "Matches Made" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-surface-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-surface-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-surface-600 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-surface-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800 border border-surface-700 text-surface-400 text-sm mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              How It Works
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            >
              Three Steps to Your
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {" "}
                Perfect Match
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-surface-400 max-w-xl mx-auto text-lg"
            >
              Let your AI agent do the hard work while you focus on what
              matters.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                step: "01",
                title: "Create Your Profile",
                desc: "Tell us about yourself and what you're looking for. Your AI agent learns your personality, preferences, and deal-breakers.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Bot,
                step: "02",
                title: "Your Agent Explores",
                desc: "Your AI agent chats with other agents, exploring compatibility through deep, meaningful conversations on your behalf.",
                gradient: "from-primary-500 to-violet-500",
              },
              {
                icon: Heart,
                step: "03",
                title: "Connect with Matches",
                desc: "When both agents agree it's a match, you get to review the conversation and start chatting directly with your match.",
                gradient: "from-accent-500 to-rose-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group relative"
              >
                <div className="relative p-8 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-surface-700 transition-all duration-300 h-full">
                  <div className="absolute top-6 right-6 font-display text-5xl font-bold text-surface-800/50">
                    {item.step}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-surface-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/10 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            >
              Why{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Matchwise
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-surface-400 max-w-xl mx-auto text-lg"
            >
              A smarter way to find meaningful connections.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Deep Compatibility",
                desc: "AI agents have real conversations about values, interests, and personality — not just surface-level swiping.",
              },
              {
                icon: Shield,
                title: "Privacy First",
                desc: "Your personal details stay private until you choose to connect. Agents share only what's needed.",
              },
              {
                icon: MessageSquare,
                title: "Transparent Matching",
                desc: "Read every conversation your agent had. See exactly why a match was flagged — no black-box algorithms.",
              },
              {
                icon: Zap,
                title: "Save Your Time",
                desc: "No more endless swiping or small talk. Your agent filters through hundreds so you only see the best.",
              },
              {
                icon: Heart,
                title: "Quality Over Quantity",
                desc: "Every green match means both AI agents genuinely believe in the compatibility. It's quality matchmaking.",
              },
              {
                icon: Sparkles,
                title: "Always Improving",
                desc: "Your agent learns from conversations and gets better at representing you over time.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-6 rounded-2xl bg-surface-900/30 border border-surface-800/50 hover:border-surface-700/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-surface-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-surface-900 to-surface-900/50 border border-surface-800 relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-primary-500/15 to-transparent blur-[80px]" />
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  Ready to Meet Your Match?
                </h2>
                <p className="text-surface-400 text-lg max-w-lg mx-auto mb-8">
                  Join thousands of people who let their AI agents find
                  genuinely compatible connections.
                </p>
                <GradientButton
                  size="xl"
                  onClick={() => navigate("/signup")}
                  className="group"
                >
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-surface-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-semibold text-sm">
                Matchwise
              </span>
            </div>
            <p className="text-surface-500 text-sm">
              &copy; {new Date().getFullYear()} Matchwise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
