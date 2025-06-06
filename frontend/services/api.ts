import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Blocklist API endpoints
export const blocklistApi = {
  getAll: (): Promise<AxiosResponse<any[]>> => 
    api.get('/blocklist'),
  
  create: (data: any): Promise<AxiosResponse<any>> => 
    api.post('/blocklist', data),
  
  update: (id: string, data: any): Promise<AxiosResponse<any>> => 
    api.patch(`/blocklist/${id}`, data),
  
  delete: (id: string): Promise<AxiosResponse<void>> => 
    api.delete(`/blocklist/${id}`),
  
  toggle: (id: string): Promise<AxiosResponse<any>> => 
    api.patch(`/blocklist/${id}/toggle`),
  
  getActive: (): Promise<AxiosResponse<any[]>> => 
    api.get('/blocklist/active'),
};

// Session API endpoints
export const sessionApi = {
  create: (data: any): Promise<AxiosResponse<any>> => 
    api.post('/sessions', data),
  
  getTodayStats: (): Promise<AxiosResponse<any>> => 
    api.get('/sessions/stats/today'),
  
  getWeeklyStats: (): Promise<AxiosResponse<any>> => 
    api.get('/sessions/stats/weekly'),
};

// Analytics API endpoints
export const analyticsApi = {
  getDailyStats: (days?: number): Promise<AxiosResponse<any>> => 
    api.get(`/analytics/daily${days ? `?days=${days}` : ''}`),
  
  getWeeklyStats: (weeks?: number): Promise<AxiosResponse<any>> => 
    api.get(`/analytics/weekly${weeks ? `?weeks=${weeks}` : ''}`),
  
  getProductivityHours: (days?: number): Promise<AxiosResponse<any>> => 
    api.get(`/analytics/productivity-hours${days ? `?days=${days}` : ''}`),
  
  getSessionTypes: (days?: number): Promise<AxiosResponse<any>> => 
    api.get(`/analytics/session-types${days ? `?days=${days}` : ''}`),
  
  getInsights: (): Promise<AxiosResponse<any>> => 
    api.get('/analytics/insights'),
  
  getOverview: (): Promise<AxiosResponse<any>> => 
    api.get('/analytics/overview'),
};

export default api; 