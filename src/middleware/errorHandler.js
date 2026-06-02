import { logger } from '../config/logger.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES } from '../constants/messages.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isOperational = err.isOperational === true;

  const statusCode = err.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorCode = err.errorCode ?? ERROR_CODES.INTERNAL_ERROR;

  const message = isOperational ? err.message : 'Internal server error';

  if (isOperational) {
    logger.warn(
      {
        errorCode,
        statusCode,
        path: req.path,
        method: req.method,
        message: err.message,
      },
      'Operational error',
    );
  } else {
    logger.error(
      {
        err,
        path: req.path,
        method: req.method,
      },
      'Unexpected error',
    );
  }

  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    timestamp: new Date().toISOString(),
  });
}
