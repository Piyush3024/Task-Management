import 'dotenv/config';
import { cleanEnv, str, port, num, url } from 'envalid';

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 3000 }),

  MONGODB_URI: url({ docs: 'https://www.mongodb.com/docs/manual/reference/connection-string/' }),

  REDIS_URL: url(),

  SESSION_SECRET: str(),
  SESSION_EXPIRY_SECONDS: num({ default: 86400 }),

  RATE_LIMIT_WINDOW_MS: num({ default: 60000 }),
  RATE_LIMIT_MAX: num({ default: 20 }),

  LOGIN_MAX_ATTEMPTS: num({ default: 5 }),
  LOGIN_BLOCK_DURATION_SECONDS: num({ default: 900 }),
});

if (env.SESSION_SECRET.length < 32) {
  // eslint-disable-next-line no-console
  console.error('FATAL: SESSION_SECRET must be at least 32 characters long');
  process.exit(1);
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',

  mongodb: {
    uri: env.MONGODB_URI,
  },

  redis: {
    url: env.REDIS_URL,
  },

  session: {
    secret: env.SESSION_SECRET,
    expirySeconds: env.SESSION_EXPIRY_SECONDS,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },

  login: {
    maxAttempts: env.LOGIN_MAX_ATTEMPTS,
    blockDurationSeconds: env.LOGIN_BLOCK_DURATION_SECONDS,
  },
};
