const Joi = require('joi');

/**
 * Generic Joi validation middleware factory.
 * Validates req.body, req.query, or req.params against a Joi schema.
 *
 * Usage:
 *   router.post('/contacts', validate(createContactSchema), controller.create);
 *   router.get('/contacts', validate(listQuerySchema, 'query'), controller.list);
 *
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @param {string} source - Request property to validate: 'body' | 'query' | 'params'
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
      return next(new Error('Invalid validation schema'));
    }

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details
      });
    }

    // Replace source data with validated/sanitized values
    req[source] = value;
    next();
  };
};

// ─── Common reusable schemas ────────────────────────────────────────────────

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().trim(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// ─── Contact schemas ────────────────────────────────────────────────────────

const createContactSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().trim().allow(''),
  company: Joi.string().trim().allow(''),
  jobTitle: Joi.string().trim().allow(''),
  avatar: Joi.string().uri().allow(''),
  address: Joi.object({
    street: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow(''),
    country: Joi.string().trim().allow(''),
    zipCode: Joi.string().trim().allow('')
  }),
  social: Joi.object({
    linkedin: Joi.string().trim().allow(''),
    twitter: Joi.string().trim().allow(''),
    facebook: Joi.string().trim().allow('')
  }),
  status: Joi.string().valid('lead', 'prospect', 'customer', 'churned'),
  source: Joi.string().valid('website', 'referral', 'social', 'email', 'ads', 'organic', 'direct', 'import', 'api', 'other'),
  tags: Joi.array().items(Joi.string().trim()),
  customFields: Joi.object().pattern(Joi.string(), Joi.any()),
  lifecycleStage: Joi.string().valid('subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'),
  emailOptIn: Joi.boolean(),
  smsOptIn: Joi.boolean()
});

const updateContactSchema = createContactSchema.fork(
  ['firstName', 'lastName', 'email'],
  (schema) => schema.optional()
);

// ─── Campaign schemas ───────────────────────────────────────────────────────

const createCampaignSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().allow(''),
  type: Joi.string().valid('email', 'sms', 'push', 'social', 'multi-channel').required(),
  status: Joi.string().valid('draft', 'scheduled', 'active', 'paused', 'completed', 'archived'),
  segment: objectId,
  content: Joi.object({
    subject: Joi.string().trim(),
    htmlBody: Joi.string(),
    textBody: Joi.string(),
    templateId: Joi.string()
  }),
  schedule: Joi.object({
    scheduledAt: Joi.date().iso(),
    timezone: Joi.string(),
    frequency: Joi.string().valid('one-time', 'daily', 'weekly', 'monthly')
  }),
  abTesting: Joi.object({
    enabled: Joi.boolean(),
    variants: Joi.array().items(Joi.object({
      name: Joi.string(),
      content: Joi.object({
        subject: Joi.string(),
        htmlBody: Joi.string(),
        textBody: Joi.string()
      }),
      weight: Joi.number().min(0).max(100)
    })),
    winnerCriteria: Joi.string().valid('open_rate', 'click_rate', 'conversion_rate', 'revenue')
  }),
  aiOptimization: Joi.object({
    enabled: Joi.boolean()
  }),
  budget: Joi.number().min(0),
  tags: Joi.array().items(Joi.string().trim())
});

// ─── Segment schemas ────────────────────────────────────────────────────────

const createSegmentSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().allow(''),
  type: Joi.string().valid('static', 'dynamic', 'ai-predicted'),
  rules: Joi.object({
    conditions: Joi.array().items(Joi.object({
      field: Joi.string().required(),
      operator: Joi.string().valid(
        'equals', 'not_equals', 'contains', 'not_contains',
        'gt', 'lt', 'gte', 'lte', 'in', 'not_in',
        'between', 'exists', 'not_exists', 'starts_with', 'ends_with'
      ).required(),
      value: Joi.any().required()
    })),
    logic: Joi.string().valid('and', 'or')
  }),
  aiCriteria: Joi.object({
    model: Joi.string(),
    threshold: Joi.number().min(0).max(1),
    features: Joi.array().items(Joi.string())
  }),
  contacts: Joi.array().items(objectId),
  autoUpdate: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim())
});

// ─── Event schemas ──────────────────────────────────────────────────────────

const createEventSchema = Joi.object({
  contact: objectId,
  anonymousId: Joi.string().trim(),
  eventType: Joi.string().valid(
    'page_view', 'click', 'purchase', 'email_open', 'email_click',
    'form_submit', 'custom', 'login', 'signup', 'product_view',
    'add_to_cart', 'checkout', 'search', 'campaign_interaction',
    'support_ticket'
  ).required(),
  eventName: Joi.string().trim().required(),
  properties: Joi.object(),
  context: Joi.object({
    ip: Joi.string(),
    userAgent: Joi.string(),
    page: Joi.string(),
    referrer: Joi.string(),
    campaign: Joi.object({
      name: Joi.string(),
      source: Joi.string(),
      medium: Joi.string(),
      term: Joi.string(),
      content: Joi.string()
    })
  }),
  source: Joi.string().valid('website', 'mobile', 'email', 'api', 'import', 'system'),
  sessionId: Joi.string().trim(),
  timestamp: Joi.date().iso(),
  revenue: Joi.number().min(0),
  currency: Joi.string().length(3)
}).or('contact', 'anonymousId');

// ─── Auth schemas ───────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'manager', 'agent')
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

module.exports = {
  validate,
  schemas: {
    objectId,
    pagination: paginationSchema,
    createContact: createContactSchema,
    updateContact: updateContactSchema,
    createCampaign: createCampaignSchema,
    createSegment: createSegmentSchema,
    createEvent: createEventSchema,
    register: registerSchema,
    login: loginSchema
  }
};
