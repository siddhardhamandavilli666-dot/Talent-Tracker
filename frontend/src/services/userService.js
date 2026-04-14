import api from './api';

export const userService = {
  getProfile: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  updateProfile: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  uploadPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post(`/users/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  searchStudents: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
};
