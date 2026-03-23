'use strict';

/**
 * CDP Profile Unifier
 *
 * Merges contact profiles, resolves identities across channels,
 * detects duplicates using fuzzy matching, and builds unified profiles.
 */

const eventProcessor = require('./eventProcessor');

/**
 * Unify profiles that share common identities.
 * Groups contacts by matching identity values (email, phone, device_id, etc.).
 *
 * @param {Array} identities - Array of { contactId, identities: [{ type, value }] }
 * @returns {Object} { groups, mergeRecommendations }
 */
function unifyProfiles(identities) {
  if (!Array.isArray(identities) || identities.length === 0) {
    return { groups: [], mergeRecommendations: [] };
  }

  // Build identity-to-contacts index
  const identityIndex = new Map(); // "type:value" -> Set of contactIds

  for (const entry of identities) {
    const contactId = (entry.contactId || entry._id || '').toString();
    const contactIdentities = entry.identities || [];

    for (const ident of contactIdentities) {
      if (!ident.type || !ident.value) continue;
      const key = `${ident.type}:${ident.value.toLowerCase().trim()}`;
      if (!identityIndex.has(key)) {
        identityIndex.set(key, new Set());
      }
      identityIndex.get(key).add(contactId);
    }
  }

  // Find connected components using union-find
  const parent = {};
  function find(x) {
    if (!parent[x]) parent[x] = x;
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  // Union contacts that share any identity
  for (const contactIds of identityIndex.values()) {
    const ids = Array.from(contactIds);
    for (let i = 1; i < ids.length; i++) {
      union(ids[0], ids[i]);
    }
  }

  // Group by root
  const groups = {};
  const allContactIds = new Set();
  for (const entry of identities) {
    const cid = (entry.contactId || entry._id || '').toString();
    allContactIds.add(cid);
    const root = find(cid);
    if (!groups[root]) groups[root] = [];
    groups[root].push(cid);
  }

  // Build merge recommendations (only groups with > 1 contact)
  const mergeRecommendations = [];
  const groupList = [];

  for (const [root, members] of Object.entries(groups)) {
    groupList.push({
      unifiedId: root,
      contactIds: [...new Set(members)],
      memberCount: new Set(members).size
    });

    if (new Set(members).size > 1) {
      const uniqueMembers = [...new Set(members)];
      mergeRecommendations.push({
        primaryId: uniqueMembers[0],
        secondaryIds: uniqueMembers.slice(1),
        sharedIdentities: _findSharedIdentities(uniqueMembers, identities),
        confidence: Math.min(1, uniqueMembers.length * 0.3 + 0.4)
      });
    }
  }

  return {
    groups: groupList,
    mergeRecommendations,
    totalProfiles: allContactIds.size,
    unifiedProfiles: groupList.length,
    duplicateGroups: mergeRecommendations.length
  };
}

/**
 * Resolve a contact identity from any identifier.
 *
 * @param {Object} identifier - { type, value } e.g. { type: 'email', value: 'test@example.com' }
 * @param {Array} contacts - Array of contacts to search
 * @returns {Object|null} Matched contact or null
 */
function resolveIdentity(identifier, contacts) {
  if (!identifier || !identifier.type || !identifier.value) {
    throw new Error('Identifier with type and value is required');
  }
  if (!Array.isArray(contacts)) {
    return null;
  }

  const searchValue = identifier.value.toLowerCase().trim();
  const searchType = identifier.type.toLowerCase().trim();

  for (const contact of contacts) {
    // Check direct fields
    if (searchType === 'email' && contact.email && contact.email.toLowerCase().trim() === searchValue) {
      return contact;
    }
    if (searchType === 'phone' && contact.phone && contact.phone.replace(/\D/g, '') === searchValue.replace(/\D/g, '')) {
      return contact;
    }

    // Check identities array
    if (Array.isArray(contact.identities)) {
      for (const ident of contact.identities) {
        if (ident.type === searchType && ident.value && ident.value.toLowerCase().trim() === searchValue) {
          return contact;
        }
      }
    }

    // Check unifiedProfileId
    if (searchType === 'unified_profile_id' && contact.unifiedProfileId === searchValue) {
      return contact;
    }
  }

  return null;
}

/**
 * Merge two contacts into one unified profile.
 *
 * @param {Object} primary - Primary contact (will be the surviving record)
 * @param {Object} secondary - Secondary contact (will be merged into primary)
 * @returns {Object} Merged contact data
 */
function mergeContacts(primary, secondary) {
  if (!primary || !secondary) {
    throw new Error('Both primary and secondary contacts are required');
  }

  const merged = { ...primary };

  // Merge identities
  const identitySet = new Set();
  const mergedIdentities = [];

  for (const ident of (primary.identities || [])) {
    const key = `${ident.type}:${ident.value}`;
    if (!identitySet.has(key)) {
      identitySet.add(key);
      mergedIdentities.push(ident);
    }
  }
  for (const ident of (secondary.identities || [])) {
    const key = `${ident.type}:${ident.value}`;
    if (!identitySet.has(key)) {
      identitySet.add(key);
      mergedIdentities.push(ident);
    }
  }
  merged.identities = mergedIdentities;

  // Merge tags (union)
  const tagSet = new Set([...(primary.tags || []), ...(secondary.tags || [])]);
  merged.tags = Array.from(tagSet);

  // Fill in missing fields from secondary
  const fillableFields = ['phone', 'company', 'title', 'source', 'address'];
  for (const field of fillableFields) {
    if (!merged[field] || (typeof merged[field] === 'object' && !_hasValues(merged[field]))) {
      if (secondary[field] && (typeof secondary[field] !== 'object' || _hasValues(secondary[field]))) {
        merged[field] = secondary[field];
      }
    }
  }

  // Take the higher engagement score
  merged.engagementScore = Math.max(primary.engagementScore || 0, secondary.engagementScore || 0);
  merged.aiScore = Math.max(primary.aiScore || 0, secondary.aiScore || 0);
  merged.totalInteractions = (primary.totalInteractions || 0) + (secondary.totalInteractions || 0);

  // Take the most recent activity
  const primaryActivity = primary.lastActivity ? new Date(primary.lastActivity) : new Date(0);
  const secondaryActivity = secondary.lastActivity ? new Date(secondary.lastActivity) : new Date(0);
  merged.lastActivity = primaryActivity > secondaryActivity ? primary.lastActivity : secondary.lastActivity;

  // Take the earlier creation date
  const primaryCreated = primary.createdAt ? new Date(primary.createdAt) : new Date();
  const secondaryCreated = secondary.createdAt ? new Date(secondary.createdAt) : new Date();
  merged.createdAt = primaryCreated < secondaryCreated ? primary.createdAt : secondary.createdAt;

  // Take the most advanced lifecycle
  const lifecycleOrder = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];
  const primaryLifecycleIdx = lifecycleOrder.indexOf(primary.lifecycle || 'subscriber');
  const secondaryLifecycleIdx = lifecycleOrder.indexOf(secondary.lifecycle || 'subscriber');
  merged.lifecycle = primaryLifecycleIdx >= secondaryLifecycleIdx ? primary.lifecycle : secondary.lifecycle;

  // Merge custom fields
  merged.customFields = { ...(secondary.customFields || {}), ...(primary.customFields || {}) };

  // Keep AI segments from both
  const segmentSet = new Set([...(primary.aiSegments || []), ...(secondary.aiSegments || [])]);
  merged.aiSegments = Array.from(segmentSet);

  // Consent: keep opt-in if either is opted in; keep unsubscribed if either unsubscribed
  merged.marketingConsent = primary.marketingConsent || secondary.marketingConsent;
  merged.unsubscribed = primary.unsubscribed || secondary.unsubscribed;

  merged._mergedFrom = (secondary._id || secondary.id || 'unknown').toString();
  merged._mergedAt = new Date().toISOString();

  return merged;
}

/**
 * Build a complete unified profile for a contact.
 *
 * @param {Object} contact - Contact document
 * @param {Array} [events] - All events for this contact
 * @param {Array} [deals] - Deals associated with this contact
 * @param {Array} [segments] - Segments this contact belongs to
 * @returns {Object} Unified profile
 */
function buildUnifiedProfile(contact, events = [], deals = [], segments = []) {
  if (!contact) {
    throw new Error('Contact is required');
  }

  const contactId = (contact._id || contact.id || '').toString();

  // Aggregate events
  const eventAggregation = eventProcessor.aggregateEvents(contactId, events);

  // Compute activity timeline (last 12 months, by month)
  const timeline = _buildTimeline(events);

  // Channel preferences from events
  const channelBreakdown = _analyzeChannels(events);

  // Deal summary
  const dealSummary = _summarizeDeals(deals);

  return {
    contactId,
    profile: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      lifecycle: contact.lifecycle,
      status: contact.status,
      source: contact.source,
      address: contact.address,
      tags: contact.tags || [],
      customFields: contact.customFields || {}
    },
    identities: contact.identities || [],
    scores: {
      aiScore: contact.aiScore || 0,
      engagementScore: contact.engagementScore || 0,
      churnRisk: contact.churnRisk || 0,
      predictedLTV: contact.predictedLTV || 0,
      sentimentScore: contact.sentimentScore || 0
    },
    activity: {
      lastActivity: contact.lastActivity,
      totalInteractions: contact.totalInteractions || 0,
      events: eventAggregation
    },
    channels: channelBreakdown,
    deals: dealSummary,
    segments: segments.map(s => ({
      id: (s._id || s.id || '').toString(),
      name: s.name,
      type: s.type
    })),
    timeline,
    preferences: {
      preferredChannel: contact.preferredChannel || 'email',
      marketingConsent: contact.marketingConsent || false,
      unsubscribed: contact.unsubscribed || false
    },
    builtAt: new Date().toISOString()
  };
}

/**
 * Detect potential duplicate contacts using fuzzy matching.
 *
 * @param {Array} contacts - Array of contacts to check
 * @returns {Array} Array of { contactA, contactB, matchScore, matchedFields }
 */
function detectDuplicates(contacts) {
  if (!Array.isArray(contacts) || contacts.length < 2) {
    return [];
  }

  const duplicates = [];

  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const a = contacts[i];
      const b = contacts[j];
      const match = _compareContacts(a, b);

      if (match.score >= 0.6) {
        duplicates.push({
          contactA: (a._id || a.id || i).toString(),
          contactB: (b._id || b.id || j).toString(),
          matchScore: match.score,
          matchedFields: match.fields,
          recommendation: match.score >= 0.9 ? 'auto_merge' : match.score >= 0.75 ? 'review' : 'possible'
        });
      }
    }
  }

  // Sort by match score descending
  duplicates.sort((a, b) => b.matchScore - a.matchScore);
  return duplicates;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _findSharedIdentities(contactIds, identities) {
  const shared = [];
  const contactSet = new Set(contactIds);

  // Build map of identity -> contacts that have it
  const identMap = new Map();
  for (const entry of identities) {
    const cid = (entry.contactId || entry._id || '').toString();
    if (!contactSet.has(cid)) continue;
    for (const ident of (entry.identities || [])) {
      const key = `${ident.type}:${ident.value}`;
      if (!identMap.has(key)) identMap.set(key, new Set());
      identMap.get(key).add(cid);
    }
  }

  for (const [key, cids] of identMap.entries()) {
    if (cids.size > 1) {
      const [type, value] = key.split(':');
      shared.push({ type, value, sharedBy: Array.from(cids) });
    }
  }

  return shared;
}

function _hasValues(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).some(v => v !== undefined && v !== null && v !== '');
}

function _buildTimeline(events) {
  const timeline = {};
  const now = new Date();

  // Initialize last 12 months
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    timeline[key] = 0;
  }

  for (const event of events) {
    const d = new Date(event.timestamp);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in timeline) {
      timeline[key]++;
    }
  }

  return timeline;
}

function _analyzeChannels(events) {
  const channels = {};
  for (const event of events) {
    const source = event.source || 'unknown';
    if (!channels[source]) channels[source] = 0;
    channels[source]++;
  }
  return channels;
}

function _summarizeDeals(deals) {
  if (!Array.isArray(deals) || deals.length === 0) {
    return { total: 0, totalValue: 0, won: 0, lost: 0, open: 0 };
  }

  let totalValue = 0, won = 0, lost = 0, open = 0;
  for (const deal of deals) {
    totalValue += deal.value || 0;
    if (deal.stage === 'closed_won') won++;
    else if (deal.stage === 'closed_lost') lost++;
    else open++;
  }

  return {
    total: deals.length,
    totalValue: Math.round(totalValue * 100) / 100,
    won,
    lost,
    open,
    avgValue: Math.round((totalValue / deals.length) * 100) / 100
  };
}

function _compareContacts(a, b) {
  const fields = [];
  let totalWeight = 0;
  let matchWeight = 0;

  // Email match (highest weight)
  if (a.email && b.email) {
    totalWeight += 40;
    if (a.email.toLowerCase().trim() === b.email.toLowerCase().trim()) {
      matchWeight += 40;
      fields.push('email');
    }
  }

  // Phone match
  if (a.phone && b.phone) {
    totalWeight += 25;
    const phoneA = a.phone.replace(/\D/g, '');
    const phoneB = b.phone.replace(/\D/g, '');
    if (phoneA && phoneB && phoneA === phoneB) {
      matchWeight += 25;
      fields.push('phone');
    }
  }

  // Name match (fuzzy)
  if (a.firstName && b.firstName && a.lastName && b.lastName) {
    totalWeight += 20;
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase().trim();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase().trim();
    const similarity = _stringSimilarity(nameA, nameB);
    if (similarity >= 0.8) {
      matchWeight += 20 * similarity;
      fields.push('name');
    }
  }

  // Company match
  if (a.company && b.company) {
    const compA = typeof a.company === 'string' ? a.company : (a.company.name || '');
    const compB = typeof b.company === 'string' ? b.company : (b.company.name || '');
    if (compA && compB) {
      totalWeight += 15;
      if (_stringSimilarity(compA.toLowerCase(), compB.toLowerCase()) >= 0.8) {
        matchWeight += 15;
        fields.push('company');
      }
    }
  }

  const score = totalWeight > 0 ? Math.round((matchWeight / totalWeight) * 100) / 100 : 0;
  return { score, fields };
}

function _stringSimilarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;

  // Levenshtein-based similarity
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const dist = _levenshtein(a, b);
  return 1 - dist / maxLen;
}

function _levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

module.exports = {
  unifyProfiles,
  resolveIdentity,
  mergeContacts,
  buildUnifiedProfile,
  detectDuplicates
};
