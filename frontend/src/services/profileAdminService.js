import axiosInstance from '../api/axios';

export const profileAdminService = {
  getAllProfiles: async () => {
    const response = await axiosInstance.get('/profiles/');
    return response.data;
  },

  getProfile: async (id) => {
    const response = await axiosInstance.get(`/profiles/${id}/`);
    return response.data;
  },

  deleteProfile: async (id) => {
    const response = await axiosInstance.delete(`/profiles/${id}/`);
    return response.data;
  },

  getProfilesByEvent: async (eventId) => {
    const response = await axiosInstance.get(`/profiles/?event=${eventId}`);
    return response.data;
  },
};