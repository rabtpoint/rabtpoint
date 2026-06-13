import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, uploadImage } from '../services/api';
import { SITE, loginMeta } from '../data/publicPages';

const applyLoginSeo = () => {
  const path = window.location.pathname === '/' ? '/' : '/login';

  document.title = `${loginMeta.title} | RabtPoint`;

  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement('meta');
    description.setAttribute('name', 'description');
    document.head.appendChild(description);
  }
  description.setAttribute('content', loginMeta.description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', path === '/' ? `${SITE}/` : `${SITE}/login`);
};

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

export default function AuthGate() {
  const { login } = useApp();

  useEffect(() => {
    applyLoginSeo();
  }, []);

  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingPhoto(true);

    try {
      const data = await uploadImage(file);
      setForm((current) => ({ ...current, photo: data.url }));
      setInfo('Photo upload ho gaya.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
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

      const data = await api('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setOtpSent(true);
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtpAndCreateAccount = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const session = await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, otp })
      });
      login(session);
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
          <h1>Login to RabtPoint</h1>
          <p className="muted">{loginMeta.intro}</p>
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
              <label className="file-upload">
                {uploadingPhoto ? 'Photo upload ho rahi hai...' : 'Upload profile photo'}
                <input accept="image/*" type="file" onChange={uploadPhoto} />
              </label>
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
            {mode === 'signup' ? (otpSent ? 'Resend OTP' : 'Send OTP') : 'Login'}
          </button>

          {mode === 'signup' && otpSent && (
            <>
              <input
                required
                inputMode="numeric"
                maxLength="6"
                placeholder="6 digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button className="secondary-button" type="button" onClick={verifyOtpAndCreateAccount} disabled={submitting || otp.length !== 6}>
                Verify OTP and create account
              </button>
            </>
          )}
        </form>
      </section>
    </main>
  );
}
