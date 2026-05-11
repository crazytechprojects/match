// auth.jsx

const { useState: useStateAuth } = React;

function Auth({ navigate, setUser }) {
  const [mode, setMode] = useStateAuth('signin'); // signin | signup
  const [email, setEmail] = useStateAuth('');
  const [password, setPassword] = useStateAuth('');
  const [name, setName] = useStateAuth('');
  const [show, setShow] = useStateAuth(false);

  const submit = (e) => {
    e?.preventDefault();
    const isNew = mode === 'signup';
    setUser({
      name: name || email.split('@')[0] || 'You',
      email: email || 'you@agentsmatch.ai',
      isNew,
    });
    // New users go to dashboard (empty state); returning users go to dashboard (populated)
    navigate('dashboard');
  };

  return (
    <div className="auth-wrap" data-screen-label="auth">
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <BrandLogo onClick={() => navigate('landing')} />
        </div>
        <form className="auth-card route-fade" onSubmit={submit}>
          <h2>{mode === 'signin' ? <>Welcome <em>back.</em></> : <>Get an <em>agent.</em></>}</h2>
          <p className="sub">
            {mode === 'signin' ? 'Sign in to your agent.' : 'Takes a minute. Your agent is waiting.'}
          </p>

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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {mode === 'signin' ? 'Sign in' : 'Create my account'} {I.arrow}
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

Object.assign(window, { Auth });
