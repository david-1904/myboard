import axios from 'axios';
import { DashboardData, WidgetData } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export async function login(username: string, password: string): Promise<{ username: string }> {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
}

export async function register(username: string, password: string): Promise<{ username: string }> {
  const res = await api.post('/auth/register', { username, password });
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<{ username: string }> {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get('/dashboard');
  return res.data;
}

export async function updateLayout(layouts: { id: number; x: number; y: number; w: number; h: number }[]): Promise<void> {
  await api.put('/dashboard/layout', { layouts });
}

export async function addWidget(widgetType: string): Promise<WidgetData> {
  const res = await api.post('/dashboard/widgets', { widgetType });
  return res.data;
}

export async function updateWidgetConfig(id: number, config: Record<string, unknown>): Promise<WidgetData> {
  const res = await api.put(`/dashboard/widgets/${id}/config`, { config });
  return res.data;
}

export async function deleteWidget(id: number): Promise<void> {
  await api.delete(`/dashboard/widgets/${id}`);
}
