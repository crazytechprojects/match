import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";
import { Glyph, AppShell, I } from "../components/shared";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Conversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState(null);
  const feedRef = useRef(null);

  const agentName = localStorage.getItem("agentsmatch_agent_name") || user?.name || "Your agent";

  const fetchConversation = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getConversation(token, id);
      setConv({
        id: data.id,
        status: data.status,
        matchName: data.match_name || "Unknown",
        matchAge: data.match_age,
        matchGender: data.match_gender,
        humanChatStarted: data.human_chat_started,
      });

      const mapped = (data.messages || []).map(msg => {
        let who, name;
        if (msg.sender_type === "my-agent") {
          who = "b";
          name = agentName;
        } else if (msg.sender_type === "their-agent") {
          who = "a";
          name = (data.match_name || "Unknown") + "'s agent";
        } else if (msg.sender_type === "human-self") {
          who = "human";
          name = "You";
        } else if (msg.sender_type === "human-match") {
          who = "them-human";
          name = data.match_name || "Unknown";
        } else {
          who = "a";
          name = "Unknown";
        }
        return { who, name, text: msg.text, time: formatTime(msg.created_at), isAi: msg.is_ai };
      });

      const aiToHumanIdx = mapped.findIndex(m => !m.isAi);
      if (aiToHumanIdx > 0 && data.status === "green") {
        mapped.splice(aiToHumanIdx, 0, {
          who: "system",
          text: "Both agents flagged this a match. Handing over to humans.",
        });
      }

      setMessages(mapped);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [token, id, agentName]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    if (conv?.status === "green" && conv?.humanChatStarted) {
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [conv?.status, conv?.humanChatStarted, fetchConversation]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || conv?.status !== "green") return;
    const text = draft.trim();
    setDraft("");
    try {
      await api.sendMessage(token, id, text);
      await fetchConversation();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!conv) {
    return (
      <AppShell route="dashboard" fullBleed>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <p style={{ color: "var(--text-muted)" }}>{loadError || "Loading…"}</p>
        </div>
      </AppShell>
    );
  }

  const status = conv.status;
  const isGreen = status === "green";
  const isYellow = status === "yellow";
  const isRed = status === "red";
  const matchName = conv.matchName;
  const matchFirstName = matchName.split(" ")[0];

  return (
    <AppShell route="dashboard" fullBleed>
    <div className="chat-wrap" data-screen-label={`conv-${status}`}>
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-left" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="btn btn-soft btn-sm" onClick={() => navigate("/dashboard")}>{I.back} Back</button>
          <div style={{ width: 1, height: 24, background: "var(--border)", flexShrink: 0 }}></div>
          <Glyph seed={matchName} letter={matchName[0]} />
          <div style={{ minWidth: 0 }}>
            <div className="name-row">
              <span className="who" style={{ fontWeight: 500, fontSize: 16 }}>{matchName}</span>
              {conv.matchAge && <span style={{ color: "var(--text-dim)", fontSize: 13 }}>· {conv.matchAge}</span>}
              <span className={`pill ${status}`}>
                <span className={`dot ${status}`}></span>
                {isGreen ? "Mutual match" : isYellow ? "They passed" : "Mutual no"}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              agent <span style={{ color: "var(--text-muted)" }}>{matchFirstName}'s agent</span> ↔ <span style={{ color: "var(--text-muted)" }}>{agentName}</span> · {messages.filter(m => m.who !== "system").length} messages
            </div>
          </div>
        </div>

        <div className="header-right" style={{ color: "var(--text-dim)", fontSize: 12.5 }}>
          {isGreen && "You can talk to them directly now."}
          {isYellow && "Read-only. The other agent declined."}
          {isRed && "Read-only. Archived."}
        </div>
      </div>

      {/* FEED */}
      <div className="chat-feed" ref={feedRef}>
        {/* Verdict banner */}
        <div className="card" style={{
          padding: "16px 20px",
          borderColor: isGreen ? "rgba(55, 211, 153, .3)" : isYellow ? "rgba(245, 195, 68, .3)" : "rgba(240, 68, 56, .3)",
          background: isGreen ? "var(--green-soft)" : isYellow ? "var(--yellow-soft)" : "var(--red-soft)",
          margin: "4px auto 16px",
          maxWidth: 540,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2, marginBottom: 4 }}>
            {isGreen && "Both agents said yes."}
            {isYellow && <span><em style={{ color: "var(--yellow)", fontStyle: "italic" }}>{agentName}</em> said yes. <em style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{matchFirstName}'s agent</em> said no.</span>}
            {isRed && "Both agents said no."}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {isGreen && "Your messages are clearly marked as you. The agents are out of the room."}
            {isYellow && "You can read the transcript. No replying — it wouldn't be welcome."}
            {isRed && "Kept for the curious. Read-only."}
          </div>
        </div>

        {messages.map((m, i) => {
          if (m.who === "system") {
            return (
              <div key={i} style={{ alignSelf: "center", color: "var(--text-dim)", fontSize: 12, padding: "6px 14px", border: "1px dashed var(--border)", borderRadius: 999, fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>
                {m.text}
              </div>
            );
          }
          const isMine = m.who === "b" || m.who === "human";
          const bubbleCls = m.who === "human" ? "human"
                          : m.who === "them-human" ? "agent-a"
                          : m.who === "a" ? "agent-a" : "agent-b";
          const onRight = isMine;

          return (
            <div key={i} className={`msg-row ${onRight ? "right" : ""}`}>
              {!onRight && <Glyph seed={m.who === "them-human" ? matchName : matchName + "-agent"} letter={(m.name || "?")[0]} size="sm" />}
              <div style={{ display: "flex", flexDirection: "column", alignItems: onRight ? "flex-end" : "flex-start", gap: 4 }}>
                <div className="msg-meta">
                  {!onRight && m.who === "them-human" && (
                    <>
                      <span className="you-pill" style={{ background: "var(--text)", color: "var(--bg)" }}>HUMAN</span>
                      <span>{matchFirstName}</span>
                    </>
                  )}
                  {!onRight && m.who === "a" && (
                    <>
                      <span style={{ color: "var(--text-dim)" }}>agent</span>
                      <span>{matchFirstName}'s agent</span>
                    </>
                  )}
                  {onRight && m.who === "human" && (
                    <>
                      <span>{m.name || "You"}</span>
                      <span className="you-pill">YOU</span>
                    </>
                  )}
                  {onRight && m.who === "b" && (
                    <>
                      <span>{agentName}</span>
                      <span style={{ color: "var(--text-dim)" }}>agent</span>
                    </>
                  )}
                </div>
                <div className={`msg-bubble ${bubbleCls}`} style={
                  m.who === "them-human" ? { background: "var(--text)", color: "var(--bg)", border: 0 } : {}
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
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, color: "var(--text-dim)", fontSize: 12 }}>
            <span className="you-pill" style={{ background: "var(--primary)", color: "var(--primary-ink)", padding: "2px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em" }}>YOU</span>
            Speaking as yourself — your agent is out of the room.
          </div>
          <div className="composer-box">
            <textarea
              placeholder={`Message ${matchFirstName}…`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={1}
            />
            <button className="send-btn" disabled={!draft.trim()} onClick={send} aria-label="Send">
              {I.send}
            </button>
          </div>
        </div>
      ) : (
        <div className={`readonly-bar ${isYellow ? "yellow" : "red"}`}>
          {I.lock}
          {isYellow ? "Read-only — the other agent declined this match." : "Read-only — both agents declined."}
        </div>
      )}
    </div>
    </AppShell>
  );
}
