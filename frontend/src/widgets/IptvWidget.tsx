import { useState, useEffect, useRef, useCallback } from 'react';
import { WidgetProps } from '../types';
import {
  XtreamCredentials,
  Category,
  LiveStream,
  getLiveCategories,
  getLiveStreams,
  buildStreamUrl,
  getAccountInfo,
} from '../api/xtreamApi';
import Hls from 'hls.js';

type View = 'settings' | 'channels' | 'player';

export default function IptvWidget({ widget, onConfigChange }: WidgetProps) {
  const [view, setView] = useState<View>('settings');
  const [credentials, setCredentials] = useState<XtreamCredentials>({
    server: (widget.config.server as string) || '',
    username: (widget.config.username as string) || '',
    password: (widget.config.password as string) || '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [currentChannel, setCurrentChannel] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const hasCredentials = credentials.server && credentials.username && credentials.password;

  useEffect(() => {
    const saved = {
      server: (widget.config.server as string) || '',
      username: (widget.config.username as string) || '',
      password: (widget.config.password as string) || '',
    };
    setCredentials(saved);
    if (saved.server && saved.username && saved.password) {
      setView('channels');
    }
  }, [widget.config.server, widget.config.username, widget.config.password]);

  const loadCategories = useCallback(async () => {
    if (!hasCredentials) return;
    setLoading(true);
    setError(null);
    try {
      await getAccountInfo(credentials);
      const cats = await getLiveCategories(credentials);
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0].category_id);
      }
    } catch (e) {
      setError('Verbindung fehlgeschlagen. Überprüfe die Zugangsdaten.');
      setView('settings');
    } finally {
      setLoading(false);
    }
  }, [credentials, hasCredentials]);

  useEffect(() => {
    if (view === 'channels' && categories.length === 0 && hasCredentials) {
      loadCategories();
    }
  }, [view, categories.length, hasCredentials, loadCategories]);

  useEffect(() => {
    if (!selectedCategory || !hasCredentials) return;
    setLoading(true);
    getLiveStreams(credentials, selectedCategory)
      .then(setChannels)
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, credentials, hasCredentials]);

  const playChannel = useCallback((channel: LiveStream) => {
    setCurrentChannel(channel);
    setIsStarted(false);
    setView('player');
  }, []);

  useEffect(() => {
    if (view !== 'player' || !currentChannel || !videoRef.current || !isStarted) return;

    const video = videoRef.current;
    const streamUrl = buildStreamUrl(credentials, currentChannel.stream_id);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    video.muted = false;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Stream konnte nicht geladen werden');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [view, currentChannel, credentials, isStarted]);

  const saveCredentials = () => {
    onConfigChange({
      server: credentials.server,
      username: credentials.username,
      password: credentials.password,
    });
    setView('channels');
    setCategories([]);
  };

  const goBack = () => {
    if (view === 'player') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setCurrentChannel(null);
      setView('channels');
    } else if (view === 'channels') {
      setView('settings');
    }
  };

  return (
    <div className="iptv-widget">
      {view === 'settings' && (
        <div className="iptv-settings">
          <h4>IPTV Einstellungen</h4>
          {error && <div className="iptv-error">{error}</div>}
          <input
            type="text"
            placeholder="Server URL (http://...)"
            value={credentials.server}
            onChange={(e) => setCredentials(c => ({ ...c, server: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Benutzername"
            value={credentials.username}
            onChange={(e) => setCredentials(c => ({ ...c, username: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Passwort"
            value={credentials.password}
            onChange={(e) => setCredentials(c => ({ ...c, password: e.target.value }))}
          />
          <button onClick={saveCredentials} disabled={!hasCredentials}>
            Verbinden
          </button>
        </div>
      )}

      {view === 'channels' && (
        <div className="iptv-channels">
          <div className="iptv-header">
            <button className="iptv-back" onClick={goBack}>⚙️</button>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="iptv-category-select"
            >
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="iptv-channel-list">
            {loading && <div className="iptv-loading">Laden...</div>}
            {!loading && channels.length === 0 && (
              <div className="iptv-empty">Keine Kanäle in dieser Kategorie</div>
            )}
            {!loading && channels.map(channel => (
              <div
                key={channel.stream_id}
                className="iptv-channel"
                onClick={() => playChannel(channel)}
              >
                {channel.stream_icon && (
                  <img
                    src={channel.stream_icon}
                    alt=""
                    className="iptv-channel-icon"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <span className="iptv-channel-name">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'player' && (
        <div className="iptv-player">
          <div className="iptv-player-header">
            <button className="iptv-back" onClick={goBack}>← Zurück</button>
            <span className="iptv-player-title">{currentChannel?.name}</span>
          </div>
          {error && <div className="iptv-error">{error}</div>}
          {!isStarted ? (
            <div className="iptv-start-overlay" onClick={() => setIsStarted(true)}>
              <div className="iptv-start-button">▶ Stream starten</div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="iptv-video"
              controls
              playsInline
            />
          )}
        </div>
      )}
    </div>
  );
}
