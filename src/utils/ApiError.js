import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES } from '../constants/messages.js';

export class ApiError extends Error {
  constructor(
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message = 'Internal server error',
    errorCode = ERROR_CODES.INTERNAL_ERROR,
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
