'use strict';

/**
 * Automation Runner
 *
 * Executes marketing automation workflows: processes steps, evaluates conditions,
 * runs actions, and tracks workflow metrics.
 */

const STEP_TYPES = [
  'send_email', 'send_sms', 'wait', 'condition', 'split',
  'update_contact', 'add_tag', 'remove_tag', 'webhook',
  'ai_decision', 'score_lead', 'assign_owner', 'create_deal', 'move_stage'
];

const CONDITION_OPERATORS = [
  'equals', 'not_equals', 'contains', 'not_contains',
  'gt', 'lt', 'gte', 'lte', 'in', 'not_in',
  'is_true', 'is_false', 'exists', 'not_exists',
  'before', 'after', 'between'
];

/**
 * Execute an automation workflow for a specific contact.
 *
 * @param {Object} automation - Automation document with steps
 * @param {Object} contact - Contact document
 * @returns {Object} Execution result with step outcomes
 */
function executeWorkflow(automation, contact) {
  if (!automation) {
    throw new Error('Automation is required');
  }
  if (!contact) {
    throw new Error('Contact is required');
  }

  if (automation.status !== 'active') {
    return {
      success: false,
      error: `Automation "${automation.name}" is not active (status: ${automation.status}).`,
      results: []
    };
  }

  const steps = automation.steps || [];
  if (steps.length === 0) {
    return {
      success: false,
      error: 'Automation has no steps defined.',
      results: []
    };
  }

  const results = [];
  const visited = new Set();
  let currentStepId = steps[0].id;
  let contactState = { ...contact };
  let completed = false;
  let maxIterations = 100; // Safety limit

  while (currentStepId && maxIterations > 0) {
    maxIterations--;

    if (visited.has(currentStepId)) {
      results.push({ stepId: currentStepId, status: 'skipped', reason: 'Loop detected' });
      break;
    }
    visited.add(currentStepId);

    const step = steps.find(s => s.id === currentStepId);
    if (!step) {
      results.push({ stepId: currentStepId, status: 'error', reason: 'Step not found' });
      break;
    }

    const stepResult = processStep(step, contactState);
    results.push(stepResult);

    // Update contact state if the step modified it
    if (stepResult.contactUpdates) {
      contactState = { ...contactState, ...stepResult.contactUpdates };
    }

    // Handle wait steps
    if (step.type === 'wait') {
      results[results.length - 1].waitUntil = _calculateWaitUntil(step.config);
      break; // Pause execution; resume later
    }

    // Handle conditions / splits
    if (step.type === 'condition' || step.type === 'split') {
      currentStepId = stepResult.nextStepId || null;
    } else {
      // Move to next step(s)
      currentStepId = step.nextSteps && step.nextSteps.length > 0 ? step.nextSteps[0] : null;
    }

    if (!currentStepId) {
      completed = true;
    }
  }

  return {
    success: true,
    automationId: (automation._id || automation.id || '').toString(),
    automationName: automation.name,
    contactId: (contact._id || contact.id || '').toString(),
    completed,
    stepsExecuted: results.length,
    results,
    updatedContact: contactState,
    executedAt: new Date().toISOString()
  };
}

/**
 * Process an individual workflow step.
 *
 * @param {Object} step - Workflow step { id, type, config, nextSteps }
 * @param {Object} contact - Current contact state
 * @returns {Object} Step execution result
 */
function processStep(step, contact) {
  if (!step || !step.type) {
    return { stepId: step ? step.id : null, status: 'error', reason: 'Invalid step' };
  }

  if (!STEP_TYPES.includes(step.type)) {
    return { stepId: step.id, status: 'error', reason: `Unknown step type: ${step.type}` };
  }

  const config = step.config || {};

  switch (step.type) {
    case 'condition': {
      const condResult = evaluateCondition(config, contact);
      return {
        stepId: step.id,
        type: 'condition',
        status: 'completed',
        conditionMet: condResult,
        nextStepId: condResult
          ? (step.nextSteps && step.nextSteps[0])
          : (step.nextSteps && step.nextSteps[1]) || null
      };
    }

    case 'split': {
      // Evaluate multiple conditions (split branches)
      const branches = config.branches || [];
      let matchedBranch = null;
      for (let i = 0; i < branches.length; i++) {
        if (evaluateCondition(branches[i].condition, contact)) {
          matchedBranch = i;
          break;
        }
      }
      const nextStepId = matchedBranch !== null && step.nextSteps
        ? step.nextSteps[matchedBranch]
        : (step.nextSteps && step.nextSteps[step.nextSteps.length - 1]) || null; // Default branch

      return {
        stepId: step.id,
        type: 'split',
        status: 'completed',
        matchedBranch,
        nextStepId
      };
    }

    case 'wait': {
      return {
        stepId: step.id,
        type: 'wait',
        status: 'waiting',
        duration: config.duration || config.days || 1,
        unit: config.unit || 'days'
      };
    }

    default: {
      // Execute action steps
      return executeAction({ type: step.type, config }, contact);
    }
  }
}

/**
 * Evaluate a workflow condition against a contact.
 *
 * @param {Object} condition - { field, operator, value } or { conditions, logic }
 * @param {Object} contact - Contact document
 * @returns {boolean} Whether the condition is met
 */
function evaluateCondition(condition, contact) {
  if (!condition) return false;
  if (!contact) return false;

  // Compound conditions
  if (condition.conditions && Array.isArray(condition.conditions)) {
    const logic = (condition.logic || condition.operator || 'AND').toUpperCase();
    const results = condition.conditions.map(c => evaluateCondition(c, contact));
    return logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
  }

  const { field, operator, value } = condition;
  if (!field || !operator) return false;

  const fieldValue = _getNestedValue(contact, field);

  switch (operator) {
    case 'equals':
      return fieldValue == value; // eslint-disable-line eqeqeq
    case 'not_equals':
      return fieldValue != value; // eslint-disable-line eqeqeq
    case 'contains':
      if (typeof fieldValue === 'string') return fieldValue.includes(String(value));
      if (Array.isArray(fieldValue)) return fieldValue.includes(value);
      return false;
    case 'not_contains':
      if (typeof fieldValue === 'string') return !fieldValue.includes(String(value));
      if (Array.isArray(fieldValue)) return !fieldValue.includes(value);
      return true;
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
    case 'is_true':
      return Boolean(fieldValue) === true;
    case 'is_false':
      return Boolean(fieldValue) === false;
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    case 'not_exists':
      return fieldValue === undefined || fieldValue === null;
    case 'before':
      return new Date(fieldValue) < new Date(value);
    case 'after':
      return new Date(fieldValue) > new Date(value);
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const num = Number(fieldValue);
        return num >= Number(value[0]) && num <= Number(value[1]);
      }
      return false;
    default:
      return false;
  }
}

/**
 * Execute a workflow action (send email, update field, add tag, etc.).
 *
 * @param {Object} action - { type, config }
 * @param {Object} contact - Contact document
 * @returns {Object} Action execution result
 */
function executeAction(action, contact) {
  if (!action || !action.type) {
    return { status: 'error', reason: 'Invalid action' };
  }

  const config = action.config || {};
  const contactId = (contact._id || contact.id || '').toString();
  const result = { stepId: config.stepId, type: action.type, contactId };

  switch (action.type) {
    case 'send_email':
      result.status = 'completed';
      result.action = 'send_email';
      result.details = {
        to: contact.email,
        template: config.template || config.emailId || null,
        subject: config.subject || null
      };
      if (!contact.email) {
        result.status = 'skipped';
        result.reason = 'Contact has no email address';
      }
      if (contact.unsubscribed) {
        result.status = 'skipped';
        result.reason = 'Contact is unsubscribed';
      }
      break;

    case 'send_sms':
      result.status = 'completed';
      result.action = 'send_sms';
      result.details = { to: contact.phone, message: config.message || null };
      if (!contact.phone) {
        result.status = 'skipped';
        result.reason = 'Contact has no phone number';
      }
      break;

    case 'update_contact':
      result.status = 'completed';
      result.action = 'update_contact';
      result.contactUpdates = {};
      if (config.fields && typeof config.fields === 'object') {
        for (const [key, val] of Object.entries(config.fields)) {
          result.contactUpdates[key] = val;
        }
      }
      result.details = { fieldsUpdated: Object.keys(result.contactUpdates) };
      break;

    case 'add_tag':
      result.status = 'completed';
      result.action = 'add_tag';
      const currentTags = [...(contact.tags || [])];
      const tagsToAdd = Array.isArray(config.tags) ? config.tags : [config.tag || config.tags];
      for (const tag of tagsToAdd) {
        if (tag && !currentTags.includes(tag)) currentTags.push(tag);
      }
      result.contactUpdates = { tags: currentTags };
      result.details = { tagsAdded: tagsToAdd };
      break;

    case 'remove_tag':
      result.status = 'completed';
      result.action = 'remove_tag';
      const existingTags = [...(contact.tags || [])];
      const tagsToRemove = Array.isArray(config.tags) ? config.tags : [config.tag || config.tags];
      result.contactUpdates = { tags: existingTags.filter(t => !tagsToRemove.includes(t)) };
      result.details = { tagsRemoved: tagsToRemove };
      break;

    case 'webhook':
      result.status = 'completed';
      result.action = 'webhook';
      result.details = {
        url: config.url,
        method: config.method || 'POST',
        payload: { contactId, email: contact.email }
      };
      if (!config.url) {
        result.status = 'error';
        result.reason = 'Webhook URL not configured';
      }
      break;

    case 'ai_decision':
      result.status = 'completed';
      result.action = 'ai_decision';
      // AI decision would integrate with scoring engine
      result.details = {
        decisionType: config.decisionType || 'score_based',
        threshold: config.threshold || 50
      };
      result.conditionMet = (contact.aiScore || 0) >= (config.threshold || 50);
      break;

    case 'score_lead':
      result.status = 'completed';
      result.action = 'score_lead';
      const scoreAdjust = config.adjustment || config.score || 0;
      const newScore = Math.min(100, Math.max(0, (contact.aiScore || 0) + scoreAdjust));
      result.contactUpdates = { aiScore: newScore };
      result.details = { previousScore: contact.aiScore || 0, adjustment: scoreAdjust, newScore };
      break;

    case 'assign_owner':
      result.status = 'completed';
      result.action = 'assign_owner';
      result.contactUpdates = { owner: config.ownerId || config.userId };
      result.details = { assignedTo: config.ownerId || config.userId };
      if (!config.ownerId && !config.userId) {
        result.status = 'error';
        result.reason = 'Owner ID not specified';
      }
      break;

    case 'create_deal':
      result.status = 'completed';
      result.action = 'create_deal';
      result.details = {
        title: config.title || `Deal for ${contact.firstName || 'Contact'}`,
        value: config.value || 0,
        stage: config.stage || 'prospecting'
      };
      break;

    case 'move_stage':
      result.status = 'completed';
      result.action = 'move_stage';
      result.contactUpdates = { lifecycle: config.stage || config.lifecycle };
      result.details = { previousStage: contact.lifecycle, newStage: config.stage || config.lifecycle };
      break;

    default:
      result.status = 'error';
      result.reason = `Unsupported action type: ${action.type}`;
  }

  return result;
}

/**
 * Calculate workflow performance metrics.
 *
 * @param {Object} automation - Automation document with metrics
 * @param {Array} [executionLogs] - Optional execution history
 * @returns {Object} Workflow performance metrics
 */
function getWorkflowMetrics(automation, executionLogs = []) {
  if (!automation) {
    throw new Error('Automation is required');
  }

  const m = automation.metrics || {};
  const enrolled = m.enrolled || 0;
  const completed = m.completed || 0;
  const active = m.active || 0;
  const converted = m.converted || 0;
  const dropped = m.dropped || 0;

  const completionRate = enrolled > 0 ? (completed / enrolled) * 100 : 0;
  const conversionRate = enrolled > 0 ? (converted / enrolled) * 100 : 0;
  const dropOffRate = enrolled > 0 ? (dropped / enrolled) * 100 : 0;

  // Step-level metrics from execution logs
  const stepMetrics = {};
  for (const log of executionLogs) {
    if (!log.results) continue;
    for (const step of log.results) {
      const sid = step.stepId || step.type;
      if (!stepMetrics[sid]) {
        stepMetrics[sid] = { executed: 0, completed: 0, skipped: 0, errors: 0 };
      }
      stepMetrics[sid].executed++;
      if (step.status === 'completed') stepMetrics[sid].completed++;
      if (step.status === 'skipped') stepMetrics[sid].skipped++;
      if (step.status === 'error') stepMetrics[sid].errors++;
    }
  }

  // Average steps per contact
  const avgSteps = executionLogs.length > 0
    ? executionLogs.reduce((sum, l) => sum + (l.stepsExecuted || 0), 0) / executionLogs.length
    : 0;

  // Average time to complete (from logs)
  let avgCompletionTime = null;
  const completedLogs = executionLogs.filter(l => l.completed);
  if (completedLogs.length > 0) {
    // Approximate from execution timestamps if available
    avgCompletionTime = 'Requires execution timestamp tracking';
  }

  return {
    automationId: (automation._id || automation.id || '').toString(),
    automationName: automation.name,
    status: automation.status,
    enrollment: { enrolled, active, completed, converted, dropped },
    rates: {
      completionRate: _round(completionRate),
      conversionRate: _round(conversionRate),
      dropOffRate: _round(dropOffRate)
    },
    stepMetrics,
    avgStepsPerContact: _round(avgSteps),
    totalExecutions: executionLogs.length,
    calculatedAt: new Date().toISOString()
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

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

function _calculateWaitUntil(config) {
  if (!config) return null;
  const now = new Date();
  const duration = config.duration || config.days || 1;
  const unit = config.unit || 'days';

  switch (unit) {
    case 'minutes':
      return new Date(now.getTime() + duration * 60 * 1000);
    case 'hours':
      return new Date(now.getTime() + duration * 60 * 60 * 1000);
    case 'days':
      return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    case 'weeks':
      return new Date(now.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
  }
}

function _round(val) {
  return Math.round(val * 100) / 100;
}

module.exports = {
  executeWorkflow,
  processStep,
  evaluateCondition,
  executeAction,
  getWorkflowMetrics
};
