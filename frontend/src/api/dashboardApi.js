import api from './axios';

export const dashboardApi = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getRegisteredUsers: () => api.get('/dashboard/users'),
  getRegistrationLimit: () => api.get('/dashboard/registration-limit'),
  updateRegistrationLimit: (data) => api.put('/dashboard/registration-limit', data),
};
