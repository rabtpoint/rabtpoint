import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AuthOtp } from '../models/AuthOtp.js';
import { PendingSignup } from '../models/PendingSignup.js';
import { Session } from '../models/Session.js';
import { User, syncAdminFlag } from '../models/User.js';
import { sendLoginAlertEmail, sendOtpEmail, buildOtpResponse } from '../services/email.service.js';
import { isDisposableEmail } from '../utils/disposableEmails.js';
import { createUserSession, rotateUserSession } from '../utils/session.js';
const router=express.Router();

const otpExpiryMs = 10 * 60 * 1000;
const otpCooldownMs = 60 * 1000;
const otpLockMs = 15 * 60 * 1000;
const rateWindowMs = 15 * 60 * 1000;
const maxOtpAttempts = 5;
const maxPasswordAttempts = 5;
const rateBuckets = new Map();
const LEGAL_VERSION = '2026-06-13';

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const requestIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
const requestUserAgent = (req) => req.headers['user-agent'] || '';
const createResetToken = () => crypto.randomBytes(32).toString('base64url');

const isRateLimited = (key, max = 8, windowMs = rateWindowMs) => {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > max;
};

const assertNotRateLimited = (req, purpose, email, max = 8) => {
  const ip = requestIp(req);

  if (isRateLimited(`${purpose}:ip:${ip}`, max) || isRateLimited(`${purpose}:email:${normalizeEmail(email)}`, max)) {
    const error = new Error('Bahut zyada attempts ho gaye. Thodi der baad try karo.');
    error.status = 429;
    throw error;
  }
};

const assertOtpCanBeSent = (record) => {
  if (!record) return;

  if (record.lockedUntil && record.lockedUntil > new Date()) {
    const error = new Error('Bahut zyada attempts ho gaye. 15 minutes baad naya OTP try karo.');
    error.status = 429;
    throw error;
  }

  if (record.lastSentAt && Date.now() - record.lastSentAt.getTime() < otpCooldownMs) {
    const error = new Error('OTP abhi bheja gaya hai. 1 minute baad resend karo.');
    error.status = 429;
    throw error;
  }
};

const issueAuthOtp = async ({ email, purpose, req }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await AuthOtp.findOne({ email: normalizedEmail, purpose });

  assertOtpCanBeSent(existing);

  const otp = createOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  await AuthOtp.findOneAndUpdate(
    { email: normalizedEmail, purpose },
    {
      email: normalizedEmail,
      purpose,
      otpHash,
      attempts: 0,
      resendCount: (existing?.resendCount || 0) + 1,
      lastSentAt: new Date(),
      lockedUntil: null,
      resetTokenHash: '',
      resetTokenExpiresAt: null,
      ipAddress: requestIp(req),
      userAgent: requestUserAgent(req),
      expiresAt: new Date(Date.now() + otpExpiryMs)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return otp;
};

const verifyAuthOtp = async ({ email, otp, purpose }) => {
  const normalizedEmail = normalizeEmail(email);
  const record = await AuthOtp.findOne({ email: normalizedEmail, purpose });

  if (!record) {
    const error = new Error('OTP expired ya missing hai. Naya OTP bhejo.');
    error.status = 400;
    throw error;
  }

  if (record.lockedUntil && record.lockedUntil > new Date()) {
    const error = new Error('Bahut galat attempts ho gaye. 15 minutes baad naya OTP bhejo.');
    error.status = 429;
    throw error;
  }

  if (record.attempts >= maxOtpAttempts) {
    record.lockedUntil = new Date(Date.now() + otpLockMs);
    await record.save();
    const error = new Error('Bahut galat attempts ho gaye. 15 minutes baad naya OTP bhejo.');
    error.status = 429;
    throw error;
  }

  const isMatch = await bcrypt.compare(String(otp), record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const error = new Error('Invalid OTP');
    error.status = 400;
    throw error;
  }

  return record;
};

const completeLogin = async (user, req, res) => {
  const previousIp = user.lastLoginIp;
  const previousUserAgent = user.lastLoginUserAgent;
  const loginAt = new Date();

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = loginAt;
  user.lastLoginIp = requestIp(req);
  user.lastLoginUserAgent = requestUserAgent(req);
  syncAdminFlag(user);
  await user.save();

  const isNewDevice =
    Boolean(previousUserAgent || previousIp) &&
    (previousUserAgent !== user.lastLoginUserAgent || previousIp !== user.lastLoginIp);

  if (isNewDevice) {
    sendLoginAlertEmail({
      email: user.email,
      name: user.name,
      ipAddress: user.lastLoginIp,
      userAgent: user.lastLoginUserAgent,
      loginAt: loginAt.toISOString()
    }).catch((error) => console.error('Login alert email failed:', error.message));
  }

  const session = await createUserSession(user, req);
  res.json({
    token: session.token,
    refreshToken: session.refreshToken,
    user: user.toPublicJSON(user._id)
  });
};

const getSignupPayload = (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    photo,
    country,
    state,
    district,
    city,
    latitude,
    longitude,
    acceptTerms,
    acceptPrivacy,
    acceptCookies,
    legalVersion
  } = body;

  if (!firstName || !lastName || !email || !password || !country || !state || !district || !city) {
    throw new Error('All signup fields are required');
  }

  if (latitude === undefined || longitude === undefined || latitude === '' || longitude === '') {
    throw new Error('Location permission is required. Allow GPS access to continue.');
  }

  if (!acceptTerms || !acceptPrivacy || !acceptCookies) {
    throw new Error('You must accept the Terms, Privacy Policy, and Cookie Policy.');
  }

  const cleanFirst = String(firstName).trim();
  const cleanLast = String(lastName).trim();

  return {
    firstName: cleanFirst,
    lastName: cleanLast,
    name: `${cleanFirst} ${cleanLast}`.trim(),
    email: normalizeEmail(email),
    password,
    photo,
    country,
    state,
    district,
    city,
    latitude: Number(latitude),
    longitude: Number(longitude),
    legalConsent: {
      termsAccepted: true,
      privacyAccepted: true,
      cookiesAccepted: true,
      version: legalVersion || LEGAL_VERSION
    }
  };
};

router.post('/signup', (req, res) => {
  res.status(410).json({ message: 'Signup ke liye pehle /api/auth/send-otp use karo.' });
});

router.post('/send-otp', async (req, res) => {
  try {
    const signup = getSignupPayload(req.body);
    assertNotRateLimited(req, 'signup-otp', signup.email, 6);

    if (isDisposableEmail(signup.email)) {
      return res.status(400).json({ message: 'Temporary/disposable email allowed nahi hai.' });
    }

    if (await User.findOne({ email: signup.email })) {
      return res.status(409).json({ message: 'Email already registered. Login karo.' });
    }

    const existing = await PendingSignup.findOne({ email: signup.email });
    assertOtpCanBeSent(existing);

    const otp = createOtp();
    const [otpHash, passwordHash] = await Promise.all([
      bcrypt.hash(otp, 10),
      bcrypt.hash(signup.password, 12)
    ]);

    await PendingSignup.findOneAndUpdate(
      { email: signup.email },
      {
        email: signup.email,
        otpHash,
        attempts: 0,
        resendCount: (existing?.resendCount || 0) + 1,
        lastSentAt: new Date(),
        lockedUntil: null,
        ipAddress: requestIp(req),
        userAgent: requestUserAgent(req),
        signupData: {
          firstName: signup.firstName,
          lastName: signup.lastName,
          name: signup.name,
          email: signup.email,
          passwordHash,
          photo: signup.photo,
          country: signup.country,
          state: signup.state,
          district: signup.district,
          city: signup.city,
          latitude: signup.latitude,
          longitude: signup.longitude,
          legalConsent: signup.legalConsent
        },
        expiresAt: new Date(Date.now() + otpExpiryMs)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const emailResult = await sendOtpEmail({ email: signup.email, name: signup.firstName || signup.name, otp, purpose: 'signup' });

    res.json(
      buildOtpResponse({
        message: 'OTP sent. Code is valid for 10 minutes.',
        otp,
        emailResult
      })
    );
  } catch (e) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email aur OTP required hai' });
    }

    const pending = await PendingSignup.findOne({ email: normalizedEmail });

    if (!pending) {
      return res.status(400).json({ message: 'OTP expired ya missing hai. Naya OTP bhejo.' });
    }

    if (pending.lockedUntil && pending.lockedUntil > new Date()) {
      return res.status(429).json({ message: 'Bahut galat attempts ho gaye. 15 minutes baad naya OTP bhejo.' });
    }

    if (pending.attempts >= 5) {
      pending.lockedUntil = new Date(Date.now() + otpLockMs);
      await pending.save();
      return res.status(429).json({ message: 'Bahut galat attempts ho gaye. Naya OTP bhejo.' });
    }

    const isMatch = await bcrypt.compare(String(otp), pending.otpHash);

    if (!isMatch) {
      pending.attempts += 1;
      if (pending.attempts >= maxOtpAttempts) {
        pending.lockedUntil = new Date(Date.now() + otpLockMs);
      }
      await pending.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (await User.findOne({ email: pending.email })) {
      await PendingSignup.deleteOne({ _id: pending._id });
      return res.status(409).json({ message: 'Email already registered. Login karo.' });
    }

    let user = await User.create({
      firstName: pending.signupData.firstName,
      lastName: pending.signupData.lastName,
      name: pending.signupData.name,
      email: pending.signupData.email,
      password: pending.signupData.passwordHash,
      photo: pending.signupData.photo,
      emailVerified: true,
      legalConsent: {
        ...pending.signupData.legalConsent,
        acceptedAt: new Date()
      },
      lastLoginAt: new Date(),
      lastLoginIp: requestIp(req),
      lastLoginUserAgent: requestUserAgent(req),
      location: {
        country: pending.signupData.country,
        state: pending.signupData.state,
        district: pending.signupData.district,
        city: pending.signupData.city,
        latitude: pending.signupData.latitude,
        longitude: pending.signupData.longitude
      }
    });

    syncAdminFlag(user);
    await user.save();

    await PendingSignup.deleteOne({ _id: pending._id });

    const session = await createUserSession(user, req);
    res.status(201).json({
      token: session.token,
      refreshToken: session.refreshToken,
      user: user.toPublicJSON(user._id)
    });
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
});

router.post('/login',async(req,res)=>{ try{ const {email,password}=req.body; const normalizedEmail=normalizeEmail(email); if(!normalizedEmail||!password) return res.status(400).json({message:'Email aur password required hai'}); assertNotRateLimited(req,'password-login',normalizedEmail,10); const user=await User.findOne({email:normalizedEmail}); if(user?.lockedUntil&&user.lockedUntil>new Date()) return res.status(423).json({message:'Account temporary locked hai. Thodi der baad try karo.'}); if(!user||!(await bcrypt.compare(password||'',user.password))){ if(user){ user.failedLoginAttempts+=1; if(user.failedLoginAttempts>=maxPasswordAttempts) user.lockedUntil=new Date(Date.now()+otpLockMs); await user.save(); } return res.status(401).json({message:'Invalid email or password'}); } await completeLogin(user,req,res); }catch(e){res.status(e.status||500).json({message:e.message});} });

router.post('/login/send-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Email required hai' });
    }
    assertNotRateLimited(req, 'login-otp', email, 6);

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'Agar account milta hai to OTP email bhej diya jayega.' });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ message: 'Account temporary locked hai. Thodi der baad try karo.' });
    }

    const otp = await issueAuthOtp({ email, purpose: 'login', req });
    const emailResult = await sendOtpEmail({ email, name: user.name, otp, purpose: 'login' });

    res.json(
      buildOtpResponse({
        message: 'Login OTP sent. Code is valid for 10 minutes.',
        otp,
        emailResult
      })
    );
  } catch (e) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Email aur OTP required hai' });
    }
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    await verifyAuthOtp({ email: normalizedEmail, otp, purpose: 'login' });
    await AuthOtp.deleteOne({ email: normalizedEmail, purpose: 'login' });
    await completeLogin(user, req, res);
  } catch (e) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

router.post('/password/forgot/send-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Email required hai' });
    }
    assertNotRateLimited(req, 'forgot-password', email, 5);
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'Agar account milta hai to password reset OTP email bhej diya jayega.' });
    }

    const otp = await issueAuthOtp({ email, purpose: 'forgot-password', req });
    const emailResult = await sendOtpEmail({ email, name: user.name, otp, purpose: 'forgot-password' });

    res.json(
      buildOtpResponse({
        message: 'Password reset OTP sent. Code is valid for 10 minutes.',
        otp,
        emailResult
      })
    );
  } catch (e) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

router.post('/password/forgot/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Email aur OTP required hai' });
    }
    await verifyAuthOtp({ email: normalizedEmail, otp, purpose: 'forgot-password' });

    const resetToken = createResetToken();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    await AuthOtp.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'forgot-password' },
      { resetTokenHash, resetTokenExpiresAt: new Date(Date.now() + otpExpiryMs), otpHash: await bcrypt.hash(createOtp(), 10), attempts: 0 }
    );

    res.json({ message: 'OTP verify ho gaya. Ab naya password set karo.', resetToken });
  } catch (e) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

router.post('/password/reset', async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !resetToken) {
      return res.status(400).json({ message: 'Reset session required hai.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password kam se kam 6 characters ka hona chahiye.' });
    }

    const record = await AuthOtp.findOne({ email: normalizedEmail, purpose: 'forgot-password' });

    if (!record?.resetTokenHash || !record.resetTokenExpiresAt || record.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset session expired hai. Naya OTP bhejo.' });
    }

    const tokenOk = await bcrypt.compare(String(resetToken || ''), record.resetTokenHash);

    if (!tokenOk) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      await AuthOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Reset session expired hai. Naya OTP bhejo.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
    await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
    await AuthOtp.deleteOne({ _id: record._id });

    res.json({ message: 'Password reset ho gaya. Ab login karo.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshToken.includes('.')) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const sessionId = refreshToken.split('.')[0];
    const session = await Session.findOne({ _id: sessionId, revokedAt: null });

    if (!session || !(await bcrypt.compare(refreshToken, session.refreshTokenHash))) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const next = await rotateUserSession(session, req);
    res.json({ token: next.token, refreshToken: next.refreshToken, user: user.toPublicJSON(user._id) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/sessions', requireAuth, async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id, revokedAt: null }).sort({ lastUsedAt: -1 });
  res.json({
    sessions: sessions.map((session) => session.toSafeJSON(req.session?._id))
  });
});

router.delete('/sessions/:id', requireAuth, async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.user._id, revokedAt: null });

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  session.revokedAt = new Date();
  await session.save();
  res.json({ message: 'Device logged out' });
});

router.post('/sessions/logout-all', requireAuth, async (req, res) => {
  const filter = { userId: req.user._id, revokedAt: null };

  if (req.session?._id) {
    filter._id = { $ne: req.session._id };
  }

  await Session.updateMany(filter, { revokedAt: new Date() });
  res.json({ message: 'All other devices logged out' });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toPublicJSON(req.user._id) }));
export default router;
