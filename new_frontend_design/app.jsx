// app.jsx — router + state owner + tweaks panel

const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#e87560", "#14100f", "#f5ede4"],
  "density": "regular",
  "agentBubble": "outline",
  "showGrain": true,
  "heroBoldness": "sexy"
}/*EDITMODE-END*/;

const PALETTES = [
  ["#e87560", "#14100f", "#f5ede4"],   // coral / warm-black / cream  (default)
  ["#d4a017", "#14100f", "#f5ede4"],   // amber / warm-black / cream
  ["#e3577a", "#1a0f12", "#f5e8e8"],   // rose / wine / blush
  ["#7a9d6e", "#0f1410", "#ecf0e7"],   // sage / pine / mist
  ["#9c5db0", "#120f18", "#ece6f4"],   // mauve / aubergine / pale lilac
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateApp('landing');
  const [user, setUser] = useStateApp(null);
  const [agent, setAgent] = useStateApp(null);
  const [conversations, setConversations] = useStateApp([]);
  const [activeConv, setActiveConv] = useStateApp(null);

  // Apply tweaks to :root
  useEffectApp(() => {
    const r = document.documentElement;
    const [primary, bg, text] = t.palette;
    r.style.setProperty('--primary', primary);
    // derive a lighter primary
    r.style.setProperty('--primary-2', primary);
    r.style.setProperty('--bg', bg);

    // For non-default palettes, adjust surrounding surfaces minimally
    if (bg !== '#14100f') {
      // generate slightly lighter surfaces by mixing with white via rgba overlay won't work in vars,
      // so just nudge bg-2 / surface in code-side here.
    }
    document.body.dataset.density = t.density;
    document.body.dataset.grain = t.showGrain ? 'on' : 'off';
    document.body.dataset.agentBubble = t.agentBubble;
  }, [t.palette, t.density, t.showGrain, t.agentBubble]);

  // Returning users get sample conversations; new users start empty
  const navigate = (to) => {
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // After auth, if user marked "returning"-ish (signed in vs signed up), seed conversations
  // For our prototype: signed-up = new (empty); signed-in = populated demo
  useEffectApp(() => {
    if (!user) return;
    if (user.isNew) {
      setConversations([]);
      setAgent(null);
    } else {
      setConversations(SAMPLE_CONVS);
      setAgent({
        name: 'Marigold',
        yourGender: 'Woman',
        theirGender: 'Man',
        dob: '1996-03-14',
        ageRange: [28, 38],
        aboutYou: "5'10\", dark hair, half-Greek, half-Welsh. Read a lot. I cook, I'm bad at small talk until I'm not. I'm sober. I write for a living. I'm probably funnier than I look on paper.",
        aboutThem: "Curious. Reads. Has opinions and is good-natured about losing them. Not loud. Hates phones at dinner. Has a thing they're obsessed with — could be ceramics, could be Lebanese poetry — but has one.",
      });
    }
  }, [user]);

  const openConversation = (conv) => {
    setActiveConv(conv);
    setRoute('conversation');
  };

  // ROUTE TABLE
  let view;
  if (route === 'landing') {
    view = <Landing navigate={navigate} />;
  } else if (route === 'auth') {
    view = <Auth navigate={navigate} setUser={setUser} />;
  } else if (route === 'create-agent') {
    view = <CreateAgent navigate={navigate} agent={agent} setAgent={setAgent} />;
  } else if (route === 'edit-agent') {
    view = <CreateAgent navigate={navigate} agent={agent} setAgent={setAgent} mode="edit" />;
  } else if (route === 'conversation' && activeConv) {
    view = (
      <div className="shell" data-screen-label="conversation">
        <Sidebar route="dashboard" navigate={navigate} user={user} agent={agent} />
        <main className="main main--full route-fade" key={route}>
          <Conversation conv={activeConv} navigate={navigate} agent={agent} />
        </main>
      </div>
    );
  } else if (['dashboard', 'profile', 'agent', 'billing'].includes(route)) {
    let inner;
    if (route === 'dashboard') {
      inner = <Dashboard navigate={navigate} user={user} agent={agent} conversations={conversations} openConversation={openConversation} />;
    } else if (route === 'profile') {
      inner = <Profile user={user} setUser={setUser} />;
    } else if (route === 'agent') {
      inner = <AgentPage agent={agent} setAgent={setAgent} navigate={navigate} />;
    } else if (route === 'billing') {
      inner = <Billing />;
    }
    view = (
      <AppShell route={route} navigate={navigate} user={user} agent={agent}>
        {inner}
      </AppShell>
    );
  } else {
    view = <Landing navigate={navigate} />;
  }

  return (
    <>
      {view}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Color" />
        <TweakColor
          label="Palette"
          value={t.palette}
          options={PALETTES}
          onChange={(v) => setTweak('palette', v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)}
        />

        <TweakSection label="Chat" />
        <TweakRadio
          label="Agent bubble"
          value={t.agentBubble}
          options={['outline', 'tinted']}
          onChange={(v) => setTweak('agentBubble', v)}
        />

        <TweakSection label="Vibe" />
        <TweakToggle
          label="Warm grain"
          value={t.showGrain}
          onChange={(v) => setTweak('showGrain', v)}
        />

        <TweakSection label="Demo" />
        <TweakButton onClick={() => {
          setUser({ name: 'Jordan', email: 'jordan@agentsmatch.ai', isNew: true });
          setAgent(null);
          setConversations([]);
          setRoute('dashboard');
        }}>Reset to new-user state</TweakButton>
        <TweakButton onClick={() => {
          setUser({ name: 'Jordan', email: 'jordan@agentsmatch.ai', isNew: false });
          setRoute('dashboard');
        }}>Load demo data</TweakButton>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
