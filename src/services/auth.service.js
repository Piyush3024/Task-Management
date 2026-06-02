import { User } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { ApiError } from '../utils/ApiError.js';
import { redis } from '../config/redis.js';
import { config } from '../config/index.js';
import { REDIS_KEYS } from '../constants/redis.keys.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES, MESSAGES } from '../constants/messages.js';
import { logger } from '../config/logger.js';
import * as analyticsService from './analytics.service.js';

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, MESSAGES.auth.EMAIL_TAKEN, ERROR_CODES.EMAIL_TAKEN);
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({ name, email, passwordHash });

  return user;
}

export async function login({ email, password }) {
  const attemptsKey = REDIS_KEYS.loginAttempts(email.toLowerCase());
  const maxAttempts = config.login.maxAttempts;
  const blockDuration = config.login.blockDurationSeconds;

  const attempts = await redis.get(attemptsKey);
  if (parseInt(attempts ?? '0', 10) >= maxAttempts) {
    throw new ApiError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      MESSAGES.auth.ACCOUNT_BLOCKED,
      ERROR_CODES.ACCOUNT_BLOCKED,
    );
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash').lean();

  const isValidPassword = user ? await comparePassword(password, user.passwordHash) : false;

  if (!user || !isValidPassword) {
    await redis.multi().incr(attemptsKey).expire(attemptsKey, blockDuration).exec();
    logger.warn({ email: email.toLowerCase(), attemptsKey }, 'User login failed');

    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      MESSAGES.auth.INVALID_CREDENTIALS,
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  await redis.del(attemptsKey);

  await analyticsService.increment('totalLogins');
  logger.info({ userId: user._id.toString(), email: user.email }, 'User login successful');

  return user;
}
