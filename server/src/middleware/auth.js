import jwt from 'jsonwebtoken';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Auth token required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (payload.sessionId) {
      const session = await Session.findOne({
        _id: payload.sessionId,
        userId: user._id,
        revokedAt: null
      });

      if (!session) {
        return res.status(401).json({ message: 'Session expired. Login again.' });
      }

      req.session = session;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};
