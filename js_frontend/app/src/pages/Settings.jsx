import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";
import { Glyph, AppShell, I } from "../components/shared";

function capitalize(s) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ───────── Profile page ─────────
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || "");

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user]);

  const save = async (e) => {
    e?.preventDefault();
    try {
      await updateUser({ name });
      setSaved(true);
      setCur("");
      setNext("");
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  return (
    <AppShell route="profile">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your <em>profile.</em></h1>
          <p className="page-sub">The boring, important stuff. Your agent does the rest.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div className="section-card">
          <h3>Account</h3>
          <p className="desc">Used for signing in. Not visible to other users or agents.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={user?.email || ""} readOnly style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <button className="btn btn-primary" onClick={save}>Save profile</button>
              {saved && <span style={{ marginLeft: 12, color: "var(--green)", fontSize: 13 }}>{I.check} Saved</span>}
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3>Password</h3>
          <p className="desc">Updates take effect immediately on this device.</p>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Current password</label>
              <input className="input" type="password" placeholder="••••••••" value={cur} onChange={e => setCur(e.target.value)} />
            </div>
            <div>
              <label className="label">New password</label>
              <input className="input" type="password" placeholder="At least 8 characters" value={next} onChange={e => setNext(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary" disabled={!cur || next.length < 8} type="submit" style={(!cur || next.length < 8) ? { opacity: .4, cursor: "not-allowed" } : {}}>
                Update password
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 22 }}>
        <h3>Danger zone</h3>
        <p className="desc">Pausing your agent stops outbound conversations immediately. Existing ones stay accessible.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-soft">Pause agent</button>
          <button className="btn btn-ghost" style={{ color: "var(--red)", borderColor: "rgba(240,68,56,.4)" }}>Delete account</button>
        </div>
      </div>
    </AppShell>
  );
}

// ───────── Agent specs page ─────────
export function AgentPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [agentStatus, setAgentStatus] = useState(null);

  const isNew = !user?.onboarded;
  const agentName = localStorage.getItem("agentsmatch_agent_name") || user?.name || "Your agent";

  useEffect(() => {
    if (token) {
      api.getAgentStatus(token).then(setAgentStatus).catch(() => {});
    }
  }, [token]);

  if (isNew) {
    return (
      <AppShell route="agent">
        <div className="page-head">
          <div>
            <h1 className="page-title">Your <em>agent.</em></h1>
            <p className="page-sub">No agent yet.</p>
          </div>
        </div>
        <div className="empty">
          <div className="em-title">No agent <em>yet.</em></div>
          <p>Build your agent to start showing up in conversations.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/onboarding")}>
            {I.plus} Create my agent
          </button>
        </div>
      </AppShell>
    );
  }

  const age = user?.date_of_birth
    ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : "—";

  const ageMin = user?.age_range_min ?? 18;
  const ageMax = user?.age_range_max ?? 80;

  return (
    <AppShell route="agent">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your <em>agent.</em></h1>
          <p className="page-sub">The brief you handed your agent. Edit any of it; changes apply to new conversations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/onboarding?mode=edit")}>
          Edit agent {I.arrow}
        </button>
      </div>

      <div className="section-card" style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 22 }}>
        <Glyph seed={agentName} letter={agentName[0]} size="xl" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 38, lineHeight: 1 }}>{agentName}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
            {capitalize(user?.gender)} · age {age} · seeking {(user?.match_gender || "").toLowerCase()} aged {ageMin}–{ageMax}{ageMax === 80 ? "+" : ""}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {agentStatus?.is_active ? (
              <span className="pill green"><span className="dot green"></span> Active</span>
            ) : (
              <span className="pill"><span className="dot"></span> Idle</span>
            )}
            <span className="pill">{agentStatus?.total_conversations ?? 0} live conversations</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div className="section-card">
          <h3>You</h3>
          <p className="desc">How your agent describes you.</p>
          <div className="kv" style={{ marginBottom: 18 }}>
            <div className="k">Gender</div><div className="v">{capitalize(user?.gender)}</div>
            <div className="k">Born</div><div className="v">{user?.date_of_birth || "—"}</div>
          </div>
          <div className="label">Self-portrait</div>
          <p style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
            {user?.self_description || <em>None yet.</em>}
          </p>
        </div>

        <div className="section-card">
          <h3>Them</h3>
          <p className="desc">The brief for who your agent looks for.</p>
          <div className="kv" style={{ marginBottom: 18 }}>
            <div className="k">Gender</div><div className="v">{capitalize(user?.match_gender)}</div>
            <div className="k">Age range</div><div className="v">{ageMin}–{ageMax}{ageMax === 80 ? "+" : ""}</div>
          </div>
          <div className="label">Looking for</div>
          <p style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
            {user?.match_description || <em>None yet.</em>}
          </p>
        </div>
      </div>
    </AppShell>
  );
}

// ───────── Billing ─────────
export function Billing() {
  const [plan, setPlan] = useState("plus");

  return (
    <AppShell route="billing">
      <div className="page-head">
        <div>
          <h1 className="page-title">Billing.</h1>
          <p className="page-sub">Your plan and your payment method. Nothing else.</p>
        </div>
      </div>

      {/* Current plan */}
      <div className="section-card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h3 style={{ margin: 0 }}>Plus</h3>
              <span className="pill green"><span className="dot green"></span> Current plan</span>
            </div>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 0", fontSize: 14 }}>
              Unlimited conversations · priority matching · agent memory across sessions
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 1 }}>
              $24<span style={{ fontSize: 18, color: "var(--text-muted)" }}>/mo</span>
            </div>
            <div style={{ color: "var(--text-dim)", fontSize: 12.5, marginTop: 4 }}>Next charge May 28, 2026</div>
          </div>
        </div>

        <div className="divider"></div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { id: "free",  name: "Free",     price: "$0",   blurb: "1 active conversation" },
            { id: "plus",  name: "Plus",     price: "$24",  blurb: "Unlimited · priority" },
            { id: "pro",   name: "Concierge",price: "$96",  blurb: "+ human curation reviews" },
          ].map(p => (
            <div
              key={p.id}
              onClick={() => setPlan(p.id)}
              style={{
                padding: 18,
                borderRadius: 14,
                border: `1px solid ${plan === p.id ? "var(--primary)" : "var(--border)"}`,
                background: plan === p.id ? "rgba(232,117,96,.06)" : "var(--bg-2)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                {plan === p.id && <span style={{ color: "var(--primary)", fontSize: 12 }}>● Selected</span>}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "8px 0 4px" }}>{p.price}<span style={{ fontSize: 12, color: "var(--text-dim)" }}>/mo</span></div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{p.blurb}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn btn-ghost">Cancel plan</button>
          <button className="btn btn-primary">Update plan</button>
        </div>
      </div>

      {/* Payment method */}
      <div className="section-card">
        <h3>Payment method</h3>
        <p className="desc">Card on file. Billing receipts are sent by email.</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, border: "1px solid var(--border)", borderRadius: 14, background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 30, borderRadius: 6, background: "linear-gradient(135deg, #ffb185, #e87560 60%, #b1442f)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-ink)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".06em" }}>
              VISA
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>•••• •••• •••• 4242</div>
              <div style={{ color: "var(--text-dim)", fontSize: 12.5 }}>Expires 11/28 · Jordan A.</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm">Replace</button>
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="label">Billing email</div>
          <input className="input" defaultValue="jordan@agentsmatch.ai" />
        </div>
      </div>
    </AppShell>
  );
}
