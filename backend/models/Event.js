const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Contact linkage
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  anonymousId: { type: String, index: true },

  // Event classification
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view', 'click', 'purchase', 'email_open', 'email_click',
      'form_submit', 'custom', 'login', 'signup', 'product_view',
      'add_to_cart', 'checkout', 'search', 'campaign_interaction',
      'support_ticket'
    ],
    index: true
  },
  eventName: { type: String, required: true, trim: true },

  // Event payload
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Context / environment
  context: {
    ip: { type: String },
    userAgent: { type: String },
    page: { type: String },
    referrer: { type: String },
    campaign: {
      name: String,
      source: String,
      medium: String,
      term: String,
      content: String
    }
  },

  // Source identification
  source: {
    type: String,
    enum: ['website', 'mobile', 'email', 'api', 'import', 'system'],
    default: 'website',
    index: true
  },

  // Session tracking
  sessionId: { type: String, index: true },

  // Timestamp (separate from mongoose timestamps for precise event timing)
  timestamp: { type: Date, default: Date.now, index: true },

  // Revenue attribution
  revenue: { type: Number, min: 0 },
  currency: { type: String, default: 'USD' },

  // Campaign attribution
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
eventSchema.index({ contact: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ contact: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ anonymousId: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ campaign: 1, eventType: 1 });
eventSchema.index({ source: 1, eventType: 1, timestamp: -1 });

// TTL index: auto-delete events older than 2 years (optional, configurable)
// eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

module.exports = mongoose.model('Event', eventSchema);
