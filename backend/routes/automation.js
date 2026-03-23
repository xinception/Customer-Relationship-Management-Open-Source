const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Automation = require('../models/Automation');
const Event = require('../models/Event');

// GET / - List automations with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sort = '-createdAt' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) filter.name = new RegExp(search, 'i');
    if (status) filter.status = status;

    const sortObj = {};
    const sortFields = sort.split(',');
    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    }

    const [automations, total] = await Promise.all([
      Automation.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .populate('enrollmentRules.segment', 'name memberCount')
        .lean(),
      Automation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: automations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch automations', error: error.message });
  }
});

// POST / - Create a new automation
router.post('/', auth, async (req, res) => {
  try {
    const automationData = { ...req.body, createdBy: req.user.id };
    const automation = new Automation(automationData);
    await automation.save();

    const populated = await Automation.findById(automation._id)
      .populate('createdBy', 'name email')
      .populate('enrollmentRules.segment', 'name memberCount');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create automation', error: error.message });
  }
});

// GET /:id - Get a single automation
router.get('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('enrollmentRules.segment', 'name memberCount');

    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    res.json({ success: true, data: automation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch automation', error: error.message });
  }
});

// PUT /:id - Update an automation
router.put('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    if (automation.status === 'active') {
      const restrictedFields = ['trigger', 'enrollmentRules'];
      for (const field of restrictedFields) {
        if (req.body[field] !== undefined) {
          return res.status(400).json({
            success: false,
            message: `Cannot modify ${field} on an active automation. Pause it first.`
          });
        }
      }
    }

    const updated = await Automation.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('enrollmentRules.segment', 'name memberCount');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update automation', error: error.message });
  }
});

// DELETE /:id - Delete an automation
router.delete('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    if (automation.status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active automation. Pause it first.' });
    }

    await Automation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Automation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete automation', error: error.message });
  }
});

// POST /:id/activate - Activate a workflow
router.post('/:id/activate', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    if (automation.status !== 'draft' && automation.status !== 'paused') {
      return res.status(400).json({ success: false, message: `Cannot activate an automation with status "${automation.status}"` });
    }

    if (!automation.trigger || !automation.trigger.type) {
      return res.status(400).json({ success: false, message: 'Automation must have a trigger configured before activation' });
    }

    if (!automation.steps || automation.steps.length === 0) {
      return res.status(400).json({ success: false, message: 'Automation must have at least one step before activation' });
    }

    automation.status = 'active';
    await automation.save();

    res.json({ success: true, data: automation, message: 'Automation activated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to activate automation', error: error.message });
  }
});

// POST /:id/pause - Pause a workflow
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    if (automation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active automations can be paused' });
    }

    automation.status = 'paused';
    await automation.save();

    res.json({ success: true, data: automation, message: 'Automation paused' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to pause automation', error: error.message });
  }
});

// GET /:id/metrics - Get workflow metrics
router.get('/:id/metrics', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id).lean();
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    const metrics = automation.metrics || {};
    const enrolled = metrics.enrolled || 0;

    const stepMetrics = (automation.steps || []).map(step => ({
      id: step.id,
      type: step.type,
      config: step.config
    }));

    res.json({
      success: true,
      data: {
        automationId: automation._id,
        name: automation.name,
        status: automation.status,
        metrics: {
          ...metrics,
          completionRate: enrolled > 0 ? ((metrics.completed || 0) / enrolled * 100).toFixed(2) : 0,
          conversionRate: enrolled > 0 ? ((metrics.converted || 0) / enrolled * 100).toFixed(2) : 0,
          dropRate: enrolled > 0 ? ((metrics.dropped || 0) / enrolled * 100).toFixed(2) : 0
        },
        steps: stepMetrics,
        totalSteps: (automation.steps || []).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch metrics', error: error.message });
  }
});

// POST /:id/steps - Add a step to the workflow
router.post('/:id/steps', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    const { type, config, nextSteps = [], position } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Step type is required' });
    }

    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newStep = {
      id: stepId,
      type,
      config: config || {},
      nextSteps,
      position: position || { x: 0, y: (automation.steps || []).length * 100 }
    };

    automation.steps.push(newStep);
    await automation.save();

    res.status(201).json({
      success: true,
      data: newStep,
      message: 'Step added to automation'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add step', error: error.message });
  }
});

// PUT /:id/steps/:stepId - Update a step
router.put('/:id/steps/:stepId', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    const stepIndex = automation.steps.findIndex(s => s.id === req.params.stepId);
    if (stepIndex === -1) {
      return res.status(404).json({ success: false, message: 'Step not found' });
    }

    const allowedUpdates = ['type', 'config', 'nextSteps', 'position'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        automation.steps[stepIndex][key] = req.body[key];
      }
    }

    await automation.save();

    res.json({
      success: true,
      data: automation.steps[stepIndex],
      message: 'Step updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update step', error: error.message });
  }
});

// DELETE /:id/steps/:stepId - Remove a step
router.delete('/:id/steps/:stepId', auth, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    const stepIndex = automation.steps.findIndex(s => s.id === req.params.stepId);
    if (stepIndex === -1) {
      return res.status(404).json({ success: false, message: 'Step not found' });
    }

    const removedStepId = automation.steps[stepIndex].id;

    // Remove references to this step from other steps' nextSteps
    for (const step of automation.steps) {
      if (step.nextSteps && step.nextSteps.includes(removedStepId)) {
        step.nextSteps = step.nextSteps.filter(id => id !== removedStepId);
      }
    }

    automation.steps.splice(stepIndex, 1);
    await automation.save();

    res.json({ success: true, message: 'Step removed from automation' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove step', error: error.message });
  }
});

module.exports = router;
