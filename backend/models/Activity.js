const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ['note', 'call', 'meeting', 'email', 'task', 'deal_update', 'stage_change', 'system'], required: true },
  description: { type: String, required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: mongoose.Schema.Types.Mixed,
  dueDate: Date,
  completed: { type: Boolean, default: false }
}, { timestamps: true });

activitySchema.index({ contact: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
