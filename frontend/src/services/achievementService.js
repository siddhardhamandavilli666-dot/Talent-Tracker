import api from './api';

export const achievementService = {
  upload: async (data, file) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => formData.append(key, val));
    if (file) formData.append('media', file);
    const res = await api.post('/achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getByUser: async (userId) => {
    const res = await api.get(`/achievements/${userId}`);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/achievements/${id}`);
    return res.data;
  },
};
