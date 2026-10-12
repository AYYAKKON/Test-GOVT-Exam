import {
  fbGetUsers,
  fbGetUserById,
  fbCreateUser,
  fbUpdateUser,
  fbDeleteUser,
  fbGetCategories,
  fbCreateCategory,
  fbDeleteCategory
} from '../firebase/dbService';

export const getUsers = async (params) => {
  return await fbGetUsers(params);
};

export const getUserById = async (id) => {
  return await fbGetUserById(id);
};

export const createUser = async (userData) => {
  return await fbCreateUser(userData);
};

export const updateUser = async (id, userData) => {
  return await fbUpdateUser(id, userData);
};

export const deleteUser = async (id) => {
  return await fbDeleteUser(id);
};

export const getCategories = async () => {
  return await fbGetCategories();
};

export const createCategory = async (data) => {
  return await fbCreateCategory(data);
};

export const deleteCategory = async (id) => {
  return await fbDeleteCategory(id);
};
