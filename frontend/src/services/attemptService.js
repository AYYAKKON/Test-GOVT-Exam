import {
  fbSubmitTestAttempt,
  fbGetUserHistory,
  fbGetAttemptDetails,
  fbGetAdminTestResults,
  fbGetAdminDashboardStats
} from '../firebase/dbService';

const getStoredUser = () => {
  try {
    const str = localStorage.getItem('govt_exam_user');
    return str ? JSON.parse(str) : null;
  } catch (e) {
    return null;
  }
};

export const submitTestAttempt = async (attemptData) => {
  const currentUser = getStoredUser();
  return await fbSubmitTestAttempt(attemptData, currentUser);
};

export const getUserHistory = async () => {
  const currentUser = getStoredUser();
  if (!currentUser?._id) return [];
  return await fbGetUserHistory(currentUser._id);
};

export const getAttemptDetails = async (id) => {
  return await fbGetAttemptDetails(id);
};

export const getAdminTestResults = async (params) => {
  return await fbGetAdminTestResults(params);
};

export const getAdminDashboardStats = async () => {
  return await fbGetAdminDashboardStats();
};
