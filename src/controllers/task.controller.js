import * as taskService from '../services/task.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/http.status.js';
import { MESSAGES } from '../constants/messages.js';

export async function createTask(req, res) {
  const task = await taskService.createTask(req.user.userId, req.validatedBody);

  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(MESSAGES.task.CREATE_SUCCESS, task));
}

export async function getTasks(req, res) {
  const tasks = await taskService.getTasksByUser(req.user.userId);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.task.FETCH_SUCCESS, tasks));
}

export async function updateTask(req, res) {
  const task = await taskService.updateTask(req.params.id, req.user.userId, req.validatedBody);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.task.UPDATE_SUCCESS, task));
}

export async function deleteTask(req, res) {
  await taskService.deleteTask(req.params.id, req.user.userId);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.task.DELETE_SUCCESS));
}
