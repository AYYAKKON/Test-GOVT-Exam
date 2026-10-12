import React, { createContext, useContext, useState, useEffect } from 'react';
import { fbLogin, fbRegister } from '../firebase/dbService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('govt_exam_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('govt_exam_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await fbLogin(email, password);
    setUser(userData);
    localStorage.setItem('govt_exam_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const newUser = await fbRegister(userData);
    setUser(newUser);
    localStorage.setItem('govt_exam_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('govt_exam_user');
  };

  const updateUserProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('govt_exam_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAdmin: user && user.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
