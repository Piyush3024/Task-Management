import * as authService from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { MESSAGES } from '../constants/messages.js';
import { config } from '../config/index.js';

export async function register(req, res) {
  const user = await authService.register(req.validatedBody);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(MESSAGES.auth.REGISTER_SUCCESS, {
      id: user._id,
      name: user.name,
      email: user.email,
    }),
  );
}

export async function login(req, res) {
  const user = await authService.login(req.validatedBody);
  const loginTime = new Date();
  const sessionExpiry = new Date(loginTime.getTime() + config.session.expirySeconds * 1000);

  req.session.user = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    loginTime: loginTime.toISOString(),
    sessionExpiry: sessionExpiry.toISOString(),
  };

  req.session.cookie.maxAge = config.session.expirySeconds * 1000;

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(MESSAGES.auth.LOGIN_SUCCESS, {
      id: user._id,
      name: user.name,
      email: user.email,
    }),
  );
}

export async function logout(req, res) {
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  res.clearCookie('connect.sid');

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.auth.LOGOUT_SUCCESS));
}

export async function sessionInfo(req, res) {
  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.session.FETCH_SUCCESS, req.user));
}
