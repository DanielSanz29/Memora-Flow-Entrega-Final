import crypto from 'crypto';

export function hashPassword(password) {
  const iterations = 100000;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2${iterations}${salt}${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [algorithm, iterationsStr, salt, originalHash] = storedHash.split('$');

  if (algorithm !== 'pbkdf2') {
    return false;
  }

  const hash = crypto.pbkdf2Sync(password, salt, Number(iterationsStr), 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}
