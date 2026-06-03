import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:     { type: String, required: true, trim: true, maxlength: [1000, 'Comment too long'] },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  editedAt: { type: Date },
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  actor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: {
    type: String,
    enum: [
      'created', 'moved', 'assigned', 'unassigned', 'commented',
      'priority_changed', 'due_date_changed', 'title_changed',
      'label_added', 'label_removed', 'completed', 'reopened',
    ],
    required: true,
  },
  meta:      { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title: {
    type:      String,
    required:  [true, 'Task title is required'],
    trim:      true,
    maxlength: [200, 'Title too long'],
  },
  description: { type: String, trim: true, maxlength: [2000, 'Description too long'] },
  status: {
    type:    String,
    enum:    ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
  priority: {
    type:    String,
    enum:    ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  workspace:   { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  creator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  assignees:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags:        [{ type: String, trim: true }],
  labels:      [{ type: String, trim: true }],
  dueDate:     { type: Date },
  order:       { type: Number, default: 0 },
  isArchived:  { type: Boolean, default: false },
  completedAt: { type: Date },
  comments:    [commentSchema],
  activity:    [activitySchema],
  attachments: [{
    name:       String,
    url:        String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

taskSchema.index({ workspace: 1, status: 1, order: 1 });
taskSchema.index({ assignees: 1 });

export default mongoose.model('Task', taskSchema);