// dashboard.jsx — populated + empty states

const { useState: useStateDash } = React;

// Sample conversations for the populated state
const SAMPLE_CONVS = [
  { id: 'c1', name: 'Maya R.', age: 29, status: 'green', last: "She read Patti Smith on the subway and her agent asked mine what we'd order at 1am. Same diner, same hour, weirdly.", time: '2h', unread: 3, agentName: 'Halcyon' },
  { id: 'c2', name: 'Sasha P.', age: 31, status: 'green', last: "Both agents agreed on Lisbon over Paris and that's a green light from me.", time: '5h', unread: 0, agentName: 'Vesper' },
  { id: 'c3', name: 'Lena K.', age: 27, status: 'green', last: "Long thread on dogs vs. cats vs. one very specific dog. Mutual.", time: 'yesterday', unread: 1, agentName: 'Wren' },
  { id: 'c4', name: 'Iris M.', age: 30, status: 'yellow', last: "We flagged it green. Theirs said no — something about cilantro and Sundays.", time: '1d', unread: 0, agentName: 'Juno' },
  { id: 'c5', name: 'Eva T.', age: 28, status: 'yellow', last: "Almost. Her agent said the music taste overlap was too thin.", time: '2d', unread: 0, agentName: 'Hollis' },
  { id: 'c6', name: 'Quinn L.', age: 26, status: 'red', last: "Mutual no. Talked about hiking, talked about not hiking. Couldn't agree on anything.", time: '3d', unread: 0, agentName: 'Beck' },
  { id: 'c7', name: 'Noor A.', age: 32, status: 'red', last: "Polite mutual pass after 41 messages. Agents shook hands and moved on.", time: '5d', unread: 0, agentName: 'Indra' },
  { id: 'c8', name: 'Camila V.', age: 29, status: 'green', last: "Yes, mutually, and her agent quoted yours back at her — I'm impressed.", time: '6d', unread: 0, agentName: 'Sable' },
];

function Dashboard({ navigate, user, agent, conversations, openConversation }) {
  const [tab, setTab] = useStateDash('green');
  const isNew = !agent;

  const counts = {
    green: conversations.filter(c => c.status === 'green').length,
    yellow: conversations.filter(c => c.status === 'yellow').length,
    red: conversations.filter(c => c.status === 'red').length,
  };

  const filtered = conversations.filter(c => c.status === tab);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {isNew ? <>Hi <em>{user?.name || 'there'}.</em></> : <>Your <em>conversations.</em></>}
          </h1>
          <p className="page-sub">
            {isNew
              ? "First, build your agent. It'll do the talking — you'll see the conversations worth your time appear here."
              : "Greens are mutual. Yellows are theirs to refuse. Reds, well — at least somebody learned something."}
          </p>
        </div>
        {!isNew && (
          <button className="btn btn-ghost" onClick={() => navigate('agent')}>
            {I.agent} Edit agent
          </button>
        )}
      </div>

      {/* Stat tiles — always shown */}
      <div className="stat-grid">
        <div className="stat green" onClick={() => !isNew && setTab('green')}>
          <div className="stat-lbl"><span className="dot green"></span> Green · matched</div>
          <div className="stat-num">{counts.green}</div>
          <div className="stat-sub">Both said yes. Your move.</div>
        </div>
        <div className="stat yellow" onClick={() => !isNew && setTab('yellow')}>
          <div className="stat-lbl"><span className="dot yellow"></span> Yellow · rejected</div>
          <div className="stat-num">{counts.yellow}</div>
          <div className="stat-sub">You said yes. They didn't.</div>
        </div>
        <div className="stat red" onClick={() => !isNew && setTab('red')}>
          <div className="stat-lbl"><span className="dot red"></span> Red · mutual no</div>
          <div className="stat-num">{counts.red}</div>
          <div className="stat-sub">Archived. Nothing to do.</div>
        </div>
      </div>

      {/* Empty vs populated */}
      {isNew ? (
        <div style={{ marginTop: 40 }}>
          <div className="empty">
            <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: 'var(--elevated)', color: 'var(--primary)' }}>
              {I.sparkle}
            </div>
            <div className="em-title">Your agent is <em>waiting.</em></div>
            <p>
              We don't show you matches before there's an agent to make them. Tell it who you are, who you'd like to meet, and let it go to work.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('create-agent')}>
              {I.plus} Create my agent
            </button>
          </div>

          <div style={{ marginTop: 50, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, color: 'var(--text-muted)', fontSize: 14 }}>
            <div className="section-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 6 }}>~5 minutes</div>
              <div>to build your agent.</div>
            </div>
            <div className="section-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 6 }}>~36 hours</div>
              <div>before the first conversations land.</div>
            </div>
            <div className="section-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 6 }}>0 swipes</div>
              <div>required, ever.</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="tabs">
              <button className={tab === 'green' ? 'active' : ''} onClick={() => setTab('green')}>
                <span className="dot green"></span> Green <span className="count">{counts.green}</span>
              </button>
              <button className={tab === 'yellow' ? 'active' : ''} onClick={() => setTab('yellow')}>
                <span className="dot yellow"></span> Yellow <span className="count">{counts.yellow}</span>
              </button>
              <button className={tab === 'red' ? 'active' : ''} onClick={() => setTab('red')}>
                <span className="dot red"></span> Red <span className="count">{counts.red}</span>
              </button>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              {agent?.name} is chatting with <span style={{ color: 'var(--text)' }}>17</span> agents right now
            </div>
          </div>

          <div className="conv-list">
            {filtered.length === 0 && (
              <div className="empty" style={{ marginTop: 8 }}>
                <p style={{ margin: 0 }}>Nothing here yet. Your agent is still working.</p>
              </div>
            )}
            {filtered.map(c => (
              <div key={c.id} className="conv-row" onClick={() => openConversation(c)}>
                <Glyph seed={c.name} letter={c.name[0]} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="who">{c.name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>· {c.age}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>· agent {c.agentName}</span>
                  </div>
                  <div className="last">{c.last}</div>
                </div>
                <div className="meta">
                  {c.unread > 0 && (
                    <span style={{ background: 'var(--primary)', color: 'var(--primary-ink)', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 10 }}>
                      {c.unread}
                    </span>
                  )}
                  {c.time}
                </div>
                <span className={`dot ${c.status}`} style={{ marginLeft: 6 }}></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

Object.assign(window, { Dashboard, SAMPLE_CONVS });
