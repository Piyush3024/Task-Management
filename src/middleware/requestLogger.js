import { logger } from '../config/logger.js';

export function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'Request completed');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
}
