import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTasks, createTask, updateTask, deleteTask,
  reorderTasks, addComment, deleteComment
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/workspaces/:workspaceId/tasks', getTasks);
router.post('/workspaces/:workspaceId/tasks', createTask);
router.put('/workspaces/:workspaceId/tasks/reorder', reorderTasks);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);
router.post('/tasks/:taskId/comments', addComment);
router.delete('/tasks/:taskId/comments/:commentId', deleteComment);

export default router;