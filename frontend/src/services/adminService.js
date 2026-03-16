import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (params) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  verifyUser: async (id) => {
    const res = await api.put(`/admin/users/${id}/verify`);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  deleteAchievement: async (id) => {
    const res = await api.delete(`/admin/achievements/${id}`);
    return res.data;
  },
};
