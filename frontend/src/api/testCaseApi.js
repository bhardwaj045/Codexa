import api from './axios';

export const testCaseApi = {
  getTestCases: (problemId, includeHidden = false) =>
    api.get(`/problems/${problemId}/test-cases`, { params: { includeHidden } }),
  addTestCase: (problemId, data) => api.post(`/problems/${problemId}/test-cases`, data),
  createTestCase: (problemId, data) => api.post(`/problems/${problemId}/test-cases`, data),
  updateTestCase: (problemId, testCaseId, data) =>
    api.put(`/problems/${problemId}/test-cases/${testCaseId}`, data),
  deleteTestCase: (problemId, testCaseId) =>
    api.delete(`/problems/${problemId}/test-cases/${testCaseId}`),
};
