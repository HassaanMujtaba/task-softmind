import express from 'express';
import  { authUser, getUsersByRole, registerUser } from '../controllers/userController.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/', registerUser);
router.get("/get-users",  getUsersByRole);
export default router;