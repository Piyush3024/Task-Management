import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES, MESSAGES } from '../constants/messages.js';

export function requireAuth(req, _res, next) {
  if (!req.session?.user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      MESSAGES.auth.UNAUTHENTICATED,
      ERROR_CODES.UNAUTHENTICATED,
    );
  }

  req.user = req.session.user;
  next();
}
