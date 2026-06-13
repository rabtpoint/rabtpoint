import { AuditLog } from '../models/AuditLog.js';

export const writeAudit = async ({ actorId, action, targetType = '', targetId = null, meta = {} }) => {
  await AuditLog.create({ actorId, action, targetType, targetId, meta });
};
