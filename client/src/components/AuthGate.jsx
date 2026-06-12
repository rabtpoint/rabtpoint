import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { confirmEmailVerification, sendSignupVerification } from '../services/firebase';

const initialForm = {
  name: '',
  email: '',
  password: '',
  photo: '',
  country: '',
  state: '',
  district: '',
  latitude: '',
  longitude: ''
};

const pendingSignupKey = 'rabtpoint_pending_signup';

const readPendingSignup = () => {
  const saved = localStorage.getItem(pendingSignupKey);
  return saved ? JSON.parse(saved) : null;
};

export default function AuthGate() {
  const { login } = useApp();
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState(() => readPendingSignup() || initialForm);
  const [pendingSignup, setPendingSignup] = useState(() => readPendingSignup());
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser location permission support nahi karta.');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setLoadingLocation(false);
      },
      () => {
        setError('Location permission denied. Aap manually latitude/longitude fill kar sakte ho.');
        setLoadingLocation(false);
      }
    );
  };

  const createBackendAccount = async (signupForm) => {
    const session = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupForm)
    });

    localStorage.removeItem(pendingSignupKey);
    setPendingSignup(null);
    login(session);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        login(
          await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: form.email, password: form.password })
          })
        );
        return;
      }

      await sendSignupVerification(form);
      localStorage.setItem(pendingSignupKey, JSON.stringify(form));
      setPendingSignup(form);
      setInfo('Verification email bhej diya hai. Inbox/spam me link click karke niche wala button dabao.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const finishVerifiedSignup = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const signupForm = pendingSignup || form;
      await confirmEmailVerification(signupForm);
      await createBackendAccount(signupForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div>
          <p className="eyebrow">RabtPoint MERN</p>
          <h1>Sign in karo aur apni permanent location set karo.</h1>
          <p className="muted">
            Signup se pehle Firebase email verification hoga. Verify hone ke baad data MongoDB me save hoga.
          </p>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>
            Sign up
          </button>
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
            Login
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <input required placeholder="Name" value={form.name} onChange={update('name')} />
              <input placeholder="Photo URL" value={form.photo} onChange={update('photo')} />
            </>
          )}

          <input required type="email" placeholder="Email" value={form.email} onChange={update('email')} />
          <input required minLength="6" type="password" placeholder="Password" value={form.password} onChange={update('password')} />

          {mode === 'signup' && (
            <>
              <div className="form-grid">
                <input required placeholder="Country" value={form.country} onChange={update('country')} />
                <input required placeholder="State" value={form.state} onChange={update('state')} />
                <input required placeholder="District" value={form.district} onChange={update('district')} />
              </div>
              <button className="secondary-button" type="button" onClick={useCurrentLocation}>
                {loadingLocation ? 'Location aa rahi hai...' : 'Use current location permission'}
              </button>
              <div className="form-grid">
                <input required type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={update('latitude')} />
                <input required type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={update('longitude')} />
              </div>
            </>
          )}

          {info && <p className="info-text">{info}</p>}
          {error && <p className="error-text">{error}</p>}

          <button className="primary-button" type="submit" disabled={submitting}>
            {mode === 'signup' ? 'Send verification email' : 'Login'}
          </button>

          {mode === 'signup' && pendingSignup && (
            <button className="secondary-button" type="button" onClick={finishVerifiedSignup} disabled={submitting}>
              I verified my email, create account
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
