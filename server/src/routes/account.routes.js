import bcrypt from 'bcryptjs';
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AuthOtp } from '../models/AuthOtp.js';
import { Block } from '../models/Block.js';
import { Message } from '../models/Message.js';
import { Post } from '../models/Post.js';
import { Report } from '../models/Report.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { sendOtpEmail } from '../services/email.service.js';
import { writeAudit } from '../utils/audit.js';
import { isDisposableEmail } from '../utils/disposableEmails.js';

const router = express.Router();
const otpExpiryMs = 10 * 60 * 1000;
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, username, bio, privacy } = req.body;
    const user = req.user;

    if (name) user.name = String(name).trim();
    if (bio !== undefined) user.bio = String(bio).trim();

    if (username !== undefined) {
      const nextUsername = String(username).trim().toLowerCase();

      if (nextUsername && !/^[a-z0-9_]{3,20}$/.test(nextUsername)) {
        return res.status(400).json({ message: 'Username 3-20 chars, letters/numbers/underscore only.' });
      }

      if (nextUsername) {
        const taken = await User.findOne({ username: nextUsername, _id: { $ne: user._id } });
        if (taken) return res.status(409).json({ message: 'Username already taken.' });
      }

      user.username = nextUsername;
    }

    if (privacy?.locationVisibility) {
      if (!['exact', 'district', 'hidden'].includes(privacy.locationVisibility)) {
        return res.status(400).json({ message: 'Invalid location privacy setting.' });
      }

      user.privacy = { locationVisibility: privacy.locationVisibility };
    }

    await user.save();
    res.json({ user: user.toPublicJSON(user._id) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/email/change/send-otp', requireAuth, async (req, res) => {
  try {
    const newEmail = normalizeEmail(req.body.newEmail);

    if (!newEmail) {
      return res.status(400).json({ message: 'New email required hai.' });
    }

    if (isDisposableEmail(newEmail)) {
      return res.status(400).json({ message: 'Temporary/disposable email allowed nahi hai.' });
    }

    if (newEmail === req.user.email) {
      return res.status(400).json({ message: 'Ye already aapka current email hai.' });
    }

    if (await User.findOne({ email: newEmail })) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const otp = createOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await AuthOtp.findOneAndUpdate(
      { email: newEmail, purpose: 'change-email' },
      {
        email: newEmail,
        purpose: 'change-email',
        otpHash,
        attempts: 0,
        resendCount: 0,
        lastSentAt: new Date(),
        lockedUntil: null,
        expiresAt: new Date(Date.now() + otpExpiryMs)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail({ email: newEmail, name: req.user.name, otp, purpose: 'change-email' });
    res.json({ message: 'New email par OTP bhej diya hai.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/email/change/verify', requireAuth, async (req, res) => {
  try {
    const newEmail = normalizeEmail(req.body.newEmail);
    const { otp } = req.body;

    if (!newEmail || !otp) {
      return res.status(400).json({ message: 'New email aur OTP required hai.' });
    }

    const record = await AuthOtp.findOne({ email: newEmail, purpose: 'change-email' });

    if (!record || !(await bcrypt.compare(String(otp), record.otpHash))) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    req.user.email = newEmail;
    req.user.emailVerified = true;
    await req.user.save();
    await AuthOtp.deleteOne({ _id: record._id });
    await writeAudit({ actorId: req.user._id, action: 'email_changed', meta: { newEmail } });

    res.json({ user: req.user.toPublicJSON(req.user._id), message: 'Email update ho gaya.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/export', requireAuth, async (req, res) => {
  const [posts, messagesSent, messagesReceived, reports] = await Promise.all([
    Post.find({ author: req.user._id }).sort({ createdAt: -1 }),
    Message.find({ sender: req.user._id }).sort({ createdAt: -1 }),
    Message.find({ receiver: req.user._id }).sort({ createdAt: -1 }),
    Report.find({ reporter: req.user._id }).sort({ createdAt: -1 })
  ]);

  res.json({
    exportedAt: new Date().toISOString(),
    profile: req.user.toPublicJSON(req.user._id),
    posts,
    messagesSent,
    messagesReceived,
    reports
  });
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || !(await bcrypt.compare(password, req.user.password))) {
      return res.status(401).json({ message: 'Password confirm karo account delete karne ke liye.' });
    }

    const userId = req.user._id;

    await Promise.all([
      Post.deleteMany({ author: userId }),
      Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
      Block.deleteMany({ $or: [{ blocker: userId }, { blocked: userId }] }),
      Report.deleteMany({ reporter: userId }),
      Session.updateMany({ userId }, { revokedAt: new Date() }),
      User.deleteOne({ _id: userId })
    ]);

    await writeAudit({ actorId: userId, action: 'account_deleted' });
    res.json({ message: 'Account delete ho gaya.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
