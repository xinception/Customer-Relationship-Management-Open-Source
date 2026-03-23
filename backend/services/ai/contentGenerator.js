'use strict';

/**
 * Content Generator
 *
 * Template-based email content generation with personalization tokens,
 * campaign brief creation, and content personalization.
 */

const TEMPLATES = {
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to {{companyName}}, {{firstName}}!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Welcome, {{firstName}}!</h1>
  <p>We're thrilled to have you join {{companyName}}. Here's what you can do to get started:</p>
  <ol>
    <li>Complete your profile</li>
    <li>Explore our features</li>
    <li>Join our community</li>
  </ol>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
  <p style="margin-top: 20px; color: #666;">If you have any questions, just reply to this email.</p>
  <p>Best,<br/>The {{companyName}} Team</p>
</div>`,
    text: `Welcome, {{firstName}}!\n\nWe're thrilled to have you join {{companyName}}.\n\nGet started: {{ctaUrl}}\n\nBest,\nThe {{companyName}} Team`
  },

  reengagement: {
    name: 'Re-engagement Email',
    subject: 'We miss you, {{firstName}}!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">We've missed you, {{firstName}}!</h1>
  <p>It's been a while since we last saw you. We've been busy improving things, and we'd love to show you what's new.</p>
  <p>Here's what you've been missing:</p>
  <ul>
    <li>{{highlight1}}</li>
    <li>{{highlight2}}</li>
    <li>{{highlight3}}</li>
  </ul>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Come Back & Explore</a>
  <p style="margin-top: 20px; color: #666;">We value your time and attention. Unsubscribe anytime.</p>
</div>`,
    text: `We've missed you, {{firstName}}!\n\nIt's been a while. Here's what's new:\n- {{highlight1}}\n- {{highlight2}}\n- {{highlight3}}\n\nCheck it out: {{ctaUrl}}`
  },

  promotion: {
    name: 'Promotional Email',
    subject: '{{firstName}}, {{discountPercent}}% off just for you!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
  <h1 style="color: #E53E3E; font-size: 36px;">{{discountPercent}}% OFF</h1>
  <h2 style="color: #333;">Exclusive offer for you, {{firstName}}</h2>
  <p>Use code <strong style="font-size: 18px; color: #4F46E5;">{{promoCode}}</strong> at checkout.</p>
  <p>Valid until {{expiryDate}}.</p>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #E53E3E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">Shop Now</a>
  <p style="margin-top: 20px; color: #666; font-size: 12px;">Terms and conditions apply.</p>
</div>`,
    text: `{{discountPercent}}% OFF - Exclusive for you, {{firstName}}!\n\nUse code: {{promoCode}}\nValid until: {{expiryDate}}\n\nShop now: {{ctaUrl}}`
  },

  newsletter: {
    name: 'Newsletter',
    subject: '{{companyName}} Newsletter - {{monthYear}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">{{companyName}} Monthly Update</h1>
  <p>Hi {{firstName}}, here's your monthly digest:</p>
  <h2 style="color: #4F46E5;">Featured</h2>
  <p>{{featuredContent}}</p>
  <h2 style="color: #4F46E5;">What's New</h2>
  <p>{{newContent}}</p>
  <h2 style="color: #4F46E5;">Tips & Tricks</h2>
  <p>{{tipsContent}}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
  <p style="color: #666; font-size: 12px;">You're receiving this because you subscribed to {{companyName}} updates.</p>
</div>`,
    text: `{{companyName}} Monthly Update\n\nHi {{firstName}},\n\nFeatured: {{featuredContent}}\n\nWhat's New: {{newContent}}\n\nTips: {{tipsContent}}`
  },

  follow_up: {
    name: 'Follow-up Email',
    subject: 'Following up on {{topic}}, {{firstName}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi {{firstName}},</p>
  <p>I wanted to follow up on {{topic}}. {{followUpBody}}</p>
  <p>Would you be available for a quick chat this week?</p>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Schedule a Call</a>
  <p style="margin-top: 20px;">Best regards,<br/>{{senderName}}</p>
</div>`,
    text: `Hi {{firstName}},\n\nI wanted to follow up on {{topic}}. {{followUpBody}}\n\nWould you be available for a quick chat? Schedule here: {{ctaUrl}}\n\nBest,\n{{senderName}}`
  },

  cart_abandonment: {
    name: 'Cart Abandonment',
    subject: '{{firstName}}, you left something behind!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Forgot something?</h1>
  <p>Hi {{firstName}}, it looks like you left items in your cart. They're waiting for you!</p>
  <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p><strong>Your cart summary:</strong></p>
    <p>{{cartSummary}}</p>
  </div>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Your Order</a>
  <p style="margin-top: 20px; color: #666;">Need help? Reply to this email.</p>
</div>`,
    text: `Hi {{firstName}},\n\nYou left items in your cart:\n{{cartSummary}}\n\nComplete your order: {{ctaUrl}}`
  },

  event_invitation: {
    name: 'Event Invitation',
    subject: 'You\'re invited: {{eventName}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #4F46E5;">You're Invited!</h1>
  <h2 style="color: #333;">{{eventName}}</h2>
  <p>Hi {{firstName}}, we'd love to see you at our upcoming event.</p>
  <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p><strong>Date:</strong> {{eventDate}}</p>
    <p><strong>Time:</strong> {{eventTime}}</p>
    <p><strong>Location:</strong> {{eventLocation}}</p>
  </div>
  <p>{{eventDescription}}</p>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px;">RSVP Now</a>
</div>`,
    text: `You're Invited: {{eventName}}\n\nHi {{firstName}},\n\nDate: {{eventDate}}\nTime: {{eventTime}}\nLocation: {{eventLocation}}\n\n{{eventDescription}}\n\nRSVP: {{ctaUrl}}`
  },

  thank_you: {
    name: 'Thank You / Post-Purchase',
    subject: 'Thank you for your order, {{firstName}}!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #38A169;">Thank You!</h1>
  <p>Hi {{firstName}}, your order has been confirmed.</p>
  <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p><strong>Order #:</strong> {{orderNumber}}</p>
    <p><strong>Total:</strong> {{orderTotal}}</p>
  </div>
  <p>We'll send tracking details once your order ships.</p>
  <a href="{{ctaUrl}}" style="display: inline-block; background: #38A169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Order</a>
</div>`,
    text: `Thank you, {{firstName}}!\n\nOrder #: {{orderNumber}}\nTotal: {{orderTotal}}\n\nView your order: {{ctaUrl}}`
  }
};

const TOKEN_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Generate email content from a template with parameters.
 *
 * @param {Object} params - { template, data, customHtml, customText }
 * @returns {Object} { subject, html, text, tokens }
 */
function generateEmailContent(params) {
  if (!params) {
    throw new Error('Parameters are required');
  }

  const { template: templateKey, data = {}, customHtml, customText } = params;

  if (customHtml) {
    // Use custom content with personalization
    const html = _replaceTokens(customHtml, data);
    const text = customText ? _replaceTokens(customText, data) : _stripHtml(html);
    const subject = data.subject ? _replaceTokens(data.subject, data) : '';
    return { subject, html, text, tokens: _extractTokens(customHtml) };
  }

  const tmpl = TEMPLATES[templateKey];
  if (!tmpl) {
    throw new Error(`Unknown template: ${templateKey}. Available: ${Object.keys(TEMPLATES).join(', ')}`);
  }

  const subject = _replaceTokens(tmpl.subject, data);
  const html = _replaceTokens(tmpl.html, data);
  const text = _replaceTokens(tmpl.text, data);

  return {
    subject,
    html,
    text,
    templateUsed: templateKey,
    tokens: _extractTokens(tmpl.html)
  };
}

/**
 * Replace personalization tokens in content using contact data.
 *
 * @param {string} template - Content string with {{token}} placeholders
 * @param {Object} contact - Contact document
 * @returns {string} Personalized content
 */
function personalizeContent(template, contact) {
  if (!template || typeof template !== 'string') {
    return template || '';
  }
  if (!contact) {
    return template;
  }

  const tokenMap = {
    firstName: contact.firstName || 'there',
    lastName: contact.lastName || '',
    fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Valued Customer',
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company && typeof contact.company === 'object' ? (contact.company.name || '') : (contact.company || ''),
    title: contact.title || '',
    lifecycle: contact.lifecycle || '',
    status: contact.status || '',
    city: contact.address ? (contact.address.city || '') : '',
    state: contact.address ? (contact.address.state || '') : '',
    country: contact.address ? (contact.address.country || '') : '',
    score: (contact.aiScore || 0).toString(),
    source: contact.source || '',
    preferredChannel: contact.preferredChannel || 'email'
  };

  // Include custom fields
  if (contact.customFields && typeof contact.customFields === 'object') {
    for (const [key, value] of Object.entries(contact.customFields)) {
      tokenMap[`custom_${key}`] = String(value != null ? value : '');
    }
  }

  return _replaceTokens(template, tokenMap);
}

/**
 * Generate a campaign brief based on objective and target audience description.
 *
 * @param {string} objective - Campaign objective
 * @param {Object} audience - Audience description { size, segment, demographics }
 * @returns {Object} Campaign brief
 */
function generateCampaignBrief(objective, audience = {}) {
  if (!objective || typeof objective !== 'string') {
    throw new Error('Campaign objective is required');
  }

  const objectiveLower = objective.toLowerCase();

  // Determine campaign approach based on objective keywords
  let approach, suggestedChannels, keyMetrics, templateRecommendation, toneGuide;

  if (objectiveLower.includes('reengag') || objectiveLower.includes('win back') || objectiveLower.includes('re-engag')) {
    approach = 'Re-engage dormant contacts with a compelling reminder of value and a special incentive.';
    suggestedChannels = ['email', 'push'];
    keyMetrics = ['reactivation_rate', 'open_rate', 'click_rate'];
    templateRecommendation = 'reengagement';
    toneGuide = 'Warm, personal, non-pushy. Show the contact they are valued.';
  } else if (objectiveLower.includes('onboard') || objectiveLower.includes('welcome')) {
    approach = 'Guide new contacts through their first experience with a multi-step onboarding sequence.';
    suggestedChannels = ['email'];
    keyMetrics = ['completion_rate', 'activation_rate', 'engagement_score'];
    templateRecommendation = 'welcome';
    toneGuide = 'Friendly, helpful, educational. Focus on quick wins.';
  } else if (objectiveLower.includes('promot') || objectiveLower.includes('sale') || objectiveLower.includes('discount')) {
    approach = 'Drive conversions with a time-limited promotional offer targeted at qualified segments.';
    suggestedChannels = ['email', 'sms', 'push'];
    keyMetrics = ['conversion_rate', 'revenue', 'roi'];
    templateRecommendation = 'promotion';
    toneGuide = 'Urgent yet authentic. Emphasize exclusivity and value.';
  } else if (objectiveLower.includes('nurtur') || objectiveLower.includes('educat')) {
    approach = 'Build trust and authority through educational content that addresses audience pain points.';
    suggestedChannels = ['email'];
    keyMetrics = ['engagement_rate', 'lifecycle_progression', 'content_consumption'];
    templateRecommendation = 'newsletter';
    toneGuide = 'Authoritative, helpful, value-first. No hard sell.';
  } else if (objectiveLower.includes('upsell') || objectiveLower.includes('cross')) {
    approach = 'Increase customer lifetime value by recommending relevant upgrades or complementary products.';
    suggestedChannels = ['email', 'push'];
    keyMetrics = ['upsell_rate', 'average_order_value', 'revenue'];
    templateRecommendation = 'promotion';
    toneGuide = 'Consultative, benefit-focused. Show how the upgrade solves problems.';
  } else if (objectiveLower.includes('event') || objectiveLower.includes('webinar')) {
    approach = 'Drive registrations for an event through a multi-touch invitation sequence.';
    suggestedChannels = ['email', 'social'];
    keyMetrics = ['registration_rate', 'attendance_rate', 'engagement'];
    templateRecommendation = 'event_invitation';
    toneGuide = 'Exciting, informative. Highlight speakers, topics, and value.';
  } else {
    approach = 'Design a multi-touch campaign aligned with the stated objective, using segmented messaging.';
    suggestedChannels = ['email'];
    keyMetrics = ['open_rate', 'click_rate', 'conversion_rate'];
    templateRecommendation = 'newsletter';
    toneGuide = 'Professional, clear, benefit-oriented.';
  }

  const audienceSize = audience.size || audience.memberCount || 'Unknown';
  const segmentName = audience.segment || audience.name || 'General audience';

  return {
    title: `Campaign Brief: ${objective}`,
    objective,
    approach,
    audience: {
      segment: segmentName,
      estimatedSize: audienceSize,
      demographics: audience.demographics || 'Not specified'
    },
    strategy: {
      suggestedChannels,
      templateRecommendation,
      toneGuide,
      suggestedTouchpoints: 3,
      suggestedDuration: '7-14 days'
    },
    keyMetrics,
    timeline: {
      planning: '2-3 days',
      contentCreation: '3-5 days',
      testing: '1-2 days',
      launch: '1 day',
      monitoring: 'Ongoing'
    },
    generatedAt: new Date().toISOString()
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _replaceTokens(str, data) {
  if (!str || typeof str !== 'string') return str || '';
  return str.replace(TOKEN_REGEX, (match, key) => {
    const value = data[key];
    if (value !== undefined && value !== null) return String(value);
    return match; // Leave unreplaced tokens as-is
  });
}

function _extractTokens(str) {
  if (!str) return [];
  const tokens = new Set();
  let match;
  const re = new RegExp(TOKEN_REGEX.source, 'g');
  while ((match = re.exec(str)) !== null) {
    tokens.add(match[1]);
  }
  return Array.from(tokens);
}

function _stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

module.exports = {
  generateEmailContent,
  personalizeContent,
  generateCampaignBrief,
  TEMPLATES
};
