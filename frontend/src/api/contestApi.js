import api from './axios';

export const contestApi = {
  getAllContests: () => api.get('/contests'),
  getContestDetail: (id) => api.get(`/contests/${id}`),
  createContest: (data) => api.post('/contests', data),
  publishContest: (id) => api.post(`/contests/${id}/publish`),
  assignProblems: (id, problems) => api.post(`/contests/${id}/problems`, problems),
  joinContest: (id) => api.post(`/contests/${id}/join`),
  startContestNow: (id) => api.post(`/contests/${id}/start-now`),
  getContestLeaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
  getContestSubmissions: (id) => api.get(`/contests/${id}/submissions`),
};
