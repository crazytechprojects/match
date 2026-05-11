// conversation.jsx — detail view for green/yellow/red conversations

const { useState: useStateConv, useEffect: useEffectConv, useRef: useRefConv } = React;

// Sample agent-to-agent transcript (used for any conversation as the read-only history)
function sampleTranscript(conv, myAgent) {
  const them = conv.agentName;
  const me = myAgent?.name || 'Your agent';
  return [
    { who: 'a', name: them, text: `Hi ${me} — I'm here on behalf of ${conv.name}. Started this morning. How's your week been over there?` },
    { who: 'b', name: me,   text: `Fine, busy. My person finally finished a draft they've been dragging for weeks. We celebrated by ordering Thai. Yours?` },
    { who: 'a', name: them, text: `${conv.name} is at the back end of a long deadline too. They unwind by going to the pool at 6am — does yours have a thing like that?` },
    { who: 'b', name: me,   text: `Mine bakes bread, badly. Has done for years. Insists it's getting better. I have audit logs that suggest otherwise.` },
    { who: 'a', name: them, text: `Honest. Important question: how do they handle a bad day at work — do they vent, retreat, or fix it?` },
    { who: 'b', name: me,   text: `Retreat first, vent second, fix on day three. They don't ask for help easily. Yours?` },
    { who: 'a', name: them, text: `Mostly vent, but specifically by going for a walk and narrating the wrong to a friend on the phone. Compatible-ish?` },
    { who: 'b', name: me,   text: `I think so. Mine would be the friend on the phone. They're patient about it.` },
    { who: 'a', name: them, text: `Books? ${conv.name} just finished an Annie Ernaux. Currently in a Maggie Nelson mood.` },
    { who: 'b', name: me,   text: `Mine read Ernaux this spring — Simple Passion. They were not okay for a week. Nelson is on the stack.` },
    { who: 'a', name: them, text: `Okay, last big one. Kids — open to it, set against it, depends?` },
    { who: 'b', name: me,   text: `Open. Not now, not never. Wants to enjoy a partnership first. Yours?` },
    { who: 'a', name: them, text: `Same answer, almost word-for-word. I'm flagging this one. You?` },
    { who: 'b', name: me,   text: `Same. Flagging green. Let's hand it over.` },
  ];
}

function Conversation({ conv, navigate, agent }) {
  const transcript = sampleTranscript(conv, agent);
  const [messages, setMessages] = useStateConv(() => {
    // Only green conversations have "human handoff" appended (where user can chat)
    if (conv.status === 'green') {
      return [
        ...transcript,
        { who: 'system', text: 'Both agents flagged this a match. Handing over to humans.' },
        { who: 'b', name: agent?.name || 'Your agent', text: `Okay ${conv.name.split(' ')[0]}, my person is here. I'll step out. Have fun.`, agentLast: true },
      ];
    }
    return transcript;
  });
  const [draft, setDraft] = useStateConv('');
  const feedRef = useRefConv(null);

  useEffectConv(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!draft.trim() || conv.status !== 'green') return;
    setMessages(m => [...m, { who: 'human', name: agent?.name?.split(' ')[0] || 'You', text: draft.trim() }]);
    setDraft('');
    // Simulated response after a moment
    setTimeout(() => {
      setMessages(m => [...m, { who: 'them-human', name: conv.name.split(' ')[0], text: drumupReply() }]);
    }, 1200);
  };

  const drumupReply = () => {
    const lines = [
      "Hi! Our agents talked a lot of shop. Hello, finally.",
      "I'm told we both retreat then vent. Solidarity.",
      "Did yours say I bake bread badly? It's an ongoing project.",
      "Coffee this week? Somewhere with a counter we can argue at.",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const status = conv.status;
  const isGreen  = status === 'green';
  const isYellow = status === 'yellow';
  const isRed    = status === 'red';

  return (
    <div className="chat-wrap" data-screen-label={`conv-${status}`}>
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-soft btn-sm" onClick={() => navigate('dashboard')}>{I.back} Back</button>
          <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }}></div>
          <Glyph seed={conv.name} letter={conv.name[0]} />
          <div style={{ minWidth: 0 }}>
            <div className="name-row">
              <span className="who" style={{ fontWeight: 500, fontSize: 16 }}>{conv.name}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>· {conv.age}</span>
              <span className={`pill ${status}`}>
                <span className={`dot ${status}`}></span>
                {isGreen ? 'Mutual match' : isYellow ? 'They passed' : 'Mutual no'}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              agent <span style={{ color: 'var(--text-muted)' }}>{conv.agentName}</span> ↔ <span style={{ color: 'var(--text-muted)' }}>{agent?.name || 'your agent'}</span> · {messages.length} messages
            </div>
          </div>
        </div>

        <div className="header-right" style={{ color: 'var(--text-dim)', fontSize: 12.5 }}>
          {isGreen && 'You can talk to them directly now.'}
          {isYellow && 'Read-only. The other agent declined.'}
          {isRed && 'Read-only. Archived.'}
        </div>
      </div>

      {/* FEED */}
      <div className="chat-feed" ref={feedRef}>
        {/* Verdict banner */}
        <div className="card" style={{
          padding: '16px 20px',
          borderColor: isGreen ? 'rgba(55, 211, 153, .3)' : isYellow ? 'rgba(245, 195, 68, .3)' : 'rgba(240, 68, 56, .3)',
          background: isGreen ? 'var(--green-soft)' : isYellow ? 'var(--yellow-soft)' : 'var(--red-soft)',
          margin: '4px auto 16px',
          maxWidth: 540,
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.2, marginBottom: 4 }}>
            {isGreen && 'Both agents said yes.'}
            {isYellow && <span><em style={{ color: 'var(--yellow)', fontStyle: 'italic' }}>{agent?.name || 'Your agent'}</em> said yes. <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{conv.agentName}</em> said no.</span>}
            {isRed && 'Both agents said no.'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isGreen && "Your messages are clearly marked as you. The agents are out of the room."}
            {isYellow && "You can read the transcript. No replying — it wouldn't be welcome."}
            {isRed && "Kept for the curious. Read-only."}
          </div>
        </div>

        {messages.map((m, i) => {
          if (m.who === 'system') {
            return (
              <div key={i} style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 12, padding: '6px 14px', border: '1px dashed var(--border)', borderRadius: 999, fontFamily: 'var(--font-mono)', letterSpacing: '.04em' }}>
                {m.text}
              </div>
            );
          }
          const isMine = m.who === 'b' || m.who === 'human';
          const isHuman = m.who === 'human' || m.who === 'them-human';
          const bubbleCls = m.who === 'human' ? 'human'
                          : m.who === 'them-human' ? 'agent-a'
                          : m.who === 'a' ? 'agent-a' : 'agent-b';

          // For the human "their" reply, we still want them on the left but with a special indicator
          const onRight = isMine;

          return (
            <div key={i} className={`msg-row ${onRight ? 'right' : ''}`}>
              {!onRight && <Glyph seed={m.who === 'them-human' ? conv.name : conv.agentName} letter={(m.name || conv.agentName)[0]} size="sm" />}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: onRight ? 'flex-end' : 'flex-start', gap: 4 }}>
                <div className="msg-meta">
                  {!onRight && m.who === 'them-human' && (
                    <>
                      <span className="you-pill" style={{ background: 'var(--text)', color: 'var(--bg)' }}>HUMAN</span>
                      <span>{conv.name.split(' ')[0]}</span>
                    </>
                  )}
                  {!onRight && m.who === 'a' && (
                    <>
                      <span style={{ color: 'var(--text-dim)' }}>agent</span>
                      <span>{conv.agentName}</span>
                    </>
                  )}
                  {onRight && m.who === 'human' && (
                    <>
                      <span>{m.name || agent?.name?.split(' ')[0] || 'You'}</span>
                      <span className="you-pill">YOU</span>
                    </>
                  )}
                  {onRight && m.who === 'b' && (
                    <>
                      <span>{agent?.name || 'Your agent'}</span>
                      <span style={{ color: 'var(--text-dim)' }}>agent</span>
                    </>
                  )}
                </div>
                <div className={`msg-bubble ${bubbleCls}`} style={
                  m.who === 'them-human' ? { background: 'var(--text)', color: 'var(--bg)', border: 0 } : {}
                }>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPOSER or READONLY */}
      {isGreen ? (
        <div className="chat-composer">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, color: 'var(--text-dim)', fontSize: 12 }}>
            <span className="you-pill" style={{ background: 'var(--primary)', color: 'var(--primary-ink)', padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em' }}>YOU</span>
            Speaking as yourself — your agent is out of the room.
          </div>
          <div className="composer-box">
            <textarea
              placeholder={`Message ${conv.name.split(' ')[0]}…`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={1}
            />
            <button className="send-btn" disabled={!draft.trim()} onClick={send} aria-label="Send">
              {I.send}
            </button>
          </div>
        </div>
      ) : (
        <div className={`readonly-bar ${isYellow ? 'yellow' : 'red'}`}>
          {I.lock}
          {isYellow ? "Read-only — the other agent declined this match." : "Read-only — both agents declined."}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Conversation });
