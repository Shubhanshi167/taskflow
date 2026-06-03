import User from '../models/User.js';

// Helper — works whether JWT decoded to { id } or { _id }
const uid = (req) => req.user?.id || req.user?._id;

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(uid(req)).select('notifications');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const notifications = [...user.notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await User.updateOne(
      { _id: uid(req), 'notifications._id': notificationId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: uid(req) },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await User.findByIdAndUpdate(uid(req), { $set: { notifications: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};