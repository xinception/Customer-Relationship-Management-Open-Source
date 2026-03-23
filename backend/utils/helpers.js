const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * MongoDB pagination helper.
 * Applies skip/limit to a Mongoose query and returns results with metadata.
 *
 * @param {import('mongoose').Query} query  - Mongoose query (before exec)
 * @param {number}                   page   - Current page (1-based)
 * @param {number}                   limit  - Items per page
 * @returns {Promise<{ data: Array, pagination: Object }>}
 */
const paginate = async (query, page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Clone the query for counting (before skip/limit are applied)
  const countQuery = query.model.find(query.getFilter());
  const [data, total] = await Promise.all([
    query.skip(skip).limit(limitNum).lean(),
    countQuery.countDocuments(),
  ]);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  };
};

/**
 * Generate a signed JWT for the given user ID.
 *
 * @param {string} userId
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Wrap an async Express route handler so thrown errors are forwarded to
 * the Express error-handling middleware automatically.
 *
 * @param {Function} fn - async (req, res, next) => {}
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Calculate a percentage value, returning 0 when the total is zero.
 *
 * @param {number} part
 * @param {number} total
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {number}
 */
const calculatePercentage = (part, total, decimals = 2) => {
  if (!total || total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
};

/**
 * Format a numeric amount as a USD currency string.
 *
 * @param {number} amount
 * @param {string} [currency='USD']
 * @param {string} [locale='en-US']
 * @returns {string}
 */
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Convert a string into a URL-friendly slug.
 *
 * @param {string} text
 * @returns {string}
 */
const slugify = (text) => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars (except spaces & hyphens)
    .replace(/[\s_]+/g, '-')    // collapse whitespace / underscores to hyphens
    .replace(/-+/g, '-')        // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
};

/**
 * Generate a short, random, URL-safe identifier (8 characters).
 *
 * @returns {string}
 */
const randomId = () => {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8);
};

module.exports = {
  paginate,
  generateToken,
  asyncHandler,
  calculatePercentage,
  formatCurrency,
  slugify,
  randomId,
};
