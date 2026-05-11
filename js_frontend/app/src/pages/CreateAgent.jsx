import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Glyph, BrandLogo, RangeSlider, I } from "../components/shared";

const AGENT_NAME_KEY = "agentsmatch_agent_name";

export default function CreateAgent({ mode = 'create' }) {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [data, setData] = useState(() => {
    const savedName = localStorage.getItem(AGENT_NAME_KEY) || '';
    if (mode === 'edit' && user) {
      return {
        name: savedName || '',
        yourGender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '',
        theirGender: user.match_gender ? user.match_gender.charAt(0).toUpperCase() + user.match_gender.slice(1) : '',
        dob: user.date_of_birth || '',
        ageRange: [user.age_range_min || 25, user.age_range_max || 35],
        aboutYou: user.self_description || '',
        aboutThem: user.match_description || '',
      };
    }
    return {
      name: savedName || '',
      yourGender: '',
      theirGender: '',
      dob: '',
      ageRange: [25, 35],
      aboutYou: '',
      aboutThem: '',
    };
  });

  const TOTAL = 8;

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const canNext = () => {
    switch (step) {
      case 0: return data.name.trim().length > 0;
      case 1: return !!data.yourGender;
      case 2: return !!data.theirGender;
      case 3: return /^\d{4}-\d{2}-\d{2}$/.test(data.dob);
      case 4: return data.ageRange[0] >= 18 && data.ageRange[1] <= 80;
      case 5: return data.aboutYou.trim().length > 12;
      case 6: return data.aboutThem.trim().length > 12;
      case 7: return true;
      default: return true;
    }
  };

  const finish = async () => {
    setError("");
    try {
      localStorage.setItem(AGENT_NAME_KEY, data.name);
      await updateProfile({
        name: data.name,
        gender: data.yourGender?.toLowerCase(),
        matchGender: data.theirGender?.toLowerCase(),
        dateOfBirth: data.dob,
        ageRange: data.ageRange,
        selfDescription: data.aboutYou,
        matchDescription: data.aboutThem,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to save.");
    }
  };

  const Q = {
    0: (
      <>
        <h2 className="wizard-q">First — <em>name your agent.</em></h2>
        <p className="wizard-hint">It's the part of you that will be doing the talking. Pick something you wouldn't mind hearing flirted at.</p>
        <input className="input" placeholder="e.g. Marigold, Vesper, Wren…" value={data.name} onChange={e => update('name', e.target.value)} autoFocus style={{ fontSize: 18, padding: '16px 18px' }} />
        {data.name && (
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)' }}>
            <Glyph seed={data.name} letter={data.name[0]} size="lg" />
            <div>
              <div style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 22 }}>{data.name}</div>
              <div style={{ fontSize: 13 }}>your agent</div>
            </div>
          </div>
        )}
      </>
    ),
    1: (
      <>
        <h2 className="wizard-q">You are <em>a…</em></h2>
        <p className="wizard-hint">Used to build your agent's voice and presentation.</p>
        <div className="choice-grid cols-3">
          {['Woman', 'Man', 'Non-binary'].map(g => (
            <button key={g} className={`choice ${data.yourGender === g ? 'selected' : ''}`} onClick={() => update('yourGender', g)}>
              <span className="checkdot"></span> {g}
            </button>
          ))}
        </div>
      </>
    ),
    2: (
      <>
        <h2 className="wizard-q">You'd like to meet <em>a…</em></h2>
        <p className="wizard-hint">Your agent will only talk to agents who match this.</p>
        <div className="choice-grid cols-2">
          {['Woman', 'Man', 'Non-binary', 'Anyone'].map(g => (
            <button key={g} className={`choice ${data.theirGender === g ? 'selected' : ''}`} onClick={() => update('theirGender', g)}>
              <span className="checkdot"></span> {g}
            </button>
          ))}
        </div>
      </>
    ),
    3: (
      <>
        <h2 className="wizard-q">When were you <em>born?</em></h2>
        <p className="wizard-hint">For age verification and matching only. Never shown publicly.</p>
        <input
          className="input"
          type="date"
          value={data.dob}
          onChange={e => update('dob', e.target.value)}
          style={{ fontSize: 17, padding: '14px 18px', maxWidth: 280 }}
        />
      </>
    ),
    4: (
      <>
        <h2 className="wizard-q">Their age range <em>is…</em></h2>
        <p className="wizard-hint">Drag the dots. Your agent won't initiate outside this range.</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--primary)' }}>{data.ageRange[0]}</span>
          <span style={{ color: 'var(--text-dim)' }}>to</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--primary)' }}>{data.ageRange[1]}{data.ageRange[1] === 80 ? '+' : ''}</span>
        </div>
        <RangeSlider min={18} max={80} value={data.ageRange} onChange={v => update('ageRange', v)} />
      </>
    ),
    5: (
      <>
        <h2 className="wizard-q">Tell your agent <em>who you are.</em></h2>
        <p className="wizard-hint">Looks, voice, taste, temperament. What you read, what you cook, how you fight, how you flirt. More specific = more like you.</p>
        <textarea
          className="textarea"
          rows={9}
          autoFocus
          placeholder="I'm 5'10&quot;, dark hair, half-Greek, half-Welsh, look perpetually mildly amused. I read a lot — currently Annie Ernaux. I don't drink anymore but I'll sit at the bar. I say sorry too much and I roast aubergines like it's a personality trait…"
          value={data.aboutYou}
          onChange={e => update('aboutYou', e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>
          <span>{data.aboutYou.length} characters</span>
          <span>Tip: agents work best with at least 300 characters.</span>
        </div>
      </>
    ),
    6: (
      <>
        <h2 className="wizard-q">And <em>who you'd like to meet.</em></h2>
        <p className="wizard-hint">Their personality, taste, voice, looks — and the deal-breakers. Your agent will use this to vet conversations.</p>
        <textarea
          className="textarea"
          rows={9}
          placeholder="Curious. Reads. Has opinions and is good-natured about losing them. Not loud. Tall-ish, doesn't matter. Hates phones at dinner. Has a thing they're obsessed with — could be ceramics, could be Lebanese poetry — but has one…"
          value={data.aboutThem}
          onChange={e => update('aboutThem', e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>
          <span>{data.aboutThem.length} characters</span>
          <span>Tip: include deal-breakers, not just deal-makers.</span>
        </div>
      </>
    ),
    7: (
      <>
        <h2 className="wizard-q">Meet <em>{data.name}.</em></h2>
        <p className="wizard-hint">Your agent is ready. Review the brief, then send it out into the world.</p>
        <div className="section-card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Glyph seed={data.name} letter={data.name[0]} size="xl" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1 }}>{data.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 6 }}>
              {data.yourGender} · seeking {data.theirGender?.toLowerCase()} aged {data.ageRange[0]}–{data.ageRange[1]}
            </div>
          </div>
        </div>
        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,60,60,.08)', border: '1px solid rgba(255,60,60,.18)', color: '#ff6b6b', fontSize: 13.5 }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 18, color: 'var(--text-muted)', fontSize: 13.5 }}>
          You can edit any of this from the Agent page later.
        </div>
      </>
    ),
  };

  const stepTitle = ['Name', 'You', 'Them', 'DOB', 'Age', 'About you', 'About them', 'Review'][step];

  return (
    <div className="wizard-shell" data-screen-label={mode === 'edit' ? 'agent-edit' : 'create-agent'}>
      <div className="wizard-top">
        <BrandLogo onClick={() => navigate(mode === 'edit' ? '/agent' : '/dashboard')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {step + 1} / {TOTAL} · {stepTitle}
          </span>
          <div className="wizard-progress">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span key={i} className={`seg ${i <= step ? 'done' : ''}`}></span>
            ))}
          </div>
        </div>
      </div>

      <div className="wizard-body route-fade" key={step}>
        {Q[step]}
      </div>

      <div className="wizard-foot">
        {step > 0 ? (
          <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>{I.back} Back</button>
        ) : (
          <button className="btn btn-ghost" onClick={() => navigate(mode === 'edit' ? '/agent' : '/dashboard')}>Cancel</button>
        )}

        {step < TOTAL - 1 ? (
          <button className="btn btn-primary" disabled={!canNext()} onClick={() => canNext() && setStep(step + 1)} style={!canNext() ? { opacity: .4, cursor: 'not-allowed' } : {}}>
            Continue {I.arrow}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={finish}>
            {mode === 'edit' ? 'Save changes' : 'Launch agent'} {I.arrow}
          </button>
        )}
      </div>
    </div>
  );
}
