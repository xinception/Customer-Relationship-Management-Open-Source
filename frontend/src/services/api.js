import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Contacts API
// ============================================
export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  bulkUpdate: (ids, data) => api.put('/contacts/bulk', { ids, ...data }),
  bulkDelete: (ids) => api.post('/contacts/bulk-delete', { ids }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: (params) => api.get('/contacts/export', { params, responseType: 'blob' }),
  getTimeline: (id) => api.get(`/contacts/${id}/timeline`),
  addNote: (id, note) => api.post(`/contacts/${id}/notes`, note),
  getTags: () => api.get('/contacts/tags'),
};

// ============================================
// Campaigns API
// ============================================
export const campaignsAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  launch: (id) => api.post(`/campaigns/${id}/launch`),
  pause: (id) => api.post(`/campaigns/${id}/pause`),
  getMetrics: (id) => api.get(`/campaigns/${id}/metrics`),
  getABResults: (id) => api.get(`/campaigns/${id}/ab-results`),
  optimize: (id) => api.post(`/campaigns/${id}/optimize`),
};

// ============================================
// Segments API
// ============================================
export const segmentsAPI = {
  getAll: (params) => api.get('/segments', { params }),
  getById: (id) => api.get(`/segments/${id}`),
  create: (data) => api.post('/segments', data),
  update: (id, data) => api.put(`/segments/${id}`, data),
  delete: (id) => api.delete(`/segments/${id}`),
  preview: (conditions) => api.post('/segments/preview', { conditions }),
  getContacts: (id, params) => api.get(`/segments/${id}/contacts`, { params }),
  getSuggestions: () => api.get('/segments/ai-suggestions'),
};

// ============================================
// Automation API
// ============================================
export const automationAPI = {
  getAll: (params) => api.get('/automation', { params }),
  getById: (id) => api.get(`/automation/${id}`),
  create: (data) => api.post('/automation', data),
  update: (id, data) => api.put(`/automation/${id}`, data),
  delete: (id) => api.delete(`/automation/${id}`),
  activate: (id) => api.post(`/automation/${id}/activate`),
  pause: (id) => api.post(`/automation/${id}/pause`),
  getMetrics: (id) => api.get(`/automation/${id}/metrics`),
  getLogs: (id, params) => api.get(`/automation/${id}/logs`, { params }),
};

// ============================================
// Analytics API
// ============================================
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getContactMetrics: (params) => api.get('/analytics/contacts', { params }),
  getCampaignMetrics: (params) => api.get('/analytics/campaigns', { params }),
  getRevenueMetrics: (params) => api.get('/analytics/revenue', { params }),
  getEngagement: (params) => api.get('/analytics/engagement', { params }),
  getFunnel: (params) => api.get('/analytics/funnel', { params }),
  getCohort: (params) => api.get('/analytics/cohort', { params }),
  exportReport: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

// ============================================
// CDP API
// ============================================
export const cdpAPI = {
  getEvents: (params) => api.get('/cdp/events', { params }),
  getProfile: (id) => api.get(`/cdp/profiles/${id}`),
  searchProfiles: (query) => api.get('/cdp/profiles/search', { params: { q: query } }),
  getDataSources: () => api.get('/cdp/data-sources'),
  getIdentityStats: () => api.get('/cdp/identity-resolution'),
  getEventTypes: () => api.get('/cdp/event-types'),
  getJourney: (contactId) => api.get(`/cdp/journey/${contactId}`),
  trackEvent: (data) => api.post('/cdp/events', data),
};

// ============================================
// AI API
// ============================================
export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
  getPredictions: (params) => api.get('/ai/predictions', { params }),
  getSegmentSuggestions: () => api.get('/ai/segment-suggestions'),
  getCampaignOptimization: (campaignId) => api.get(`/ai/campaigns/${campaignId}/optimize`),
  getChurnRisk: (params) => api.get('/ai/churn-risk', { params }),
  getScoreDistribution: () => api.get('/ai/score-distribution'),
  getContactScore: (id) => api.get(`/ai/contacts/${id}/score`),
  getNextBestAction: (contactId) => api.get(`/ai/contacts/${contactId}/next-action`),
};

// ============================================
// Settings API
// ============================================
export const settingsAPI = {
  getGeneral: () => api.get('/settings'),
  updateGeneral: (data) => api.put('/settings', data),
  getIntegrations: () => api.get('/settings/integrations'),
  updateIntegration: (id, data) => api.put(`/settings/integrations/${id}`, data),
  getAPIKeys: () => api.get('/settings/api-keys'),
  createAPIKey: (data) => api.post('/settings/api-keys', data),
  deleteAPIKey: (id) => api.delete(`/settings/api-keys/${id}`),
};

export default api;
