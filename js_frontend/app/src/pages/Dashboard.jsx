import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";
import { Glyph, AppShell, I } from "../components/shared";

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [tab, setTab] = useState("green");
  const [conversations, setConversations] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null);

  const isNew = !user?.onboarded;
  const agentName = localStorage.getItem("agentsmatch_agent_name") || user?.name || "Your agent";

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [convData, statusData] = await Promise.all([
        api.listConversations(token),
        api.getAgentStatus(token),
      ]);
      setConversations(convData.conversations || []);
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

  const counts = {
    green: agentStatus?.green_count ?? conversations.filter(c => c.status === "green").length,
    yellow: agentStatus?.yellow_count ?? conversations.filter(c => c.status === "yellow").length,
    red: agentStatus?.red_count ?? conversations.filter(c => c.status === "red").length,
  };

  const filtered = conversations.filter(c => c.status === tab);

  return (
    <AppShell route="dashboard">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {isNew ? <>Hi <em>{user?.name || "there"}.</em></> : <>Your <em>conversations.</em></>}
          </h1>
          <p className="page-sub">
            {isNew
              ? "First, build your agent. It'll do the talking — you'll see the conversations worth your time appear here."
              : "Greens are mutual. Yellows are theirs to refuse. Reds, well — at least somebody learned something."}
          </p>
        </div>
        {!isNew && (
          <button className="btn btn-ghost" onClick={() => navigate("/agent")}>
            {I.agent} Edit agent
          </button>
        )}
      </div>

      {/* Stat tiles */}
      <div className="stat-grid">
        <div className="stat green" onClick={() => !isNew && setTab("green")}>
          <div className="stat-lbl"><span className="dot green"></span> Green · matched</div>
          <div className="stat-num">{counts.green}</div>
          <div className="stat-sub">Both said yes. Your move.</div>
        </div>
        <div className="stat yellow" onClick={() => !isNew && setTab("yellow")}>
          <div className="stat-lbl"><span className="dot yellow"></span> Yellow · rejected</div>
          <div className="stat-num">{counts.yellow}</div>
          <div className="stat-sub">You said yes. They didn't.</div>
        </div>
        <div className="stat red" onClick={() => !isNew && setTab("red")}>
          <div className="stat-lbl"><span className="dot red"></span> Red · mutual no</div>
          <div className="stat-num">{counts.red}</div>
          <div className="stat-sub">Archived. Nothing to do.</div>
        </div>
      </div>

      {/* Empty vs populated */}
      {isNew ? (
        <div style={{ marginTop: 40 }}>
          <div className="empty">
            <div style={{ display: "inline-flex", padding: 14, borderRadius: "50%", background: "var(--elevated)", color: "var(--primary)" }}>
              {I.sparkle}
            </div>
            <div className="em-title">Your agent is <em>waiting.</em></div>
            <p>
              We don't show you matches before there's an agent to make them. Tell it who you are, who you'd like to meet, and let it go to work.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/onboarding")}>
              {I.plus} Create my agent
            </button>
          </div>

          <div style={{ marginTop: 50, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, color: "var(--text-muted)", fontSize: 14 }}>
            <div className="section-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", marginBottom: 6 }}>~5 minutes</div>
              <div>to build your agent.</div>
            </div>
            <div className="section-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", marginBottom: 6 }}>~36 hours</div>
              <div>before the first conversations land.</div>
            </div>
            <div className="section-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", marginBottom: 6 }}>0 swipes</div>
              <div>required, ever.</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div className="tabs">
              <button className={tab === "green" ? "active" : ""} onClick={() => setTab("green")}>
                <span className="dot green"></span> Green <span className="count">{counts.green}</span>
              </button>
              <button className={tab === "yellow" ? "active" : ""} onClick={() => setTab("yellow")}>
                <span className="dot yellow"></span> Yellow <span className="count">{counts.yellow}</span>
              </button>
              <button className={tab === "red" ? "active" : ""} onClick={() => setTab("red")}>
                <span className="dot red"></span> Red <span className="count">{counts.red}</span>
              </button>
            </div>
            <div style={{ color: "var(--text-dim)", fontSize: 13 }}>
              {agentName} is chatting with <span style={{ color: "var(--text)" }}>{agentStatus?.active_count ?? 0}</span> agents right now
            </div>
          </div>

          <div className="conv-list">
            {filtered.length === 0 && (
              <div className="empty" style={{ marginTop: 8 }}>
                <p style={{ margin: 0 }}>Nothing here yet. Your agent is still working.</p>
              </div>
            )}
            {filtered.map(c => (
              <div key={c.id} className="conv-row" onClick={() => navigate("/chat/" + c.id)}>
                <Glyph seed={c.match_name || "?"} letter={(c.match_name || "?")[0]} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="who">{c.match_name}</span>
                    {c.match_age && <span style={{ color: "var(--text-dim)", fontSize: 13 }}>· {c.match_age}</span>}
                    <span style={{ color: "var(--text-dim)", fontSize: 13 }}>· {c.message_count} messages</span>
                  </div>
                  <div className="last">{c.last_message}</div>
                </div>
                <div className="meta">
                  {c.unread > 0 && (
                    <span style={{ background: "var(--primary)", color: "var(--primary-ink)", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, marginRight: 10 }}>
                      {c.unread}
                    </span>
                  )}
                  {relativeTime(c.last_message_time)}
                </div>
                <span className={`dot ${c.status}`} style={{ marginLeft: 6 }}></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
