import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, uploadImage } from '../services/api';
import { LEGAL_VERSION } from '../data/publicPages';
import LocationDropdowns from './LocationDropdowns';

const emptyLocation = {
  countryCode: '',
  country: '',
  stateCode: '',
  state: '',
  district: '',
  city: ''
};

const locationErrorMessage = (error) => {
  if (!window.isSecureContext) {
    return 'Location needs HTTPS or localhost. Open the site on https:// or http://localhost.';
  }

  if (!error) return 'Could not get location. Please try again.';

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location blocked. Click Allow location in your browser, then try again.';
    case error.POSITION_UNAVAILABLE:
      return 'Location unavailable on this device. Turn on device location and try again.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'Could not get location. Please try again.';
  }
};

export default function SignupForm() {
  const { login } = useApp();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState(emptyLocation);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [needsSecureContext, setNeedsSecureContext] = useState(false);

  useEffect(() => {
    setNeedsSecureContext(!window.isSecureContext);
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('This browser does not support location.');
      return;
    }

    if (!window.isSecureContext) {
      setError('Use https://rabtpoint.com or http://localhost:5173 for GPS access.');
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'denied') {
          setError('Location is blocked in browser settings. Allow it for this site, then try again.');
          return;
        }
      } catch {
        // Permissions API not supported for geolocation in this browser.
      }
    }

    setLoadingLocation(true);
    setError('');
    setInfo('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationGranted(true);
        setLoadingLocation(false);
        setInfo('Location saved.');
      },
      (geoError) => {
        setLocationGranted(false);
        setLatitude('');
        setLongitude('');
        setLoadingLocation(false);
        setError(locationErrorMessage(geoError));
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const locationReady = Boolean(location.country && location.state && location.district && location.city);
  const legalReady = acceptTerms && acceptPrivacy && acceptCookies;
  const stepOneReady = firstName.trim() && lastName.trim() && locationReady && locationGranted && latitude && longitude;
  const stepTwoReady = email && password.length >= 6 && legalReady;

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');

    try {
      const data = await uploadImage(file);
      setPhoto(data.url);
      setInfo('Photo uploaded.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    try {
      await Notification.requestPermission();
    } catch {
      // optional
    }
  };

  const buildPayload = () => ({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    password,
    photo,
    country: location.country,
    state: location.state,
    district: location.district,
    city: location.city,
    latitude,
    longitude,
    acceptTerms,
    acceptPrivacy,
    acceptCookies,
    legalVersion: LEGAL_VERSION
  });

  const sendSignupOtp = async () => {
    setSubmitting(true);
    setError('');
    setInfo('');

    try {
      await requestNotifications();
      const data = await api('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify(buildPayload())
      });
      setStep(3);
      if (data.devOtp) setOtp(data.devOtp);
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    setSubmitting(true);
    setError('');

    try {
      const session = await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });
      login(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form signup-flow">
      {step === 1 && (
        <>
          <div className="form-grid two-col">
            <input required placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input required placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <LocationDropdowns value={location} onChange={setLocation} />

          {needsSecureContext && (
            <p className="error-text">GPS works only on https:// or http://localhost. Open the app on localhost to test location.</p>
          )}

          <button className="secondary-button" type="button" onClick={requestLocation} disabled={loadingLocation || needsSecureContext}>
            {loadingLocation ? 'Getting location...' : locationGranted ? 'Update location' : 'Allow location'}
          </button>

          {locationGranted && <p className="info-text">GPS ready</p>}

          <button className="primary-button" type="button" disabled={!stepOneReady} onClick={() => setStep(2)}>
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required minLength="6" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label className="file-upload">
            {uploadingPhoto ? 'Uploading photo...' : 'Upload photo (optional)'}
            <input accept="image/*" type="file" onChange={uploadPhoto} />
          </label>

          <div className="legal-checks">
            <label className="legal-check">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              <span>
                I accept the <a href="/terms" target="_blank" rel="noreferrer">Terms</a>
              </span>
            </label>
            <label className="legal-check">
              <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
              <span>
                I accept the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
              </span>
            </label>
            <label className="legal-check">
              <input type="checkbox" checked={acceptCookies} onChange={(e) => setAcceptCookies(e.target.checked)} />
              <span>
                I accept the <a href="/cookies" target="_blank" rel="noreferrer">Cookie Policy</a>
              </span>
            </label>
          </div>

          <button className="primary-button" type="button" disabled={!stepTwoReady || submitting} onClick={sendSignupOtp}>
            Send OTP
          </button>
          <button className="secondary-button" type="button" onClick={() => setStep(1)}>
            Back
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <input
            required
            inputMode="numeric"
            maxLength="6"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <button className="primary-button" type="button" onClick={verifyOtp} disabled={submitting || otp.length !== 6}>
            Verify & create account
          </button>
          <button className="secondary-button" type="button" onClick={sendSignupOtp} disabled={submitting}>
            Resend OTP
          </button>
        </>
      )}

      {info && <p className="info-text">{info}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
