import bcrypt from 'bcryptjs';
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { PendingSignup } from '../models/PendingSignup.js';
import { User } from '../models/User.js';
import { sendOtpEmail } from '../services/email.service.js';
import { createToken } from '../utils/token.js';
const router=express.Router();

const otpExpiryMs = 10 * 60 * 1000;

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const getSignupPayload = (body) => {
  const { name, email, password, photo, country, state, district, latitude, longitude } = body;

  if (!name || !email || !password || !country || !state || !district || latitude === undefined || longitude === undefined) {
    throw new Error('All signup fields are required');
  }

  return {
    name,
    email,
    password,
    photo,
    country,
    state,
    district,
    latitude: Number(latitude),
    longitude: Number(longitude)
  };
};

router.post('/signup', (req, res) => {
  res.status(410).json({ message: 'Signup ke liye pehle /api/auth/send-otp use karo.' });
});

router.post('/send-otp', async (req, res) => {
  try {
    const signup = getSignupPayload(req.body);

    if (await User.findOne({ email: signup.email })) {
      return res.status(409).json({ message: 'Email already registered. Login karo.' });
    }

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
        signupData: {
          name: signup.name,
          email: signup.email,
          passwordHash,
          photo: signup.photo,
          country: signup.country,
          state: signup.state,
          district: signup.district,
          latitude: signup.latitude,
          longitude: signup.longitude
        },
        expiresAt: new Date(Date.now() + otpExpiryMs)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail({ email: signup.email, name: signup.name, otp });

    res.json({ message: 'OTP email bhej diya hai. Code 10 minutes tak valid hai.' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email aur OTP required hai' });
    }

    const pending = await PendingSignup.findOne({ email });

    if (!pending) {
      return res.status(400).json({ message: 'OTP expired ya missing hai. Naya OTP bhejo.' });
    }

    if (pending.attempts >= 5) {
      await PendingSignup.deleteOne({ _id: pending._id });
      return res.status(429).json({ message: 'Bahut galat attempts ho gaye. Naya OTP bhejo.' });
    }

    const isMatch = await bcrypt.compare(String(otp), pending.otpHash);

    if (!isMatch) {
      pending.attempts += 1;
      await pending.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (await User.findOne({ email: pending.email })) {
      await PendingSignup.deleteOne({ _id: pending._id });
      return res.status(409).json({ message: 'Email already registered. Login karo.' });
    }

    const user = await User.create({
      name: pending.signupData.name,
      email: pending.signupData.email,
      password: pending.signupData.passwordHash,
      photo: pending.signupData.photo,
      location: {
        country: pending.signupData.country,
        state: pending.signupData.state,
        district: pending.signupData.district,
        latitude: pending.signupData.latitude,
        longitude: pending.signupData.longitude
      }
    });

    await PendingSignup.deleteOne({ _id: pending._id });

    res.status(201).json({
      token: createToken(user._id),
      user: user.toPublicJSON()
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/login',async(req,res)=>{ try{ const {email,password}=req.body; const user=await User.findOne({email}); if(!user||!(await bcrypt.compare(password,user.password))) return res.status(401).json({message:'Invalid email or password'}); res.json({token:createToken(user._id),user:user.toPublicJSON()}); }catch(e){res.status(500).json({message:e.message});} });
router.get('/me',requireAuth,(req,res)=>res.json({user:req.user.toPublicJSON()}));
export default router;
