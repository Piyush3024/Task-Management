export const MESSAGES = {
  auth: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_TAKEN: 'An account with this email already exists',
    UNAUTHENTICATED: 'Authentication required',
    SESSION_EXPIRED: 'Session expired or invalid',
    ACCOUNT_BLOCKED:
      'Account temporarily blocked due to too many failed login attempts. Try again in 15 minutes.',
  },

  task: {
    CREATE_SUCCESS: 'Task created successfully',
    FETCH_SUCCESS: 'Tasks fetched successfully',
    UPDATE_SUCCESS: 'Task updated successfully',
    DELETE_SUCCESS: 'Task deleted successfully',
    NOT_FOUND: 'Task not found',
  },

  analytics: {
    FETCH_SUCCESS: 'Analytics fetched successfully',
  },

  session: {
    FETCH_SUCCESS: 'Session info fetched successfully',
  },

  rateLimit: {
    EXCEEDED: 'Too many requests. Try again in a minute.',
  },

  validation: {
    FAILED: 'Validation failed',
  },

  server: {
    INTERNAL_ERROR: 'Internal server error',
  },
};

// Error codes — used in ApiError for machine-readable error identification
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};
