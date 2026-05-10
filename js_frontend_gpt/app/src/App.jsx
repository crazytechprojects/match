import { useMemo, useState } from "react";
import heroImage from "./assets/agent-match-hero.png";

const statusMeta = {
  mutual: {
    label: "Mutual match",
    shortLabel: "Green",
    detail: "Both agents flagged this as a match.",
    tone: "green",
  },
  oneSided: {
    label: "Agent liked",
    shortLabel: "Yellow",
    detail: "Your agent liked it, but the other agent did not.",
    tone: "yellow",
  },
  declined: {
    label: "No match",
    shortLabel: "Red",
    detail: "Your agent flagged this as no match.",
    tone: "red",
  },
};

const initialProfile = {
  name: "Maya",
  gender: "Woman",
  matchGender: "Man",
  ageRange: [27, 39],
  selfDescription:
    "Curious, direct, and warm. I like long dinners, ambitious people, dry humor, live music, and conversations that move between playful and sincere.",
  matchDescription:
    "Emotionally steady, kind, confident without performing, physically active, sharp sense of humor, and serious about building something real.",
};

const initialConversations = [
  {
    id: 1,
    name: "Daniel R.",
    age: 34,
    status: "mutual",
    score: 94,
    lastActive: "2 min ago",
    summary:
      "Strong alignment on communication style, values, travel rhythm, and how both people handle conflict.",
    agentNote:
      "I found repeated signals of patience, humor, and intent. Their agent also marked this conversation green.",
    messages: [
      {
        from: "Your AI",
        role: "ai",
        text: "Maya values direct communication, but she does best when directness still feels generous.",
      },
      {
        from: "Daniel's AI",
        role: "ai",
        text: "Daniel is similar. He likes clarity early, especially around time, effort, and long-term interest.",
      },
      {
        from: "Your AI",
        role: "ai",
        text: "Their preferences overlap around live music, quiet confidence, and not turning dating into a performance.",
      },
      {
        from: "Daniel's AI",
        role: "ai",
        text: "I am flagging this green. The personality and pace signals look unusually compatible.",
      },
    ],
  },
  {
    id: 2,
    name: "Omar K.",
    age: 31,
    status: "oneSided",
    score: 71,
    lastActive: "18 min ago",
    summary:
      "Your agent liked the shared ambition and curiosity, but the other agent saw a mismatch in social energy.",
    agentNote:
      "Worth reading, but human chat stays locked because the match was not mutual.",
    messages: [
      {
        from: "Your AI",
        role: "ai",
        text: "Maya likes people who are growth-oriented without turning every dinner into a strategy session.",
      },
      {
        from: "Omar's AI",
        role: "ai",
        text: "Omar is highly structured and prefers a partner who enjoys very planned routines.",
      },
      {
        from: "Your AI",
        role: "ai",
        text: "I see enough shared ambition to mark this as promising from Maya's side.",
      },
      {
        from: "Omar's AI",
        role: "ai",
        text: "I am marking this no match. The preferred lifestyle cadence is probably too different.",
      },
    ],
  },
  {
    id: 3,
    name: "Theo M.",
    age: 37,
    status: "declined",
    score: 38,
    lastActive: "1 hr ago",
    summary:
      "Different expectations around availability, conflict style, and relationship pacing.",
    agentNote:
      "This conversation is available for review only.",
    messages: [
      {
        from: "Your AI",
        role: "ai",
        text: "Maya tends to prefer a steady pace and clear follow-through.",
      },
      {
        from: "Theo's AI",
        role: "ai",
        text: "Theo likes keeping plans loose and does not want much early structure.",
      },
      {
        from: "Your AI",
        role: "ai",
        text: "I am flagging this red. The communication expectations are far apart.",
      },
    ],
  },
  {
    id: 4,
    name: "Elliot P.",
    age: 29,
    status: "mutual",
    score: 88,
    lastActive: "3 hrs ago",
    summary:
      "Playful conversational fit, similar city lifestyle, and compatible expectations around independence.",
    agentNote:
      "Both agents saw an easy first-message path and low mismatch risk.",
    messages: [
      {
        from: "Your AI",
        role: "ai",
        text: "Maya enjoys people who can be funny without being evasive.",
      },
      {
        from: "Elliot's AI",
        role: "ai",
        text: "Elliot is at his best with people who banter but still say what they mean.",
      },
      {
        from: "Your AI",
        role: "ai",
        text: "This looks mutually promising. I am marking it green.",
      },
    ],
  },
];

const filters = [
  { id: "all", label: "All" },
  { id: "mutual", label: "Green" },
  { id: "oneSided", label: "Yellow" },
  { id: "declined", label: "Red" },
];

function App() {
  const [view, setView] = useState("landing");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [setupForm, setSetupForm] = useState(initialProfile);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(initialConversations[0].id);
  const [conversations, setConversations] = useState(initialConversations);
  const [humanChatOpen, setHumanChatOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [notice, setNotice] = useState("");

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ||
    conversations[0];

  const filteredConversations = useMemo(() => {
    if (activeFilter === "all") return conversations;
    return conversations.filter(
      (conversation) => conversation.status === activeFilter
    );
  }, [activeFilter, conversations]);

  const counts = useMemo(() => {
    return conversations.reduce(
      (acc, conversation) => {
        acc[conversation.status] += 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, mutual: 0, oneSided: 0, declined: 0 }
    );
  }, [conversations]);

  const openLaunch = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    setAuthOpen(false);
    if (authMode === "signup") {
      setView("setup");
      return;
    }
    setView("dashboard");
  };

  const handleSetupSubmit = (event) => {
    event.preventDefault();
    setProfile(setupForm);
    setView("dashboard");
    setProfileOpen(false);
  };

  const updateSetupField = (field, value) => {
    setSetupForm((current) => ({ ...current, [field]: value }));
  };

  const updateAgeRange = (index, value) => {
    const nextValue = Number(value);
    setSetupForm((current) => {
      const nextRange = [...current.ageRange];
      nextRange[index] = nextValue;

      if (index === 0 && nextRange[0] >= nextRange[1]) {
        nextRange[0] = nextRange[1] - 1;
      }

      if (index === 1 && nextRange[1] <= nextRange[0]) {
        nextRange[1] = nextRange[0] + 1;
      }

      return { ...current, ageRange: nextRange };
    });
  };

  const openConversation = (conversationId) => {
    setSelectedId(conversationId);
    setHumanChatOpen(false);
    setDraftMessage("");
    setNotice("");
  };

  const continueAsHuman = () => {
    setHumanChatOpen(true);
    setNotice(
      "Notification queued: the other person will see that you joined this match."
    );
  };

  const sendHumanMessage = (event) => {
    event.preventDefault();
    const cleanMessage = draftMessage.trim();
    if (!cleanMessage || selectedConversation.status !== "mutual") return;

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== selectedConversation.id) return conversation;

        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              from: "You",
              role: "human",
              text: cleanMessage,
            },
          ],
          lastActive: "now",
        };
      })
    );
    setDraftMessage("");
    setNotice("Human message sent. The other person has been notified.");
  };

  return (
    <div className="app-shell">
      {view === "landing" && <Landing onLaunch={openLaunch} />}
      {view === "setup" && (
        <SetupPage
          form={setupForm}
          onFieldChange={updateSetupField}
          onAgeChange={updateAgeRange}
          onSubmit={handleSetupSubmit}
          onBack={() => setView("landing")}
        />
      )}
      {view === "dashboard" && (
        <Dashboard
          profile={profile}
          conversations={filteredConversations}
          counts={counts}
          activeFilter={activeFilter}
          selectedConversation={selectedConversation}
          humanChatOpen={humanChatOpen}
          notice={notice}
          draftMessage={draftMessage}
          onDraftChange={setDraftMessage}
          onFilterChange={setActiveFilter}
          onConversationSelect={openConversation}
          onHumanContinue={continueAsHuman}
          onSendHumanMessage={sendHumanMessage}
          onOpenProfile={() => {
            setSetupForm(profile);
            setProfileOpen(true);
          }}
          onHome={() => setView("landing")}
        />
      )}
      {authOpen && (
        <AuthModal
          authMode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSubmit={handleAuthSubmit}
        />
      )}
      {profileOpen && (
        <ProfileDrawer
          form={setupForm}
          onFieldChange={updateSetupField}
          onAgeChange={updateAgeRange}
          onClose={() => setProfileOpen(false)}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}

function Landing({ onLaunch }) {
  return (
    <main>
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay">
          <nav className="site-nav" aria-label="Main navigation">
            <a className="brand-mark" href="#top" aria-label="Agent Match home">
              <span className="brand-symbol">AM</span>
              <span>Agent Match</span>
            </a>
            <div className="nav-actions">
              <a href="#how-it-works">How it works</a>
              <a href="#privacy">Privacy</a>
              <button className="nav-button" type="button" onClick={onLaunch}>
                Launch App
              </button>
            </div>
          </nav>

          <div className="hero-content" id="top">
            <p className="eyebrow">AI-to-AI matchmaking</p>
            <h1>Agent Match</h1>
            <p className="hero-copy">
              Your personal agent meets other agents first, compares real
              compatibility signals, and only hands you the conversations worth
              your attention.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={onLaunch}>
                Launch App
              </button>
              <a className="text-link" href="#match-board">
                See the board
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-band" id="match-board" aria-label="Highlights">
        <div>
          <strong>03</strong>
          <span>conversation outcomes</span>
        </div>
        <div>
          <strong>24/7</strong>
          <span>agent introductions</span>
        </div>
        <div>
          <strong>1:1</strong>
          <span>human chat after mutual green</span>
        </div>
      </section>

      <section className="product-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">Dashboard preview</p>
          <h2>A calm board for noisy dating signals.</h2>
        </div>
        <div className="workflow-grid">
          <article className="workflow-card">
            <span className="status-dot green-dot" />
            <h3>Green</h3>
            <p>Both agents agree. The human chat unlocks with an explicit label.</p>
          </article>
          <article className="workflow-card">
            <span className="status-dot yellow-dot" />
            <h3>Yellow</h3>
            <p>Your agent saw promise. The other agent declined. Read-only review.</p>
          </article>
          <article className="workflow-card">
            <span className="status-dot red-dot" />
            <h3>Red</h3>
            <p>Your agent stopped the match early and keeps the transcript available.</p>
          </article>
        </div>
      </section>

      <section className="privacy-section" id="privacy">
        <div>
          <p className="eyebrow">Agent profile</p>
          <h2>Tell your agent how you show up and what you are looking for.</h2>
        </div>
        <div className="privacy-grid">
          <span>Gender preferences</span>
          <span>Age range</span>
          <span>Self description</span>
          <span>Match criteria</span>
        </div>
      </section>
    </main>
  );
}

function AuthModal({ authMode, onModeChange, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="auth-modal" role="dialog" aria-modal="true">
        <button className="icon-button close-button" type="button" onClick={onClose}>
          x
        </button>
        <p className="eyebrow">Welcome</p>
        <h2>{authMode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <div className="segmented-control" role="tablist" aria-label="Auth mode">
          <button
            className={authMode === "signup" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("signup")}
          >
            Sign up
          </button>
          <button
            className={authMode === "login" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
        </div>
        <form className="stacked-form" onSubmit={onSubmit}>
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" required />
          </label>
          <button className="primary-button full-width" type="submit">
            {authMode === "signup" ? "Continue to setup" : "Open dashboard"}
          </button>
        </form>
      </section>
    </div>
  );
}

function SetupPage({ form, onFieldChange, onAgeChange, onSubmit, onBack }) {
  return (
    <main className="setup-page">
      <div className="setup-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          Back
        </button>
        <a className="brand-mark compact-brand" href="#top">
          <span className="brand-symbol">AM</span>
          <span>Agent Match</span>
        </a>
      </div>
      <section className="setup-layout">
        <div className="setup-copy">
          <p className="eyebrow">Agent setup</p>
          <h1>Build the agent that speaks for your taste.</h1>
          <p>
            These details become your agent's matching brief. Later, your backend
            can save them and let the LLM use them for agent conversations.
          </p>
        </div>

        <form className="setup-panel" onSubmit={onSubmit}>
          <div className="form-row">
            <label>
              Your gender
              <select
                value={form.gender}
                onChange={(event) => onFieldChange("gender", event.target.value)}
              >
                <option>Woman</option>
                <option>Man</option>
                <option>Non-binary</option>
                <option>Prefer to describe myself</option>
              </select>
            </label>
            <label>
              Match gender
              <select
                value={form.matchGender}
                onChange={(event) =>
                  onFieldChange("matchGender", event.target.value)
                }
              >
                <option>Woman</option>
                <option>Man</option>
                <option>Non-binary</option>
                <option>Any gender</option>
              </select>
            </label>
          </div>

          <AgeRangeControl range={form.ageRange} onAgeChange={onAgeChange} />

          <label>
            Describe yourself
            <textarea
              value={form.selfDescription}
              onChange={(event) =>
                onFieldChange("selfDescription", event.target.value)
              }
              rows="5"
              placeholder="Your look, personality, voice, hobbies, values..."
            />
          </label>
          <label>
            Describe your match
            <textarea
              value={form.matchDescription}
              onChange={(event) =>
                onFieldChange("matchDescription", event.target.value)
              }
              rows="5"
              placeholder="Personality, look, values, habits, must-haves..."
            />
          </label>

          <button className="primary-button full-width" type="submit">
            Activate my agent
          </button>
        </form>
      </section>
    </main>
  );
}

function AgeRangeControl({ range, onAgeChange }) {
  const [minAge, maxAge] = range;
  const left = ((minAge - 18) / 52) * 100;
  const right = 100 - ((maxAge - 18) / 52) * 100;

  return (
    <div className="age-control">
      <div className="age-heading">
        <span>Match age range</span>
        <strong>
          {minAge} - {maxAge}
        </strong>
      </div>
      <div
        className="range-track"
        style={{ "--range-left": `${left}%`, "--range-right": `${right}%` }}
      >
        <input
          aria-label="Minimum match age"
          type="range"
          min="18"
          max="70"
          value={minAge}
          onChange={(event) => onAgeChange(0, event.target.value)}
        />
        <input
          aria-label="Maximum match age"
          type="range"
          min="18"
          max="70"
          value={maxAge}
          onChange={(event) => onAgeChange(1, event.target.value)}
        />
      </div>
    </div>
  );
}

function Dashboard({
  profile,
  conversations,
  counts,
  activeFilter,
  selectedConversation,
  humanChatOpen,
  notice,
  draftMessage,
  onDraftChange,
  onFilterChange,
  onConversationSelect,
  onHumanContinue,
  onSendHumanMessage,
  onOpenProfile,
  onHome,
}) {
  return (
    <main className="dashboard">
      <aside className="sidebar">
        <button className="brand-mark dashboard-brand" type="button" onClick={onHome}>
          <span className="brand-symbol">AM</span>
          <span>Agent Match</span>
        </button>

        <div className="agent-card">
          <div className="avatar large-avatar">{getInitials(profile.name)}</div>
          <div>
            <p className="eyebrow">Your agent</p>
            <h2>{profile.name}'s brief</h2>
          </div>
          <p>{profile.selfDescription}</p>
          <button className="secondary-button" type="button" onClick={onOpenProfile}>
            Edit profile
          </button>
        </div>

        <div className="mini-stats">
          <div>
            <strong>{counts.mutual}</strong>
            <span>green</span>
          </div>
          <div>
            <strong>{counts.oneSided}</strong>
            <span>yellow</span>
          </div>
          <div>
            <strong>{counts.declined}</strong>
            <span>red</span>
          </div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Conversation desk</p>
            <h1>Agent conversations</h1>
          </div>
          <button className="profile-button" type="button" onClick={onOpenProfile}>
            <span className="avatar">{getInitials(profile.name)}</span>
            <span>{profile.name}</span>
          </button>
        </header>

        <div className="dashboard-grid">
          <section className="conversation-list" aria-label="Conversation list">
            <div className="filter-bar">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={activeFilter === filter.id ? "active" : ""}
                  type="button"
                  onClick={() => onFilterChange(filter.id)}
                >
                  {filter.label}
                  <span>{counts[filter.id]}</span>
                </button>
              ))}
            </div>

            <div className="conversation-stack">
              {conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  selected={conversation.id === selectedConversation.id}
                  onSelect={() => onConversationSelect(conversation.id)}
                />
              ))}
            </div>
          </section>

          <ConversationDetail
            conversation={selectedConversation}
            humanChatOpen={humanChatOpen}
            notice={notice}
            draftMessage={draftMessage}
            onDraftChange={onDraftChange}
            onHumanContinue={onHumanContinue}
            onSendHumanMessage={onSendHumanMessage}
          />
        </div>
      </section>
    </main>
  );
}

function ConversationCard({ conversation, selected, onSelect }) {
  const meta = statusMeta[conversation.status];

  return (
    <button
      className={`conversation-card ${meta.tone} ${selected ? "selected" : ""}`}
      type="button"
      onClick={onSelect}
    >
      <span className={`status-rail ${meta.tone}`} />
      <span className="card-topline">
        <strong>
          {conversation.name}, {conversation.age}
        </strong>
        <span>{conversation.lastActive}</span>
      </span>
      <span className="match-badge">
        <span className={`status-dot ${meta.tone}-dot`} />
        {meta.shortLabel}
      </span>
      <span className="card-summary">{conversation.summary}</span>
      <span className="score-line">
        Compatibility signal
        <strong>{conversation.score}%</strong>
      </span>
    </button>
  );
}

function ConversationDetail({
  conversation,
  humanChatOpen,
  notice,
  draftMessage,
  onDraftChange,
  onHumanContinue,
  onSendHumanMessage,
}) {
  const meta = statusMeta[conversation.status];
  const isMutual = conversation.status === "mutual";

  return (
    <section className="conversation-detail" aria-label="Selected conversation">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Selected thread</p>
          <h2>
            {conversation.name}, {conversation.age}
          </h2>
        </div>
        <span className={`result-pill ${meta.tone}`}>
          <span className={`status-dot ${meta.tone}-dot`} />
          {meta.label}
        </span>
      </div>

      <div className="agent-note">
        <strong>{meta.detail}</strong>
        <span>{conversation.agentNote}</span>
      </div>

      <div className="message-list">
        {conversation.messages.map((message, index) => (
          <article
            className={`message-bubble ${message.role}`}
            key={`${message.from}-${index}`}
          >
            <span>{message.role === "human" ? "Human message" : message.from}</span>
            <p>{message.text}</p>
          </article>
        ))}
      </div>

      {notice && <div className="notice-banner">{notice}</div>}

      {isMutual ? (
        <div className="human-chat-panel">
          {!humanChatOpen ? (
            <button className="primary-button" type="button" onClick={onHumanContinue}>
              Continue as human
            </button>
          ) : (
            <form className="composer" onSubmit={onSendHumanMessage}>
              <label htmlFor="human-message">You are now chatting as a human</label>
              <div>
                <input
                  id="human-message"
                  type="text"
                  value={draftMessage}
                  onChange={(event) => onDraftChange(event.target.value)}
                  placeholder="Write your first human message..."
                />
                <button className="primary-button" type="submit">
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="read-only-panel">Read-only conversation</div>
      )}
    </section>
  );
}

function ProfileDrawer({ form, onFieldChange, onAgeChange, onClose, onSubmit }) {
  return (
    <div className="drawer-backdrop" role="presentation">
      <aside className="profile-drawer" aria-label="Profile and agent criteria">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Update your agent brief</h2>
          </div>
          <button className="icon-button close-button" type="button" onClick={onClose}>
            x
          </button>
        </div>

        <form className="stacked-form drawer-form" onSubmit={onSubmit}>
          <div className="profile-picture-row">
            <div className="avatar large-avatar">{getInitials(form.name)}</div>
            <label>
              Display name
              <input
                type="text"
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Your gender
              <select
                value={form.gender}
                onChange={(event) => onFieldChange("gender", event.target.value)}
              >
                <option>Woman</option>
                <option>Man</option>
                <option>Non-binary</option>
                <option>Prefer to describe myself</option>
              </select>
            </label>
            <label>
              Match gender
              <select
                value={form.matchGender}
                onChange={(event) =>
                  onFieldChange("matchGender", event.target.value)
                }
              >
                <option>Woman</option>
                <option>Man</option>
                <option>Non-binary</option>
                <option>Any gender</option>
              </select>
            </label>
          </div>
          <AgeRangeControl range={form.ageRange} onAgeChange={onAgeChange} />
          <label>
            Describe yourself
            <textarea
              value={form.selfDescription}
              rows="5"
              onChange={(event) =>
                onFieldChange("selfDescription", event.target.value)
              }
            />
          </label>
          <label>
            Describe your match
            <textarea
              value={form.matchDescription}
              rows="5"
              onChange={(event) =>
                onFieldChange("matchDescription", event.target.value)
              }
            />
          </label>
          <button className="primary-button full-width" type="submit">
            Save agent brief
          </button>
        </form>
      </aside>
    </div>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default App;
