import Task from '../models/Task.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

// Normalize user id — works whether JWT has .id or ._id
const getReqUserId = (req) => req.user?.id || req.user?._id;

// Safe member check — works populated or unpopulated
const toId = (val) => {
  if (!val) return null;
  if (val._id) return val._id.toString();
  return val.toString();
};

const checkAccess = async (workspaceId, userId) => {
  if (!userId) return null;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return null;
  const isMember = workspace.members.some(
    (m) => toId(m.user) === userId.toString()
  );
  return isMember ? workspace : null;
};

// ─── GET TASKS ───────────────────────────────────────────────────────────────
export const getTasks = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const ws = await checkAccess(req.params.workspaceId, userId);
    if (!ws) return res.status(403).json({ success: false, message: 'Access denied' });

    const filter = { workspace: req.params.workspaceId, isArchived: false };
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignee) filter.assignees = req.query.assignee;
    if (req.query.status)   filter.status    = req.query.status;

    const tasks = await Task.find(filter)
      .populate('assignees', 'username email avatar avatarColor')
      .populate('creator', 'username avatar avatarColor')
      .populate('comments.author', 'username avatar avatarColor')
      .sort({ status: 1, order: 1, createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) {
    console.error('GET TASKS ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE TASK ─────────────────────────────────────────────────────────────
export const createTask = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const ws = await checkAccess(req.params.workspaceId, userId);
    if (!ws) return res.status(403).json({ success: false, message: 'Access denied' });

    const { title, description, priority, status, assignees, dueDate, tags, labels } = req.body;

    const maxOrderTask = await Task.findOne({
      workspace: req.params.workspaceId,
      status: status || 'todo',
    }).sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      priority,
      status:    status || 'todo',
      assignees: assignees || [],
      dueDate,
      tags:      tags    || [],
      labels:    labels  || [],
      workspace: req.params.workspaceId,
      creator:   userId,
      order,
      activity: [{ actor: userId, action: 'created', meta: { title } }],
    });

    await task.populate([
      { path: 'assignees', select: 'username email avatar avatarColor' },
      { path: 'creator',   select: 'username avatar avatarColor' },
    ]);

    // Notify assignees
    if (task.assignees.length > 0) {
      const notifications = task.assignees
        .filter((a) => a._id.toString() !== userId.toString())
        .map((a) => ({
          type:      'task_assigned',
          message:   `${req.user.username} assigned you to "${task.title}"`,
          from:      userId,
          workspace: ws._id,
          task:      task._id,
          link:      `/workspace/${ws._id}`,
        }));

      if (notifications.length) {
        await User.updateMany(
          { _id: { $in: task.assignees.map((a) => a._id) } },
          { $push: { notifications: { $each: notifications } } }
        );
      }
    }

    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('CREATE TASK ERROR:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── UPDATE TASK ─────────────────────────────────────────────────────────────
export const updateTask = async (req, res) => {
  try {
    const userId = getReqUserId(req);

    const task = await Task.findById(req.params.taskId)
      .populate('assignees', 'username email avatar avatarColor')
      .populate('creator',   'username avatar avatarColor');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const ws = await checkAccess(task.workspace, userId);
    if (!ws) return res.status(403).json({ success: false, message: 'Access denied' });

    const { title, description, priority, status, assignees, dueDate, labels } = req.body;

    if (title && title !== task.title) {
      task.activity.push({ actor: userId, action: 'title_changed', meta: { from: task.title, to: title } });
      task.title = title;
    }
    if (priority && priority !== task.priority) {
      task.activity.push({ actor: userId, action: 'priority_changed', meta: { from: task.priority, to: priority } });
      task.priority = priority;
    }
    if (status && status !== task.status) {
      task.activity.push({ actor: userId, action: 'moved', meta: { from: task.status, to: status } });
      task.status = status;
      task.completedAt = status === 'done' ? new Date() : undefined;
    }
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) {
      task.activity.push({ actor: userId, action: 'due_date_changed', meta: { to: dueDate } });
      task.dueDate = dueDate;
    }
    if (labels) task.labels = labels;

    if (assignees !== undefined) {
      const prevAssignees = task.assignees.map((a) => a._id.toString());
      const addedAssignees = assignees.filter(
        (id) => !prevAssignees.includes(id.toString())
      );

      if (addedAssignees.length > 0) {
        task.activity.push({ actor: userId, action: 'assigned', meta: { assignees: addedAssignees } });
        await User.updateMany(
          { _id: { $in: addedAssignees } },
          {
            $push: {
              notifications: {
                type:      'task_assigned',
                message:   `${req.user.username} assigned you to "${task.title}"`,
                from:      userId,
                workspace: ws._id,
                task:      task._id,
                link:      `/workspace/${ws._id}`,
              },
            },
          }
        );
      }
      task.assignees = assignees;
    }

    await task.save();
    await task.populate([
      { path: 'assignees',      select: 'username email avatar avatarColor' },
      { path: 'creator',        select: 'username avatar avatarColor' },
      { path: 'activity.actor', select: 'username avatar avatarColor' },
      { path: 'comments.author',select: 'username avatar avatarColor' },
    ]);

    res.json({ success: true, task });
  } catch (err) {
    console.error('UPDATE TASK ERROR:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── REORDER / DRAG-DROP ─────────────────────────────────────────────────────
export const reorderTasks = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const ws = await checkAccess(req.params.workspaceId, userId);
    if (!ws) return res.status(403).json({ success: false, message: 'Access denied' });

    const { updates } = req.body;
    await Promise.all(
      updates.map((u) =>
        Task.findByIdAndUpdate(u.taskId, { status: u.status, order: u.order })
      )
    );
    res.json({ success: true });
  } catch (err) {
    console.error('REORDER TASKS ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE TASK ─────────────────────────────────────────────────────────────
export const deleteTask = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const ws = await checkAccess(task.workspace, userId);
    if (!ws) return res.status(403).json({ success: false, message: 'Access denied' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error('DELETE TASK ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const ws = await checkAccess(task.workspace, userId);
    if (!ws) return res.status(403).json({ success: false, message: 'Access denied' });

    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });

    const mentionRegex = /@(\w+)/g;
    const mentionedUsernames = [...text.matchAll(mentionRegex)].map((m) => m[1]);
    let mentionIds = [];

    if (mentionedUsernames.length) {
      const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });
      mentionIds = mentionedUsers.map((u) => u._id);
      await User.updateMany(
        { _id: { $in: mentionIds } },
        {
          $push: {
            notifications: {
              type:      'comment_mention',
              message:   `${req.user.username} mentioned you in "${task.title}"`,
              from:      userId,
              workspace: ws._id,
              task:      task._id,
              link:      `/workspace/${ws._id}`,
            },
          },
        }
      );
    }

    task.comments.push({ author: userId, text: text.trim(), mentions: mentionIds });
    task.activity.push({ actor: userId, action: 'commented' });
    await task.save();

    await task.populate('comments.author', 'username avatar avatarColor');
    const newComment = task.comments[task.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error('ADD COMMENT ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE COMMENT ──────────────────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Not found' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (toId(comment.author) !== userId.toString())
      return res.status(403).json({ success: false, message: 'Can only delete your own comments' });

    comment.deleteOne();
    await task.save();
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE COMMENT ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};