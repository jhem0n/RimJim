import crypto from 'crypto';

// Password Hashing with standard secure scrypt + salt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(hash, 'hex');
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

// Secure token generation
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Secure room code generation: RJ-XXXXX format with non-confusing characters
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `RJ-${code}`;
}
