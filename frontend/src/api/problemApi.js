import api from './axios';

export const problemApi = {
  getProblems: (params) => api.get('/problems', { params }),
  getAllProblems: (params) => api.get('/problems', { params }),
  getProblemById: (id) => api.get(`/problems/${id}`),
  getTopics: () => api.get('/problems/topics'),
  createProblem: (data) => api.post('/problems', data),
  updateProblem: (id, data) => api.put(`/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/problems/${id}`),
};
