import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getWorkspaces, getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace,
  inviteMember, acceptInvite, removeMember, updateMemberRole, getWorkspaceAnalytics
} from '../controllers/workspaceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);
router.post('/:id/invite', inviteMember);
router.post('/invite/:token/accept', acceptInvite);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/role', updateMemberRole);
router.get('/:id/analytics', getWorkspaceAnalytics);

export default router;