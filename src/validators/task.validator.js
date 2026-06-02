import { z } from 'zod';
import { TASK_PRIORITIES } from '../models/task.model.js';

export const createTaskSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),

  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .default(''),

  priority: z
    .enum(TASK_PRIORITIES, {
      error: 'Priority must be Low, Medium, or High',
    })
    .optional()
    .default('Medium'),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must not exceed 200 characters')
      .trim()
      .optional(),

    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional(),

    priority: z
      .enum(TASK_PRIORITIES, {
        error: 'Priority must be Low, Medium, or High',
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: 'At least one field must be provided for update',
  });
