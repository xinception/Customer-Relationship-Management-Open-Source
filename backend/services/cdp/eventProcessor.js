'use strict';

/**
 * CDP Event Processor
 *
 * Processes, enriches, deduplicates, and aggregates customer events
 * for the Customer Data Platform.
 */

const VALID_EVENT_TYPES = [
  'page_view', 'email_open', 'email_click', 'form_submit', 'purchase',
  'login', 'signup', 'product_view', 'add_to_cart', 'checkout',
  'campaign_interaction', 'support_ticket', 'custom'
];

const VALID_SOURCES = ['web', 'mobile', 'api', 'import', 'system'];

/**
 * Process and enrich a single incoming event.
 *
 * @param {Object} event - Raw event object
 * @returns {Object} Processed event with enrichment and validation
 */
function processEvent(event) {
  if (!event) {
    throw new Error('Event is required');
  }

  const errors = _validateEvent(event);
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      event: null
    };
  }

  const processed = {
    ...event,
    timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    processedAt: new Date(),
    _processed: true
  };

  // Normalize type
  processed.type = processed.type.toLowerCase().trim();

  // Normalize source
  if (processed.source) {
    processed.source = processed.source.toLowerCase().trim();
  }

  // Enrich the event
  const enriched = enrichEvent(processed);

  return {
    success: true,
    errors: [],
    event: enriched
  };
}

/**
 * Process multiple events in batch.
 *
 * @param {Array} events - Array of raw events
 * @returns {Object} { processed, failed, deduplicated, stats }
 */
function batchProcessEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array');
  }

  const results = {
    processed: [],
    failed: [],
    stats: {
      total: events.length,
      succeeded: 0,
      failed: 0,
      duplicatesRemoved: 0
    }
  };

  // Process each event
  const processedEvents = [];
  for (const event of events) {
    try {
      const result = processEvent(event);
      if (result.success) {
        processedEvents.push(result.event);
        results.stats.succeeded++;
      } else {
        results.failed.push({ event, errors: result.errors });
        results.stats.failed++;
      }
    } catch (err) {
      results.failed.push({ event, errors: [err.message] });
      results.stats.failed++;
    }
  }

  // Deduplicate
  const deduped = deduplicateEvents(processedEvents);
  results.stats.duplicatesRemoved = processedEvents.length - deduped.length;
  results.processed = deduped;

  return results;
}

/**
 * Enrich an event with additional context.
 *
 * @param {Object} event - Event to enrich
 * @returns {Object} Enriched event
 */
function enrichEvent(event) {
  if (!event) return event;

  const enriched = { ...event };

  // Add engagement weight
  enriched.engagementWeight = _getEngagementWeight(enriched.type);

  // Categorize the event
  enriched.category = _categorizeEvent(enriched.type);

  // Parse device info from properties if available
  if (!enriched.deviceInfo && enriched.properties) {
    enriched.deviceInfo = _parseDeviceInfo(enriched.properties);
  }

  // Geo enrichment from IP (basic - maps known patterns)
  if (enriched.deviceInfo && enriched.deviceInfo.ip) {
    enriched.geo = _enrichGeo(enriched.deviceInfo.ip);
  }

  // Determine session context
  if (enriched.sessionId) {
    enriched.isNewSession = false; // Would check session store in production
  }

  // Revenue normalization
  if (enriched.revenue !== undefined && enriched.revenue !== null) {
    enriched.revenue = Math.round(Number(enriched.revenue) * 100) / 100;
  }

  // Day-of-week and hour for analytics
  const ts = new Date(enriched.timestamp);
  if (!isNaN(ts.getTime())) {
    enriched.dayOfWeek = ts.getDay();
    enriched.hourOfDay = ts.getHours();
    enriched.isWeekend = ts.getDay() === 0 || ts.getDay() === 6;
  }

  return enriched;
}

/**
 * Remove duplicate events from an array.
 *
 * @param {Array} events - Array of events
 * @returns {Array} Deduplicated events
 */
function deduplicateEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const seen = new Map();

  for (const event of events) {
    const key = _generateDedupeKey(event);
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, event);
    } else {
      // Keep the one with more data (more properties)
      const existingProps = Object.keys(existing.properties || {}).length;
      const newProps = Object.keys(event.properties || {}).length;
      if (newProps > existingProps) {
        seen.set(key, event);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Aggregate events for a specific contact within a time range.
 *
 * @param {string} contactId - Contact ID to aggregate for
 * @param {Array} events - All events to filter from
 * @param {Object} [timeRange] - { start, end } as dates or timestamps
 * @returns {Object} Aggregated event summary
 */
function aggregateEvents(contactId, events, timeRange = {}) {
  if (!contactId) {
    throw new Error('Contact ID is required');
  }
  if (!Array.isArray(events)) {
    return _emptyAggregation(contactId);
  }

  // Filter events by contact
  let contactEvents = events.filter(e => {
    const eid = (e.contact || '').toString();
    return eid === contactId.toString();
  });

  // Filter by time range
  if (timeRange.start) {
    const start = new Date(timeRange.start).getTime();
    contactEvents = contactEvents.filter(e => new Date(e.timestamp).getTime() >= start);
  }
  if (timeRange.end) {
    const end = new Date(timeRange.end).getTime();
    contactEvents = contactEvents.filter(e => new Date(e.timestamp).getTime() <= end);
  }

  // Sort by timestamp
  contactEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Aggregate by type
  const byType = {};
  for (const event of contactEvents) {
    if (!byType[event.type]) {
      byType[event.type] = { count: 0, firstSeen: null, lastSeen: null, totalRevenue: 0 };
    }
    byType[event.type].count++;
    const ts = new Date(event.timestamp);
    if (!byType[event.type].firstSeen || ts < byType[event.type].firstSeen) {
      byType[event.type].firstSeen = ts;
    }
    if (!byType[event.type].lastSeen || ts > byType[event.type].lastSeen) {
      byType[event.type].lastSeen = ts;
    }
    if (event.revenue) {
      byType[event.type].totalRevenue += event.revenue;
    }
  }

  // Aggregate by source
  const bySource = {};
  for (const event of contactEvents) {
    const src = event.source || 'unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  }

  // Aggregate by category
  const byCategory = {};
  for (const event of contactEvents) {
    const cat = _categorizeEvent(event.type);
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  // Session counts
  const sessions = new Set(contactEvents.map(e => e.sessionId).filter(Boolean));

  // Revenue total
  const totalRevenue = contactEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);

  // First and last event
  const firstEvent = contactEvents.length > 0 ? contactEvents[0] : null;
  const lastEvent = contactEvents.length > 0 ? contactEvents[contactEvents.length - 1] : null;

  return {
    contactId,
    totalEvents: contactEvents.length,
    uniqueSessions: sessions.size,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    byType,
    bySource,
    byCategory,
    firstEventAt: firstEvent ? firstEvent.timestamp : null,
    lastEventAt: lastEvent ? lastEvent.timestamp : null,
    timeRange: {
      start: timeRange.start || (firstEvent ? firstEvent.timestamp : null),
      end: timeRange.end || (lastEvent ? lastEvent.timestamp : null)
    },
    aggregatedAt: new Date().toISOString()
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _validateEvent(event) {
  const errors = [];

  if (!event.type) {
    errors.push('Event type is required');
  } else if (!VALID_EVENT_TYPES.includes(event.type.toLowerCase().trim())) {
    errors.push(`Invalid event type: ${event.type}. Valid types: ${VALID_EVENT_TYPES.join(', ')}`);
  }

  if (!event.name && !event.type) {
    errors.push('Event name or type is required');
  }

  if (!event.contact) {
    errors.push('Contact ID is required for event');
  }

  if (event.source && !VALID_SOURCES.includes(event.source.toLowerCase().trim())) {
    errors.push(`Invalid source: ${event.source}. Valid sources: ${VALID_SOURCES.join(', ')}`);
  }

  if (event.timestamp) {
    const ts = new Date(event.timestamp);
    if (isNaN(ts.getTime())) {
      errors.push('Invalid timestamp format');
    }
  }

  return errors;
}

function _getEngagementWeight(type) {
  const weights = {
    page_view: 1,
    email_open: 2,
    email_click: 5,
    form_submit: 10,
    purchase: 20,
    login: 1,
    signup: 10,
    product_view: 3,
    add_to_cart: 7,
    checkout: 15,
    campaign_interaction: 4,
    support_ticket: 2,
    custom: 1
  };
  return weights[type] || 1;
}

function _categorizeEvent(type) {
  const categories = {
    page_view: 'browsing',
    product_view: 'browsing',
    email_open: 'email_engagement',
    email_click: 'email_engagement',
    form_submit: 'conversion',
    purchase: 'conversion',
    checkout: 'conversion',
    add_to_cart: 'shopping',
    login: 'authentication',
    signup: 'authentication',
    campaign_interaction: 'marketing',
    support_ticket: 'support',
    custom: 'other'
  };
  return categories[type] || 'other';
}

function _parseDeviceInfo(properties) {
  if (!properties) return {};
  return {
    type: properties.deviceType || properties.device_type || null,
    browser: properties.browser || properties.userAgent || null,
    os: properties.os || properties.platform || null,
    ip: properties.ip || properties.ipAddress || properties.ip_address || null
  };
}

function _enrichGeo(ip) {
  // Basic geo stub - in production this would call a geo-IP service
  if (!ip) return null;
  return {
    ip,
    enriched: false,
    note: 'Geo enrichment requires external service integration'
  };
}

function _generateDedupeKey(event) {
  const contact = (event.contact || '').toString();
  const type = event.type || '';
  const ts = event.timestamp ? new Date(event.timestamp).getTime() : 0;
  const session = event.sessionId || '';
  // Events within 1-second window for the same contact, type, and session are duplicates
  const timeWindow = Math.floor(ts / 1000);
  return `${contact}:${type}:${timeWindow}:${session}`;
}

function _emptyAggregation(contactId) {
  return {
    contactId,
    totalEvents: 0,
    uniqueSessions: 0,
    totalRevenue: 0,
    byType: {},
    bySource: {},
    byCategory: {},
    firstEventAt: null,
    lastEventAt: null,
    timeRange: { start: null, end: null },
    aggregatedAt: new Date().toISOString()
  };
}

module.exports = {
  processEvent,
  batchProcessEvents,
  enrichEvent,
  deduplicateEvents,
  aggregateEvents
};
