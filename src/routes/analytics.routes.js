import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, analyticsController.getAnalytics);

export default router;
