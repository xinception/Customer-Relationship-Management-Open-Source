const cron = require('node-cron');

// ---------------------------------------------------------------------------
// Helper – wrap a job so it logs start / finish / errors
// ---------------------------------------------------------------------------
const runJob = (name, fn) => async () => {
  const start = Date.now();
  console.log(`[Scheduler] Starting job: ${name} at ${new Date().toISOString()}`);
  try {
    await fn();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`[Scheduler] Completed job: ${name} in ${duration}s`);
  } catch (error) {
    console.error(`[Scheduler] Error in job "${name}":`, error.message);
  }
};

// ---------------------------------------------------------------------------
// Job definitions
// ---------------------------------------------------------------------------

/**
 * Recalculate AI lead scores for all contacts.
 * Runs daily at 02:00 UTC.
 */
const recalculateScores = async () => {
  const Contact = require('../models/Contact');
  const Event = require('../models/Event');

  const contacts = await Contact.find({ status: { $ne: 'churned' } }).select('_id aiScore totalEvents lastSeen emailEngagementScore');

  let updated = 0;
  for (const contact of contacts) {
    const recentEvents = await Event.countDocuments({
      contact: contact._id,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Simple scoring heuristic (a real implementation would use ML)
    let score = 0;
    score += Math.min(recentEvents * 2, 40);                        // activity (max 40)
    score += Math.min((contact.emailEngagementScore || 0) * 0.3, 30); // email engagement (max 30)
    score += contact.totalEvents > 50 ? 15 : contact.totalEvents > 10 ? 10 : 5; // lifetime depth
    score += contact.lastSeen && (Date.now() - new Date(contact.lastSeen).getTime()) < 7 * 86400000 ? 15 : 0; // recency

    score = Math.min(100, Math.max(0, Math.round(score)));

    if (score !== contact.aiScore) {
      await Contact.updateOne({ _id: contact._id }, { $set: { aiScore: score } });
      updated++;
    }
  }
  console.log(`[Scheduler]   → Updated scores for ${updated} / ${contacts.length} contacts`);
};

/**
 * Refresh dynamic segments by re-evaluating their rule sets.
 * Runs every 6 hours.
 */
const refreshSegments = async () => {
  const Segment = require('../models/Segment');
  const Contact = require('../models/Contact');

  const segments = await Segment.find({ type: 'dynamic', autoRefresh: true });

  for (const segment of segments) {
    // Build a basic Mongo filter from segment rules
    const filter = {};
    if (segment.rules && segment.rules.conditions && segment.rules.conditions.length) {
      for (const cond of segment.rules.conditions) {
        switch (cond.operator) {
          case 'equals':     filter[cond.field] = cond.value; break;
          case 'not_equals': filter[cond.field] = { $ne: cond.value }; break;
          case 'gt':         filter[cond.field] = { $gt: cond.value }; break;
          case 'gte':        filter[cond.field] = { $gte: cond.value }; break;
          case 'lt':         filter[cond.field] = { $lt: cond.value }; break;
          case 'lte':        filter[cond.field] = { $lte: cond.value }; break;
          case 'contains':   filter[cond.field] = new RegExp(cond.value, 'i'); break;
          case 'in':         filter[cond.field] = { $in: Array.isArray(cond.value) ? cond.value : [cond.value] }; break;
          case 'exists':     filter[cond.field] = { $exists: true }; break;
          default: break;
        }
      }
    }

    const memberIds = await Contact.find(filter).distinct('_id');
    await Segment.updateOne(
      { _id: segment._id },
      { $set: { members: memberIds, memberCount: memberIds.length, lastRefreshed: new Date() } },
    );
    console.log(`[Scheduler]   → Segment "${segment.name}": ${memberIds.length} members`);
  }
};

/**
 * Check campaigns whose scheduled send time has passed and activate them.
 * Runs every hour.
 */
const checkCampaignStatuses = async () => {
  const Campaign = require('../models/Campaign');

  const now = new Date();

  // Activate scheduled campaigns whose time has arrived
  const activated = await Campaign.updateMany(
    { status: 'scheduled', 'schedule.scheduledAt': { $lte: now } },
    { $set: { status: 'active' } },
  );
  if (activated.modifiedCount) {
    console.log(`[Scheduler]   → Activated ${activated.modifiedCount} scheduled campaign(s)`);
  }

  // Mark active campaigns that have been running for > 30 days as completed
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const completed = await Campaign.updateMany(
    { status: 'active', 'schedule.frequency': 'one-time', 'schedule.scheduledAt': { $lte: thirtyDaysAgo } },
    { $set: { status: 'completed' } },
  );
  if (completed.modifiedCount) {
    console.log(`[Scheduler]   → Completed ${completed.modifiedCount} expired campaign(s)`);
  }
};

/**
 * Aggregate daily event counts per contact and update totalEvents.
 * Runs daily at 03:00 UTC.
 */
const aggregateEvents = async () => {
  const Contact = require('../models/Contact');
  const Event = require('../models/Event');

  const pipeline = [
    { $group: { _id: '$contact', count: { $sum: 1 }, lastTimestamp: { $max: '$timestamp' } } },
  ];

  const results = await Event.aggregate(pipeline);

  let updated = 0;
  for (const r of results) {
    await Contact.updateOne(
      { _id: r._id },
      { $set: { totalEvents: r.count, lastSeen: r.lastTimestamp } },
    );
    updated++;
  }
  console.log(`[Scheduler]   → Aggregated events for ${updated} contacts`);
};

/**
 * Calculate churn risk based on recent activity and engagement.
 * Runs weekly on Sunday at 04:00 UTC.
 */
const calculateChurnRisk = async () => {
  const Contact = require('../models/Contact');

  const contacts = await Contact.find({ status: 'customer' }).select('_id lastSeen emailEngagementScore totalEvents');

  let updated = 0;
  for (const contact of contacts) {
    const daysSinceLastSeen = contact.lastSeen
      ? Math.floor((Date.now() - new Date(contact.lastSeen).getTime()) / 86400000)
      : 90;

    let risk = 0;
    // Inactivity component (max 50)
    if (daysSinceLastSeen > 60) risk += 50;
    else if (daysSinceLastSeen > 30) risk += 35;
    else if (daysSinceLastSeen > 14) risk += 20;
    else if (daysSinceLastSeen > 7) risk += 10;

    // Low engagement component (max 30)
    const engagement = contact.emailEngagementScore || 0;
    if (engagement < 10) risk += 30;
    else if (engagement < 30) risk += 20;
    else if (engagement < 50) risk += 10;

    // Low total events component (max 20)
    if ((contact.totalEvents || 0) < 5) risk += 20;
    else if ((contact.totalEvents || 0) < 20) risk += 10;

    risk = Math.min(100, Math.max(0, risk));

    await Contact.updateOne({ _id: contact._id }, { $set: { churnRisk: risk } });
    updated++;
  }
  console.log(`[Scheduler]   → Calculated churn risk for ${updated} customers`);
};

// ---------------------------------------------------------------------------
// Schedule all jobs
// ---------------------------------------------------------------------------
const initScheduler = () => {
  console.log('[Scheduler] Initializing cron jobs...');

  // Score recalculation – daily at 02:00 UTC
  cron.schedule('0 2 * * *', runJob('Score Recalculation', recalculateScores), {
    scheduled: true,
    timezone: 'UTC',
  });

  // Segment refresh – every 6 hours
  cron.schedule('0 */6 * * *', runJob('Segment Refresh', refreshSegments), {
    scheduled: true,
    timezone: 'UTC',
  });

  // Campaign status check – every hour
  cron.schedule('0 * * * *', runJob('Campaign Status Check', checkCampaignStatuses), {
    scheduled: true,
    timezone: 'UTC',
  });

  // Event aggregation – daily at 03:00 UTC
  cron.schedule('0 3 * * *', runJob('Event Aggregation', aggregateEvents), {
    scheduled: true,
    timezone: 'UTC',
  });

  // Churn risk calculation – weekly on Sunday at 04:00 UTC
  cron.schedule('0 4 * * 0', runJob('Churn Risk Calculation', calculateChurnRisk), {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('[Scheduler] All cron jobs registered.');
};

module.exports = { initScheduler };
