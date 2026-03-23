const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const Event = require('../models/Event');

// POST /events - Track a single event
router.post('/events', auth, async (req, res) => {
  try {
    const { contactId, type, name, properties, source, sessionId, deviceInfo, revenue, campaignId } = req.body;

    if (!contactId || !type || !name) {
      return res.status(400).json({ success: false, message: 'contactId, type, and name are required' });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const event = new Event({
      contact: contactId,
      type,
      name,
      properties,
      source: source || 'api',
      sessionId,
      deviceInfo,
      revenue,
      campaign: campaignId,
      timestamp: new Date()
    });

    await event.save();

    // Update contact engagement
    contact.lastActivity = new Date();
    contact.totalInteractions = (contact.totalInteractions || 0) + 1;
    contact.engagementScore = Math.min(100, (contact.engagementScore || 0) + 1);
    await contact.save();

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to track event', error: error.message });
  }
});

// POST /events/batch - Batch track events
router.post('/events/batch', auth, async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: 'events array is required and must not be empty' });
    }

    if (events.length > 1000) {
      return res.status(400).json({ success: false, message: 'Maximum 1000 events per batch' });
    }

    const results = { created: 0, errors: [] };
    const contactUpdates = {};

    for (let i = 0; i < events.length; i++) {
      try {
        const { contactId, type, name, properties, source, sessionId, deviceInfo, revenue, campaignId } = events[i];

        if (!contactId || !type || !name) {
          results.errors.push({ index: i, message: 'contactId, type, and name are required' });
          continue;
        }

        const event = new Event({
          contact: contactId,
          type,
          name,
          properties,
          source: source || 'api',
          sessionId,
          deviceInfo,
          revenue,
          campaign: campaignId,
          timestamp: events[i].timestamp || new Date()
        });

        await event.save();
        results.created++;

        // Track contacts that need engagement updates
        if (!contactUpdates[contactId]) {
          contactUpdates[contactId] = 0;
        }
        contactUpdates[contactId]++;
      } catch (err) {
        results.errors.push({ index: i, message: err.message });
      }
    }

    // Bulk update contact engagement
    const contactUpdatePromises = Object.entries(contactUpdates).map(([contactId, eventCount]) =>
      Contact.findByIdAndUpdate(contactId, {
        $set: { lastActivity: new Date() },
        $inc: { totalInteractions: eventCount, engagementScore: Math.min(eventCount, 10) }
      })
    );
    await Promise.all(contactUpdatePromises);

    res.status(201).json({
      success: true,
      data: results,
      message: `Batch complete: ${results.created} events created, ${results.errors.length} errors`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Batch event tracking failed', error: error.message });
  }
});

// GET /profiles/:id - Unified profile
router.get('/profiles/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('company', 'name')
      .lean();

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Aggregate event data for the profile
    const [eventSummary, recentEvents, firstEvent, channelActivity] = await Promise.all([
      Event.aggregate([
        { $match: { contact: contact._id } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            lastOccurrence: { $max: '$timestamp' },
            totalRevenue: { $sum: { $ifNull: ['$revenue', 0] } }
          }
        }
      ]),
      Event.find({ contact: contact._id })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
      Event.findOne({ contact: contact._id })
        .sort({ timestamp: 1 })
        .select('timestamp')
        .lean(),
      Event.aggregate([
        { $match: { contact: contact._id } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ])
    ]);

    const totalRevenue = eventSummary.reduce((sum, e) => sum + (e.totalRevenue || 0), 0);
    const totalEvents = eventSummary.reduce((sum, e) => sum + e.count, 0);

    res.json({
      success: true,
      data: {
        profile: contact,
        engagement: {
          totalEvents,
          eventBreakdown: eventSummary.reduce((acc, e) => {
            acc[e._id] = { count: e.count, lastOccurrence: e.lastOccurrence };
            return acc;
          }, {}),
          channelActivity: channelActivity.reduce((acc, c) => {
            acc[c._id || 'unknown'] = c.count;
            return acc;
          }, {}),
          firstSeen: firstEvent?.timestamp || contact.createdAt,
          lastSeen: contact.lastActivity || contact.updatedAt,
          lifetimeValue: totalRevenue
        },
        identities: contact.identities || [],
        recentEvents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unified profile', error: error.message });
  }
});

// POST /identify - Identify or merge profiles
router.post('/identify', auth, async (req, res) => {
  try {
    const { contactId, identities, mergeWith } = req.body;

    if (!contactId) {
      return res.status(400).json({ success: false, message: 'contactId is required' });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Add new identities
    if (identities && Array.isArray(identities)) {
      for (const identity of identities) {
        if (identity.type && identity.value) {
          const exists = contact.identities.some(
            i => i.type === identity.type && i.value === identity.value
          );
          if (!exists) {
            contact.identities.push(identity);
          }
        }
      }
    }

    // Merge with another contact
    if (mergeWith) {
      const mergeContact = await Contact.findById(mergeWith);
      if (!mergeContact) {
        return res.status(404).json({ success: false, message: 'Merge target contact not found' });
      }

      // Merge identities
      for (const identity of mergeContact.identities || []) {
        const exists = contact.identities.some(
          i => i.type === identity.type && i.value === identity.value
        );
        if (!exists) {
          contact.identities.push(identity);
        }
      }

      // Merge tags
      for (const tag of mergeContact.tags || []) {
        if (!contact.tags.includes(tag)) {
          contact.tags.push(tag);
        }
      }

      // Keep higher scores
      contact.aiScore = Math.max(contact.aiScore || 0, mergeContact.aiScore || 0);
      contact.engagementScore = Math.max(contact.engagementScore || 0, mergeContact.engagementScore || 0);
      contact.totalInteractions = (contact.totalInteractions || 0) + (mergeContact.totalInteractions || 0);

      // Fill in empty fields from merge contact
      if (!contact.phone && mergeContact.phone) contact.phone = mergeContact.phone;
      if (!contact.company && mergeContact.company) contact.company = mergeContact.company;
      if (!contact.title && mergeContact.title) contact.title = mergeContact.title;

      // Reassign events from the merged contact
      await Event.updateMany(
        { contact: mergeWith },
        { $set: { contact: contactId } }
      );

      // Delete the merged contact
      await Contact.findByIdAndDelete(mergeWith);
    }

    if (!contact.unifiedProfileId) {
      contact.unifiedProfileId = `UP_${contact._id}`;
    }

    await contact.save();

    res.json({
      success: true,
      data: contact,
      message: mergeWith ? 'Profiles merged successfully' : 'Identity added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to identify/merge profile', error: error.message });
  }
});

// GET /events/stream - Recent events stream
router.get('/events/stream', auth, async (req, res) => {
  try {
    const { limit = 50, type, source, since } = req.query;
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));

    const filter = {};
    if (type) filter.type = type;
    if (source) filter.source = source;
    if (since) filter.timestamp = { $gte: new Date(since) };

    const events = await Event.find(filter)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .populate('contact', 'firstName lastName email')
      .populate('campaign', 'name type')
      .lean();

    res.json({
      success: true,
      data: events,
      meta: {
        count: events.length,
        latestTimestamp: events[0]?.timestamp || null,
        oldestTimestamp: events[events.length - 1]?.timestamp || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch event stream', error: error.message });
  }
});

// GET /profiles/:id/journey - Customer journey map
router.get('/profiles/:id/journey', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).lean();
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const events = await Event.find({ contact: req.params.id })
      .sort({ timestamp: 1 })
      .populate('campaign', 'name type')
      .lean();

    // Group events into journey stages
    const stageMap = {
      'page_view': 'awareness',
      'signup': 'awareness',
      'form_submit': 'consideration',
      'email_open': 'consideration',
      'email_click': 'consideration',
      'product_view': 'consideration',
      'add_to_cart': 'decision',
      'checkout': 'purchase',
      'purchase': 'purchase',
      'support_ticket': 'retention',
      'campaign_interaction': 'consideration',
      'login': 'retention',
      'custom': 'other'
    };

    const journeyStages = {};
    const touchpoints = [];

    for (const event of events) {
      const stage = stageMap[event.type] || 'other';

      if (!journeyStages[stage]) {
        journeyStages[stage] = { events: 0, firstTouch: event.timestamp, lastTouch: event.timestamp };
      }
      journeyStages[stage].events++;
      journeyStages[stage].lastTouch = event.timestamp;

      touchpoints.push({
        timestamp: event.timestamp,
        type: event.type,
        name: event.name,
        stage,
        source: event.source,
        campaign: event.campaign ? { id: event.campaign._id, name: event.campaign.name } : null,
        revenue: event.revenue || 0,
        properties: event.properties
      });
    }

    const totalDuration = events.length >= 2
      ? new Date(events[events.length - 1].timestamp) - new Date(events[0].timestamp)
      : 0;

    res.json({
      success: true,
      data: {
        contactId: contact._id,
        contactName: `${contact.firstName} ${contact.lastName}`,
        currentLifecycle: contact.lifecycle,
        currentStatus: contact.status,
        journeyStages,
        touchpoints,
        summary: {
          totalTouchpoints: touchpoints.length,
          totalDurationMs: totalDuration,
          totalDurationDays: Math.ceil(totalDuration / 86400000),
          totalRevenue: touchpoints.reduce((sum, t) => sum + t.revenue, 0),
          stagesReached: Object.keys(journeyStages)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer journey', error: error.message });
  }
});

module.exports = router;
