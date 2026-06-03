import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// ─── SAFE HELPER ─────────────────────────────────────────────────────────────
// Works whether m.user is a populated object, a raw ObjectId, or null/undefined
const toId = (val) => {
  if (!val) return null;
  if (val._id) return val._id.toString();
  return val.toString();
};

// ─── GET ALL WORKSPACES FOR USER ─────────────────────────────────────────────
export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user.id,
      isArchived: false,
    })
      .populate('members.user', 'username email avatar avatarColor')
      .populate('owner', 'username email avatar avatarColor')
      .sort({ updatedAt: -1 });

    const workspacesWithStats = await Promise.all(
      workspaces.map(async (ws) => {
        const [total, completed] = await Promise.all([
          Task.countDocuments({ workspace: ws._id, isArchived: false }),
          Task.countDocuments({ workspace: ws._id, status: 'done', isArchived: false }),
        ]);
        return {
          ...ws.toObject(),
          stats: {
            total,
            completed,
            completion: total > 0 ? Math.round((completed / total) * 100) : 0,
          },
        };
      })
    );

    res.json({ success: true, workspaces: workspacesWithStats });
  } catch (err) {
    console.error('getWorkspaces error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE WORKSPACE ────────────────────────────────────────────────────
export const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.user', 'username email avatar avatarColor lastSeen')
      .populate('owner', 'username email avatar avatarColor');

    if (!workspace)
      return res.status(404).json({ success: false, message: 'Workspace not found' });

    const reqId = req.user?.id?.toString();
    if (!reqId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const isMember = workspace.members.some((m) => toId(m.user) === reqId);

    if (!isMember)
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, workspace });
  } catch (err) {
    console.error('getWorkspace error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE WORKSPACE ────────────────────────────────────────────────────────
export const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    console.log('REQ USER =', req.user);

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }],
    });

    await workspace.populate('members.user', 'username email avatar avatarColor');
    res.status(201).json({ success: true, workspace });
  } catch (err) {
    console.error('createWorkspace error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── UPDATE WORKSPACE ────────────────────────────────────────────────────────
export const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace)
      return res.status(404).json({ success: false, message: 'Not found' });
    if (!workspace.canManage(req.user.id))
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });

    const { name, description, color, settings } = req.body;
    if (name)                    workspace.name        = name;
    if (description !== undefined) workspace.description = description;
    if (color)                   workspace.color       = color;
    if (settings)                workspace.settings    = { ...workspace.settings, ...settings };

    await workspace.save();
    await workspace.populate('members.user', 'username email avatar avatarColor');
    res.json({ success: true, workspace });
  } catch (err) {
    console.error('updateWorkspace error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE WORKSPACE ────────────────────────────────────────────────────────
export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace)
      return res.status(404).json({ success: false, message: 'Not found' });

    const ownerId = toId(workspace.owner);
    if (!ownerId || ownerId !== req.user.id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can delete workspace' });

    await Task.deleteMany({ workspace: workspace._id });
    await workspace.deleteOne();
    res.json({ success: true, message: 'Workspace deleted' });
  } catch (err) {
    console.error('deleteWorkspace error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INVITE MEMBER ───────────────────────────────────────────────────────────
export const inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.user', 'username email');

    if (!workspace)
      return res.status(404).json({ success: false, message: 'Not found' });
    if (!workspace.canManage(req.user.id))
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      const alreadyMember = workspace.members.some(
        (m) => toId(m.user) === existingUser._id.toString()
      );
      if (alreadyMember)
        return res.status(400).json({ success: false, message: 'User is already a member' });

      workspace.members.push({ user: existingUser._id, role });

      await User.findByIdAndUpdate(existingUser._id, {
        $push: {
          notifications: {
            type: 'workspace_invite',
            message: `${req.user.username} added you to workspace "${workspace.name}"`,
            from: req.user.id,
            workspace: workspace._id,
            link: `/workspace/${workspace._id}`,
          },
        },
      });

      await workspace.save();
      await workspace.populate('members.user', 'username email avatar avatarColor');
      return res.json({
        success: true,
        workspace,
        message: `${existingUser.username} added to workspace`,
      });
    }

    // Non-existing user — generate invite token
    const existingInvite = workspace.invitations.find(
      (inv) => inv.email === email.toLowerCase() && !inv.accepted
    );
    if (existingInvite)
      return res.status(400).json({ success: false, message: 'Invite already sent' });

    const token = uuidv4();
    workspace.invitations.push({
      email: email.toLowerCase(),
      token,
      role,
      invitedBy: req.user.id,
    });
    await workspace.save();

    const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;
    console.log(`📧 Invite link for ${email}: ${inviteLink}`);
    res.json({ success: true, message: `Invitation sent to ${email}`, inviteLink });
  } catch (err) {
    console.error('inviteMember error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ACCEPT INVITE ───────────────────────────────────────────────────────────
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const workspace = await Workspace.findOne({ 'invitations.token': token });
    if (!workspace)
      return res.status(404).json({ success: false, message: 'Invalid or expired invite' });

    const invitation = workspace.invitations.find((inv) => inv.token === token);
    if (!invitation)
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    if (invitation.accepted)
      return res.status(400).json({ success: false, message: 'Invite already used' });
    if (new Date() > invitation.expiresAt)
      return res.status(400).json({ success: false, message: 'Invite expired' });

    const alreadyMember = workspace.members.some(
      (m) => toId(m.user) === req.user.id.toString()
    );
    if (!alreadyMember) {
      workspace.members.push({ user: req.user.id, role: invitation.role });
    }

    invitation.accepted = true;
    await workspace.save();
    res.json({
      success: true,
      message: 'Joined workspace successfully',
      workspaceId: workspace._id,
    });
  } catch (err) {
    console.error('acceptInvite error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REMOVE MEMBER ───────────────────────────────────────────────────────────
export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace)
      return res.status(404).json({ success: false, message: 'Not found' });

    if (!workspace.canManage(req.user.id) && req.user.id.toString() !== memberId)
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });

    const ownerId = toId(workspace.owner);
    if (ownerId === memberId)
      return res.status(400).json({ success: false, message: 'Cannot remove workspace owner' });

    workspace.members = workspace.members.filter((m) => toId(m.user) !== memberId);
    await workspace.save();
    await workspace.populate('members.user', 'username email avatar avatarColor');
    res.json({ success: true, workspace });
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE MEMBER ROLE ──────────────────────────────────────────────────────
export const updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace)
      return res.status(404).json({ success: false, message: 'Not found' });

    const ownerId = toId(workspace.owner);
    if (!ownerId || ownerId !== req.user.id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can change roles' });

    const member = workspace.members.find((m) => toId(m.user) === memberId);
    if (!member)
      return res.status(404).json({ success: false, message: 'Member not found' });

    member.role = role;
    await workspace.save();
    await workspace.populate('members.user', 'username email avatar avatarColor');
    res.json({ success: true, workspace });
  } catch (err) {
    console.error('updateMemberRole error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET WORKSPACE ANALYTICS ─────────────────────────────────────────────────
export const getWorkspaceAnalytics = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace)
      return res.status(404).json({ success: false, message: 'Not found' });

    const reqId = req.user?.id?.toString();
    const isMember = workspace.members.some((m) => toId(m.user) === reqId);
    if (!isMember)
      return res.status(403).json({ success: false, message: 'Access denied' });

    const tasks = await Task.find({ workspace: workspace._id, isArchived: false })
      .populate('assignees', 'username avatarColor')
      .populate('creator', 'username');

    const byStatus = {
      todo:          tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done:          tasks.filter((t) => t.status === 'done').length,
    };
    const byPriority = {
      low:    tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high:   tasks.filter((t) => t.priority === 'high').length,
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
    };
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    const completion =
      tasks.length > 0 ? Math.round((byStatus.done / tasks.length) * 100) : 0;

    const memberStats = {};
    tasks.forEach((task) => {
      task.assignees.forEach((a) => {
        if (!a?._id) return;
        const id = a._id.toString();
        if (!memberStats[id]) memberStats[id] = { user: a, total: 0, done: 0 };
        memberStats[id].total++;
        if (task.status === 'done') memberStats[id].done++;
      });
    });

    res.json({
      success: true,
      analytics: {
        total: tasks.length,
        byStatus,
        byPriority,
        overdue,
        completion,
        memberStats: Object.values(memberStats),
      },
    });
  } catch (err) {
    console.error('getWorkspaceAnalytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};