const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Basic info
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  avatar: { type: String },

  // Address
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true }
  },

  // Social profiles
  social: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true }
  },

  // CRM fields
  status: {
    type: String,
    enum: ['lead', 'prospect', 'customer', 'churned'],
    default: 'lead',
    index: true
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'email', 'ads', 'organic', 'direct', 'import', 'api', 'other'],
    default: 'other'
  },
  tags: { type: [String], index: true },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },

  // CDP fields
  unifiedProfileId: { type: String, unique: true, sparse: true },
  identities: [{
    type: { type: String, enum: ['email', 'phone', 'device_id', 'cookie', 'social', 'anonymous_id', 'external_id'] },
    value: { type: String },
    _id: false
  }],
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  totalEvents: { type: Number, default: 0, min: 0 },

  // AI-powered fields
  aiScore: { type: Number, default: 0, min: 0, max: 100, index: true },
  aiSegments: [{ type: String }],
  predictedLTV: { type: Number, min: 0 },
  churnRisk: { type: Number, default: 0, min: 0, max: 100 },
  nextBestAction: { type: String },
  sentimentScore: { type: Number, min: -1, max: 1 },

  // Marketing preferences
  subscribed: { type: Boolean, default: true },
  emailOptIn: { type: Boolean, default: false },
  smsOptIn: { type: Boolean, default: false },
  lastEmailOpened: { type: Date },
  lastEmailClicked: { type: Date },
  emailEngagementScore: { type: Number, default: 0, min: 0, max: 100 },

  // Lifecycle and deals
  lifecycleStage: {
    type: String,
    enum: ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'],
    default: 'subscriber',
    index: true
  },
  dealValue: { type: Number, default: 0, min: 0 },
  wonDeals: { type: Number, default: 0, min: 0 },
  lostDeals: { type: Number, default: 0, min: 0 },

  // Owner
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for query performance
contactSchema.index({ email: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ 'address.country': 1, 'address.city': 1 });
contactSchema.index({ status: 1, lifecycleStage: 1 });
contactSchema.index({ aiScore: -1 });
contactSchema.index({ churnRisk: -1 });
contactSchema.index({ lastSeen: -1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ owner: 1, status: 1 });
contactSchema.index({ 'identities.type': 1, 'identities.value': 1 });
contactSchema.index({ tags: 1 });
contactSchema.index({ emailEngagementScore: -1 });

// Virtual: full name
contactSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Contact', contactSchema);
