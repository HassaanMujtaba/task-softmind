import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'manager'), createTask)
  .get( getTasks);

router
  .route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router;