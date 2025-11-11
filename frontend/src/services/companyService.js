import axiosInstance from '../api/axios';

export const companyService = {
  getAllCompanies: async () => {
    const response = await axiosInstance.get('/companies/');
    return response.data;
  },

  getCompany: async (id) => {
    const response = await axiosInstance.get(`/companies/${id}/`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const formData = new FormData();
    
    formData.append('name', companyData.name);
    formData.append('industry', companyData.industry);
    formData.append('description', companyData.description || '');
    formData.append('is_active', companyData.is_active);
    formData.append('primary_color', companyData.primary_color);
    formData.append('secondary_color', companyData.secondary_color);
    formData.append('accent_color', companyData.accent_color);
    
    if (companyData.logo) {
      formData.append('logo', companyData.logo);
    }

    const response = await axiosInstance.post('/companies/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const formData = new FormData();
    
    formData.append('name', companyData.name);
    formData.append('industry', companyData.industry);
    formData.append('description', companyData.description || '');
    formData.append('is_active', companyData.is_active);
    formData.append('primary_color', companyData.primary_color);
    formData.append('secondary_color', companyData.secondary_color);
    formData.append('accent_color', companyData.accent_color);
    
    if (companyData.logo && companyData.logo instanceof File) {
      formData.append('logo', companyData.logo);
    }

    const response = await axiosInstance.patch(`/companies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axiosInstance.delete(`/companies/${id}/`);
    return response.data;
  },
};