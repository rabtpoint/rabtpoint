import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Session } from '../models/Session.js';
import { createAccessToken } from './token.js';

const randomPart = () => crypto.randomBytes(48).toString('base64url');

export const buildRefreshToken = (sessionId, secret = randomPart()) => `${sessionId}.${secret}`;

export const createUserSession = async (user, req) => {
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: 'pending',
    ipAddress,
    userAgent,
    lastUsedAt: new Date()
  });

  const refreshToken = buildRefreshToken(session._id);
  session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await session.save();

  return {
    token: createAccessToken(user._id, session._id),
    refreshToken,
    sessionId: session._id
  };
};

export const rotateUserSession = async (session, req) => {
  const refreshToken = buildRefreshToken(session._id);
  session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  session.lastUsedAt = new Date();
  session.ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || session.ipAddress;
  session.userAgent = req.headers['user-agent'] || session.userAgent;
  await session.save();

  return {
    token: createAccessToken(session.userId, session._id),
    refreshToken
  };
};
