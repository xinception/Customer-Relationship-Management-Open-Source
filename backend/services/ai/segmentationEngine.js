'use strict';

/**
 * AI Segmentation Engine
 *
 * Automatic contact segmentation using k-means-like clustering,
 * rule evaluation, and behavioral pattern detection.
 */

const scoringEngine = require('./scoringEngine');

const PREDEFINED_SEGMENTS = {
  HIGH_VALUE_ACTIVE: 'high_value_active',
  AT_RISK_HIGH_VALUE: 'at_risk_high_value',
  GROWING_ACCOUNTS: 'growing_accounts',
  DORMANT_LEADS: 'dormant_leads',
  NEW_PROSPECTS: 'new_prospects'
};

const SEGMENT_DEFINITIONS = {
  [PREDEFINED_SEGMENTS.HIGH_VALUE_ACTIVE]: {
    label: 'High-Value Active',
    description: 'Customers with high engagement and purchase history',
    criteria: { minScore: 70, maxChurnRisk: 0.3, minLifecycle: 'customer' }
  },
  [PREDEFINED_SEGMENTS.AT_RISK_HIGH_VALUE]: {
    label: 'At-Risk High-Value',
    description: 'Previously high-value customers showing churn signals',
    criteria: { minScore: 40, minChurnRisk: 0.5, minLifecycle: 'customer' }
  },
  [PREDEFINED_SEGMENTS.GROWING_ACCOUNTS]: {
    label: 'Growing Accounts',
    description: 'Contacts with increasing engagement and positive trajectory',
    criteria: { minScore: 40, maxScore: 70, maxChurnRisk: 0.3, lifecycles: ['mql', 'sql', 'opportunity'] }
  },
  [PREDEFINED_SEGMENTS.DORMANT_LEADS]: {
    label: 'Dormant Leads',
    description: 'Leads with low recent activity',
    criteria: { maxScore: 30, minDaysInactive: 30, lifecycles: ['subscriber', 'lead'] }
  },
  [PREDEFINED_SEGMENTS.NEW_PROSPECTS]: {
    label: 'New Prospects',
    description: 'Recently added contacts still in early stages',
    criteria: { maxAgeDays: 30, lifecycles: ['subscriber', 'lead', 'mql'] }
  }
};

const LIFECYCLE_ORDER = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];

/**
 * Automatically segment contacts into predefined clusters.
 * Uses scoring + heuristic rules (k-means-like assignment to nearest centroid).
 *
 * @param {Array} contacts - Array of contact objects
 * @param {Object} [eventsMap] - Optional map of contactId -> events
 * @returns {Object} Map of segmentName -> array of contactIds
 */
function autoSegment(contacts, eventsMap = {}) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return _emptySegments();
  }

  const segments = {};
  for (const key of Object.values(PREDEFINED_SEGMENTS)) {
    segments[key] = [];
  }

  for (const contact of contacts) {
    const contactId = (contact._id || contact.id || '').toString();
    const events = eventsMap[contactId] || [];

    // Calculate features
    let scoreResult, churnResult;
    try {
      scoreResult = scoringEngine.calculateContactScore(contact, events);
      churnResult = scoringEngine.predictChurnRisk(contact, events);
    } catch (_err) {
      scoreResult = { score: 0 };
      churnResult = { risk: 0.5 };
    }

    const score = scoreResult.score;
    const churnRisk = churnResult.risk;
    const lifecycle = contact.lifecycle || 'subscriber';
    const lifecycleIndex = LIFECYCLE_ORDER.indexOf(lifecycle);
    const ageDays = contact.createdAt
      ? (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    const lastActivityDate = contact.lastActivity ? new Date(contact.lastActivity) : null;
    const daysSinceActivity = lastActivityDate
      ? (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    // Assign to best-matching segment (priority order)
    const entry = { contactId, score, churnRisk };

    if (ageDays <= 30 && lifecycleIndex <= 2) {
      segments[PREDEFINED_SEGMENTS.NEW_PROSPECTS].push(entry);
    } else if (score >= 70 && churnRisk < 0.3 && lifecycleIndex >= 5) {
      segments[PREDEFINED_SEGMENTS.HIGH_VALUE_ACTIVE].push(entry);
    } else if (churnRisk >= 0.5 && lifecycleIndex >= 5) {
      segments[PREDEFINED_SEGMENTS.AT_RISK_HIGH_VALUE].push(entry);
    } else if (score >= 40 && score < 70 && churnRisk < 0.3 && lifecycleIndex >= 2 && lifecycleIndex < 5) {
      segments[PREDEFINED_SEGMENTS.GROWING_ACCOUNTS].push(entry);
    } else if (score < 30 && daysSinceActivity > 30 && lifecycleIndex <= 1) {
      segments[PREDEFINED_SEGMENTS.DORMANT_LEADS].push(entry);
    } else {
      // Assign to nearest segment by distance
      const assignment = _findNearestSegment(score, churnRisk, lifecycleIndex, ageDays);
      segments[assignment].push(entry);
    }
  }

  return {
    segments,
    definitions: SEGMENT_DEFINITIONS,
    totalContacts: contacts.length,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Suggest new segments based on behavioral patterns in the data.
 *
 * @param {Array} contacts - Array of contacts
 * @param {Array} events - All events
 * @returns {Array} Array of segment suggestions
 */
function suggestSegments(contacts, events = []) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return [];
  }

  const suggestions = [];

  // Build event map by contact
  const eventMap = {};
  for (const event of events) {
    const cid = (event.contact || '').toString();
    if (!eventMap[cid]) eventMap[cid] = [];
    eventMap[cid].push(event);
  }

  // Pattern 1: Frequent email openers who never click
  const openersNoClick = contacts.filter(c => {
    const cid = (c._id || c.id || '').toString();
    const ce = eventMap[cid] || [];
    const opens = ce.filter(e => e.type === 'email_open').length;
    const clicks = ce.filter(e => e.type === 'email_click').length;
    return opens >= 3 && clicks === 0;
  });
  if (openersNoClick.length >= 2) {
    suggestions.push({
      name: 'Email Openers - Low Click',
      description: 'Contacts who open emails frequently but rarely click. Consider improving CTAs.',
      memberCount: openersNoClick.length,
      contactIds: openersNoClick.map(c => (c._id || c.id || '').toString()),
      confidence: Math.min(1, openersNoClick.length / contacts.length * 5),
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'email_opens_count', operator: 'gte', value: 3 },
          { field: 'email_clicks_count', operator: 'lte', value: 0 }
        ]
      }
    });
  }

  // Pattern 2: High cart abandoners
  const cartAbandoners = contacts.filter(c => {
    const cid = (c._id || c.id || '').toString();
    const ce = eventMap[cid] || [];
    const carts = ce.filter(e => e.type === 'add_to_cart').length;
    const purchases = ce.filter(e => e.type === 'purchase').length;
    return carts >= 2 && purchases === 0;
  });
  if (cartAbandoners.length >= 2) {
    suggestions.push({
      name: 'Cart Abandoners',
      description: 'Contacts who add items to cart but never purchase. Opportunity for retargeting.',
      memberCount: cartAbandoners.length,
      contactIds: cartAbandoners.map(c => (c._id || c.id || '').toString()),
      confidence: Math.min(1, cartAbandoners.length / contacts.length * 5),
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'add_to_cart_count', operator: 'gte', value: 2 },
          { field: 'purchase_count', operator: 'equals', value: 0 }
        ]
      }
    });
  }

  // Pattern 3: Weekend-active contacts
  const weekendActive = contacts.filter(c => {
    const cid = (c._id || c.id || '').toString();
    const ce = eventMap[cid] || [];
    if (ce.length < 3) return false;
    const weekendEvents = ce.filter(e => {
      const day = new Date(e.timestamp).getDay();
      return day === 0 || day === 6;
    });
    return weekendEvents.length / ce.length > 0.5;
  });
  if (weekendActive.length >= 2) {
    suggestions.push({
      name: 'Weekend Warriors',
      description: 'Contacts primarily active on weekends. Tailor send times accordingly.',
      memberCount: weekendActive.length,
      contactIds: weekendActive.map(c => (c._id || c.id || '').toString()),
      confidence: Math.min(1, weekendActive.length / contacts.length * 5),
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'weekend_activity_ratio', operator: 'gt', value: 0.5 }
        ]
      }
    });
  }

  // Pattern 4: Multi-channel contacts
  const multiChannel = contacts.filter(c => {
    const cid = (c._id || c.id || '').toString();
    const ce = eventMap[cid] || [];
    const sources = new Set(ce.map(e => e.source).filter(Boolean));
    return sources.size >= 3;
  });
  if (multiChannel.length >= 2) {
    suggestions.push({
      name: 'Multi-Channel Engaged',
      description: 'Contacts active across 3+ channels. Good candidates for omni-channel campaigns.',
      memberCount: multiChannel.length,
      contactIds: multiChannel.map(c => (c._id || c.id || '').toString()),
      confidence: Math.min(1, multiChannel.length / contacts.length * 5),
      rules: {
        operator: 'AND',
        conditions: [
          { field: 'unique_channels', operator: 'gte', value: 3 }
        ]
      }
    });
  }

  return suggestions;
}

/**
 * Evaluate dynamic segment rules against a set of contacts.
 *
 * @param {Object} rules - { operator: 'AND'|'OR', conditions: [...] }
 * @param {Array} contacts - Array of contacts to evaluate
 * @returns {Array} Contacts that match the rules
 */
function evaluateSegmentRules(rules, contacts) {
  if (!rules || !rules.conditions || !Array.isArray(rules.conditions)) {
    return [];
  }
  if (!Array.isArray(contacts)) {
    return [];
  }

  const logicOp = (rules.operator || 'AND').toUpperCase();

  return contacts.filter(contact => {
    const results = rules.conditions.map(cond => _evaluateCondition(cond, contact));

    if (logicOp === 'OR') {
      return results.some(Boolean);
    }
    return results.every(Boolean);
  });
}

/**
 * Calculate overlap between two segments.
 *
 * @param {Array} segmentA - Array of contactIds or contact objects
 * @param {Array} segmentB - Array of contactIds or contact objects
 * @returns {Object} { overlapCount, overlapPercentA, overlapPercentB, commonIds }
 */
function calculateSegmentOverlap(segmentA, segmentB) {
  const idsA = new Set(
    (segmentA || []).map(item => (typeof item === 'string' ? item : (item._id || item.contactId || item.id || '').toString()))
  );
  const idsB = new Set(
    (segmentB || []).map(item => (typeof item === 'string' ? item : (item._id || item.contactId || item.id || '').toString()))
  );

  const commonIds = [];
  for (const id of idsA) {
    if (idsB.has(id)) commonIds.push(id);
  }

  return {
    overlapCount: commonIds.length,
    overlapPercentA: idsA.size > 0 ? Math.round((commonIds.length / idsA.size) * 10000) / 100 : 0,
    overlapPercentB: idsB.size > 0 ? Math.round((commonIds.length / idsB.size) * 10000) / 100 : 0,
    sizeA: idsA.size,
    sizeB: idsB.size,
    commonIds
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _emptySegments() {
  const segments = {};
  for (const key of Object.values(PREDEFINED_SEGMENTS)) {
    segments[key] = [];
  }
  return { segments, definitions: SEGMENT_DEFINITIONS, totalContacts: 0, generatedAt: new Date().toISOString() };
}

function _findNearestSegment(score, churnRisk, lifecycleIndex, ageDays) {
  // Use simple distance to centroids
  const centroids = {
    [PREDEFINED_SEGMENTS.HIGH_VALUE_ACTIVE]: { score: 85, churn: 0.1, lifecycle: 5 },
    [PREDEFINED_SEGMENTS.AT_RISK_HIGH_VALUE]: { score: 55, churn: 0.7, lifecycle: 5 },
    [PREDEFINED_SEGMENTS.GROWING_ACCOUNTS]: { score: 55, churn: 0.2, lifecycle: 3 },
    [PREDEFINED_SEGMENTS.DORMANT_LEADS]: { score: 15, churn: 0.5, lifecycle: 1 },
    [PREDEFINED_SEGMENTS.NEW_PROSPECTS]: { score: 30, churn: 0.2, lifecycle: 1 }
  };

  let bestSegment = PREDEFINED_SEGMENTS.DORMANT_LEADS;
  let bestDist = Infinity;

  for (const [seg, centroid] of Object.entries(centroids)) {
    const dist = Math.sqrt(
      Math.pow((score - centroid.score) / 100, 2) +
      Math.pow(churnRisk - centroid.churn, 2) +
      Math.pow((lifecycleIndex - centroid.lifecycle) / 6, 2)
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestSegment = seg;
    }
  }

  return bestSegment;
}

function _evaluateCondition(condition, contact) {
  const { field, operator, value } = condition;
  const fieldValue = _getNestedValue(contact, field);

  switch (operator) {
    case 'equals':
      return fieldValue == value; // eslint-disable-line eqeqeq
    case 'not_equals':
      return fieldValue != value; // eslint-disable-line eqeqeq
    case 'contains':
      if (typeof fieldValue === 'string') return fieldValue.includes(value);
      if (Array.isArray(fieldValue)) return fieldValue.includes(value);
      return false;
    case 'gt':
      return Number(fieldValue) > Number(value);
    case 'lt':
      return Number(fieldValue) < Number(value);
    case 'gte':
      return Number(fieldValue) >= Number(value);
    case 'lte':
      return Number(fieldValue) <= Number(value);
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    case 'not_in':
      return Array.isArray(value) && !value.includes(fieldValue);
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const num = Number(fieldValue);
        return num >= Number(value[0]) && num <= Number(value[1]);
      }
      return false;
    case 'exists':
      return value ? (fieldValue !== undefined && fieldValue !== null) : (fieldValue === undefined || fieldValue === null);
    default:
      return false;
  }
}

function _getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

module.exports = {
  autoSegment,
  suggestSegments,
  evaluateSegmentRules,
  calculateSegmentOverlap,
  PREDEFINED_SEGMENTS,
  SEGMENT_DEFINITIONS
};
