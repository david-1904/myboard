import { useState, useEffect, useRef, useCallback } from 'react';
import { WidgetProps } from '../types';
import { getGoogleNews, RssItem } from '../api/rssApi';

const PRESETS = [
  { id: 'leverkusen', name: 'Bayer Leverkusen', query: 'Bayer Leverkusen' },
  { id: 'bvb', name: 'Borussia Dortmund', query: 'Borussia Dortmund' },
  { id: 'bayern', name: 'FC Bayern', query: 'FC Bayern München' },
  { id: 'bundesliga', name: 'Bundesliga', query: 'Bundesliga' },
  { id: 'custom', name: 'Eigene Suche', query: '' },
];

export default function RssWidget({ widget, onConfigChange }: WidgetProps) {
  const [query, setQuery] = useState((widget.config.query as string) || 'Bayer Leverkusen');
  const [isCustom, setIsCustom] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getGoogleNews(searchQuery);
      setItems(data.slice(0, 10));
    } catch (err) {
      setError('News konnten nicht geladen werden');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedQuery = (widget.config.query as string) || 'Bayer Leverkusen';
    setQuery(savedQuery);
    const matchingPreset = PRESETS.find(p => p.query === savedQuery && p.id !== 'custom');
    setIsCustom(!matchingPreset);
    if (!matchingPreset) {
      setCustomQuery(savedQuery);
    }
    fetchNews(savedQuery);
  }, [widget.config.query, fetchNews]);

  useEffect(() => {
    refreshRef.current = setInterval(() => {
      fetchNews(query);
    }, 5 * 60 * 1000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [query, fetchNews]);

  const handlePresetChange = (preset: typeof PRESETS[0]) => {
    if (preset.id === 'custom') {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    setQuery(preset.query);
    onConfigChange({ query: preset.query });
    fetchNews(preset.query);
  };

  const handleCustomSearch = () => {
    if (customQuery.trim()) {
      setQuery(customQuery);
      onConfigChange({ query: customQuery });
      fetchNews(customQuery);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const currentPresetId = isCustom ? 'custom' : (PRESETS.find(p => p.query === query && p.id !== 'custom')?.id || 'custom');

  return (
    <div className="rss-widget">
      <div className="rss-header">
        <select
          value={currentPresetId}
          onChange={(e) => {
            const preset = PRESETS.find(p => p.id === e.target.value);
            if (preset) handlePresetChange(preset);
          }}
          className="rss-select"
        >
          {PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {isCustom && (
          <div className="rss-custom">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
              placeholder="Suchbegriff..."
              className="rss-input"
            />
            <button onClick={handleCustomSearch} className="rss-search-btn">Suchen</button>
          </div>
        )}
      </div>

      <div className="rss-content">
        {loading && <div className="rss-loading">Laden...</div>}
        {error && <div className="rss-error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="rss-empty">Keine News gefunden</div>
        )}
        {!loading && !error && items.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rss-item"
          >
            <div className="rss-item-title">{item.title}</div>
            <div className="rss-item-meta">
              {item.source && <span className="rss-item-source">{item.source}</span>}
              <span className="rss-item-date">{formatDate(item.pubDate)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
