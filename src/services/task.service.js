import { Task } from '../models/task.model.js';
import { ApiError } from '../utils/ApiError.js';
import { REDIS_KEYS, REDIS_TTL } from '../constants/redis.keys.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES, MESSAGES } from '../constants/messages.js';
import { logger } from '../config/logger.js';
import * as cacheService from './cache.service.js';
import * as analyticsService from './analytics.service.js';

export async function createTask(userId, taskData) {
  const task = await Task.create({ ...taskData, userId });

  await cacheService.del(REDIS_KEYS.tasksCache(userId));

  await analyticsService.increment('tasksCreated');
  logger.info({ taskId: task._id.toString(), userId }, 'Task created');

  return task;
}

export async function getTasksByUser(userId) {
  const cacheKey = REDIS_KEYS.tasksCache(userId);

  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();

  await cacheService.set(cacheKey, tasks, REDIS_TTL.TASK_CACHE);

  return tasks;
}

export async function updateTask(taskId, userId, updates) {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.task.NOT_FOUND, ERROR_CODES.TASK_NOT_FOUND);
  }

  await cacheService.del(REDIS_KEYS.tasksCache(userId));

  await analyticsService.increment('tasksUpdated');
  logger.info({ taskId: task._id.toString(), userId }, 'Task updated');

  return task;
}

export async function deleteTask(taskId, userId) {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });

  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.task.NOT_FOUND, ERROR_CODES.TASK_NOT_FOUND);
  }

  await cacheService.del(REDIS_KEYS.tasksCache(userId));

  await analyticsService.increment('tasksDeleted');
  logger.info({ taskId: task._id.toString(), userId }, 'Task deleted');
}
