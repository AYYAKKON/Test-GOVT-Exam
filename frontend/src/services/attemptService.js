import API from './api';

export const submitTestAttempt = async (attemptData) => {
  const res = await API.post('/attempts/submit', attemptData);
  return res.data;
};

export const getUserHistory = async () => {
  const res = await API.get('/attempts/history');
  return res.data;
};

export const getAttemptDetails = async (id) => {
  const res = await API.get(`/attempts/${id}`);
  return res.data;
};

export const getAdminTestResults = async (params) => {
  const res = await API.get('/attempts/admin/all', { params });
  return res.data;
};

export const getAdminDashboardStats = async () => {
  const res = await API.get('/attempts/admin/stats');
  return res.data;
};
