const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: {
    type: String,
    enum: ['static', 'dynamic', 'ai-predicted'],
    default: 'dynamic',
    index: true
  },

  // Dynamic segment rules
  rules: {
    conditions: [{
      field: { type: String, required: true },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in', 'between', 'exists', 'not_exists', 'starts_with', 'ends_with'],
        required: true
      },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
      _id: false
    }],
    logic: {
      type: String,
      enum: ['and', 'or'],
      default: 'and'
    }
  },

  // AI-powered segmentation criteria
  aiCriteria: {
    model: { type: String },
    threshold: { type: Number, min: 0, max: 1 },
    features: [{ type: String }],
    lastTrainedAt: { type: Date },
    accuracy: { type: Number, min: 0, max: 1 }
  },

  // Membership
  contactCount: { type: Number, default: 0, min: 0 },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],

  // Auto-update settings
  autoUpdate: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  refreshIntervalMs: { type: Number, default: 3600000 },

  // Metadata
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Indexes
segmentSchema.index({ name: 1 });
segmentSchema.index({ type: 1 });
segmentSchema.index({ createdBy: 1 });
segmentSchema.index({ tags: 1 });
segmentSchema.index({ lastUpdated: 1 });
segmentSchema.index({ autoUpdate: 1, lastUpdated: 1 });

module.exports = mongoose.model('Segment', segmentSchema);
