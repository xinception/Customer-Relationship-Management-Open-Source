const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  stage: { type: String, enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], default: 'prospecting' },
  probability: { type: Number, min: 0, max: 100 },
  expectedCloseDate: Date,
  actualCloseDate: Date,
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiPredictedClose: Number,
  aiRecommendation: String,
  notes: String,
  tags: [String],
  lostReason: String
}, { timestamps: true });

dealSchema.index({ stage: 1 });
dealSchema.index({ owner: 1 });

module.exports = mongoose.model('Deal', dealSchema);
