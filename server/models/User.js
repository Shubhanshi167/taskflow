import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['task_assigned', 'workspace_invite', 'comment_mention', 'task_due', 'member_joined', 'task_moved'],
    required: true
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: { type: String, default: '' },
  avatarColor: {
    type: String,
    default: () => {
      const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#22c55e','#3b82f6','#ef4444'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  notifications: [notificationSchema],
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

// FIX: Mongoose 9 + async pre-save — remove next parameter entirely
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    avatarColor: this.avatarColor,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);