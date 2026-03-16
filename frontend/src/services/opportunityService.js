import api from './api';

export const opportunityService = {
  create: async (data) => {
    const res = await api.post('/opportunities', data);
    return res.data;
  },

  getAll: async (params) => {
    const res = await api.get('/opportunities', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/opportunities/${id}`);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/opportunities/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/opportunities/${id}`);
    return res.data;
  },
};
