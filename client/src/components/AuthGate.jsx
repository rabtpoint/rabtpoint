import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { SITE, loginMeta } from '../data/publicPages';
import SignupForm from './SignupForm';

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

const resetForm = {
  email: '',
  otp: '',
  resetToken: '',
  password: ''
};

export default function AuthGate() {
  const { login } = useApp();

  useEffect(() => {
    applyLoginSeo();
  }, []);

  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [otpLogin, setOtpLogin] = useState({ email: '', otp: '' });
  const [forgot, setForgot] = useState(resetForm);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetVerified, setResetVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setInfo('');
  };

  const updateLogin = (field) => (event) => {
    setLoginForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateOtpLogin = (field) => (event) => {
    setOtpLogin((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateForgot = (field) => (event) => {
    setForgot((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitPasswordLogin = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      login(
        await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify(loginForm)
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendLoginOtp = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const data = await api('/auth/login/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: otpLogin.email })
      });
      setLoginOtpSent(true);
      if (data.devOtp) setOtpLogin((current) => ({ ...current, otp: data.devOtp }));
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtpLogin = (event) => {
    if (!loginOtpSent) {
      sendLoginOtp(event);
      return;
    }

    event.preventDefault();

    if (otpLogin.otp.length === 6) {
      verifyLoginOtp();
    }
  };

  const verifyLoginOtp = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      login(
        await api('/auth/login/verify-otp', {
          method: 'POST',
          body: JSON.stringify(otpLogin)
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendResetOtp = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const data = await api('/auth/password/forgot/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: forgot.email })
      });
      setResetOtpSent(true);
      setResetVerified(false);
      if (data.devOtp) setForgot((current) => ({ ...current, otp: data.devOtp }));
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitForgot = (event) => {
    if (!resetOtpSent) {
      sendResetOtp(event);
      return;
    }

    event.preventDefault();

    if (!resetVerified && forgot.otp.length === 6) {
      verifyResetOtp();
      return;
    }

    if (resetVerified && forgot.password.length >= 6) {
      resetPassword();
    }
  };

  const verifyResetOtp = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const data = await api('/auth/password/forgot/verify', {
        method: 'POST',
        body: JSON.stringify({ email: forgot.email, otp: forgot.otp })
      });
      setForgot((current) => ({ ...current, resetToken: data.resetToken }));
      setResetVerified(true);
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const data = await api('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({
          email: forgot.email,
          resetToken: forgot.resetToken,
          password: forgot.password
        })
      });
      setInfo(data.message);
      setForgot(resetForm);
      setResetOtpSent(false);
      setResetVerified(false);
      setMode('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell neon-auth-shell">
      <section className="auth-card neon-auth-card">
        <div className="auth-brand">
          <div className="auth-logo-ring">
            <span>R</span>
          </div>
          <h1 className="auth-title">RabtPoint</h1>
          <p className="muted auth-subtitle">Sign in or create your account</p>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => switchMode('login')}>
            Login
          </button>
          <button className={mode === 'otpLogin' ? 'active' : ''} type="button" onClick={() => switchMode('otpLogin')}>
            OTP Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => switchMode('signup')}>
            Sign up
          </button>
        </div>

        {mode === 'login' && (
          <form className="auth-form" onSubmit={submitPasswordLogin}>
            <input required type="email" placeholder="Email" value={loginForm.email} onChange={updateLogin('email')} />
            <input required minLength="6" type="password" placeholder="Password" value={loginForm.password} onChange={updateLogin('password')} />

            {info && <p className="info-text">{info}</p>}
            {error && <p className="error-text">{error}</p>}

            <button className="primary-button" type="submit" disabled={submitting}>
              Login
            </button>
            <button className="secondary-button" type="button" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          </form>
        )}

        {mode === 'otpLogin' && (
          <form className="auth-form" onSubmit={submitOtpLogin}>
            <input required type="email" placeholder="Email" value={otpLogin.email} onChange={updateOtpLogin('email')} />

            {loginOtpSent && (
              <>
                <input
                  required
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="6 digit login OTP"
                  value={otpLogin.otp}
                  onChange={(event) => setOtpLogin((current) => ({ ...current, otp: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                />
                <button className="secondary-button" type="button" onClick={verifyLoginOtp} disabled={submitting || otpLogin.otp.length !== 6}>
                  Verify OTP and login
                </button>
              </>
            )}

            {info && <p className="info-text">{info}</p>}
            {error && <p className="error-text">{error}</p>}

            <button className="primary-button" type="submit" disabled={submitting}>
              {loginOtpSent ? 'Resend Login OTP' : 'Send Login OTP'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="auth-form" onSubmit={submitForgot}>
            <input required type="email" placeholder="Email" value={forgot.email} onChange={updateForgot('email')} />

            {resetOtpSent && !resetVerified && (
              <>
                <input
                  required
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="6 digit reset OTP"
                  value={forgot.otp}
                  onChange={(event) => setForgot((current) => ({ ...current, otp: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                />
                <button className="secondary-button" type="button" onClick={verifyResetOtp} disabled={submitting || forgot.otp.length !== 6}>
                  Verify reset OTP
                </button>
              </>
            )}

            {resetVerified && (
              <>
                <input required minLength="6" type="password" placeholder="New password" value={forgot.password} onChange={updateForgot('password')} />
                <button className="secondary-button" type="button" onClick={resetPassword} disabled={submitting || forgot.password.length < 6}>
                  Reset password
                </button>
              </>
            )}

            {info && <p className="info-text">{info}</p>}
            {error && <p className="error-text">{error}</p>}

            {!resetVerified && (
              <button className="primary-button" type="submit" disabled={submitting}>
                {resetOtpSent ? 'Resend Reset OTP' : 'Send Reset OTP'}
              </button>
            )}
            <button className="secondary-button" type="button" onClick={() => switchMode('login')}>
              Back to login
            </button>
          </form>
        )}

        {mode === 'signup' && <SignupForm />}
      </section>
    </main>
  );
}
