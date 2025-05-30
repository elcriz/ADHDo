import axios from 'axios';

// Dynamic API URL configuration
const getApiUrl = () => {
  // In production, use the same domain as the frontend (since backend serves frontend)
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }

  // In development, use environment variable or localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Todo API
export const todoApi = {
  getTodos: async () => {
    const response = await api.get('/todos');
    return response.data.todos || response.data;
  },

  createTodo: async (todoData: { title: string; description?: string; parent?: string; tags?: string[] }) => {
    const response = await api.post('/todos', todoData);
    return response.data.todo || response.data;
  },

  updateTodo: async (id: string, todoData: { title: string; description?: string; tags?: string[] }) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data.todo || response.data;
  },

  toggleTodo: async (id: string) => {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data.todo || response.data;
  },

  deleteTodo: async (id: string) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },

  deleteCompletedTodos: async () => {
    const response = await api.delete('/todos/completed');
    return response.data;
  },

  deleteTodosByDate: async (date: string) => {
    const response = await api.delete(`/todos/completed/${date}`);
    return response.data;
  },

  reorderTodos: async (todoIds: string[]) => {
    const response = await api.patch('/todos/reorder', { todoIds });
    return response.data;
  },
};

// Tag API
export const tagApi = {
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data.tags || response.data;
  },

  createTag: async (tagData: { name: string }) => {
    const response = await api.post('/tags', tagData);
    return response.data.tag || response.data;
  },

  updateTag: async (id: string, tagData: { name?: string; color?: string }) => {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data.tag || response.data;
  },

  deleteTag: async (id: string) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },
};

export default api;
