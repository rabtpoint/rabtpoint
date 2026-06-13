const blockedDomains = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  '10minutemail.com',
  'yopmail.com',
  'throwaway.email',
  'getnada.com',
  'sharklasers.com',
  'trashmail.com'
]);

export const isDisposableEmail = (email = '') => {
  const domain = String(email).split('@')[1]?.toLowerCase();
  return domain ? blockedDomains.has(domain) : false;
};
