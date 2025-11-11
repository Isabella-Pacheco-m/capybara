import axiosInstance from '../api/axios';

export const eventService = {
  getAllEvents: async () => {
    const response = await axiosInstance.get('/events/');
    return response.data;
  },

  getEvent: async (id) => {
    const response = await axiosInstance.get(`/events/${id}/`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await axiosInstance.post('/events/', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await axiosInstance.patch(`/events/${id}/`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/events/${id}/`);
    return response.data;
  },

  getEventsByCompany: async (companyId) => {
    const response = await axiosInstance.get(`/events/?company=${companyId}`);
    return response.data;
  },
};