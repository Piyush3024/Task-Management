import { redis } from '../config/redis.js';

export async function get(key) {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function set(key, value, ttlSeconds) {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function del(key) {
  await redis.del(key);
}
