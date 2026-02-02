import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export interface XtreamCredentials {
  server: string;
  username: string;
  password: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface AccountInfo {
  user_info: {
    username: string;
    password: string;
    status: string;
    exp_date: string;
    max_connections: string;
    active_cons: string;
  };
  server_info: {
    url: string;
    port: string;
  };
}

export async function getAccountInfo(creds: XtreamCredentials): Promise<AccountInfo> {
  const res = await api.get('/xtream/info', { params: creds });
  return res.data;
}

export async function getLiveCategories(creds: XtreamCredentials): Promise<Category[]> {
  const res = await api.get('/xtream/live-categories', { params: creds });
  return res.data || [];
}

export async function getLiveStreams(creds: XtreamCredentials, categoryId?: string): Promise<LiveStream[]> {
  const res = await api.get('/xtream/live-streams', {
    params: { ...creds, categoryId }
  });
  return res.data || [];
}

export function buildStreamUrl(creds: XtreamCredentials, streamId: number, extension: string = 'm3u8'): string {
  const server = creds.server.endsWith('/') ? creds.server.slice(0, -1) : creds.server;
  return `${server}/live/${creds.username}/${creds.password}/${streamId}.${extension}`;
}
