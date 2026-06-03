import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskAPI } from '../api';

const PRIORITIES = [
  { value: 'low',    label: 'Low',    emoji: '🟢' },
  { value: 'medium', label: 'Medium', emoji: '🟡' },
  { value: 'high',   label: 'High',   emoji: '🔴' },
];

const STATUSES = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done',        label: 'Done'        },
];

/* ── shared field class ─────────────────────────────────────── */
const field = `
  w-full
  rounded-[12px]
  border border-white/10
  bg-[#141d2e]
  px-4 py-[10px]
  text-[14px] text-white
  placeholder:text-white/30
  outline-none
  transition-colors
  focus:border-blue-500/50
  focus:bg-[#162034]
`;

const labelClass = `
  mb-[6px]
  block
  text-[13px]
  font-medium
  text-white/60
`;

const AddTaskModal = ({
  workspaceId,
  onClose,
  onAdd,
  initialStatus = 'todo',
}) => {
  const [form, setForm] = useState({
    title:       '',
    description: '',
    priority:    'medium',
    status:      initialStatus,
    dueDate:     '',
    tags:        '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!workspaceId) {
      setError('Workspace ID missing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        priority:    form.priority,
        status:      form.status,
        dueDate:     form.dueDate || undefined,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        workspace: workspaceId,
      };

      const { data } = await taskAPI.create(workspaceId, payload);
      onAdd(data.task);
      toast.success('Task created!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/85
        backdrop-blur-sm
        p-4
      "
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Modal ── */}
      <div
        className="
          w-full max-w-[500px]
          rounded-[20px]
          bg-[#0f1623]
          border border-white/[0.08]
          shadow-[0_32px_80px_rgba(0,0,0,0.7)]
        "
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <h2 className="text-white text-[18px] font-bold tracking-[-0.02em]">
            Add new task
          </h2>
          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-[10px]
              border border-white/10
              bg-white/[0.05]
              flex items-center justify-center
              text-white/50
              hover:text-white hover:bg-white/10
              transition-all
            "
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-[14px]">

          {/* Error */}
          {error && (
            <div className="
              rounded-[10px]
              border border-red-500/30
              bg-red-500/[0.12]
              px-4 py-[10px]
              text-[13px] text-red-400
              leading-snug
            ">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>Task title *</label>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="Enter task title..."
              autoFocus
              className={field}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              Description{' '}
              <span className="text-white/30 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="Add more details..."
              className={`${field} resize-y min-h-[100px]`}
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={set('priority')}
                className={`${field} cursor-pointer appearance-none`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff60' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '36px',
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#141d2e]">
                    {p.emoji} {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={set('status')}
                className={`${field} cursor-pointer appearance-none`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff60' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '36px',
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#141d2e]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={set('dueDate')}
                className={`${field} [color-scheme:dark]`}
              />
            </div>

            <div>
              <label className={labelClass}>Tags</label>
              <input
                value={form.tags}
                onChange={set('tags')}
                placeholder="frontend, bug…"
                className={field}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-[6px]">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 h-[48px]
                rounded-[12px]
                border border-white/10
                bg-[#1a2235]
                text-[14px] text-white/70 font-semibold
                transition-all
                hover:bg-[#1e2840] hover:text-white/90
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex-[1.6] h-[48px]
                rounded-[12px]
                bg-[#2563EB]
                text-[14px] text-white font-bold
                tracking-[-0.01em]
                transition-all
                hover:bg-[#3070f0]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Creating…' : 'Add task →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;