import Redis from 'ioredis';
import { Store } from 'express-session';
import { config } from './index.js';
import { logger } from './logger.js';

export const redis = new Redis(config.redis.url, {
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn({ attempt: times, delayMs: delay }, 'Redis reconnecting');
    return delay;
  },
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('ready', () => logger.info('Redis ready'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));
redis.on('close', () => logger.warn('Redis connection closed'));

const SESSION_PREFIX = 'sess:';

export class IoRedisStore extends Store {
  constructor(options = {}) {
    super();
    this.client = options.client ?? redis;
    this.ttl = options.ttl ?? config.session.expirySeconds;
    this.prefix = options.prefix ?? SESSION_PREFIX;
  }

  _key(sid) {
    return `${this.prefix}${sid}`;
  }

  _ttl(sess) {
    if (sess?.cookie?.expires) {
      const ms = new Date(sess.cookie.expires).getTime() - Date.now();
      return Math.ceil(ms / 1000);
    }
    return this.ttl;
  }

  get(sid, cb) {
    this.client
      .get(this._key(sid))
      .then((data) => {
        if (!data) return cb(null, null);
        cb(null, JSON.parse(data));
      })
      .catch((err) => cb(err));
  }

  set(sid, sess, cb) {
    const ttl = this._ttl(sess);
    if (ttl <= 0) {
      return this.destroy(sid, cb);
    }
    this.client
      .setex(this._key(sid), ttl, JSON.stringify(sess))
      .then(() => cb(null))
      .catch((err) => cb(err));
  }

  destroy(sid, cb) {
    this.client
      .del(this._key(sid))
      .then(() => cb(null))
      .catch((err) => cb(err));
  }

  touch(sid, sess, cb) {
    const ttl = this._ttl(sess);
    if (ttl <= 0) {
      return this.destroy(sid, cb);
    }
    this.client
      .expire(this._key(sid), ttl)
      .then(() => cb(null))
      .catch((err) => cb(err));
  }
}
