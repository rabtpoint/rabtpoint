import jwt from 'jsonwebtoken';

export const createAccessToken = (userId, sessionId = null) => {
  const payload = sessionId ? { userId, sessionId } : { userId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const createToken = (userId) => createAccessToken(userId);
