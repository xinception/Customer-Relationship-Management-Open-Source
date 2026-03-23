const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'social', 'multi-channel'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'],
    default: 'draft',
    index: true
  },

  // Targeting
  segment: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
  targetAudience: {
    filters: [{
      field: { type: String },
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in', 'between', 'exists'] },
      value: mongoose.Schema.Types.Mixed,
      _id: false
    }],
    estimatedSize: { type: Number, default: 0 }
  },

  // Content
  content: {
    subject: { type: String, trim: true },
    htmlBody: { type: String },
    textBody: { type: String },
    templateId: { type: String }
  },

  // Schedule
  schedule: {
    scheduledAt: { type: Date },
    timezone: { type: String, default: 'UTC' },
    frequency: {
      type: String,
      enum: ['one-time', 'daily', 'weekly', 'monthly'],
      default: 'one-time'
    }
  },

  // A/B Testing
  abTesting: {
    enabled: { type: Boolean, default: false },
    variants: [{
      name: { type: String },
      content: {
        subject: String,
        htmlBody: String,
        textBody: String
      },
      weight: { type: Number, min: 0, max: 100 },
      _id: false
    }],
    winnerCriteria: {
      type: String,
      enum: ['open_rate', 'click_rate', 'conversion_rate', 'revenue'],
      default: 'open_rate'
    }
  },

  // Campaign metrics
  metrics: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },

  // AI Optimization
  aiOptimization: {
    enabled: { type: Boolean, default: false },
    optimizedSubject: { type: String },
    optimizedSendTime: { type: Date },
    predictedOpenRate: { type: Number, min: 0, max: 100 },
    predictedClickRate: { type: Number, min: 0, max: 100 }
  },

  // Budget
  budget: { type: Number, default: 0, min: 0 },
  actualSpend: { type: Number, default: 0, min: 0 },
  roi: { type: Number, default: 0 },

  // Tags
  tags: [{ type: String }],

  // Owner
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
campaignSchema.index({ status: 1, type: 1 });
campaignSchema.index({ 'schedule.scheduledAt': 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ segment: 1 });
campaignSchema.index({ tags: 1 });

// Virtual: open rate
campaignSchema.virtual('openRate').get(function () {
  return this.metrics.delivered > 0
    ? ((this.metrics.opened / this.metrics.delivered) * 100).toFixed(2)
    : 0;
});

// Virtual: click rate
campaignSchema.virtual('clickRate').get(function () {
  return this.metrics.delivered > 0
    ? ((this.metrics.clicked / this.metrics.delivered) * 100).toFixed(2)
    : 0;
});

module.exports = mongoose.model('Campaign', campaignSchema);
