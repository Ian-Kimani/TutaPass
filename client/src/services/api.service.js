import apiClient from '../lib/apiClient';

/**
 * Service Layer mapping to backend Express API.
 * Emits promptTelemetry automatically whenever an AI call returns.
 */

let onTelemetryCallback = null;

export const registerTelemetryHandler = (callback) => {
  onTelemetryCallback = callback;
};

const handleResponse = (response) => {
  if (response?.promptTelemetry && onTelemetryCallback) {
    onTelemetryCallback(response.promptTelemetry);
  }
  return response?.data;
};

export const apiService = {
  // Syllabi
  getSyllabi: async () => {
    const res = await apiClient.get('/syllabus');
    return handleResponse(res);
  },

  importSyllabus: async (rawText, title, sourceUrl = '') => {
    const res = await apiClient.post('/syllabus/import', { rawText, title, sourceUrl });
    return handleResponse(res);
  },

  // Dashboard & Plan
  getDashboard: async (userId = 'demo-learner', syllabusId = null) => {
    let endpoint = `/dashboard?userId=${userId}`;
    if (syllabusId) {
      endpoint += `&syllabusId=${syllabusId}`;
    }
    const res = await apiClient.get(endpoint);
    return handleResponse(res);
  },

  saveStudyPlan: async (planData) => {
    const res = await apiClient.post('/dashboard/plan', planData);
    return handleResponse(res);
  },

  resetDemo: async () => {
    const res = await apiClient.post('/dashboard/reset-demo');
    return handleResponse(res);
  },

  // Quiz Arena
  getQuizQuestions: async (syllabusId = null, domainId = null, limit = 20, balanced = false) => {
    const params = new URLSearchParams();
    if (syllabusId) params.append('syllabusId', syllabusId);
    if (domainId) params.append('domainId', domainId);
    params.append('limit', limit);
    if (balanced) params.append('balanced', 'true');
    const res = await apiClient.get(`/quiz?${params.toString()}`);
    return handleResponse(res);
  },

  submitQuizAttempt: async (attemptData) => {
    const res = await apiClient.post('/quiz/attempt', attemptData);
    return handleResponse(res);
  },

  generateMoreQuestions: async (generateData) => {
    const res = await apiClient.post('/quiz/generate', generateData);
    return handleResponse(res);
  },

  // Flashcards (Spaced Repetition)
  getFlashcards: async (userId = 'demo-learner', syllabusId = null) => {
    let endpoint = `/flashcards?userId=${userId}`;
    if (syllabusId) {
      endpoint += `&syllabusId=${syllabusId}`;
    }
    const res = await apiClient.get(endpoint);
    return handleResponse(res);
  },

  reviewFlashcard: async (cardId, rating) => {
    const res = await apiClient.post(`/flashcards/${cardId}/review`, { rating });
    return handleResponse(res);
  },

  // On-demand AI Explanation
  explainConcept: async (concept, topic, mode = 'african_context') => {
    const res = await apiClient.post('/ai/explain', { concept, topic, mode });
    return handleResponse(res);
  },

  evaluateTeachBack: async (payload) => {
    const res = await apiClient.post('/ai/teach-back', payload);
    return handleResponse(res);
  },
};

export default apiService;
