import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const networkingService = {
  requestSlot: async (eventCode, accessCode, profileId, timeSlot, message) => {
    const response = await axios.post(
      `${API_URL}/public/events/${eventCode}/networking/request/`,
      {
        access_code: accessCode,
        profile_id: profileId,
        time_slot: timeSlot,
        message: message
      }
    );
    return response.data;
  },

  acceptSlot: async (eventCode, accessCode, slotId) => {
    const response = await axios.patch(
      `${API_URL}/public/events/${eventCode}/networking/${slotId}/`,
      {
        access_code: accessCode,
        status: 'accepted'
      }
    );
    return response.data;
  },

  rejectSlot: async (eventCode, accessCode, slotId) => {
    const response = await axios.patch(
      `${API_URL}/public/events/${eventCode}/networking/${slotId}/`,
      {
        access_code: accessCode,
        status: 'rejected'
      }
    );
    return response.data;
  },

  cancelSlot: async (eventCode, accessCode, slotId) => {
    const response = await axios.delete(
      `${API_URL}/public/events/${eventCode}/networking/${slotId}/?access_code=${accessCode}`
    );
    return response.data;
  },
};