const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft',
    index: true
  },

  // Trigger configuration
  trigger: {
    type: {
      type: String,
      enum: [
        'event',
        'schedule',
        'segment_enter',
        'segment_exit',
        'score_change',
        'date_field'
      ],
      required: true
    },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  },

  // Workflow steps (DAG structure)
  steps: [{
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'email',
        'sms',
        'wait',
        'condition',
        'split',
        'update_field',
        'add_tag',
        'webhook',
        'ai_decision'
      ],
      required: true
    },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    nextSteps: [{ type: String }],
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    _id: false
  }],

  // Performance metrics
  metrics: {
    entered: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    errors: { type: Number, default: 0 }
  },

  // AI configuration
  aiPowered: { type: Boolean, default: false },
  aiModel: { type: String },

  // Enrollment settings
  enrollmentRules: {
    segment: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
    reEnrollment: { type: Boolean, default: false },
    maxEnrollments: { type: Number }
  },

  // Metadata
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Indexes
automationSchema.index({ status: 1 });
automationSchema.index({ createdBy: 1 });
automationSchema.index({ 'trigger.type': 1, status: 1 });
automationSchema.index({ createdAt: -1 });
automationSchema.index({ tags: 1 });

module.exports = mongoose.model('Automation', automationSchema);
