import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
}

export async function getGoogleNews(query: string): Promise<RssItem[]> {
  const res = await api.get('/rss/google-news', {
    params: { query },
    responseType: 'text'
  });
  return parseRss(res.data);
}

function parseRss(xml: string): RssItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');

  const result: RssItem[] = [];
  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const source = item.querySelector('source')?.textContent || '';

    result.push({ title, link, pubDate, source });
  });

  return result;
}
