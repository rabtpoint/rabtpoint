export const toPublicUser = (user, { viewerId } = {}) => {
  const doc = user?.toObject ? user.toObject() : user;
  const isSelf = viewerId && String(doc._id) === String(viewerId);

  const base = {
    id: doc._id,
    firstName: doc.firstName || doc.name?.split(' ')[0] || '',
    lastName: doc.lastName || doc.name?.split(' ').slice(1).join(' ') || '',
    name: doc.name,
    username: doc.username || '',
    photo: doc.photo,
    bio: doc.bio,
    createdAt: doc.createdAt
  };

  if (isSelf) {
    return {
      ...base,
      email: doc.email,
      privacy: doc.privacy || { locationVisibility: 'exact' },
      isAdmin: Boolean(doc.isAdmin),
      location: doc.location
    };
  }

  const visibility = doc.privacy?.locationVisibility || 'exact';

  if (visibility === 'hidden') {
    return {
      ...base,
      location: {
        country: doc.location?.country || '',
        state: '',
        district: '',
        city: '',
        latitude: null,
        longitude: null
      }
    };
  }

  if (visibility === 'district') {
    return {
      ...base,
      location: {
        country: doc.location?.country || '',
        state: doc.location?.state || '',
        district: doc.location?.district || '',
        city: doc.location?.city || '',
        latitude: null,
        longitude: null
      }
    };
  }

  return { ...base, location: doc.location };
};
