import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
