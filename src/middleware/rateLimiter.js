import { redis } from '../config/redis.js';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { REDIS_KEYS } from '../constants/redis.keys.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES, MESSAGES } from '../constants/messages.js';

export async function rateLimiter(req, res, next) {
  const key = REDIS_KEYS.rateLimit(req.ip);
  const max = config.rateLimit.max;
  const windowMs = config.rateLimit.windowMs;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.pexpire(key, windowMs);
  }

  res.set('X-RateLimit-Limit', String(max));
  res.set('X-RateLimit-Remaining', String(Math.max(0, max - current)));

  if (current > max) {
    throw new ApiError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      MESSAGES.rateLimit.EXCEEDED,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
    );
  }

  next();
}
