import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskAPI } from '../api';
import Avatar from './Avatar';
import PriorityBadge from './PriorityBadge';
import { X, Calendar, Flag, Tag, MessageSquare, Activity, Clock, Pencil, Check, Trash2, Plus, Send } from 'lucide-react';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const LABELS = ['Bug', 'Feature', 'Design', 'Backend', 'Frontend', 'Docs', 'Research', 'Urgent'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const actionLabels = {
  created: 'created this task',
  moved: (meta) => `moved from ${meta?.from} → ${meta?.to}`,
  assigned: 'assigned members',
  commented: 'added a comment',
  priority_changed: (meta) => `changed priority to ${meta?.to}`,
  completed: 'marked as done',
  reopened: 're-opened this task',
  due_date_changed: (meta) => `updated due date`,
};

const TaskDetailModal = ({ task: initialTask, workspace, currentUser, onClose, onUpdate, onDelete }) => {
  const [task, setTask] = useState(initialTask);
  const [activeTab, setActiveTab] = useState('details');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => { if (editingTitle) titleRef.current?.focus(); }, [editingTitle]);

  const update = async (changes) => {
    setSaving(true);
    try {
      const { data } = await taskAPI.update(task._id, changes);
      setTask(data.task);
      onUpdate(data.task);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    if (title.trim() && title !== task.title) update({ title: title.trim() });
  };

  const handleAssigneeToggle = (userId) => {
    const current = task.assignees.map(a => a._id);
    const updated = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];
    update({ assignees: updated });
  };

  const handleLabelToggle = (label) => {
    const current = task.labels || [];
    const updated = current.includes(label)
      ? current.filter(l => l !== label)
      : [...current, label];
    update({ labels: updated });
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      const { data } = await taskAPI.addComment(task._id, comment.trim());
      setTask(prev => ({ ...prev, comments: [...(prev.comments || []), data.comment] }));
      setComment('');
    } catch (err) {
      toast.error('Failed to send comment');
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskAPI.deleteComment(task._id, commentId);
      setTask(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
    } catch { toast.error('Failed to delete comment'); }
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="w-full max-w-3xl max-h-[90vh] bg-[#0f1225] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start gap-4 px-6 py-5 border-b border-white/08">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <PriorityBadge priority={task.priority} />
                <span className="text-white/30 text-xs">#{task._id.slice(-6).toUpperCase()}</span>
                {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin ml-1" />}
              </div>
              {editingTitle ? (
                <input
                  ref={titleRef}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false); } }}
                  className="w-full bg-transparent text-white text-xl font-bold focus:outline-none border-b-2 border-indigo-500/60 pb-1"
                />
              ) : (
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-white text-xl font-bold cursor-pointer hover:text-white/80 transition-colors flex items-center gap-2 group"
                >
                  {task.title}
                  <Pencil size={14} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (confirm('Delete this task?')) { onDelete(task._id); onClose(); } }}
                className="p-2 rounded-xl hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
              >
                <Trash2 size={18} />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/08 px-6">
            {['details', 'comments', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab ? 'border-indigo-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                {tab}
                {tab === 'comments' && task.comments?.length > 0 && (
                  <span className="ml-1.5 bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">{task.comments.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="p-6 grid grid-cols-3 gap-6">
                {/* Left: Description */}
                <div className="col-span-2 space-y-5">
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      onBlur={() => description !== task.description && update({ description })}
                      placeholder="Add a description..."
                      rows={5}
                      className="w-full bg-white/05 border border-white/08 rounded-xl p-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
                    />
                  </div>
                  {/* Labels */}
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Labels</label>
                    <div className="flex flex-wrap gap-2">
                      {LABELS.map(label => (
                        <button
                          key={label}
                          onClick={() => handleLabelToggle(label)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            task.labels?.includes(label)
                              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                              : 'bg-white/05 text-white/40 border border-white/10 hover:border-white/30 hover:text-white/70'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Meta */}
                <div className="space-y-5">
                  {/* Status */}
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Status</label>
                    <select
                      value={task.status}
                      onChange={e => update({ status: e.target.value })}
                      className="w-full bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Priority</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRIORITIES.map(p => (
                        <button
                          key={p}
                          onClick={() => update({ priority: p })}
                          className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                            task.priority === p ? 'bg-white/15 text-white ring-1 ring-white/20' : 'bg-white/05 text-white/40 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Due Date</label>
                    <input
                      type="date"
                      value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
                      onChange={e => update({ dueDate: e.target.value || null })}
                      className={`w-full bg-white/05 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-all ${
                        isOverdue ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white'
                      }`}
                    />
                    {isOverdue && <p className="text-red-400 text-xs mt-1">Overdue!</p>}
                  </div>

                  {/* Assignees */}
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Assignees</label>
                    <div className="space-y-1.5">
                      {workspace.members.map(m => {
                        const assigned = task.assignees?.some(a => (a._id || a) === m.user._id);
                        return (
                          <button
                            key={m.user._id}
                            onClick={() => handleAssigneeToggle(m.user._id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                              assigned ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/05 border border-transparent hover:border-white/10'
                            }`}
                          >
                            <Avatar user={m.user} size="xs" />
                            <span className={`text-xs font-medium truncate ${assigned ? 'text-indigo-300' : 'text-white/60'}`}>{m.user.username}</span>
                            {assigned && <Check size={12} className="ml-auto text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Creator */}
                  <div>
                    <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-2">Created by</label>
                    <div className="flex items-center gap-2">
                      <Avatar user={task.creator} size="xs" />
                      <span className="text-white/60 text-xs">{task.creator?.username}</span>
                    </div>
                    <p className="text-white/30 text-xs mt-1">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="p-6 space-y-4">
                {task.comments?.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare size={32} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No comments yet. Start the discussion!</p>
                  </div>
                )}
                {task.comments?.map(c => (
                  <div key={c._id} className="flex gap-3 group">
                    <Avatar user={c.author} size="sm" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 bg-white/05 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white text-sm font-semibold">{c.author?.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-xs">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                          {c.author?._id === currentUser?._id && (
                            <button onClick={() => handleDeleteComment(c._id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-all">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}

                {/* Comment Input */}
                <div className="flex gap-3 pt-2">
                  <Avatar user={currentUser} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 bg-white/05 border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-all">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                      placeholder="Write a comment... Use @username to mention"
                      rows={2}
                      className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-white/80 placeholder-white/30 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end px-3 pb-2">
                      <button
                        onClick={handleComment}
                        disabled={!comment.trim() || sendingComment}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                      >
                        {sendingComment ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={12} />}
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6 space-y-1">
                {(!task.activity || task.activity.length === 0) && (
                  <div className="text-center py-12">
                    <Activity size={32} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No activity recorded yet.</p>
                  </div>
                )}
                {task.activity?.slice().reverse().map((act, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/05 last:border-0">
                    <Avatar user={act.actor} size="xs" className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm">
                        <span className="text-white font-medium">{act.actor?.username || 'Someone'}</span>
                        {' '}
                        {typeof actionLabels[act.action] === 'function'
                          ? actionLabels[act.action](act.meta)
                          : (actionLabels[act.action] || act.action)}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">{formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;