import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import accountRoutes from './routes/account.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/messages.routes.js';
import postRoutes from './routes/posts.routes.js';
import safetyRoutes from './routes/safety.routes.js';
import uploadRoutes from './routes/uploads.routes.js';
import userRoutes from './routes/users.routes.js';

const isAllowedDevOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname, port } = new URL(origin);
    const isVitePort = port === '5173';
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isPrivateNetwork =
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    return isVitePort && (isLocalHost || isPrivateNetwork);
  } catch {
    return false;
  }
};

export const createApp = () => {
  const app = express();
  const allowed = [process.env.LOCAL_URL, process.env.WEBSITE_URL].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (allowed.includes(origin) || isAllowedDevOrigin(origin)) {
          return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      localUrl: process.env.LOCAL_URL,
      websiteUrl: process.env.WEBSITE_URL
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/account', accountRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/uploads', uploadRoutes);

  app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message || 'Server error' });
  });

  return app;
};
