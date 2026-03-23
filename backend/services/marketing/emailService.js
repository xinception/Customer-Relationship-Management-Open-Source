'use strict';

/**
 * Email Service
 *
 * Email sending via nodemailer, bulk sending with throttling,
 * open/click tracking, and email configuration management.
 */

const nodemailer = require('nodemailer');

let _transporter = null;

/**
 * Get email configuration from environment or defaults.
 *
 * @returns {Object} Email configuration
 */
function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@crm.example.com',
    replyTo: process.env.EMAIL_REPLY_TO || '',
    // Throttling
    maxPerSecond: parseInt(process.env.EMAIL_MAX_PER_SECOND, 10) || 10,
    maxPerHour: parseInt(process.env.EMAIL_MAX_PER_HOUR, 10) || 1000,
    // Tracking
    trackingDomain: process.env.EMAIL_TRACKING_DOMAIN || '',
    trackOpens: process.env.EMAIL_TRACK_OPENS !== 'false',
    trackClicks: process.env.EMAIL_TRACK_CLICKS !== 'false'
  };
}

/**
 * Get or create the nodemailer transporter.
 *
 * @returns {Object} Nodemailer transporter
 */
function _getTransporter() {
  if (_transporter) return _transporter;

  const config = getEmailConfig();

  _transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth.user ? config.auth : undefined,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: config.maxPerSecond
  });

  return _transporter;
}

/**
 * Send a single email.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} [text] - Plain text content
 * @param {Object} [options] - Additional options { from, replyTo, attachments, headers, emailId }
 * @returns {Object} Send result
 */
async function sendEmail(to, subject, html, text, options = {}) {
  if (!to) {
    throw new Error('Recipient email address is required');
  }
  if (!subject) {
    throw new Error('Email subject is required');
  }
  if (!html && !text) {
    throw new Error('Email content (html or text) is required');
  }

  const config = getEmailConfig();
  const emailId = options.emailId || _generateEmailId();

  // Inject tracking pixel for open tracking
  let trackedHtml = html;
  if (html && config.trackOpens && config.trackingDomain) {
    trackedHtml = _injectOpenTrackingPixel(html, emailId, config.trackingDomain);
  }

  // Wrap links for click tracking
  if (trackedHtml && config.trackClicks && config.trackingDomain) {
    trackedHtml = _wrapLinksForTracking(trackedHtml, emailId, config.trackingDomain);
  }

  const mailOptions = {
    from: options.from || config.from,
    to,
    subject,
    html: trackedHtml || undefined,
    text: text || undefined,
    replyTo: options.replyTo || config.replyTo || undefined,
    attachments: options.attachments || undefined,
    headers: {
      'X-Email-Id': emailId,
      'X-CRM-Campaign': options.campaignId || '',
      ...(options.headers || {})
    }
  };

  try {
    const transporter = _getTransporter();
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      emailId,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      sentAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      emailId,
      error: err.message,
      code: err.code || 'SEND_FAILED',
      sentAt: new Date().toISOString()
    };
  }
}

/**
 * Send bulk emails with throttling.
 *
 * @param {Array} recipients - Array of { to, contact } objects
 * @param {Object} template - { subject, html, text }
 * @param {Object} [options] - { batchSize, delayMs, campaignId, personalizer }
 * @returns {Object} Bulk send results
 */
async function sendBulkEmails(recipients, template, options = {}) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Recipients array is required and cannot be empty');
  }
  if (!template || (!template.html && !template.text)) {
    throw new Error('Email template with html or text content is required');
  }

  const config = getEmailConfig();
  const batchSize = options.batchSize || config.maxPerSecond || 10;
  const delayMs = options.delayMs || 1000;
  const personalizer = options.personalizer || null;

  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    details: [],
    startedAt: new Date().toISOString()
  };

  // Process in batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const batchPromises = batch.map(async (recipient) => {
      const to = recipient.to || (recipient.contact && recipient.contact.email);
      if (!to) {
        results.skipped++;
        results.details.push({ to: null, status: 'skipped', reason: 'No email address' });
        return;
      }

      // Check unsubscribe
      if (recipient.contact && recipient.contact.unsubscribed) {
        results.skipped++;
        results.details.push({ to, status: 'skipped', reason: 'Unsubscribed' });
        return;
      }

      // Personalize content if personalizer is provided
      let subject = template.subject;
      let html = template.html;
      let text = template.text;

      if (personalizer && typeof personalizer === 'function' && recipient.contact) {
        try {
          const personalized = personalizer(template, recipient.contact);
          subject = personalized.subject || subject;
          html = personalized.html || html;
          text = personalized.text || text;
        } catch (_err) {
          // Continue with unpersonalized content
        }
      }

      const result = await sendEmail(to, subject, html, text, {
        campaignId: options.campaignId,
        emailId: _generateEmailId()
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
      }
      results.details.push({ to, ...result });
    });

    await Promise.all(batchPromises);

    // Throttle between batches
    if (i + batchSize < recipients.length) {
      await _delay(delayMs);
    }
  }

  results.completedAt = new Date().toISOString();
  results.durationMs = new Date(results.completedAt) - new Date(results.startedAt);

  return results;
}

/**
 * Track an email open event.
 *
 * @param {string} emailId - Unique email identifier
 * @returns {Object} Tracking event data
 */
function trackOpen(emailId) {
  if (!emailId) {
    throw new Error('Email ID is required');
  }

  return {
    type: 'email_open',
    emailId,
    timestamp: new Date().toISOString(),
    event: {
      type: 'email_open',
      name: 'Email Opened',
      properties: { emailId },
      source: 'system'
    }
  };
}

/**
 * Track a link click event.
 *
 * @param {string} emailId - Unique email identifier
 * @param {string} linkId - Link identifier or URL
 * @returns {Object} Tracking event data
 */
function trackClick(emailId, linkId) {
  if (!emailId) {
    throw new Error('Email ID is required');
  }
  if (!linkId) {
    throw new Error('Link ID is required');
  }

  return {
    type: 'email_click',
    emailId,
    linkId,
    timestamp: new Date().toISOString(),
    event: {
      type: 'email_click',
      name: 'Email Link Clicked',
      properties: { emailId, linkId },
      source: 'system'
    }
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _generateEmailId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `em_${timestamp}_${random}`;
}

function _injectOpenTrackingPixel(html, emailId, trackingDomain) {
  const pixel = `<img src="${trackingDomain}/track/open/${emailId}" width="1" height="1" style="display:none;" alt="" />`;
  // Insert before closing body tag, or append
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  if (html.includes('</div>')) {
    const lastDiv = html.lastIndexOf('</div>');
    return html.slice(0, lastDiv) + pixel + html.slice(lastDiv);
  }
  return html + pixel;
}

function _wrapLinksForTracking(html, emailId, trackingDomain) {
  // Replace href attributes with tracking URLs
  let linkIndex = 0;
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (match, url) => {
    linkIndex++;
    const linkId = `link_${linkIndex}`;
    const trackingUrl = `${trackingDomain}/track/click/${emailId}/${linkId}?url=${encodeURIComponent(url)}`;
    return `href="${trackingUrl}"`;
  });
}

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reset the transporter (useful for testing).
 */
function _resetTransporter() {
  if (_transporter && _transporter.close) {
    _transporter.close();
  }
  _transporter = null;
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  trackOpen,
  trackClick,
  getEmailConfig,
  _resetTransporter
};
