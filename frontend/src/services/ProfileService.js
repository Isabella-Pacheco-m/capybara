import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const profileService = {
  getEventPublic: async (eventCode) => {
    const response = await axios.get(`${API_URL}/public/events/${eventCode}/`);
    return response.data;
  },

  checkExistingUser: async (eventCode, email, accessCode) => {
    const response = await axios.post(`${API_URL}/public/events/${eventCode}/check-existing/`, {
      email,
      access_code: accessCode
    });
    return response.data;
  },

  registerProfile: async (eventCode, profileData) => {
    const formData = new FormData();
    
    if (profileData.use_existing_profile) {
      formData.append('use_existing_profile', 'true');
      formData.append('email', profileData.email);
      formData.append('existing_access_code', profileData.existing_access_code);
    } else {
      formData.append('full_name', profileData.full_name);
      formData.append('email', profileData.email);
      formData.append('position', profileData.position);
      formData.append('company_name', profileData.company_name);
      formData.append('bio', profileData.bio || '');
      formData.append('phone', profileData.phone || '');
      formData.append('linkedin_url', profileData.linkedin_url || '');
      formData.append('interests', JSON.stringify(profileData.interests || []));
      
      if (profileData.photo && profileData.photo instanceof File) {
        formData.append('photo', profileData.photo);
      }
    }

    const response = await axios.post(
      `${API_URL}/public/events/${eventCode}/register/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  verifyAccessCode: async (eventCode, accessCode) => {
    const response = await axios.post(
      `${API_URL}/public/events/${eventCode}/verify/`,
      { access_code: accessCode }
    );
    return response.data;
  },

  getDirectory: async (eventCode, accessCode) => {
    const response = await axios.get(
      `${API_URL}/public/events/${eventCode}/directory/?access_code=${accessCode}`
    );
    return response.data;
  },

  getProfile: async (eventCode, accessCode) => {
    const response = await axios.get(
      `${API_URL}/public/events/${eventCode}/profile/?access_code=${accessCode}`
    );
    return response.data;
  },

  updateProfile: async (eventCode, accessCode, profileData) => {
    const formData = new FormData();
    
    formData.append('access_code', accessCode);
    formData.append('full_name', profileData.full_name);
    formData.append('position', profileData.position);
    formData.append('company_name', profileData.company_name);
    formData.append('bio', profileData.bio || '');
    formData.append('phone', profileData.phone || '');
    formData.append('linkedin_url', profileData.linkedin_url || '');
    formData.append('interests', JSON.stringify(profileData.interests || []));
    
    if (profileData.photo && profileData.photo instanceof File) {
      formData.append('photo', profileData.photo);
    }

    const response = await axios.patch(
      `${API_URL}/public/events/${eventCode}/profile/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  updateAvailability: async (eventCode, accessCode, availableSlots) => {
    const response = await axios.patch(
      `${API_URL}/public/events/${eventCode}/profile/`,
      {
        access_code: accessCode,
        available_slots: availableSlots
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};