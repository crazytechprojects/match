// shared.jsx — icons, glyphs, brand, sidebar, layout

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Pseudo-random hash from string for deterministic glyph colors
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

// Warm palette anchors for glyph backgrounds — vary hue, share warmth
const GLYPH_GRADS = [
  ['#e87560', '#7a2c1f'], // coral → wine
  ['#d4a017', '#5c3a0a'], // amber → cocoa
  ['#9c5db0', '#3d1d4a'], // mauve → plum
  ['#5b8def', '#1a2e5c'], // periwinkle → ink (cool counterpoint)
  ['#37d399', '#0e4a36'], // mint → forest
  ['#e3577a', '#5a1230'], // rose → maroon
  ['#f29a5e', '#5c2916'], // peach → rust
  ['#7a9d6e', '#2b4226'], // sage → moss
];

function Glyph({ seed = "x", letter, size = "md", style }) {
  const idx = hashStr(seed) % GLYPH_GRADS.length;
  const [c1, c2] = GLYPH_GRADS[idx];
  const angle = (hashStr(seed + "a") % 360);
  const cls = `glyph ${size === "lg" ? "lg" : size === "xl" ? "xl" : size === "sm" ? "sm" : ""}`;
  const bg = `radial-gradient(circle at 30% 25%, ${c1} 0%, ${c2} 75%)`;
  const init = (letter || seed[0] || "?").toUpperCase();
  return (
    <span className={cls} style={{ background: bg, ...style }}>
      <span style={{ transform: `rotate(${angle * 0}deg)`, position: 'relative', zIndex: 1 }}>{init}</span>
    </span>
  );
}

function BrandMark({ size = 26 }) {
  return <span className="brand-mark" style={{ width: size, height: size }}></span>;
}

function BrandLogo({ onClick }) {
  return (
    <div className="brand" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <BrandMark />
      <span className="brand-name">agents<em>match</em></span>
    </div>
  );
}

// ───────── Icons (minimal stroke) ─────────
const I = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
  ),
  agent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
  ),
  profile: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19c1-3 3.5-4 5.5-4s4.5 1 5.5 4"/></svg>
  ),
  billing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/></svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12H4"/><path d="M9 17l-5-5 5-5"/><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l14-7-5 16-3-7-6-2z"/></svg>
  ),
  sparkle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  back: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M11 19l-7-7 7-7"/></svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6"/></svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
  ),
};

// ───────── Sidebar ─────────
function Sidebar({ route, navigate, user, agent }) {
  const items = [
    { id: 'dashboard', label: 'Conversations', icon: I.dashboard },
    { id: 'agent', label: 'Your agent', icon: I.agent },
    { id: 'profile', label: 'Profile', icon: I.profile },
    { id: 'billing', label: 'Billing', icon: I.billing },
  ];
  return (
    <aside className="sidebar">
      <BrandLogo onClick={() => navigate('landing')} />
      {items.map(it => (
        <div
          key={it.id}
          className={`nav-item ${route === it.id ? 'active' : ''}`}
          onClick={() => navigate(it.id)}
        >
          <span className="ico">{it.icon}</span>
          {it.label}
        </div>
      ))}
      <div className="spacer"></div>
      <div
        className="nav-item"
        onClick={() => navigate('landing')}
      >
        <span className="ico">{I.logout}</span>
        Log out
      </div>
      <div className="footer-mini">
        {agent ? (
          <>
            <Glyph seed={agent.name} letter={agent.name[0]} size="sm" />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ color: 'var(--text)', fontSize: 13 }}>{agent.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{user?.email || 'you@example.com'}</div>
            </div>
          </>
        ) : <span>not signed in</span>}
      </div>
    </aside>
  );
}

// ───────── AppShell ─────────
function AppShell({ route, navigate, user, agent, children }) {
  return (
    <div className="shell" data-screen-label={route}>
      <Sidebar route={route} navigate={navigate} user={user} agent={agent} />
      <main className="main route-fade" key={route}>{children}</main>
    </div>
  );
}

// ───────── Range slider ─────────
function RangeSlider({ min, max, value, onChange }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(null); // 'lo' | 'hi' | null
  const [lo, hi] = value;

  const set = (which, raw) => {
    const v = Math.round(Math.max(min, Math.min(max, raw)));
    if (which === 'lo') onChange([Math.min(v, hi), hi]);
    else onChange([lo, Math.max(v, lo)]);
  };

  const onPointer = (e) => {
    if (!drag || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const raw = min + pct * (max - min);
    set(drag, raw);
  };

  useEffect(() => {
    const up = () => setDrag(null);
    if (drag) {
      window.addEventListener('pointermove', onPointer);
      window.addEventListener('pointerup', up);
    }
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, lo, hi]);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  return (
    <div>
      <div className="range" ref={ref}>
        <div className="track"></div>
        <div className="fill" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}></div>
        <div
          className={`knob ${drag === 'lo' ? 'dragging' : ''}`}
          style={{ left: `${pct(lo)}%` }}
          onPointerDown={(e) => { e.preventDefault(); setDrag('lo'); }}
        ></div>
        <div
          className={`knob ${drag === 'hi' ? 'dragging' : ''}`}
          style={{ left: `${pct(hi)}%` }}
          onPointerDown={(e) => { e.preventDefault(); setDrag('hi'); }}
        ></div>
      </div>
      <div className="range-readout">
        <span>{lo}</span>
        <span>{hi}{hi === max ? '+' : ''}</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  Glyph, BrandMark, BrandLogo, Sidebar, AppShell, RangeSlider, I, hashStr,
});
