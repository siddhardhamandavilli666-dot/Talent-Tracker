import api from './api';

export const messageService = {
  getMessages: async () => {
    const res = await api.get('/messages');
    return res.data;
  },

  sendMessage: async (data) => {
    const res = await api.post('/messages', data);
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.put(`/messages/${id}/read`);
    return res.data;
  }
};
