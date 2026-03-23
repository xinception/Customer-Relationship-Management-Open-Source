const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const Event = require('../models/Event');

// GET / - List contacts with pagination, search, filter, sort
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      lifecycle,
      source,
      tag,
      owner,
      sort = '-createdAt',
      minScore,
      maxScore
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    if (status) filter.status = status;
    if (lifecycle) filter.lifecycle = lifecycle;
    if (source) filter.source = source;
    if (tag) filter.tags = { $in: Array.isArray(tag) ? tag : [tag] };
    if (owner) filter.owner = owner;
    if (minScore || maxScore) {
      filter.aiScore = {};
      if (minScore) filter.aiScore.$gte = parseInt(minScore);
      if (maxScore) filter.aiScore.$lte = parseInt(maxScore);
    }

    // Build sort object
    const sortObj = {};
    const sortFields = sort.split(',');
    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email')
        .populate('company', 'name')
        .lean(),
      Contact.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contacts', error: error.message });
  }
});

// POST / - Create a new contact
router.post('/', auth, async (req, res) => {
  try {
    const contactData = { ...req.body, owner: req.body.owner || req.user.id };

    const existingContact = await Contact.findOne({ email: contactData.email?.toLowerCase() });
    if (existingContact) {
      return res.status(409).json({ success: false, message: 'A contact with this email already exists' });
    }

    const contact = new Contact(contactData);
    await contact.save();

    // Create a system event for contact creation
    await Event.create({
      contact: contact._id,
      type: 'custom',
      name: 'contact_created',
      properties: { createdBy: req.user.id },
      source: 'system'
    });

    const populated = await Contact.findById(contact._id)
      .populate('owner', 'name email')
      .populate('company', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate contact email' });
    }
    res.status(500).json({ success: false, message: 'Failed to create contact', error: error.message });
  }
});

// GET /:id - Get a single contact with events
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('company', 'name');

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const recentEvents = await Event.find({ contact: contact._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: {
        ...contact.toObject(),
        recentEvents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contact', error: error.message });
  }
});

// PUT /:id - Update a contact
router.put('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('company', 'name');

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update contact', error: error.message });
  }
});

// DELETE /:id - Delete a contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Clean up associated events
    await Event.deleteMany({ contact: req.params.id });

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete contact', error: error.message });
  }
});

// POST /import - Bulk import contacts from CSV/JSON
router.post('/import', auth, async (req, res) => {
  try {
    const { contacts, format = 'json', skipDuplicates = true } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ success: false, message: 'contacts array is required and must not be empty' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (let i = 0; i < contacts.length; i++) {
      try {
        const contactData = { ...contacts[i], owner: contacts[i].owner || req.user.id };

        if (skipDuplicates && contactData.email) {
          const existing = await Contact.findOne({ email: contactData.email.toLowerCase() });
          if (existing) {
            results.skipped++;
            continue;
          }
        }

        const contact = new Contact(contactData);
        await contact.save();
        results.created++;
      } catch (err) {
        results.errors.push({ index: i, message: err.message });
      }
    }

    res.status(201).json({
      success: true,
      data: results,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Import failed', error: error.message });
  }
});

// POST /:id/tags - Add tags to a contact
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ success: false, message: 'tags array is required' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add tags', error: error.message });
  }
});

// GET /:id/timeline - Get contact timeline (events)
router.get('/:id/timeline', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const filter = { contact: req.params.id };
    if (type) filter.type = type;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('campaign', 'name type')
        .lean(),
      Event.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timeline', error: error.message });
  }
});

// GET /:id/ai-insights - Get AI-generated insights for a contact
router.get('/:id/ai-insights', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).lean();
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const events = await Event.find({ contact: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    // Compute engagement summary
    const eventTypeCounts = {};
    for (const event of events) {
      eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
    }

    const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
    const daysSinceLastActivity = contact.lastActivity
      ? Math.floor((Date.now() - new Date(contact.lastActivity).getTime()) / 86400000)
      : null;

    const insights = {
      contactId: contact._id,
      aiScore: contact.aiScore,
      churnRisk: contact.churnRisk,
      predictedLTV: contact.predictedLTV,
      sentimentScore: contact.sentimentScore,
      nextBestAction: contact.nextBestAction,
      engagementSummary: {
        totalEvents: events.length,
        eventBreakdown: eventTypeCounts,
        totalRevenue,
        engagementScore: contact.engagementScore,
        daysSinceLastActivity
      },
      recommendations: [],
      segments: contact.aiSegments || []
    };

    // Generate rule-based recommendations
    if (contact.churnRisk > 70) {
      insights.recommendations.push('High churn risk detected. Consider a re-engagement campaign or personal outreach.');
    }
    if (contact.aiScore > 80 && contact.status === 'lead') {
      insights.recommendations.push('High-scoring lead. Prioritize for sales follow-up and upgrade to prospect.');
    }
    if (daysSinceLastActivity && daysSinceLastActivity > 30) {
      insights.recommendations.push(`No activity in ${daysSinceLastActivity} days. Send a win-back campaign.`);
    }
    if (contact.engagementScore < 20) {
      insights.recommendations.push('Low engagement. Try a different communication channel or content type.');
    }
    if (totalRevenue > 1000 && contact.lifecycle !== 'evangelist') {
      insights.recommendations.push('High-value customer. Consider for loyalty program or referral incentives.');
    }

    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate AI insights', error: error.message });
  }
});

module.exports = router;
