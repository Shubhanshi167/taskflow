import axios from './axiosConfig.js';

// AUTH
export const authAPI = {
  register: (data) => axios.post('/auth/register', data),
  login: (data) => axios.post('/auth/login', data),
  getMe: () => axios.get('/auth/me'),
  updateProfile: (data) => axios.put('/auth/profile', data),
  changePassword: (data) => axios.put('/auth/password', data),
};

// WORKSPACES
export const workspaceAPI = {
  getAll: () => axios.get('/workspaces'),
  getOne: (id) => axios.get(`/workspaces/${id}`),
  create: (data) => axios.post('/workspaces', data),
  update: (id, data) => axios.put(`/workspaces/${id}`, data),
  delete: (id) => axios.delete(`/workspaces/${id}`),
  invite: (id, data) => axios.post(`/workspaces/${id}/invite`, data),
  acceptInvite: (token) => axios.post(`/workspaces/invite/${token}/accept`),
  removeMember: (wsId, memberId) => axios.delete(`/workspaces/${wsId}/members/${memberId}`),
  updateMemberRole: (wsId, memberId, role) => axios.put(`/workspaces/${wsId}/members/${memberId}/role`, { role }),
  getAnalytics: (id) => axios.get(`/workspaces/${id}/analytics`),
};

// TASKS
export const taskAPI = {
  getAll: (workspaceId, params) => axios.get(`/workspaces/${workspaceId}/tasks`, { params }),
  create: (workspaceId, data) => axios.post(`/workspaces/${workspaceId}/tasks`, data),
  update: (taskId, data) => axios.put(`/tasks/${taskId}`, data),
  delete: (taskId) => axios.delete(`/tasks/${taskId}`),
  reorder: (workspaceId, updates) => axios.put(`/workspaces/${workspaceId}/tasks/reorder`, { updates }),
  addComment: (taskId, text) => axios.post(`/tasks/${taskId}/comments`, { text }),
  deleteComment: (taskId, commentId) => axios.delete(`/tasks/${taskId}/comments/${commentId}`),
};

// NOTIFICATIONS
export const notificationAPI = {
  getAll: () => axios.get('/notifications'),
  markRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllRead: () => axios.put('/notifications/read-all'),
  clear: () => axios.delete('/notifications/clear'),
};
export default axios;