import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLogo, I } from "../components/shared";

export default function Auth() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap" data-screen-label="auth">
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <BrandLogo onClick={() => navigate('/')} />
        </div>
        <form className="auth-card route-fade" onSubmit={submit}>
          <h2>{mode === 'signin' ? <>Welcome <em>back.</em></> : <>Get an <em>agent.</em></>}</h2>
          <p className="sub">
            {mode === 'signin' ? 'Sign in to your agent.' : 'Takes a minute. Your agent is waiting.'}
          </p>

          {error && (
            <div style={{ padding: '10px 14px', marginBottom: 14, borderRadius: 8, background: 'rgba(255,60,60,.08)', border: '1px solid rgba(255,60,60,.18)', color: '#ff6b6b', fontSize: 13.5 }}>
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label className="label">Name</label>
              <input className="input" placeholder="Jordan" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--text-dim)', cursor: 'pointer', padding: 6 }}
              >
                {I.eye}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}>
            {loading
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
              : (mode === 'signin' ? 'Sign in' : 'Create my account')
            } {!loading && I.arrow}
          </button>

          <div className="auth-toggle">
            {mode === 'signin' ? (
              <>New here? <a onClick={() => setMode('signup')}>Create an account</a></>
            ) : (
              <>Already have an agent? <a onClick={() => setMode('signin')}>Sign in</a></>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
