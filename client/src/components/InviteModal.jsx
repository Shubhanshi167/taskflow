import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { workspaceAPI } from '../api';
import Avatar from './Avatar';
import { X, UserPlus, Mail, Shield, Crown, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const roleConfig = {
  owner:  { label: 'Owner',  icon: Crown,  color: 'text-yellow-400' },
  admin:  { label: 'Admin',  icon: Shield, color: 'text-blue-400'   },
  member: { label: 'Member', icon: Users,  color: 'text-white/60'   },
};

const InviteModal = ({ workspace, onClose, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const [email,   setEmail]   = useState('');
  const [role,    setRole]    = useState('member');
  const [loading, setLoading] = useState(false);

  // Safe members — skip any entry where user failed to populate
  const members = (workspace.members || []).filter((m) => m?.user?._id);

  const currentMember = members.find(
    (m) => m.user._id === currentUser?._id || m.user._id === currentUser?.id
  );
  const isOwner = currentMember?.role === 'owner';

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await workspaceAPI.invite(workspace._id, { email: email.trim(), role });
      toast.success(data.message);
      if (data.inviteLink) {
        navigator.clipboard?.writeText(data.inviteLink).catch(() => {});
        toast.success('Invite link copied!', { icon: '📋' });
      }
      setEmail('');
      if (data.workspace) onUpdate(data.workspace);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId, username) => {
    if (!confirm(`Remove ${username} from this workspace?`)) return;
    try {
      const { data } = await workspaceAPI.removeMember(workspace._id, memberId);
      onUpdate(data.workspace);
      toast.success(`${username} removed`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const { data } = await workspaceAPI.updateMemberRole(workspace._id, memberId, newRole);
      onUpdate(data.workspace);
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#0f1225] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
            <div>
              <h2 className="text-white font-bold text-lg">Team Members</h2>
              <p className="text-white/50 text-sm mt-0.5">
                {workspace.name} · {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Invite Form */}
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <p className="text-white/70 text-sm font-medium mb-3">Invite by email</p>
            <form onSubmit={handleInvite} className="flex gap-2">
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="teammate@company.com"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60 transition-all"
                />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-indigo-500/60 transition-all"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                Invite
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="max-h-72 overflow-y-auto px-6 py-4 space-y-1">
            {members.length === 0 && (
              <p className="text-white/30 text-sm text-center py-6">No members yet</p>
            )}
            {members.map((member) => {
              const memberIsOwner = member.role === 'owner';
              const isSelf =
                member.user._id === currentUser?._id ||
                member.user._id === currentUser?.id;

              return (
                <div
                  key={member.user._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all group"
                >
                  <Avatar user={member.user} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">
                        {member.user.username}
                      </p>
                      {isSelf && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full">
                          you
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs truncate">{member.user.email}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {memberIsOwner ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                        <Crown size={12} /> Owner
                      </span>
                    ) : isOwner ? (
                      // Only workspace owner can change roles
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                        className={`bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:border-indigo-500/60 transition-all ${
                          roleConfig[member.role]?.color ?? 'text-white/60'
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-lg bg-white/[0.05] ${
                          roleConfig[member.role]?.color ?? 'text-white/60'
                        }`}
                      >
                        {roleConfig[member.role]?.label ?? member.role}
                      </span>
                    )}

                    {/* Remove button — owner can remove anyone except themselves; members can leave */}
                    {!memberIsOwner && (isOwner || isSelf) && (
                      <button
                        onClick={() => handleRemove(member.user._id, member.user.username)}
                        title={isSelf ? 'Leave workspace' : 'Remove member'}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending invitations footer */}
          {workspace.invitations?.filter((inv) => !inv.accepted).length > 0 && (
            <div className="px-6 py-3 border-t border-white/[0.08]">
              <p className="text-white/40 text-xs">
                {workspace.invitations.filter((inv) => !inv.accepted).length} pending
                invitation
                {workspace.invitations.filter((inv) => !inv.accepted).length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteModal;