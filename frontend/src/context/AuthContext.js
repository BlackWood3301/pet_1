import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = async () => {
    try {
      const { data } = await axiosInstance.post('/user/get_me');
      if (data !== 'Пользователь не вошел') {
        setCurrentUser(data);
      }
    } catch (error) {
      console.log('Не авторизован');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/user/signup', { email, password });
      if (response.data === 'Вход успешно произошел') {
        await checkUserStatus();
        return { success: true };
      } else {
        return { success: false, message: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Ошибка при входе' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axiosInstance.post('/user/login', { name, email, password });
      if (response.data === 'Успешная регистрация пользователя') {
        return { success: true };
      } else {
        return { success: false, message: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Ошибка при регистрации' 
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.delete('/user/log_out');
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Ошибка при выходе' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, checkUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 