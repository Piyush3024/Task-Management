export const REDIS_KEYS = {
  session: (sid) => `sess:${sid}`,

  rateLimit: (ip) => `rate_limit:${ip}`,

  loginAttempts: (email) => `login_attempts:${email}`,

  tasksCache: (userId) => `tasks_cache:${userId}`,

  analytics: 'analytics:global',
};

export const REDIS_TTL = {
  TASK_CACHE: 5 * 60,
};
