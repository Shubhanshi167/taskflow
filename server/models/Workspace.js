import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  token:     { type: String, required: true },
  role:      { type: String, enum: ['admin', 'member'], default: 'member' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accepted:  { type: Boolean, default: false },
  expiresAt: { type: Date,    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
});

const workspaceSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Workspace name is required'],
    trim:     true,
  },
  description: { type: String, default: '', trim: true },
  color:       { type: String, default: '#6D6AFE' },
  owner: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  members: [{
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    role: {
      type:    String,
      enum:    ['owner', 'admin', 'member'],
      default: 'member',
    },
  }],
  invitations: [invitationSchema],
  isArchived:  { type: Boolean, default: false },
  settings: {
    isPublic:         { type: Boolean, default: false },
    allowMemberInvite:{ type: Boolean, default: false },
  },
}, { timestamps: true });

// ── canManage: returns true for owner or admin ────────────────────────────────
workspaceSchema.methods.canManage = function (userId) {
  if (!userId) return false;
  const id = userId.toString();
  if (this.owner?.toString() === id) return true;
  return this.members.some((m) => {
    const mId = m.user?._id?.toString() ?? m.user?.toString();
    return mId === id && (m.role === 'owner' || m.role === 'admin');
  });
};

export default mongoose.model('Workspace', workspaceSchema);