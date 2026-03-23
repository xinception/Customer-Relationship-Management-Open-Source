const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');
const Event = require('../models/Event');
const Segment = require('../models/Segment');

// POST /score - Score contacts using AI-like heuristics
router.post('/score', auth, async (req, res) => {
  try {
    const { contactIds, scoreAll = false } = req.body;

    let contacts;
    if (scoreAll) {
      contacts = await Contact.find().lean();
    } else if (contactIds && Array.isArray(contactIds)) {
      contacts = await Contact.find({ _id: { $in: contactIds } }).lean();
    } else {
      return res.status(400).json({ success: false, message: 'Provide contactIds array or set scoreAll to true' });
    }

    const results = [];

    for (const contact of contacts) {
      const events = await Event.find({ contact: contact._id }).lean();

      let score = 0;

      // Recency: active in last 7 days
      if (contact.lastActivity && (Date.now() - new Date(contact.lastActivity).getTime()) < 7 * 86400000) {
        score += 20;
      } else if (contact.lastActivity && (Date.now() - new Date(contact.lastActivity).getTime()) < 30 * 86400000) {
        score += 10;
      }

      // Frequency
      score += Math.min(25, events.length * 2);

      // Revenue signals
      const hasRevenue = events.some(e => e.revenue && e.revenue > 0);
      if (hasRevenue) score += 15;

      // Lifecycle advancement
      const lifecycleScores = { subscriber: 5, lead: 10, mql: 20, sql: 30, opportunity: 40, customer: 50, evangelist: 50 };
      score += lifecycleScores[contact.lifecycle] || 0;

      // Engagement
      if (contact.engagementScore > 60) score += 10;

      // Clamp to 0-100
      score = Math.min(100, Math.max(0, score));

      await Contact.findByIdAndUpdate(contact._id, { $set: { aiScore: score } });

      results.push({ contactId: contact._id, previousScore: contact.aiScore, newScore: score });
    }

    res.json({
      success: true,
      data: {
        scored: results.length,
        results
      },
      message: `${results.length} contacts scored`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to score contacts', error: error.message });
  }
});

// POST /predict-churn - Predict churn risk
router.post('/predict-churn', auth, async (req, res) => {
  try {
    const { contactIds, predictAll = false, threshold = 50 } = req.body;

    let contacts;
    if (predictAll) {
      contacts = await Contact.find({ status: { $in: ['customer', 'prospect'] } }).lean();
    } else if (contactIds && Array.isArray(contactIds)) {
      contacts = await Contact.find({ _id: { $in: contactIds } }).lean();
    } else {
      return res.status(400).json({ success: false, message: 'Provide contactIds array or set predictAll to true' });
    }

    const results = [];

    for (const contact of contacts) {
      let churnRisk = 0;

      // Inactivity
      const daysSinceActivity = contact.lastActivity
        ? Math.floor((Date.now() - new Date(contact.lastActivity).getTime()) / 86400000)
        : 90;

      if (daysSinceActivity > 60) churnRisk += 35;
      else if (daysSinceActivity > 30) churnRisk += 20;
      else if (daysSinceActivity > 14) churnRisk += 10;

      // Low engagement
      if ((contact.engagementScore || 0) < 20) churnRisk += 25;
      else if ((contact.engagementScore || 0) < 40) churnRisk += 10;

      // Negative sentiment
      if (contact.sentimentScore !== undefined && contact.sentimentScore !== null) {
        if (contact.sentimentScore < -0.3) churnRisk += 20;
        else if (contact.sentimentScore < 0) churnRisk += 10;
      }

      // Declining interactions
      const recentEvents = await Event.countDocuments({
        contact: contact._id,
        timestamp: { $gte: new Date(Date.now() - 30 * 86400000) }
      });
      const olderEvents = await Event.countDocuments({
        contact: contact._id,
        timestamp: {
          $gte: new Date(Date.now() - 60 * 86400000),
          $lt: new Date(Date.now() - 30 * 86400000)
        }
      });

      if (olderEvents > 0 && recentEvents < olderEvents * 0.5) {
        churnRisk += 15;
      }

      // Unsubscribed
      if (contact.unsubscribed) churnRisk += 10;

      churnRisk = Math.min(100, Math.max(0, churnRisk));

      await Contact.findByIdAndUpdate(contact._id, { $set: { churnRisk } });

      results.push({
        contactId: contact._id,
        name: `${contact.firstName} ${contact.lastName}`,
        churnRisk,
        riskLevel: churnRisk >= 70 ? 'high' : churnRisk >= 40 ? 'medium' : 'low',
        factors: {
          daysSinceActivity,
          engagementScore: contact.engagementScore || 0,
          recentEventCount: recentEvents,
          sentimentScore: contact.sentimentScore
        }
      });
    }

    const atRisk = results.filter(r => r.churnRisk >= threshold);

    res.json({
      success: true,
      data: {
        analyzed: results.length,
        atRisk: atRisk.length,
        threshold,
        results: results.sort((a, b) => b.churnRisk - a.churnRisk)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to predict churn', error: error.message });
  }
});

// POST /recommend - Get recommendations for contacts
router.post('/recommend', auth, async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ success: false, message: 'contactId is required' });
    }

    const contact = await Contact.findById(contactId).lean();
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const events = await Event.find({ contact: contactId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const recommendations = [];

    // Channel recommendation
    const channelCounts = {};
    for (const event of events) {
      const ch = event.source || 'unknown';
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    }
    const preferredChannel = Object.entries(channelCounts)
      .sort((a, b) => b[1] - a[1])[0];
    if (preferredChannel) {
      recommendations.push({
        type: 'channel',
        title: 'Preferred Channel',
        description: `Contact is most active on ${preferredChannel[0]}. Use this channel for outreach.`,
        confidence: 0.8
      });
    }

    // Lifecycle recommendation
    const lifecycleOrder = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];
    const currentIdx = lifecycleOrder.indexOf(contact.lifecycle);
    if (currentIdx >= 0 && currentIdx < lifecycleOrder.length - 1 && contact.aiScore > 60) {
      recommendations.push({
        type: 'lifecycle',
        title: 'Ready for Advancement',
        description: `Contact scores ${contact.aiScore}/100. Consider advancing from ${contact.lifecycle} to ${lifecycleOrder[currentIdx + 1]}.`,
        confidence: 0.7
      });
    }

    // Re-engagement recommendation
    const daysSinceActivity = contact.lastActivity
      ? Math.floor((Date.now() - new Date(contact.lastActivity).getTime()) / 86400000)
      : null;
    if (daysSinceActivity && daysSinceActivity > 14) {
      recommendations.push({
        type: 'engagement',
        title: 'Re-engagement Needed',
        description: `No activity in ${daysSinceActivity} days. Send a personalized re-engagement campaign.`,
        confidence: 0.85
      });
    }

    // Upsell recommendation
    const purchaseEvents = events.filter(e => e.type === 'purchase');
    if (purchaseEvents.length > 0) {
      const totalSpent = purchaseEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
      recommendations.push({
        type: 'upsell',
        title: 'Upsell Opportunity',
        description: `Contact has ${purchaseEvents.length} purchases totaling $${totalSpent.toFixed(2)}. Consider upsell or cross-sell.`,
        confidence: 0.65
      });
    }

    // Content recommendation
    const productViews = events.filter(e => e.type === 'product_view');
    if (productViews.length > 2) {
      recommendations.push({
        type: 'content',
        title: 'Product Interest Detected',
        description: `Contact has viewed ${productViews.length} products recently. Send targeted product recommendations.`,
        confidence: 0.75
      });
    }

    // Update next best action
    if (recommendations.length > 0) {
      const topRec = recommendations.sort((a, b) => b.confidence - a.confidence)[0];
      await Contact.findByIdAndUpdate(contactId, { $set: { nextBestAction: topRec.description } });
    }

    res.json({
      success: true,
      data: {
        contactId,
        recommendations: recommendations.sort((a, b) => b.confidence - a.confidence)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate recommendations', error: error.message });
  }
});

// POST /segment-suggest - Auto-segment suggestions
router.post('/segment-suggest', auth, async (req, res) => {
  try {
    const { maxSuggestions = 5 } = req.body;

    const [
      totalContacts,
      highValueCustomers,
      atRiskCount,
      newLeadsCount,
      inactiveCount,
      highEngagementCount,
      sourceCounts
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'customer', aiScore: { $gte: 80 } }),
      Contact.countDocuments({ churnRisk: { $gte: 60 } }),
      Contact.countDocuments({
        status: 'lead',
        createdAt: { $gte: new Date(Date.now() - 7 * 86400000) }
      }),
      Contact.countDocuments({
        lastActivity: { $lt: new Date(Date.now() - 30 * 86400000) }
      }),
      Contact.countDocuments({ engagementScore: { $gte: 70 } }),
      Contact.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);

    const suggestions = [];

    if (highValueCustomers > 0) {
      suggestions.push({
        name: 'High-Value Customers',
        description: `${highValueCustomers} customers with AI score >= 80`,
        type: 'dynamic',
        rules: {
          operator: 'AND',
          conditions: [
            { field: 'status', operator: 'equals', value: 'customer' },
            { field: 'aiScore', operator: 'gte', value: 80 }
          ]
        },
        estimatedSize: highValueCustomers,
        priority: 'high'
      });
    }

    if (atRiskCount > 0) {
      suggestions.push({
        name: 'Churn Risk Segment',
        description: `${atRiskCount} contacts with high churn risk`,
        type: 'dynamic',
        rules: {
          operator: 'AND',
          conditions: [{ field: 'churnRisk', operator: 'gte', value: 60 }]
        },
        estimatedSize: atRiskCount,
        priority: 'high'
      });
    }

    if (newLeadsCount > 0) {
      suggestions.push({
        name: 'New Leads This Week',
        description: `${newLeadsCount} new leads in the last 7 days`,
        type: 'dynamic',
        rules: {
          operator: 'AND',
          conditions: [
            { field: 'status', operator: 'equals', value: 'lead' },
            { field: 'createdAt', operator: 'gte', value: new Date(Date.now() - 7 * 86400000).toISOString() }
          ]
        },
        estimatedSize: newLeadsCount,
        priority: 'medium'
      });
    }

    if (inactiveCount > 0) {
      suggestions.push({
        name: 'Inactive Contacts',
        description: `${inactiveCount} contacts with no activity in 30+ days`,
        type: 'dynamic',
        rules: {
          operator: 'AND',
          conditions: [
            { field: 'lastActivity', operator: 'lt', value: new Date(Date.now() - 30 * 86400000).toISOString() }
          ]
        },
        estimatedSize: inactiveCount,
        priority: 'medium'
      });
    }

    if (highEngagementCount > 0) {
      suggestions.push({
        name: 'Highly Engaged',
        description: `${highEngagementCount} contacts with engagement score >= 70`,
        type: 'dynamic',
        rules: {
          operator: 'AND',
          conditions: [{ field: 'engagementScore', operator: 'gte', value: 70 }]
        },
        estimatedSize: highEngagementCount,
        priority: 'medium'
      });
    }

    // Top source segment
    if (sourceCounts.length > 0) {
      const topSource = sourceCounts[0];
      suggestions.push({
        name: `${topSource._id.charAt(0).toUpperCase() + topSource._id.slice(1)} Source Contacts`,
        description: `${topSource.count} contacts from the top acquisition source: ${topSource._id}`,
        type: 'dynamic',
        rules: {
          operator: 'AND',
          conditions: [{ field: 'source', operator: 'equals', value: topSource._id }]
        },
        estimatedSize: topSource.count,
        priority: 'low'
      });
    }

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, maxSuggestions),
        context: { totalContacts }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate segment suggestions', error: error.message });
  }
});

// POST /content-generate - Generate email content
router.post('/content-generate', auth, async (req, res) => {
  try {
    const { type = 'email', purpose, tone = 'professional', targetAudience, productName, keyPoints } = req.body;

    if (!purpose) {
      return res.status(400).json({ success: false, message: 'purpose is required (e.g., welcome, promotion, re-engagement, newsletter)' });
    }

    // Template-based content generation
    const templates = {
      welcome: {
        subject: `Welcome to ${productName || 'our platform'}! Let's get started`,
        body: `Hi {{firstName}},\n\nWelcome aboard! We're thrilled to have you join us.\n\n${keyPoints ? keyPoints.map(p => `- ${p}`).join('\n') : 'Here are a few things to get you started:\n- Explore your dashboard\n- Set up your profile\n- Connect with your team'}\n\nIf you need any help, we're just a click away.\n\nBest regards,\nThe Team`
      },
      promotion: {
        subject: `Special offer just for you, {{firstName}}!`,
        body: `Hi {{firstName}},\n\nWe've got something special for you.\n\n${keyPoints ? keyPoints.map(p => `- ${p}`).join('\n') : '- Exclusive discount\n- Limited time offer\n- Free shipping'}\n\nDon't miss out — this offer expires soon.\n\nCheers,\nThe Team`
      },
      re_engagement: {
        subject: `We miss you, {{firstName}}!`,
        body: `Hi {{firstName}},\n\nIt's been a while since we last saw you, and we wanted to check in.\n\n${keyPoints ? keyPoints.map(p => `- ${p}`).join('\n') : 'Here\'s what you\'ve been missing:\n- New features and improvements\n- Exclusive content\n- Community updates'}\n\nWe'd love to have you back.\n\nBest,\nThe Team`
      },
      newsletter: {
        subject: `Your ${productName || 'monthly'} update is here`,
        body: `Hi {{firstName}},\n\nHere's your latest update:\n\n${keyPoints ? keyPoints.map(p => `- ${p}`).join('\n') : '- Industry insights\n- Product updates\n- Tips and best practices'}\n\nStay tuned for more.\n\nBest,\nThe Team`
      }
    };

    const template = templates[purpose] || templates.newsletter;

    // Apply tone adjustments
    let content = { ...template };
    if (tone === 'casual') {
      content.subject = content.subject.replace('Best regards', 'Cheers');
      content.body = content.body.replace('Best regards,', 'Cheers,').replace('Hi {{firstName}},', 'Hey {{firstName}}!');
    } else if (tone === 'formal') {
      content.body = content.body.replace('Hi {{firstName}},', 'Dear {{firstName}},').replace('Cheers,', 'Kind regards,');
    }

    const variations = [
      { label: 'Version A', subject: content.subject, body: content.body },
      { label: 'Version B', subject: content.subject.replace('!', '').replace('?', ''), body: content.body }
    ];

    res.json({
      success: true,
      data: {
        purpose,
        tone,
        type,
        content,
        variations,
        tips: [
          'Personalize the subject line with the recipient\'s name for higher open rates.',
          'Keep the email body concise and focused on a single call to action.',
          'Test different send times to optimize engagement.'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate content', error: error.message });
  }
});

// POST /send-time-optimize - Optimal send time
router.post('/send-time-optimize', auth, async (req, res) => {
  try {
    const { contactIds, campaignType = 'email' } = req.body;

    let filter = {};
    if (contactIds && Array.isArray(contactIds) && contactIds.length > 0) {
      filter.contact = { $in: contactIds };
    }

    // Analyze event timing patterns
    const hourlyActivity = await Event.aggregate([
      { $match: { ...filter, type: { $in: ['email_open', 'email_click', 'page_view', 'login'] } } },
      {
        $group: {
          _id: { hour: { $hour: '$timestamp' }, dayOfWeek: { $dayOfWeek: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Find best hours and days
    const hourCounts = {};
    const dayCounts = {};
    for (const entry of hourlyActivity) {
      const hour = entry._id.hour;
      const day = entry._id.dayOfWeek;
      hourCounts[hour] = (hourCounts[hour] || 0) + entry.count;
      dayCounts[day] = (dayCounts[day] || 0) + entry.count;
    }

    const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);

    const bestHour = sortedHours[0] ? parseInt(sortedHours[0][0]) : 10;
    const bestDay = sortedDays[0] ? parseInt(sortedDays[0][0]) : 3; // default Tuesday

    res.json({
      success: true,
      data: {
        campaignType,
        optimal: {
          day: dayNames[bestDay] || 'Tuesday',
          hour: bestHour,
          timeFormatted: `${String(bestHour).padStart(2, '0')}:00`,
          timezone: 'UTC'
        },
        hourlyDistribution: Object.entries(hourCounts)
          .map(([hour, count]) => ({ hour: parseInt(hour), activity: count }))
          .sort((a, b) => a.hour - b.hour),
        dailyDistribution: Object.entries(dayCounts)
          .map(([day, count]) => ({ day: dayNames[parseInt(day)] || 'Unknown', activity: count }))
          .sort((a, b) => b.activity - a.activity),
        recommendations: [
          `Best time: ${dayNames[bestDay] || 'Tuesday'} at ${String(bestHour).padStart(2, '0')}:00 UTC`,
          'Consider time zone differences for global audiences.',
          'A/B test different send times over multiple campaigns for best results.'
        ],
        sampleSize: hourlyActivity.reduce((sum, e) => sum + e.count, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to optimize send time', error: error.message });
  }
});

// GET /insights - AI-generated business insights
router.get('/insights', auth, async (req, res) => {
  try {
    const [
      totalContacts,
      contactsByStatus,
      avgScores,
      highChurnCount,
      recentGrowth,
      campaignPerformance,
      topSources,
      recentEventCount
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Contact.aggregate([{
        $group: {
          _id: null,
          avgAiScore: { $avg: '$aiScore' },
          avgEngagement: { $avg: '$engagementScore' },
          avgChurnRisk: { $avg: '$churnRisk' }
        }
      }]),
      Contact.countDocuments({ churnRisk: { $gte: 70 } }),
      Contact.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 86400000) }
      }),
      Campaign.aggregate([
        { $match: { status: { $in: ['completed', 'active'] } } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: '$metrics.sent' },
            totalOpened: { $sum: '$metrics.opened' },
            totalClicked: { $sum: '$metrics.clicked' },
            totalConverted: { $sum: '$metrics.converted' },
            totalRevenue: { $sum: '$metrics.revenue' }
          }
        }
      ]),
      Contact.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Event.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 7 * 86400000) }
      })
    ]);

    const scores = avgScores[0] || { avgAiScore: 0, avgEngagement: 0, avgChurnRisk: 0 };
    const campPerf = campaignPerformance[0] || {};

    const insights = [];

    // Growth insight
    const growthRate = totalContacts > 0 ? ((recentGrowth / totalContacts) * 100).toFixed(1) : 0;
    insights.push({
      category: 'growth',
      title: 'Contact Growth',
      description: `${recentGrowth} new contacts in the last 30 days (${growthRate}% growth rate).`,
      metric: growthRate,
      trend: parseFloat(growthRate) > 5 ? 'positive' : parseFloat(growthRate) > 0 ? 'neutral' : 'negative'
    });

    // Churn insight
    if (highChurnCount > 0) {
      const churnPercent = ((highChurnCount / totalContacts) * 100).toFixed(1);
      insights.push({
        category: 'risk',
        title: 'Churn Alert',
        description: `${highChurnCount} contacts (${churnPercent}%) have high churn risk. Immediate re-engagement recommended.`,
        metric: churnPercent,
        trend: 'negative',
        action: 'Create a re-engagement campaign targeting high-churn contacts.'
      });
    }

    // Engagement insight
    insights.push({
      category: 'engagement',
      title: 'Engagement Health',
      description: `Average engagement score: ${scores.avgEngagement?.toFixed(1) || 0}/100. ${recentEventCount} events tracked this week.`,
      metric: scores.avgEngagement?.toFixed(1) || 0,
      trend: (scores.avgEngagement || 0) > 50 ? 'positive' : 'neutral'
    });

    // Campaign insight
    if (campPerf.totalSent > 0) {
      const overallOpenRate = ((campPerf.totalOpened || 0) / campPerf.totalSent * 100).toFixed(1);
      const overallConvRate = ((campPerf.totalConverted || 0) / campPerf.totalSent * 100).toFixed(1);
      insights.push({
        category: 'campaigns',
        title: 'Campaign Performance',
        description: `Overall open rate: ${overallOpenRate}%, conversion rate: ${overallConvRate}%. Total campaign revenue: $${(campPerf.totalRevenue || 0).toFixed(2)}.`,
        metric: overallOpenRate,
        trend: parseFloat(overallOpenRate) > 20 ? 'positive' : 'neutral'
      });
    }

    // Source insight
    if (topSources.length > 0) {
      const topSource = topSources[0];
      insights.push({
        category: 'acquisition',
        title: 'Top Acquisition Channel',
        description: `"${topSource._id}" is the top source with ${topSource.count} contacts (${((topSource.count / totalContacts) * 100).toFixed(1)}% of total).`,
        metric: topSource.count,
        trend: 'positive'
      });
    }

    // AI scoring insight
    insights.push({
      category: 'scoring',
      title: 'Lead Quality',
      description: `Average AI lead score: ${scores.avgAiScore?.toFixed(1) || 0}/100. Average churn risk: ${scores.avgChurnRisk?.toFixed(1) || 0}/100.`,
      metric: scores.avgAiScore?.toFixed(1) || 0,
      trend: (scores.avgAiScore || 0) > 50 ? 'positive' : 'neutral'
    });

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        insights,
        summary: {
          totalContacts,
          contactsByStatus: contactsByStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
          averageScores: {
            aiScore: scores.avgAiScore?.toFixed(1) || 0,
            engagement: scores.avgEngagement?.toFixed(1) || 0,
            churnRisk: scores.avgChurnRisk?.toFixed(1) || 0
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate insights', error: error.message });
  }
});

module.exports = router;
