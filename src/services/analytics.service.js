import { redis } from '../config/redis.js';
import { REDIS_KEYS } from '../constants/redis.keys.js';

const ANALYTICS_KEY = REDIS_KEYS.analytics;

export async function increment(field) {
  await redis.hincrby(ANALYTICS_KEY, field, 1);
}

export async function getAnalytics() {
  const data = await redis.hgetall(ANALYTICS_KEY);

  return {
    totalLogins: parseInt(data?.totalLogins ?? '0', 10),
    tasksCreated: parseInt(data?.tasksCreated ?? '0', 10),
    tasksUpdated: parseInt(data?.tasksUpdated ?? '0', 10),
    tasksDeleted: parseInt(data?.tasksDeleted ?? '0', 10),
  };
}
