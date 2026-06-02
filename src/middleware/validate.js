import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { ERROR_CODES } from '../constants/messages.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message, ERROR_CODES.VALIDATION_ERROR);
  }

  req.validatedBody = result.data;
  next();
};
