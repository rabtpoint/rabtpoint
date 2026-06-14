import express from 'express';
import multer from 'multer';
import { configureCloudinary } from '../config/cloudinary.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const signupUploadBuckets = new Map();

const requestIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';

const limitSignupUpload = (req, res, next) => {
  const ip = requestIp(req);
  const now = Date.now();
  const current = signupUploadBuckets.get(ip);

  if (!current || current.resetAt <= now) {
    signupUploadBuckets.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return next();
  }

  current.count += 1;

  if (current.count > 8) {
    return res.status(429).json({ message: 'Bahut zyada uploads ho gaye. Thodi der baad try karo.' });
  }

  next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files allowed'));
    }

    callback(null, true);
  }
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('video/')) {
      return callback(new Error('Only video files allowed'));
    }

    callback(null, true);
  }
});

const uploadBuffer = (file, resourceType = 'image') =>
  new Promise((resolve, reject) => {
    const cloudinary = configureCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: resourceType === 'video' ? 'rabtpoint/reels' : 'rabtpoint',
        resource_type: resourceType,
        ...(resourceType === 'image'
          ? { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }
          : {})
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file required' });
    }

    const result = await uploadBuffer(req.file);

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post('/signup-image', limitSignupUpload, upload.single('image'), handleImageUpload);
router.post('/image', requireAuth, upload.single('image'), handleImageUpload);
router.post('/video', requireAuth, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Video file required' });
    }

    const result = await uploadBuffer(req.file, 'video');

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
