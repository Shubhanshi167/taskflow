import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { workspaceAPI, taskAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { AvatarGroup } from '../components/Avatar';
import PriorityBadge from '../components/PriorityBadge';
import TaskDetailModal from '../components/TaskDetailModal';
import AddTaskModal from '../components/AddTaskModal';
import InviteModal from '../components/InviteModal';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  Plus, Search, Users, Settings, ChevronRight,
  Calendar, MessageSquare, MoreHorizontal, Layout,
} from 'lucide-react';
import { isPast, format } from 'date-fns';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#94a3b8', dot: 'bg-slate-400'  },
  { id: 'in-progress', label: 'In Progress',  color: '#f59e0b', dot: 'bg-yellow-400' },
  { id: 'done',        label: 'Done',         color: '#22c55e', dot: 'bg-green-400'  },
];

/* ── Task card ─────────────────────────────────────────────────────────────── */
const TaskCard = ({ task, index, onClick }) => {
  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-[#141830] border rounded-xl p-4 cursor-pointer group transition-all select-none ${
            snapshot.isDragging
              ? 'border-indigo-500/60 shadow-xl shadow-indigo-900/30 rotate-1 scale-105'
              : 'border-white/[0.08] hover:border-white/20 hover:shadow-lg'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <PriorityBadge priority={task.priority} />
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-white/30 transition-all">
              <MoreHorizontal size={14} />
            </button>
          </div>

          <h3 className="text-white text-sm font-semibold leading-tight mb-3 line-clamp-2">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-white/40 text-xs mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.labels.map((l) => (
                <span
                  key={l}
                  className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-medium"
                >
                  {l}
                </span>
              ))}
            </div>
          )}

          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <span
                  className={`flex items-center gap-1 text-[11px] ${
                    isOverdue ? 'text-red-400' : 'text-white/30'
                  }`}
                >
                  <Calendar size={11} />
                  {isOverdue ? 'Overdue' : format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
              {task.comments?.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-white/30">
                  <MessageSquare size={11} />
                  {task.comments.length}
                </span>
              )}
            </div>
            {task.assignees?.length > 0 && (
              <AvatarGroup users={task.assignees} max={3} size="xs" />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
const WorkspacePage = () => {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [workspace,      setWorkspace]      = useState(null);
  const [tasks,          setTasks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask,   setSelectedTask]   = useState(null);
  const [showAddTask,    setShowAddTask]     = useState(false);
  const [addTaskStatus,  setAddTaskStatus]  = useState('todo');
  const [showInvite,     setShowInvite]     = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wsRes, taskRes] = await Promise.all([
        workspaceAPI.getOne(id),
        taskAPI.getAll(id),
      ]);
      setWorkspace(wsRes.data.workspace);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      toast.error('Failed to load workspace');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getColumnTasks = (status) =>
    tasks
      .filter((t) => {
        if (t.status !== status) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId;
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );
    try {
      await taskAPI.update(draggableId, { status: newStatus });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t._id === draggableId ? { ...t, status: source.droppableId } : t))
      );
      toast.error('Failed to move task');
    }
  };

  const handleTaskUpdate = (updated) =>
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

  const handleTaskAdd = (newTask) =>
    setTasks((prev) => [newTask, ...prev]);

  const handleTaskDelete = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const completion =
    tasks.length > 0
      ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050812] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050812] flex flex-col">

      {/* ── Navbar ── */}
      <nav className="border-b border-white/[0.08] bg-[#080b18]/90 backdrop-blur-xl sticky top-0 z-30 px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Layout size={14} className="text-white" />
              </div>
              <span className="font-bold text-sm text-white">TaskFlow</span>
            </Link>
            <div className="flex items-center gap-1 text-white/40 text-sm">
              <Link to="/dashboard" className="hover:text-white/70 transition-colors">
                Dashboard
              </Link>
              <ChevronRight size={14} />
              <span className="text-white font-medium">{workspace?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all"
            >
              <Users size={15} />
              <AvatarGroup
                users={workspace?.members?.map((m) => m.user) || []}
                max={3}
                size="xs"
              />
            </button>
            <Link
              to="/settings"
              className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="px-6 py-6 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
              style={{
                backgroundColor: (workspace?.color || '#6366f1') + '30',
                border: `1px solid ${workspace?.color || '#6366f1'}40`,
              }}
            >
              {workspace?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{workspace?.name}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-white/40 text-sm">{tasks.length} tasks</span>
                <span className="text-white/20">·</span>
                <span
                  className={`text-sm font-medium ${
                    completion === 100 ? 'text-green-400' : 'text-white/40'
                  }`}
                >
                  {completion}% complete
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setAddTaskStatus('todo'); setShowAddTask(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/30"
          >
            <Plus size={18} /> Add Task
          </button>
        </div>

        {/* Progress bar — plain CSS transition, no framer-motion */}
        <div className="w-full h-1.5 bg-white/[0.05] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Column stats */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {COLUMNS.map((col) => {
            const count = tasks.filter((t) => t.status === col.id).length;
            return (
              <div key={col.id} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-white/50">{col.label}:</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            );
          })}
          {tasks.filter(
            (t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done'
          ).length > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 font-semibold">
                {tasks.filter(
                  (t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done'
                ).length}{' '}
                overdue
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-white/[0.05] flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filterPriority === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/[0.05] text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 min-w-max">
            {COLUMNS.map((col) => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div key={col.id} className="w-80 flex flex-col gap-3">
                  {/* Column header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <span className="text-white/80 font-semibold text-sm">{col.label}</span>
                      <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full font-medium">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => { setAddTaskStatus(col.id); setShowAddTask(true); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Droppable column */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[12rem] rounded-2xl p-3 space-y-3 transition-all ${
                          snapshot.isDraggingOver
                            ? 'bg-indigo-500/[0.08] border border-indigo-500/30'
                            : 'bg-white/[0.02] border border-white/[0.05]'
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onClick={setSelectedTask}
                          />
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-24">
                            <p className="text-white/20 text-xs">Drop tasks here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* ── Modals (no AnimatePresence) ── */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          workspace={workspace}
          currentUser={user}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
      {showAddTask && (
        <AddTaskModal
          workspaceId={id}
          initialStatus={addTaskStatus}
          onClose={() => setShowAddTask(false)}
          onAdd={handleTaskAdd}
        />
      )}
      {showInvite && (
        <InviteModal
          workspace={workspace}
          onClose={() => setShowInvite(false)}
          onUpdate={setWorkspace}
        />
      )}
    </div>
  );
};

export default WorkspacePage;