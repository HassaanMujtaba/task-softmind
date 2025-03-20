import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'manager'), upload.array('attachments'), createTask)
  .get( getTasks);

router
  .route('/:id')
  .put(protect, upload.array('attachments'), updateTask)
  .delete(protect, deleteTask);

export default router;