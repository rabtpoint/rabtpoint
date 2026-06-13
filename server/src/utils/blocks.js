import { Block } from '../models/Block.js';

export const getBlockedUserIds = async (userId) => {
  const rows = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }]
  }).select('blocker blocked');

  return rows.map((row) =>
    String(row.blocker) === String(userId) ? String(row.blocked) : String(row.blocker)
  );
};

export const areUsersBlocked = async (userA, userB) => {
  const blocked = await Block.findOne({
    $or: [
      { blocker: userA, blocked: userB },
      { blocker: userB, blocked: userA }
    ]
  });

  return Boolean(blocked);
};
