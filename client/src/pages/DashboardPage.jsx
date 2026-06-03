import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { workspaceAPI } from '../api';
import { useAuth } from '../context/AuthContext';

import NotificationDropdown from '../components/NotificationDropdown';
import Avatar from '../components/Avatar';

import {
  Plus,
  Search,
  LayoutGrid,
  BarChart2,
  CheckSquare,
  ClipboardList,
  Settings,
  LogOut,
  ChevronDown,
  Trash2,
  ArrowRight,
} from 'lucide-react';

import toast from 'react-hot-toast';

/* ─── helpers ────────────────────────────────────────────── */

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const getInitials = (name = '') =>
  name.slice(0, 2).toUpperCase() || '??';

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/* ─── New-workspace modal ────────────────────────────────── */

const NewWorkspaceModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });
  const [loading, setLoading] = useState(false);

  const COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#14b8a6',
    '#f59e0b',
    '#22c55e',
    '#3b82f6',
    '#ec4899',
    '#ef4444',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const { data } = await workspaceAPI.create(form);
      onAdd(data.workspace);
      toast.success('Workspace created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl p-6">

        <h2 className="text-white font-bold text-xl mb-5">New Workspace</h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Name */}
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Workspace name"
            autoFocus
            className="w-full bg-[#1a2035] border border-indigo-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />

          {/* Description */}
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description (optional)"
            rows={3}
            className="w-full bg-[#1a2035] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
          />

          {/* Color picker */}
          <div>
            <label className="text-white/50 text-xs mb-2.5 block">Color</label>
            <div className="flex gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="w-8 h-8 rounded-full flex-shrink-0 transition-all duration-150"
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      form.color === c
                        ? `0 0 0 2px #111827, 0 0 0 4px ${c}`
                        : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#1a2035] border border-white/[0.08] text-white/70 hover:text-white hover:bg-[#1f2640] text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

/* ─── Workspace card ─────────────────────────────────────── */

const WorkspaceCard = ({ ws, onDelete }) => {
  const total = ws.stats?.total || 0;
  const done = ws.stats?.completed || 0;
  const pct = ws.stats?.completion || (total > 0 ? Math.round((done / total) * 100) : 0);
  const color = ws.color || '#6366f1';

  return (
    <Link to={`/workspace/${ws._id}`} className="group block">
      <div className="relative bg-[#0d1117] border border-white/[0.07] hover:border-white/20 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 overflow-hidden">

        {/* left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: color }}
        />

        {/* header */}
        <div className="flex items-start gap-3 mb-3">
          {/* initials avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: color + '33', border: `1px solid ${color}55` }}
          >
            <span style={{ color }}>{getInitials(ws.name)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base leading-tight truncate">
              {ws.name}
            </h3>
            <p className="text-white/40 text-xs mt-0.5">
              {ws.members?.length || 1} member{(ws.members?.length || 1) !== 1 ? 's' : ''}
            </p>
          </div>

          {/* delete — visible on hover */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(ws._id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* description */}
        <p className="text-white/35 text-xs mb-4 line-clamp-2 leading-relaxed">
          {ws.description || 'No description provided'}
        </p>

        {/* progress bar */}
        <div className="h-1 bg-white/[0.06] rounded-full mb-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-white/30 text-xs">
            {total > 0 ? `${done}/${total} tasks` : 'No tasks yet'}{' '}
            <span style={{ color }} className="font-medium">
              · {pct}%
            </span>
          </span>

          <div className="flex items-center gap-3">
            <span className="text-white/25 text-xs">
              {fmtDate(ws.createdAt)}
            </span>
            <span className="text-xs text-white/50 group-hover:text-white/80 border border-white/10 group-hover:border-white/20 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1">
              Open <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─── Main page ──────────────────────────────────────────── */

const DashboardPage = () => {
  const { user, logout } = useAuth();
  console.log("USER =", user);
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await workspaceAPI.getAll();
        setWorkspaces(data.workspaces || []);
      } catch {
        toast.error('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workspace? This cannot be undone.')) return;
    try {
      await workspaceAPI.delete(id);
      setWorkspaces((prev) => prev.filter((w) => w._id !== id));
      toast.success('Workspace deleted');
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalTasks = workspaces.reduce((s, w) => s + (w.stats?.total || 0), 0);
  const totalDone  = workspaces.reduce((s, w) => s + (w.stats?.completed || 0), 0);
  const completion = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Workspaces',
      value: workspaces.length,
      color: 'text-indigo-400',
      icon: <LayoutGrid size={18} className="text-indigo-400" />,
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Total tasks',
      value: totalTasks,
      color: 'text-amber-400',
      icon: <ClipboardList size={18} className="text-amber-400" />,
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Completed',
      value: totalDone,
      color: 'text-emerald-400',
      icon: <CheckSquare size={18} className="text-emerald-400" />,
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Completion',
      value: `${completion}%`,
      color: 'text-orange-400',
      icon: <BarChart2 size={18} className="text-orange-400" />,
      bg: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-white">

      {/* ── NAVBAR ── */}
      <nav className="border-b border-white/[0.07] bg-[#080c14]/95 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* logo + nav */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <Plus size={14} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-white font-black text-lg tracking-tight">TaskFlow</span>
            </div>

            <Link
              to="/dashboard"
              className="text-white/50 hover:text-white/90 text-sm transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* right side */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2.5 py-1.5 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {getInitials(user?.username || user?.name || 'U')}
                </div>
                <span className="text-white/80 text-sm">
                  {user?.username || user?.name}
                </span>
                <ChevronDown size={13} className="text-white/40" />
              </button>

              {showUserMenu && (
                <div className="absolute top-11 right-0 w-44 bg-[#0f1525] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:bg-white/5 text-sm transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── HERO ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-white/40 text-sm mb-1">
              {getGreeting()} 👋
            </p>
            <h1 className="text-3xl font-black text-white">
  {(user?.email?.split("@")[0] || "User")}'s Dashboard
</h1>
            <p className="text-white/30 text-sm mt-1.5">
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} ·{' '}
              {totalTasks} total task{totalTasks !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg shadow-indigo-900/30 transition-all"
          >
            <Plus size={16} />
             New workspace
          </button>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map(({ label, value, color, icon, bg }) => (
            <div
              key={label}
              className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              <div>
                <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
                <p className="text-white/35 text-xs mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEARCH ── */}
        <div className="relative max-w-xs mb-6">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full bg-[#0d1117] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* ── WORKSPACE GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 animate-pulse h-44"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ws) => (
              <WorkspaceCard key={ws._id} ws={ws} onDelete={handleDelete} />
            ))}

            {/* new workspace card */}
            <button
              onClick={() => setShowNew(true)}
              className="group bg-transparent border border-dashed border-white/[0.12] hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[160px] transition-all duration-200 hover:bg-indigo-500/[0.04]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 group-hover:bg-indigo-600/40 border border-indigo-500/30 flex items-center justify-center transition-all">
                <Plus size={18} className="text-indigo-400" />
              </div>
              <span className="text-white/40 group-hover:text-white/60 text-sm font-medium transition-colors">
                New workspace
              </span>
            </button>
          </div>
        )}

        {/* empty state */}
        {!loading && filtered.length === 0 && search && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">
              No workspaces matching "<span className="text-white/50">{search}</span>"
            </p>
          </div>
        )}
      </div>

      {showNew && (
        <NewWorkspaceModal
          onClose={() => setShowNew(false)}
          onAdd={(ws) => setWorkspaces((prev) => [ws, ...prev])}
        />
      )}
    </div>
  );
};

export default DashboardPage;