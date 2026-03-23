'use strict';

/**
 * Campaign Manager
 *
 * Campaign orchestration: launch, pause, schedule, A/B testing,
 * and metric computation including ROI.
 */

const VALID_STATUSES = ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'];
const VALID_TYPES = ['email', 'sms', 'push', 'social', 'multi_channel'];

/**
 * Launch a campaign: validate, mark active, and prepare for delivery.
 *
 * @param {Object} campaign - Campaign document
 * @returns {Object} Updated campaign with launch metadata
 */
function launchCampaign(campaign) {
  if (!campaign) {
    throw new Error('Campaign is required');
  }

  const errors = _validateCampaignForLaunch(campaign);
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      campaign: null
    };
  }

  const launched = {
    ...campaign,
    status: 'active',
    startDate: new Date(),
    _launchedAt: new Date().toISOString()
  };

  // Initialize metrics if not present
  if (!launched.metrics) {
    launched.metrics = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      bounced: 0,
      unsubscribed: 0,
      revenue: 0
    };
  }

  // Prepare A/B test variants if enabled
  if (launched.abTest && launched.abTest.enabled) {
    launched.abTest = _prepareABTest(launched.abTest, campaign);
  }

  return {
    success: true,
    errors: [],
    campaign: launched,
    message: `Campaign "${campaign.name}" launched successfully.`
  };
}

/**
 * Pause a running campaign.
 *
 * @param {Object} campaign - Campaign document
 * @returns {Object} Updated campaign
 */
function pauseCampaign(campaign) {
  if (!campaign) {
    throw new Error('Campaign is required');
  }

  if (campaign.status !== 'active') {
    return {
      success: false,
      error: `Cannot pause campaign with status "${campaign.status}". Only active campaigns can be paused.`,
      campaign
    };
  }

  const paused = {
    ...campaign,
    status: 'paused',
    _pausedAt: new Date().toISOString()
  };

  return {
    success: true,
    campaign: paused,
    message: `Campaign "${campaign.name}" paused.`
  };
}

/**
 * Calculate comprehensive campaign metrics including ROI.
 *
 * @param {Object} campaign - Campaign with metrics data
 * @returns {Object} Computed metrics
 */
function calculateCampaignMetrics(campaign) {
  if (!campaign) {
    throw new Error('Campaign is required');
  }

  const m = campaign.metrics || {};
  const sent = m.sent || 0;
  const delivered = m.delivered || 0;
  const opened = m.opened || 0;
  const clicked = m.clicked || 0;
  const converted = m.converted || 0;
  const bounced = m.bounced || 0;
  const unsubscribed = m.unsubscribed || 0;
  const revenue = m.revenue || 0;

  // Rate calculations (avoid division by zero)
  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;
  const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
  const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0;
  const clickToOpenRate = opened > 0 ? (clicked / opened) * 100 : 0;
  const conversionRate = delivered > 0 ? (converted / delivered) * 100 : 0;
  const unsubscribeRate = delivered > 0 ? (unsubscribed / delivered) * 100 : 0;

  // Revenue per email
  const revenuePerEmail = delivered > 0 ? revenue / delivered : 0;
  const revenuePerClick = clicked > 0 ? revenue / clicked : 0;

  // Cost estimation (rough: $0.01 per email sent)
  const estimatedCost = sent * 0.01;
  const roi = estimatedCost > 0 ? ((revenue - estimatedCost) / estimatedCost) * 100 : 0;

  // Campaign health score (0-100)
  let healthScore = 0;
  if (sent > 0) {
    healthScore += deliveryRate > 95 ? 25 : deliveryRate > 90 ? 15 : 5;
    healthScore += openRate > 25 ? 25 : openRate > 15 ? 15 : openRate > 5 ? 10 : 0;
    healthScore += clickRate > 5 ? 25 : clickRate > 2 ? 15 : clickRate > 1 ? 10 : 0;
    healthScore += conversionRate > 3 ? 25 : conversionRate > 1 ? 15 : conversionRate > 0.5 ? 10 : 0;
  }

  // A/B test results
  let abTestResults = null;
  if (campaign.abTest && campaign.abTest.enabled && campaign.abTest.variants) {
    abTestResults = _calculateABTestResults(campaign.abTest);
  }

  // Duration
  let durationDays = 0;
  if (campaign.startDate) {
    const end = campaign.endDate ? new Date(campaign.endDate) : new Date();
    durationDays = (end - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24);
  }

  return {
    raw: { sent, delivered, opened, clicked, converted, bounced, unsubscribed, revenue },
    rates: {
      deliveryRate: _round(deliveryRate),
      bounceRate: _round(bounceRate),
      openRate: _round(openRate),
      clickRate: _round(clickRate),
      clickToOpenRate: _round(clickToOpenRate),
      conversionRate: _round(conversionRate),
      unsubscribeRate: _round(unsubscribeRate)
    },
    financial: {
      revenue: _round(revenue),
      estimatedCost: _round(estimatedCost),
      roi: _round(roi),
      revenuePerEmail: _round(revenuePerEmail),
      revenuePerClick: _round(revenuePerClick)
    },
    healthScore,
    healthLabel: healthScore >= 75 ? 'excellent' : healthScore >= 50 ? 'good' : healthScore >= 25 ? 'fair' : 'poor',
    durationDays: _round(durationDays),
    abTestResults,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Schedule a campaign for future delivery.
 *
 * @param {Object} campaign - Campaign document
 * @param {Object} scheduleConfig - { sendAt, timezone, recurrence }
 * @returns {Object} Scheduled campaign
 */
function scheduleCampaign(campaign, scheduleConfig) {
  if (!campaign) {
    throw new Error('Campaign is required');
  }
  if (!scheduleConfig || !scheduleConfig.sendAt) {
    throw new Error('Schedule config with sendAt date is required');
  }

  const sendAt = new Date(scheduleConfig.sendAt);
  if (isNaN(sendAt.getTime())) {
    throw new Error('Invalid sendAt date');
  }

  if (sendAt <= new Date()) {
    throw new Error('Scheduled time must be in the future');
  }

  if (campaign.status !== 'draft' && campaign.status !== 'paused') {
    return {
      success: false,
      error: `Cannot schedule campaign with status "${campaign.status}". Only draft or paused campaigns can be scheduled.`,
      campaign
    };
  }

  const scheduled = {
    ...campaign,
    status: 'scheduled',
    scheduledAt: sendAt,
    _scheduledConfig: {
      sendAt: sendAt.toISOString(),
      timezone: scheduleConfig.timezone || 'UTC',
      recurrence: scheduleConfig.recurrence || null // e.g., 'daily', 'weekly', 'monthly'
    }
  };

  return {
    success: true,
    campaign: scheduled,
    message: `Campaign "${campaign.name}" scheduled for ${sendAt.toISOString()}.`
  };
}

/**
 * Execute A/B testing logic for a campaign.
 * Splits audience and tracks variant performance.
 *
 * @param {Object} campaign - Campaign with abTest configuration
 * @returns {Object} A/B test execution plan
 */
function runABTest(campaign) {
  if (!campaign) {
    throw new Error('Campaign is required');
  }
  if (!campaign.abTest || !campaign.abTest.enabled) {
    return {
      success: false,
      error: 'Campaign does not have A/B testing enabled.',
      campaign
    };
  }

  const variants = campaign.abTest.variants || [];
  if (variants.length < 2) {
    return {
      success: false,
      error: 'A/B testing requires at least 2 variants.',
      campaign
    };
  }

  const audience = campaign.targetAudience || [];
  const totalAudience = audience.length;

  // Calculate split based on weights or equal distribution
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
  const splits = variants.map((variant, idx) => {
    const weight = variant.weight || 1;
    const ratio = weight / totalWeight;
    const audienceSize = Math.floor(totalAudience * ratio);

    return {
      variantIndex: idx,
      name: variant.name || `Variant ${String.fromCharCode(65 + idx)}`,
      subject: variant.subject || campaign.subject,
      content: variant.content || campaign.content,
      weight,
      ratio: _round(ratio * 100),
      audienceSize,
      audienceIds: audience.slice(
        variants.slice(0, idx).reduce((sum, v2) => sum + Math.floor(totalAudience * ((v2.weight || 1) / totalWeight)), 0),
        variants.slice(0, idx).reduce((sum, v2) => sum + Math.floor(totalAudience * ((v2.weight || 1) / totalWeight)), 0) + audienceSize
      ),
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    };
  });

  const winnerCriteria = campaign.abTest.winnerCriteria || 'open_rate';

  return {
    success: true,
    testPlan: {
      campaignId: (campaign._id || campaign.id || '').toString(),
      campaignName: campaign.name,
      variants: splits.map(s => ({
        name: s.name,
        subject: s.subject,
        audienceSize: s.audienceSize,
        ratio: s.ratio
      })),
      totalAudience,
      winnerCriteria,
      status: 'running'
    },
    splits,
    message: `A/B test started with ${variants.length} variants across ${totalAudience} contacts.`
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _validateCampaignForLaunch(campaign) {
  const errors = [];

  if (!campaign.name) {
    errors.push('Campaign name is required');
  }

  if (!campaign.type || !VALID_TYPES.includes(campaign.type)) {
    errors.push(`Invalid campaign type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (!campaign.content && !campaign.htmlContent) {
    errors.push('Campaign content is required');
  }

  if (campaign.type === 'email' && !campaign.subject) {
    errors.push('Email subject is required for email campaigns');
  }

  if (campaign.status === 'completed' || campaign.status === 'cancelled') {
    errors.push(`Cannot launch a ${campaign.status} campaign`);
  }

  if (campaign.status === 'active') {
    errors.push('Campaign is already active');
  }

  if ((!campaign.targetAudience || campaign.targetAudience.length === 0) && !campaign.segment) {
    errors.push('Campaign must have a target audience or segment');
  }

  return errors;
}

function _prepareABTest(abTest, campaign) {
  const prepared = { ...abTest };

  if (!prepared.variants || prepared.variants.length === 0) {
    // Auto-create two variants from original
    prepared.variants = [
      { name: 'Control', subject: campaign.subject, content: campaign.content, weight: 50 },
      { name: 'Variant B', subject: campaign.subject, content: campaign.content, weight: 50 }
    ];
  }

  // Ensure weights sum to 100
  const totalWeight = prepared.variants.reduce((sum, v) => sum + (v.weight || 0), 0);
  if (totalWeight !== 100) {
    const equalWeight = Math.floor(100 / prepared.variants.length);
    prepared.variants = prepared.variants.map(v => ({ ...v, weight: equalWeight }));
  }

  return prepared;
}

function _calculateABTestResults(abTest) {
  if (!abTest.variants || abTest.variants.length === 0) return null;

  const results = abTest.variants.map(variant => {
    const sent = variant.sent || 0;
    const opened = variant.opened || 0;
    const clicked = variant.clicked || 0;
    const converted = variant.converted || 0;

    return {
      name: variant.name,
      openRate: sent > 0 ? _round((opened / sent) * 100) : 0,
      clickRate: sent > 0 ? _round((clicked / sent) * 100) : 0,
      conversionRate: sent > 0 ? _round((converted / sent) * 100) : 0,
      sent, opened, clicked, converted
    };
  });

  // Determine winner based on criteria
  const criteria = abTest.winnerCriteria || 'open_rate';
  const metricKey = criteria === 'open_rate' ? 'openRate' : criteria === 'click_rate' ? 'clickRate' : 'conversionRate';

  let winner = results[0];
  for (const result of results) {
    if (result[metricKey] > winner[metricKey]) {
      winner = result;
    }
  }

  // Statistical significance check (simplified)
  const hasEnoughData = results.every(r => r.sent >= 100);
  const hasSignificantDiff = results.length >= 2 &&
    Math.abs(results[0][metricKey] - results[1][metricKey]) > 2;

  return {
    variants: results,
    winner: winner.name,
    winnerMetric: metricKey,
    winnerValue: winner[metricKey],
    isStatisticallySignificant: hasEnoughData && hasSignificantDiff,
    recommendation: hasEnoughData && hasSignificantDiff
      ? `Use "${winner.name}" - it outperforms with a ${winner[metricKey]}% ${criteria.replace('_', ' ')}.`
      : 'Need more data to determine a statistically significant winner.'
  };
}

function _round(val) {
  return Math.round(val * 100) / 100;
}

module.exports = {
  launchCampaign,
  pauseCampaign,
  calculateCampaignMetrics,
  scheduleCampaign,
  runABTest
};
