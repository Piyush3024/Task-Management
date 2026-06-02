import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 * @param {string} password - Raw password from registration
 * @returns {Promise<string>} bcrypt hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} password - Raw password from login attempt
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>} true if match
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
