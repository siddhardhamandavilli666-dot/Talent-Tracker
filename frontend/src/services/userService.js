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

  searchStudents: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
};
