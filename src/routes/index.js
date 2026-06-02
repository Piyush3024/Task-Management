import { Router } from 'express';
import authRoutes from './auth.routes.js';
import taskRoutes from './task.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);

router.use((_req, res) => {
  res.status(404).json({
    success: false,
    errorCode: 'NOT_FOUND',
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

export default router;
