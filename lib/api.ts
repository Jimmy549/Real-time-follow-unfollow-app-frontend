import axios from 'axios';
import { useAppStore } from './store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  followUser: (userId: string) => api.post(`/users/follow/${userId}`),
  unfollowUser: (userId: string) => api.post(`/users/unfollow/${userId}`),
  getAllUsers: () => api.get('/users'),
  getUserById: (userId: string) => api.get(`/users/${userId}`),
  getFollowers: () => api.get('/users/profile'),
  getFollowing: () => api.get('/users/profile'),
};

export const commentsAPI = {
  createComment: (data: any) => api.post('/comments', data),
  getAllComments: () => api.get('/comments'),
  getCommentById: (commentId: string) => api.get(`/comments/${commentId}`),
  likeComment: (commentId: string) => api.post(`/comments/${commentId}/like`),
};

export const notificationsAPI = {
  getUserNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId: string) => api.delete(`/notifications/${notificationId}`),
};