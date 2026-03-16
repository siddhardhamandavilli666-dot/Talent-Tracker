import api from './api';

export const applicationService = {
  apply: async (data, resumeFile) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => formData.append(key, val));
    if (resumeFile) formData.append('resume', resumeFile);
    const res = await api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getByOpportunity: async (oppId) => {
    const res = await api.get(`/applications/opportunity/${oppId}`);
    return res.data;
  },

  getByStudent: async (studentId) => {
    const res = await api.get(`/applications/student/${studentId}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.put(`/applications/${id}`, { status });
    return res.data;
  },
};
