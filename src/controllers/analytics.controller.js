import * as analyticsService from '../services/analytics.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { MESSAGES } from '../constants/messages.js';

export async function getAnalytics(_req, res) {
  const analytics = await analyticsService.getAnalytics();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.analytics.FETCH_SUCCESS, analytics));
}
