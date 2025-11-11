import axiosInstance from './axios';

export const authAPI = {
  // Login
  login: async (username, password) => {
    const response = await axiosInstance.post('/auth/login/', {
      username,
      password,
    });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
  },

  // Logout
  logout: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/logout/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};