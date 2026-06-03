import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  markRead,
  markAllRead,
  clearNotifications,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect); // all notification routes require auth

router.get('/',                            getNotifications);
router.put('/:notificationId/read',        markRead);
router.put('/read-all',                    markAllRead);
router.delete('/clear',                    clearNotifications);

export default router;