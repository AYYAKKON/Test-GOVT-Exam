import API from './api';

export const getAvailableTests = async (params) => {
  const res = await API.get('/tests', { params });
  return res.data;
};

export const getTestForAttempt = async (testId) => {
  const res = await API.get(`/tests/${testId}/take`);
  return res.data;
};

// Admin Services
export const getAllTestsAdmin = async (params) => {
  const res = await API.get('/tests/admin/all', { params });
  return res.data;
};

export const getTestByIdAdmin = async (testId) => {
  const res = await API.get(`/tests/${testId}`);
  return res.data;
};

export const createTest = async (testData) => {
  const res = await API.post('/tests', testData);
  return res.data;
};

export const updateTest = async (testId, testData) => {
  const res = await API.put(`/tests/${testId}`, testData);
  return res.data;
};

export const togglePublishTest = async (testId) => {
  const res = await API.post(`/tests/${testId}/publish`);
  return res.data;
};

export const deleteTest = async (testId) => {
  const res = await API.delete(`/tests/${testId}`);
  return res.data;
};

export const duplicateTest = async (testId) => {
  const res = await API.post(`/tests/${testId}/duplicate`);
  return res.data;
};

export const uploadPdf = async (formData) => {
  const res = await API.post('/tests/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const processText = async (rawText) => {
  const res = await API.post('/tests/process-text', { rawText });
  return res.data;
};

export const saveParsedTest = async (payload) => {
  const res = await API.post('/tests/save-parsed-test', payload);
  return res.data;
};
