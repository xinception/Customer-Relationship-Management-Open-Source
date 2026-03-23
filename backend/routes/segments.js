const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Segment = require('../models/Segment');
const Contact = require('../models/Contact');

// Helper: build Mongoose query from segment rules
function buildSegmentQuery(rules) {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return {};
  }

  const conditions = rules.conditions.map(cond => {
    const { field, operator, value } = cond;
    switch (operator) {
      case 'equals': return { [field]: value };
      case 'not_equals': return { [field]: { $ne: value } };
      case 'contains': return { [field]: new RegExp(value, 'i') };
      case 'gt': return { [field]: { $gt: value } };
      case 'lt': return { [field]: { $lt: value } };
      case 'gte': return { [field]: { $gte: value } };
      case 'lte': return { [field]: { $lte: value } };
      case 'in': return { [field]: { $in: Array.isArray(value) ? value : [value] } };
      case 'not_in': return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
      case 'between': return { [field]: { $gte: value[0], $lte: value[1] } };
      case 'exists': return { [field]: { $exists: !!value } };
      default: return {};
    }
  });

  if (rules.operator === 'OR') {
    return { $or: conditions };
  }
  return { $and: conditions };
}

// GET / - List segments with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, sort = '-createdAt' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) filter.name = new RegExp(search, 'i');
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

    const [segments, total] = await Promise.all([
      Segment.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
      Segment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: segments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch segments', error: error.message });
  }
});

// POST / - Create a new segment
router.post('/', auth, async (req, res) => {
  try {
    const segmentData = { ...req.body, createdBy: req.user.id };
    const segment = new Segment(segmentData);

    // For dynamic segments, compute initial member count
    if (segment.type === 'dynamic' && segment.rules && segment.rules.conditions) {
      const query = buildSegmentQuery(segment.rules);
      const count = await Contact.countDocuments(query);
      segment.memberCount = count;
      segment.lastRefreshed = new Date();
    }

    await segment.save();

    const populated = await Segment.findById(segment._id)
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create segment', error: error.message });
  }
});

// GET /:id - Get a single segment
router.get('/:id', auth, async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found' });
    }

    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch segment', error: error.message });
  }
});

// PUT /:id - Update a segment
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Segment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Segment not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update segment', error: error.message });
  }
});

// DELETE /:id - Delete a segment
router.delete('/:id', auth, async (req, res) => {
  try {
    const segment = await Segment.findByIdAndDelete(req.params.id);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found' });
    }

    res.json({ success: true, message: 'Segment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete segment', error: error.message });
  }
});

// POST /:id/refresh - Refresh a dynamic segment
router.post('/:id/refresh', auth, async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found' });
    }

    if (segment.type === 'static') {
      return res.status(400).json({ success: false, message: 'Static segments cannot be refreshed dynamically' });
    }

    const query = buildSegmentQuery(segment.rules);
    const matchingContacts = await Contact.find(query).select('_id').lean();

    segment.members = matchingContacts.map(c => c._id);
    segment.memberCount = matchingContacts.length;
    segment.lastRefreshed = new Date();
    await segment.save();

    res.json({
      success: true,
      data: {
        segmentId: segment._id,
        name: segment.name,
        memberCount: segment.memberCount,
        lastRefreshed: segment.lastRefreshed
      },
      message: 'Segment refreshed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to refresh segment', error: error.message });
  }
});

// GET /:id/contacts - Get contacts in a segment
router.get('/:id/contacts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const segment = await Segment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found' });
    }

    let contacts, total;

    if (segment.type === 'dynamic') {
      const query = buildSegmentQuery(segment.rules);
      [contacts, total] = await Promise.all([
        Contact.find(query)
          .skip(skip)
          .limit(limitNum)
          .populate('owner', 'name email')
          .lean(),
        Contact.countDocuments(query)
      ]);
    } else {
      total = segment.members.length;
      contacts = await Contact.find({ _id: { $in: segment.members } })
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email')
        .lean();
    }

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
    res.status(500).json({ success: false, message: 'Failed to fetch segment contacts', error: error.message });
  }
});

// POST /preview - Preview a segment with rules (count matching contacts)
router.post('/preview', auth, async (req, res) => {
  try {
    const { rules } = req.body;

    if (!rules || !rules.conditions || rules.conditions.length === 0) {
      return res.status(400).json({ success: false, message: 'rules with conditions are required' });
    }

    const query = buildSegmentQuery(rules);
    const [count, sample] = await Promise.all([
      Contact.countDocuments(query),
      Contact.find(query).limit(5).select('firstName lastName email status aiScore').lean()
    ]);

    res.json({
      success: true,
      data: {
        matchingCount: count,
        sampleContacts: sample,
        rules
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to preview segment', error: error.message });
  }
});

// POST /ai-suggest - AI suggest segments
router.post('/ai-suggest', auth, async (req, res) => {
  try {
    // Analyze contact data distribution for intelligent suggestions
    const [
      totalContacts,
      statusDistribution,
      sourceDistribution,
      avgScore,
      highChurnContacts,
      inactiveContacts
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Contact.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Contact.aggregate([{ $group: { _id: null, avg: { $avg: '$aiScore' } } }]),
      Contact.countDocuments({ churnRisk: { $gte: 70 } }),
      Contact.countDocuments({ lastActivity: { $lt: new Date(Date.now() - 30 * 86400000) } })
    ]);

    const suggestions = [];

    // High-value leads
    suggestions.push({
      name: 'High-Value Leads',
      description: 'Leads with high AI scores ready for sales outreach',
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'status', operator: 'equals', value: 'lead' },
          { field: 'aiScore', operator: 'gte', value: 70 }
        ]
      },
      estimatedSize: await Contact.countDocuments({ status: 'lead', aiScore: { $gte: 70 } })
    });

    // Churn risk
    if (highChurnContacts > 0) {
      suggestions.push({
        name: 'High Churn Risk',
        description: 'Customers at risk of churning who need attention',
        rules: {
          operator: 'AND',
          conditions: [
            { field: 'status', operator: 'equals', value: 'customer' },
            { field: 'churnRisk', operator: 'gte', value: 70 }
          ]
        },
        estimatedSize: highChurnContacts
      });
    }

    // Inactive contacts
    if (inactiveContacts > 0) {
      suggestions.push({
        name: 'Inactive Contacts',
        description: 'Contacts with no activity in the last 30 days',
        rules: {
          operator: 'AND',
          conditions: [
            { field: 'lastActivity', operator: 'lt', value: new Date(Date.now() - 30 * 86400000).toISOString() }
          ]
        },
        estimatedSize: inactiveContacts
      });
    }

    // Engaged prospects
    suggestions.push({
      name: 'Engaged Prospects',
      description: 'Prospects with high engagement who may be ready to convert',
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'status', operator: 'equals', value: 'prospect' },
          { field: 'engagementScore', operator: 'gte', value: 60 }
        ]
      },
      estimatedSize: await Contact.countDocuments({ status: 'prospect', engagementScore: { $gte: 60 } })
    });

    // Top customers for referrals
    suggestions.push({
      name: 'Top Customers - Referral Candidates',
      description: 'High-scoring customers who could become evangelists',
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'status', operator: 'equals', value: 'customer' },
          { field: 'aiScore', operator: 'gte', value: 80 },
          { field: 'sentimentScore', operator: 'gte', value: 0.5 }
        ]
      },
      estimatedSize: await Contact.countDocuments({ status: 'customer', aiScore: { $gte: 80 }, sentimentScore: { $gte: 0.5 } })
    });

    res.json({
      success: true,
      data: {
        suggestions,
        analysisContext: {
          totalContacts,
          statusDistribution,
          sourceDistribution,
          averageAiScore: avgScore[0]?.avg || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate segment suggestions', error: error.message });
  }
});

module.exports = router;
