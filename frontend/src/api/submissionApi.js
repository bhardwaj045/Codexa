import api from './axios';

export const submissionApi = {
  runCode: (data) => api.post('/submissions/run', data),
  submit: (data) => api.post('/submissions/submit', data),
  getMySubmissions: () => api.get('/submissions/my'),
  getProblemSubmissions: (problemId) => api.get(`/submissions/problem/${problemId}`),
  getAllSubmissions: () => api.get('/submissions/all'),
};

export const leaderboardApi = {
  getLeaderboard: () => api.get('/leaderboard'),
};

export const dashboardApi = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
};
