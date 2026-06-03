import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../api';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';

const iconMap = {
  task_assigned: '🎯',
  workspace_invite: '✉️',
  comment_mention: '💬',
  task_due: '⏰',
  member_joined: '👋',
  task_moved: '↗️',
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClear = async () => {
    await notificationAPI.clear();
    setNotifications([]);
    setUnread(0);
  };

  const handleClick = async (n) => {
    if (!n.read) {
      await notificationAPI.markRead(n._id);
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-[#0f1225] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/08">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-400" />
              <span className="text-white font-semibold text-sm">Notifications</span>
              {unread > 0 && (
                <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button onClick={handleMarkAllRead} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all" title="Mark all read">
                    <CheckCheck size={14} />
                  </button>
                  <button onClick={handleClear} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-all" title="Clear all">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Bell size={32} className="text-white/20" />
                <p className="text-white/40 text-sm">All caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/05 transition-all border-b border-white/05 last:border-0 ${!n.read ? 'bg-indigo-500/05' : ''}`}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">{iconMap[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${n.read ? 'text-white/60' : 'text-white'}`}>{n.message}</p>
                    <p className="text-xs text-white/30 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  {!n.read && (
                    <button onClick={(e) => handleMarkRead(n._id, e)} className="flex-shrink-0 p-1 rounded hover:bg-white/10 text-indigo-400">
                      <Check size={12} />
                    </button>
                  )}
                  {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;