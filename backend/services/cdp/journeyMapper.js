'use strict';

/**
 * Customer Journey Mapper
 *
 * Builds customer journey maps from events, identifies key touchpoints,
 * calculates journey metrics, and detects common journey patterns.
 */

const STAGE_MAP = {
  signup: 'awareness',
  page_view: 'awareness',
  product_view: 'consideration',
  email_open: 'consideration',
  email_click: 'consideration',
  form_submit: 'consideration',
  campaign_interaction: 'consideration',
  add_to_cart: 'decision',
  checkout: 'decision',
  purchase: 'purchase',
  login: 'retention',
  support_ticket: 'retention',
  custom: 'other'
};

const STAGE_ORDER = ['awareness', 'consideration', 'decision', 'purchase', 'retention', 'advocacy'];

/**
 * Build a visual journey map from a contact's events.
 *
 * @param {string} contactId - Contact identifier
 * @param {Array} events - Array of event documents
 * @returns {Object} Journey map with stages, touchpoints, and timeline
 */
function buildJourney(contactId, events = []) {
  if (!contactId) {
    throw new Error('Contact ID is required');
  }

  // Filter and sort events for this contact
  const contactEvents = events
    .filter(e => (e.contact || '').toString() === contactId.toString())
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (contactEvents.length === 0) {
    return {
      contactId,
      stages: [],
      touchpoints: [],
      timeline: [],
      currentStage: null,
      metrics: null,
      builtAt: new Date().toISOString()
    };
  }

  // Identify touchpoints
  const touchpoints = identifyTouchpoints(contactEvents);

  // Map events to journey stages
  const stageEvents = {};
  for (const stage of STAGE_ORDER) {
    stageEvents[stage] = [];
  }

  for (const event of contactEvents) {
    const stage = STAGE_MAP[event.type] || 'other';
    if (stageEvents[stage]) {
      stageEvents[stage].push({
        type: event.type,
        name: event.name,
        timestamp: event.timestamp,
        source: event.source,
        revenue: event.revenue || 0
      });
    }
  }

  // Build stages array
  const stages = STAGE_ORDER
    .filter(stage => stageEvents[stage] && stageEvents[stage].length > 0)
    .map(stage => ({
      name: stage,
      eventCount: stageEvents[stage].length,
      firstEvent: stageEvents[stage][0].timestamp,
      lastEvent: stageEvents[stage][stageEvents[stage].length - 1].timestamp,
      events: stageEvents[stage]
    }));

  // Determine current stage
  const lastEvent = contactEvents[contactEvents.length - 1];
  const currentStage = STAGE_MAP[lastEvent.type] || 'other';

  // Build timeline (chronological list of stage transitions)
  const timeline = _buildTransitionTimeline(contactEvents);

  // Calculate metrics for this journey
  const metrics = calculateJourneyMetrics({
    contactId,
    stages,
    touchpoints,
    timeline,
    events: contactEvents
  });

  return {
    contactId,
    stages,
    touchpoints,
    timeline,
    currentStage,
    metrics,
    totalEvents: contactEvents.length,
    firstInteraction: contactEvents[0].timestamp,
    lastInteraction: lastEvent.timestamp,
    builtAt: new Date().toISOString()
  };
}

/**
 * Extract key touchpoints from events.
 * Touchpoints are significant interactions that mark a shift in engagement.
 *
 * @param {Array} events - Array of events (sorted by timestamp)
 * @returns {Array} Key touchpoints
 */
function identifyTouchpoints(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const touchpoints = [];

  // First interaction is always a touchpoint
  touchpoints.push({
    type: 'first_interaction',
    event: events[0].type,
    name: events[0].name,
    timestamp: events[0].timestamp,
    source: events[0].source,
    significance: 'high'
  });

  // Track stage transitions
  let lastStage = STAGE_MAP[events[0].type] || 'other';

  for (let i = 1; i < events.length; i++) {
    const event = events[i];
    const stage = STAGE_MAP[event.type] || 'other';

    // Stage progression is a touchpoint
    if (stage !== lastStage && STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(lastStage)) {
      touchpoints.push({
        type: 'stage_progression',
        fromStage: lastStage,
        toStage: stage,
        event: event.type,
        name: event.name,
        timestamp: event.timestamp,
        source: event.source,
        significance: 'high'
      });
      lastStage = stage;
    }

    // Revenue-generating events are touchpoints
    if (event.revenue && event.revenue > 0) {
      touchpoints.push({
        type: 'revenue_event',
        event: event.type,
        name: event.name,
        timestamp: event.timestamp,
        revenue: event.revenue,
        significance: 'high'
      });
    }

    // Form submissions are touchpoints (lead capture)
    if (event.type === 'form_submit') {
      touchpoints.push({
        type: 'lead_capture',
        event: event.type,
        name: event.name,
        timestamp: event.timestamp,
        source: event.source,
        significance: 'medium'
      });
    }

    // Support tickets are touchpoints (potential friction)
    if (event.type === 'support_ticket') {
      touchpoints.push({
        type: 'support_interaction',
        event: event.type,
        name: event.name,
        timestamp: event.timestamp,
        significance: 'medium'
      });
    }

    // Long gaps (> 14 days) between events indicate a re-engagement
    if (i > 0) {
      const gap = new Date(event.timestamp) - new Date(events[i - 1].timestamp);
      const gapDays = gap / (1000 * 60 * 60 * 24);
      if (gapDays > 14) {
        touchpoints.push({
          type: 'reengagement',
          event: event.type,
          name: event.name,
          timestamp: event.timestamp,
          gapDays: Math.round(gapDays),
          significance: 'medium'
        });
      }
    }
  }

  // Last interaction if different from first
  if (events.length > 1) {
    const lastEvent = events[events.length - 1];
    touchpoints.push({
      type: 'latest_interaction',
      event: lastEvent.type,
      name: lastEvent.name,
      timestamp: lastEvent.timestamp,
      source: lastEvent.source,
      significance: 'low'
    });
  }

  return touchpoints;
}

/**
 * Calculate journey metrics: time between stages, conversion points, velocity.
 *
 * @param {Object} journey - Journey object with stages, touchpoints, events
 * @returns {Object} Journey metrics
 */
function calculateJourneyMetrics(journey) {
  if (!journey || !journey.stages || journey.stages.length === 0) {
    return {
      totalDuration: 0,
      stageTransitions: [],
      conversionPoints: [],
      avgTimeBetweenInteractions: 0,
      velocity: 'unknown'
    };
  }

  const events = journey.events || [];

  // Total journey duration
  let totalDuration = 0;
  if (events.length >= 2) {
    const first = new Date(events[0].timestamp);
    const last = new Date(events[events.length - 1].timestamp);
    totalDuration = (last - first) / (1000 * 60 * 60 * 24); // in days
  }

  // Time between consecutive stages
  const stageTransitions = [];
  for (let i = 1; i < journey.stages.length; i++) {
    const prev = journey.stages[i - 1];
    const curr = journey.stages[i];
    const timeBetween = (new Date(curr.firstEvent) - new Date(prev.lastEvent)) / (1000 * 60 * 60 * 24);
    stageTransitions.push({
      from: prev.name,
      to: curr.name,
      durationDays: Math.round(timeBetween * 100) / 100
    });
  }

  // Conversion points (where stage changed to purchase/decision)
  const conversionPoints = (journey.touchpoints || [])
    .filter(tp => tp.type === 'revenue_event' || (tp.type === 'stage_progression' && (tp.toStage === 'purchase' || tp.toStage === 'decision')))
    .map(tp => ({
      type: tp.type,
      timestamp: tp.timestamp,
      revenue: tp.revenue || 0
    }));

  // Average time between interactions
  let avgTimeBetween = 0;
  if (events.length >= 2) {
    let totalGap = 0;
    for (let i = 1; i < events.length; i++) {
      totalGap += new Date(events[i].timestamp) - new Date(events[i - 1].timestamp);
    }
    avgTimeBetween = (totalGap / (events.length - 1)) / (1000 * 60 * 60); // in hours
  }

  // Velocity classification
  let velocity;
  if (totalDuration === 0) velocity = 'instant';
  else if (totalDuration <= 7) velocity = 'fast';
  else if (totalDuration <= 30) velocity = 'moderate';
  else if (totalDuration <= 90) velocity = 'slow';
  else velocity = 'very_slow';

  // Total revenue across journey
  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);

  return {
    totalDurationDays: Math.round(totalDuration * 100) / 100,
    stageTransitions,
    conversionPoints,
    avgTimeBetweenInteractionsHours: Math.round(avgTimeBetween * 100) / 100,
    velocity,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalTouchpoints: (journey.touchpoints || []).length,
    stagesReached: journey.stages.length,
    highestStage: journey.stages[journey.stages.length - 1].name
  };
}

/**
 * Detect common journey patterns across multiple customer journeys.
 *
 * @param {Array} journeys - Array of journey objects (from buildJourney)
 * @returns {Object} Detected patterns and insights
 */
function detectJourneyPatterns(journeys) {
  if (!Array.isArray(journeys) || journeys.length === 0) {
    return { patterns: [], insights: [] };
  }

  const patterns = [];
  const insights = [];

  // Pattern 1: Most common stage sequences
  const sequences = journeys
    .filter(j => j.stages && j.stages.length > 0)
    .map(j => j.stages.map(s => s.name).join(' -> '));

  const seqCounts = {};
  for (const seq of sequences) {
    seqCounts[seq] = (seqCounts[seq] || 0) + 1;
  }

  const sortedSeqs = Object.entries(seqCounts).sort(([, a], [, b]) => b - a);
  if (sortedSeqs.length > 0) {
    patterns.push({
      type: 'common_paths',
      description: 'Most common journey paths',
      paths: sortedSeqs.slice(0, 5).map(([path, count]) => ({
        path,
        count,
        percentage: Math.round((count / journeys.length) * 10000) / 100
      }))
    });
  }

  // Pattern 2: Average journey duration by outcome
  const completedJourneys = journeys.filter(j => j.metrics && j.stages && j.stages.some(s => s.name === 'purchase'));
  const incompletedJourneys = journeys.filter(j => j.metrics && j.stages && !j.stages.some(s => s.name === 'purchase'));

  if (completedJourneys.length > 0) {
    const avgDuration = completedJourneys.reduce((sum, j) => sum + (j.metrics.totalDurationDays || 0), 0) / completedJourneys.length;
    patterns.push({
      type: 'conversion_time',
      description: 'Average time to purchase',
      avgDays: Math.round(avgDuration * 100) / 100,
      sampleSize: completedJourneys.length
    });
  }

  // Pattern 3: Drop-off stages
  const stageReachCount = {};
  for (const stage of STAGE_ORDER) {
    stageReachCount[stage] = 0;
  }
  for (const journey of journeys) {
    if (!journey.stages) continue;
    for (const stage of journey.stages) {
      if (stageReachCount[stage.name] !== undefined) {
        stageReachCount[stage.name]++;
      }
    }
  }

  const dropOffs = [];
  for (let i = 1; i < STAGE_ORDER.length; i++) {
    const prev = STAGE_ORDER[i - 1];
    const curr = STAGE_ORDER[i];
    if (stageReachCount[prev] > 0 && stageReachCount[curr] < stageReachCount[prev]) {
      const dropOffRate = 1 - (stageReachCount[curr] / stageReachCount[prev]);
      dropOffs.push({
        from: prev,
        to: curr,
        dropOffRate: Math.round(dropOffRate * 10000) / 100,
        reached: stageReachCount[prev],
        progressed: stageReachCount[curr]
      });
    }
  }

  if (dropOffs.length > 0) {
    patterns.push({
      type: 'drop_off_points',
      description: 'Where contacts drop off in the journey',
      stages: dropOffs
    });

    // Insight: biggest drop-off
    const worstDropOff = dropOffs.reduce((max, d) => d.dropOffRate > max.dropOffRate ? d : max, dropOffs[0]);
    insights.push({
      type: 'high_drop_off',
      message: `Highest drop-off (${worstDropOff.dropOffRate}%) occurs between ${worstDropOff.from} and ${worstDropOff.to}. Consider improving this transition.`,
      severity: worstDropOff.dropOffRate > 70 ? 'high' : 'medium',
      data: worstDropOff
    });
  }

  // Pattern 4: Velocity distribution
  const velocities = journeys
    .filter(j => j.metrics && j.metrics.velocity)
    .map(j => j.metrics.velocity);

  const velCounts = {};
  for (const v of velocities) {
    velCounts[v] = (velCounts[v] || 0) + 1;
  }

  patterns.push({
    type: 'velocity_distribution',
    description: 'Speed of customer journeys',
    distribution: velCounts,
    totalJourneys: velocities.length
  });

  // Pattern 5: Source attribution
  const sourceFirstTouch = {};
  for (const journey of journeys) {
    if (journey.touchpoints && journey.touchpoints.length > 0) {
      const firstSource = journey.touchpoints[0].source || 'unknown';
      sourceFirstTouch[firstSource] = (sourceFirstTouch[firstSource] || 0) + 1;
    }
  }

  if (Object.keys(sourceFirstTouch).length > 0) {
    patterns.push({
      type: 'source_attribution',
      description: 'First-touch source distribution',
      sources: sourceFirstTouch
    });
  }

  // Insight: conversion rate
  if (journeys.length > 0) {
    const conversionRate = completedJourneys.length / journeys.length;
    insights.push({
      type: 'conversion_rate',
      message: `Overall journey conversion rate is ${Math.round(conversionRate * 10000) / 100}% (${completedJourneys.length}/${journeys.length}).`,
      severity: conversionRate < 0.05 ? 'high' : conversionRate < 0.15 ? 'medium' : 'low',
      data: { rate: conversionRate, converted: completedJourneys.length, total: journeys.length }
    });
  }

  return {
    patterns,
    insights,
    summary: {
      totalJourneys: journeys.length,
      uniquePaths: sortedSeqs.length,
      avgTouchpoints: journeys.length > 0
        ? Math.round(journeys.reduce((sum, j) => sum + ((j.touchpoints || []).length), 0) / journeys.length * 100) / 100
        : 0
    },
    analyzedAt: new Date().toISOString()
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _buildTransitionTimeline(events) {
  const timeline = [];
  let lastStage = null;

  for (const event of events) {
    const stage = STAGE_MAP[event.type] || 'other';
    if (stage !== lastStage) {
      timeline.push({
        stage,
        event: event.type,
        timestamp: event.timestamp,
        transitionedFrom: lastStage
      });
      lastStage = stage;
    }
  }

  return timeline;
}

module.exports = {
  buildJourney,
  identifyTouchpoints,
  calculateJourneyMetrics,
  detectJourneyPatterns
};
