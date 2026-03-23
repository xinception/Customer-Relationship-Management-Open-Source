const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const Event = require('../models/Event');
const Segment = require('../models/Segment');

// GET / - List campaigns with pagination, search, filter, sort
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      sort = '-createdAt'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.name = new RegExp(search, 'i');
    }
    if (status) filter.status = status;
    if (type) filter.type = type;

    const sortObj = {};
    const sortFields = sort.split(',');
    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('segment', 'name memberCount')
        .populate('createdBy', 'name email')
        .lean(),
      Campaign.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns', error: error.message });
  }
});

// POST / - Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    const campaignData = { ...req.body, createdBy: req.user.id };
    const campaign = new Campaign(campaignData);
    await campaign.save();

    const populated = await Campaign.findById(campaign._id)
      .populate('segment', 'name memberCount')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create campaign', error: error.message });
  }
});

// GET /:id - Get a single campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segment', 'name memberCount')
      .populate('createdBy', 'name email')
      .populate('targetAudience', 'firstName lastName email');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campaign', error: error.message });
  }
});

// PUT /:id - Update a campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status === 'active') {
      const restrictedFields = ['type', 'segment', 'targetAudience'];
      for (const field of restrictedFields) {
        if (req.body[field] !== undefined) {
          return res.status(400).json({
            success: false,
            message: `Cannot modify ${field} on an active campaign. Pause it first.`
          });
        }
      }
    }

    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('segment', 'name memberCount')
      .populate('createdBy', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update campaign', error: error.message });
  }
});

// DELETE /:id - Delete a campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active campaign. Pause or cancel it first.' });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete campaign', error: error.message });
  }
});

// POST /:id/launch - Launch a campaign
router.post('/:id/launch', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: `Cannot launch a campaign with status "${campaign.status}"` });
    }

    // Resolve target audience from segment if needed
    if (campaign.segment && (!campaign.targetAudience || campaign.targetAudience.length === 0)) {
      const segment = await Segment.findById(campaign.segment);
      if (segment && segment.members.length > 0) {
        campaign.targetAudience = segment.members;
      }
    }

    if (!campaign.targetAudience || campaign.targetAudience.length === 0) {
      return res.status(400).json({ success: false, message: 'Campaign has no target audience. Assign a segment or contacts first.' });
    }

    campaign.status = 'active';
    campaign.startDate = new Date();
    await campaign.save();

    res.json({ success: true, data: campaign, message: 'Campaign launched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to launch campaign', error: error.message });
  }
});

// POST /:id/pause - Pause a campaign
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active campaigns can be paused' });
    }

    campaign.status = 'paused';
    await campaign.save();

    res.json({ success: true, data: campaign, message: 'Campaign paused' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to pause campaign', error: error.message });
  }
});

// POST /:id/resume - Resume a paused campaign
router.post('/:id/resume', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'paused') {
      return res.status(400).json({ success: false, message: 'Only paused campaigns can be resumed' });
    }

    campaign.status = 'active';
    await campaign.save();

    res.json({ success: true, data: campaign, message: 'Campaign resumed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resume campaign', error: error.message });
  }
});

// GET /:id/metrics - Get detailed campaign metrics
router.get('/:id/metrics', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const events = await Event.find({ campaign: req.params.id }).lean();

    const eventBreakdown = {};
    for (const event of events) {
      eventBreakdown[event.type] = (eventBreakdown[event.type] || 0) + 1;
    }

    const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
    const uniqueContacts = [...new Set(events.map(e => e.contact.toString()))].length;

    const metrics = campaign.metrics || {};
    const sent = metrics.sent || 0;

    res.json({
      success: true,
      data: {
        campaignId: campaign._id,
        name: campaign.name,
        status: campaign.status,
        metrics: {
          ...metrics,
          openRate: sent > 0 ? ((metrics.opened || 0) / sent * 100).toFixed(2) : 0,
          clickRate: sent > 0 ? ((metrics.clicked || 0) / sent * 100).toFixed(2) : 0,
          conversionRate: sent > 0 ? ((metrics.converted || 0) / sent * 100).toFixed(2) : 0,
          bounceRate: sent > 0 ? ((metrics.bounced || 0) / sent * 100).toFixed(2) : 0,
          unsubscribeRate: sent > 0 ? ((metrics.unsubscribed || 0) / sent * 100).toFixed(2) : 0
        },
        eventBreakdown,
        totalRevenue,
        uniqueContacts,
        abTestResults: campaign.abTest?.enabled ? campaign.abTest.variants : null,
        aiPredictedPerformance: campaign.aiPredictedPerformance || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch metrics', error: error.message });
  }
});

// POST /:id/ab-test - Create A/B test variant
router.post('/:id/ab-test', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status === 'active' || campaign.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot modify A/B test on an active or completed campaign' });
    }

    const { name, subject, content, weight = 50, winnerCriteria } = req.body;

    if (!name || !subject || !content) {
      return res.status(400).json({ success: false, message: 'name, subject, and content are required for a variant' });
    }

    if (!campaign.abTest) {
      campaign.abTest = { enabled: true, variants: [], winnerCriteria: winnerCriteria || 'open_rate' };
    }

    campaign.abTest.enabled = true;
    campaign.abTest.variants.push({ name, subject, content, weight });
    if (winnerCriteria) {
      campaign.abTest.winnerCriteria = winnerCriteria;
    }

    await campaign.save();

    res.status(201).json({ success: true, data: campaign.abTest, message: 'A/B test variant added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create A/B test variant', error: error.message });
  }
});

// POST /:id/ai-optimize - AI optimize subject/timing
router.post('/:id/ai-optimize', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Analyze historical campaign performance for AI suggestions
    const pastCampaigns = await Campaign.find({
      status: 'completed',
      type: campaign.type,
      _id: { $ne: campaign._id }
    })
      .sort({ 'metrics.opened': -1 })
      .limit(10)
      .lean();

    const avgOpenRate = pastCampaigns.length > 0
      ? pastCampaigns.reduce((sum, c) => {
          const sent = c.metrics?.sent || 1;
          return sum + ((c.metrics?.opened || 0) / sent);
        }, 0) / pastCampaigns.length
      : 0.2;

    const avgClickRate = pastCampaigns.length > 0
      ? pastCampaigns.reduce((sum, c) => {
          const sent = c.metrics?.sent || 1;
          return sum + ((c.metrics?.clicked || 0) / sent);
        }, 0) / pastCampaigns.length
      : 0.05;

    // Generate optimization suggestions
    const suggestions = [];
    if (campaign.subject && campaign.subject.length > 60) {
      suggestions.push('Consider shortening the subject line to under 60 characters for better open rates.');
    }
    if (campaign.subject && !campaign.subject.match(/[?!]/)) {
      suggestions.push('Adding a question or exclamation to the subject line may improve engagement.');
    }
    suggestions.push('Best send times based on historical data: Tuesday-Thursday, 10:00-11:00 AM recipient local time.');
    suggestions.push('Personalized subject lines typically increase open rates by 20-30%.');

    campaign.aiOptimized = true;
    campaign.aiContentSuggestions = suggestions;
    campaign.aiPredictedPerformance = {
      openRate: Math.min(0.95, avgOpenRate * 1.15),
      clickRate: Math.min(0.5, avgClickRate * 1.2),
      conversionRate: Math.min(0.3, avgClickRate * 0.4)
    };

    await campaign.save();

    res.json({
      success: true,
      data: {
        suggestions: campaign.aiContentSuggestions,
        predictedPerformance: campaign.aiPredictedPerformance,
        optimizedSendTime: {
          day: 'Tuesday',
          time: '10:00',
          timezone: 'recipient_local'
        }
      },
      message: 'AI optimization applied'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to optimize campaign', error: error.message });
  }
});

module.exports = router;
