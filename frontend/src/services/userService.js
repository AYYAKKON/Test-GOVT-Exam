import API from './api';

export const getUsers = async (params) => {
  const res = await API.get('/users', { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await API.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (userData) => {
  const res = await API.post('/users', userData);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await API.put(`/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/users/${id}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await API.get('/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await API.post('/categories', data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await API.delete(`/categories/${id}`);
  return res.data;
};
