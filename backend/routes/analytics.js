const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');
const Event = require('../models/Event');
const Automation = require('../models/Automation');

// GET /dashboard - Overview stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [
      totalContacts,
      activeContacts,
      newContactsThisMonth,
      activeCampaigns,
      totalCampaigns,
      activeAutomations,
      recentEvents,
      statusDistribution,
      lifecycleDistribution
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: { $in: ['lead', 'prospect', 'customer'] } }),
      Contact.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments(),
      Automation.countDocuments({ status: 'active' }),
      Event.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Contact.aggregate([{ $group: { _id: '$lifecycle', count: { $sum: 1 } } }])
    ]);

    // Campaign conversion rates
    const completedCampaigns = await Campaign.find({ status: 'completed' }).lean();
    let totalSent = 0;
    let totalConverted = 0;
    for (const c of completedCampaigns) {
      totalSent += c.metrics?.sent || 0;
      totalConverted += c.metrics?.converted || 0;
    }
    const overallConversionRate = totalSent > 0 ? (totalConverted / totalSent * 100).toFixed(2) : 0;

    // Average AI score
    const avgScoreResult = await Contact.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$aiScore' }, avgEngagement: { $avg: '$engagementScore' } } }
    ]);

    res.json({
      success: true,
      data: {
        contacts: {
          total: totalContacts,
          active: activeContacts,
          newThisMonth: newContactsThisMonth,
          statusDistribution: statusDistribution.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
          lifecycleDistribution: lifecycleDistribution.reduce((acc, l) => { acc[l._id] = l.count; return acc; }, {})
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          overallConversionRate: parseFloat(overallConversionRate)
        },
        automations: {
          active: activeAutomations
        },
        engagement: {
          eventsLast24h: recentEvents,
          averageAiScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0,
          averageEngagement: avgScoreResult[0]?.avgEngagement?.toFixed(1) || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// GET /contacts/growth - Contact growth over time
router.get('/contacts/growth', auth, async (req, res) => {
  try {
    const { period = '30d', interval = 'day' } = req.query;

    let startDate;
    switch (period) {
      case '7d': startDate = new Date(Date.now() - 7 * 86400000); break;
      case '30d': startDate = new Date(Date.now() - 30 * 86400000); break;
      case '90d': startDate = new Date(Date.now() - 90 * 86400000); break;
      case '1y': startDate = new Date(Date.now() - 365 * 86400000); break;
      default: startDate = new Date(Date.now() - 30 * 86400000);
    }

    let dateFormat;
    switch (interval) {
      case 'day': dateFormat = '%Y-%m-%d'; break;
      case 'week': dateFormat = '%Y-W%V'; break;
      case 'month': dateFormat = '%Y-%m'; break;
      default: dateFormat = '%Y-%m-%d';
    }

    const growth = await Contact.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalBefore = await Contact.countDocuments({ createdAt: { $lt: startDate } });

    // Build cumulative data
    let cumulative = totalBefore;
    const cumulativeGrowth = growth.map(point => {
      cumulative += point.count;
      return {
        date: point._id,
        newContacts: point.count,
        totalContacts: cumulative
      };
    });

    res.json({
      success: true,
      data: {
        period,
        interval,
        startDate,
        dataPoints: cumulativeGrowth,
        summary: {
          totalNewContacts: growth.reduce((sum, g) => sum + g.count, 0),
          currentTotal: cumulative,
          growthRate: totalBefore > 0
            ? (((cumulative - totalBefore) / totalBefore) * 100).toFixed(2)
            : 100
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contact growth', error: error.message });
  }
});

// GET /campaigns/performance - Campaign performance comparison
router.get('/campaigns/performance', auth, async (req, res) => {
  try {
    const { status, type, limit = 10 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('name type status metrics createdAt startDate endDate')
      .lean();

    const performance = campaigns.map(c => {
      const m = c.metrics || {};
      const sent = m.sent || 0;
      return {
        id: c._id,
        name: c.name,
        type: c.type,
        status: c.status,
        sent,
        openRate: sent > 0 ? ((m.opened || 0) / sent * 100).toFixed(2) : 0,
        clickRate: sent > 0 ? ((m.clicked || 0) / sent * 100).toFixed(2) : 0,
        conversionRate: sent > 0 ? ((m.converted || 0) / sent * 100).toFixed(2) : 0,
        bounceRate: sent > 0 ? ((m.bounced || 0) / sent * 100).toFixed(2) : 0,
        revenue: m.revenue || 0,
        roi: sent > 0 && m.revenue ? ((m.revenue / sent) * 100).toFixed(2) : 0,
        startDate: c.startDate,
        endDate: c.endDate
      };
    });

    // Averages
    const avgMetrics = {
      avgOpenRate: 0,
      avgClickRate: 0,
      avgConversionRate: 0,
      totalRevenue: 0
    };

    if (performance.length > 0) {
      avgMetrics.avgOpenRate = (performance.reduce((s, p) => s + parseFloat(p.openRate), 0) / performance.length).toFixed(2);
      avgMetrics.avgClickRate = (performance.reduce((s, p) => s + parseFloat(p.clickRate), 0) / performance.length).toFixed(2);
      avgMetrics.avgConversionRate = (performance.reduce((s, p) => s + parseFloat(p.conversionRate), 0) / performance.length).toFixed(2);
      avgMetrics.totalRevenue = performance.reduce((s, p) => s + p.revenue, 0);
    }

    res.json({
      success: true,
      data: {
        campaigns: performance,
        averages: avgMetrics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campaign performance', error: error.message });
  }
});

// GET /revenue - Revenue analytics
router.get('/revenue', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate;
    switch (period) {
      case '7d': startDate = new Date(Date.now() - 7 * 86400000); break;
      case '30d': startDate = new Date(Date.now() - 30 * 86400000); break;
      case '90d': startDate = new Date(Date.now() - 90 * 86400000); break;
      case '1y': startDate = new Date(Date.now() - 365 * 86400000); break;
      default: startDate = new Date(Date.now() - 30 * 86400000);
    }

    const revenueByDay = await Event.aggregate([
      { $match: { timestamp: { $gte: startDate }, revenue: { $gt: 0 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          revenue: { $sum: '$revenue' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueBySource = await Event.aggregate([
      { $match: { timestamp: { $gte: startDate }, revenue: { $gt: 0 } } },
      {
        $lookup: {
          from: 'contacts',
          localField: 'contact',
          foreignField: '_id',
          as: 'contactData'
        }
      },
      { $unwind: '$contactData' },
      {
        $group: {
          _id: '$contactData.source',
          revenue: { $sum: '$revenue' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const revenueByCampaign = await Event.aggregate([
      { $match: { timestamp: { $gte: startDate }, revenue: { $gt: 0 }, campaign: { $exists: true } } },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaignData'
        }
      },
      { $unwind: '$campaignData' },
      {
        $group: {
          _id: { id: '$campaign', name: '$campaignData.name' },
          revenue: { $sum: '$revenue' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    const totalRevenue = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
    const totalTransactions = revenueByDay.reduce((sum, d) => sum + d.transactions, 0);

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          totalTransactions,
          averageOrderValue: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : 0
        },
        revenueByDay,
        revenueBySource,
        topCampaigns: revenueByCampaign.map(c => ({
          campaignId: c._id.id,
          campaignName: c._id.name,
          revenue: c.revenue,
          transactions: c.transactions
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch revenue analytics', error: error.message });
  }
});

// GET /engagement - Engagement metrics
router.get('/engagement', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate;
    switch (period) {
      case '7d': startDate = new Date(Date.now() - 7 * 86400000); break;
      case '30d': startDate = new Date(Date.now() - 30 * 86400000); break;
      case '90d': startDate = new Date(Date.now() - 90 * 86400000); break;
      case '1y': startDate = new Date(Date.now() - 365 * 86400000); break;
      default: startDate = new Date(Date.now() - 30 * 86400000);
    }

    const [eventsByType, eventsByDay, engagementDistribution, channelBreakdown] = await Promise.all([
      Event.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Event.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
            uniqueContacts: { $addToSet: '$contact' }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 1, count: 1, uniqueContacts: { $size: '$uniqueContacts' } } }
      ]),
      Contact.aggregate([
        {
          $bucket: {
            groupBy: '$engagementScore',
            boundaries: [0, 20, 40, 60, 80, 101],
            default: 'unknown',
            output: { count: { $sum: 1 } }
          }
        }
      ]),
      Event.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const totalEvents = eventsByType.reduce((sum, e) => sum + e.count, 0);

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalEvents,
          eventsByType: eventsByType.reduce((acc, e) => { acc[e._id] = e.count; return acc; }, {}),
          channelBreakdown: channelBreakdown.reduce((acc, c) => { acc[c._id || 'unknown'] = c.count; return acc; }, {})
        },
        dailyEngagement: eventsByDay,
        engagementScoreDistribution: engagementDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch engagement metrics', error: error.message });
  }
});

// GET /funnel - Funnel analysis
router.get('/funnel', auth, async (req, res) => {
  try {
    const { stages } = req.query;

    // Default lifecycle funnel
    const funnelStages = stages
      ? stages.split(',')
      : ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];

    const stageCounts = await Contact.aggregate([
      { $match: { lifecycle: { $in: funnelStages } } },
      { $group: { _id: '$lifecycle', count: { $sum: 1 } } }
    ]);

    const stageMap = {};
    for (const s of stageCounts) {
      stageMap[s._id] = s.count;
    }

    const funnel = funnelStages.map((stage, index) => {
      const count = stageMap[stage] || 0;
      const prevCount = index > 0 ? (stageMap[funnelStages[index - 1]] || 0) : count;
      return {
        stage,
        count,
        conversionRate: prevCount > 0 && index > 0
          ? ((count / prevCount) * 100).toFixed(2)
          : '100.00',
        dropoff: prevCount > 0 && index > 0
          ? (((prevCount - count) / prevCount) * 100).toFixed(2)
          : '0.00'
      };
    });

    const totalStart = funnel[0]?.count || 0;
    const totalEnd = funnel[funnel.length - 1]?.count || 0;

    res.json({
      success: true,
      data: {
        funnel,
        overallConversionRate: totalStart > 0 ? ((totalEnd / totalStart) * 100).toFixed(2) : 0,
        totalContacts: totalStart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch funnel analysis', error: error.message });
  }
});

// GET /cohort - Cohort analysis
router.get('/cohort', auth, async (req, res) => {
  try {
    const { months = 6, metric = 'retention' } = req.query;
    const monthsNum = Math.min(12, Math.max(1, parseInt(months)));

    const cohorts = [];

    for (let i = 0; i < monthsNum; i++) {
      const cohortStart = new Date();
      cohortStart.setMonth(cohortStart.getMonth() - i, 1);
      cohortStart.setHours(0, 0, 0, 0);

      const cohortEnd = new Date(cohortStart);
      cohortEnd.setMonth(cohortEnd.getMonth() + 1);

      const cohortContacts = await Contact.find({
        createdAt: { $gte: cohortStart, $lt: cohortEnd }
      }).select('_id').lean();

      const cohortSize = cohortContacts.length;
      if (cohortSize === 0) {
        cohorts.push({
          cohort: cohortStart.toISOString().slice(0, 7),
          size: 0,
          periods: []
        });
        continue;
      }

      const contactIds = cohortContacts.map(c => c._id);

      // For each subsequent month, check activity
      const periods = [];
      for (let j = 0; j <= i; j++) {
        const periodStart = new Date(cohortStart);
        periodStart.setMonth(periodStart.getMonth() + j);
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const activeInPeriod = await Event.distinct('contact', {
          contact: { $in: contactIds },
          timestamp: { $gte: periodStart, $lt: periodEnd }
        });

        periods.push({
          period: j,
          label: periodStart.toISOString().slice(0, 7),
          activeUsers: activeInPeriod.length,
          retentionRate: ((activeInPeriod.length / cohortSize) * 100).toFixed(2)
        });
      }

      cohorts.push({
        cohort: cohortStart.toISOString().slice(0, 7),
        size: cohortSize,
        periods
      });
    }

    res.json({
      success: true,
      data: {
        metric,
        cohorts: cohorts.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cohort analysis', error: error.message });
  }
});

module.exports = router;
