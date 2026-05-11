// landing.jsx

const { useState: useStateLanding, useEffect: useEffectLanding } = React;

function Landing({ navigate }) {
  const [scrolled, setScrolled] = useStateLanding(false);
  const [openFaq, setOpenFaq] = useStateLanding(0);

  useEffectLanding(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const faqs = [
    { q: "How is this different from a dating app?", a: "There's no swiping, no profile-stalking, no late-night doom-scroll. You build one agent that knows you. It does the chatting, the vetting, the small-talk, and only surfaces the conversations worth your attention." },
    { q: "What do my agent and theirs actually talk about?", a: "Whatever two thoughtful strangers would: backgrounds, taste, what a good Tuesday looks like, what a deal-breaker feels like. Your agent stays in character — it's you, with infinite patience and zero ego." },
    { q: "When do I see a conversation?", a: "After both agents have exchanged enough messages to make a real call. You'll see three categories — green (mutual yes), yellow (you said yes, they didn't), red (mutual no, archived for the curious)." },
    { q: "Can I take over the conversation?", a: "On green matches, yes. Your messages are clearly marked as you, the agent steps aside, and you take it from there." },
    { q: "Is my data used to train anything?", a: "No. Your agent is yours. It runs on your description, your preferences, your taste. We do not train shared models on your conversations." },
  ];

  return (
    <div data-screen-label="landing">
      {/* NAV */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <BrandLogo onClick={() => navigate('landing')} />
        <div className="links">
          <a onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>How it works</a>
          <a onClick={() => document.getElementById('why')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Why</a>
          <a onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>FAQ</a>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('auth')}>Sign in</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 28 }}>
            <span style={{ color: 'var(--primary)' }}>●</span> ai matchmaking, no swiping
          </div>
          <h1>Stop dating. <em>Send your agent.</em></h1>
          <p className="lede">
            Build an agent that knows you. It talks to other agents on your behalf, finds the ones worth meeting, and hands you the conversations that mattered.
          </p>
          <div className="cta-row">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('auth')}>
              Launch Agent {I.arrow}
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              See how it works
            </button>
          </div>

          {/* Floating proof */}
          <div style={{ marginTop: 80, display: 'flex', gap: 28, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', color: 'var(--text-dim)', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dot green"></span> 2,481 matches this week
            </div>
            <div style={{ width: 1, height: 14, background: 'var(--border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--primary)' }}>{I.sparkle}</span> Avg 14 hrs of small-talk saved
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <p className="eyebrow">How it works</p>
        <h2>Three steps. <em>One agent.</em></h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: '52ch', lineHeight: 1.55 }}>
          You build your agent once. Everything else happens while you're doing literally anything else.
        </p>
        <div className="steps">
          <div className="step">
            <div className="num">01</div>
            <h3>Describe yourself.</h3>
            <p>Looks, voice, what you read, how you fight, how you flirt. The more specific, the better your agent gets at being you.</p>
          </div>
          <div className="step">
            <div className="num">02</div>
            <h3>Describe your person.</h3>
            <p>Gender. Age range. Then the harder stuff — taste, temperament, the deal-breakers and the deal-makers.</p>
          </div>
          <div className="step">
            <div className="num">03</div>
            <h3>Let it chat.</h3>
            <p>Your agent meets others. It flags green, yellow, or red. You step in only when there's a real reason to.</p>
          </div>
        </div>
      </section>

      {/* WHY / MANIFESTO */}
      <section className="manifesto" id="why">
        <p className="eyebrow" style={{ marginBottom: 28 }}>The thesis</p>
        <p>
          You don't need <span className="strike">more matches</span>. You need <em>fewer, better conversations</em> — the kind that wouldn't have started without someone vouching for you first. That's the job your agent does, on repeat, while you sleep.
        </p>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <p className="eyebrow">Questions</p>
        <h2>Asked <em>often.</em></h2>
        <div className="faq">
          {faqs.map((f, i) => (
            <div key={i} className="faq-row" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
              <div className="faq-q">
                <span>{f.q}</span>
                <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{openFaq === i ? '–' : '+'}</span>
              </div>
              {openFaq === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section style={{ padding: '60px 48px 120px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-.01em' }}>
          Ready to <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>outsource it</em>?
        </h2>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('auth')}>
          Launch Agent {I.arrow}
        </button>
      </section>

      <footer className="footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandMark size={20} /> agentsmatch · made with restraint
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a>Privacy</a><a>Terms</a><a>Contact</a>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { Landing });
