import { useState, useEffect, useRef } from 'react';
import { WidgetProps } from '../types';

interface RadioStation {
  name: string;
  url: string;
  logo?: string;
}

const defaultStations: RadioStation[] = [
  { name: 'SWR3', url: 'https://liveradio.swr.de/sw282p3/swr3/play.mp3', logo: '📻' },
  { name: 'WDR 2', url: 'https://wdr-wdr2-rheinland.icecastssl.wdr.de/wdr/wdr2/rheinland/mp3/128/stream.mp3', logo: '📻' },
  { name: '1LIVE', url: 'https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3', logo: '📻' },
  { name: 'Bayern 3', url: 'https://streams.br.de/bayern3_2.m3u', logo: '📻' },
  { name: 'NDR 2', url: 'https://icecast.ndr.de/ndr/ndr2/niedersachsen/mp3/128/stream.mp3', logo: '📻' },
  { name: 'Radio BOB!', url: 'https://streams.radiobob.de/bob-live/mp3-192/streams.radiobob.de/', logo: '🎸' },
  { name: 'Klassik Radio', url: 'https://stream.klassikradio.de/live/mp3-192', logo: '🎻' },
  { name: 'FluxFM', url: 'https://fluxmusic.api.radiosphere.io/channels/FluxFM/stream.aac', logo: '🎵' },
  { name: 'Sunshine Live', url: 'https://stream.sunshine-live.de/live/mp3-192/stream.sunshine-live.de/', logo: '🎧' },
  { name: 'ENERGY', url: 'https://edge.live.mp3.mdn.newmedia.nacamar.net/ps-nrj_national/livestream.mp3', logo: '⚡' },
];

export default function RadioWidget({ widget, onConfigChange }: WidgetProps) {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', url: '' });

  const audioRef = useRef<HTMLAudioElement>(null);

  // Load stations from config or use defaults
  useEffect(() => {
    const customStations = (widget.config.customStations as RadioStation[]) || [];
    setStations([...defaultStations, ...customStations]);

    const savedVolume = widget.config.volume as number;
    if (savedVolume !== undefined) {
      setVolume(savedVolume);
    }
  }, [widget.config.customStations, widget.config.volume]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playStation = (station: RadioStation) => {
    if (audioRef.current) {
      if (currentStation?.url === station.url && isPlaying) {
        // Pause if same station is playing
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Play new station
        audioRef.current.src = station.url;
        audioRef.current.play().catch(() => {
          // Handle autoplay restrictions
        });
        setCurrentStation(station);
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current && currentStation) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onConfigChange({ ...widget.config, volume: newVolume });
  };

  const addCustomStation = () => {
    if (newStation.name && newStation.url) {
      const customStations = (widget.config.customStations as RadioStation[]) || [];
      const updated = [...customStations, { ...newStation, logo: '📻' }];
      onConfigChange({ ...widget.config, customStations: updated });
      setNewStation({ name: '', url: '' });
      setShowAddForm(false);
    }
  };

  const removeCustomStation = (index: number) => {
    const customStations = (widget.config.customStations as RadioStation[]) || [];
    const updated = customStations.filter((_, i) => i !== index);
    onConfigChange({ ...widget.config, customStations: updated });
  };

  return (
    <div className="radio-widget">
      <audio ref={audioRef} />

      {/* Now Playing Bar */}
      {currentStation && (
        <div className="radio-now-playing">
          <button className="radio-play-btn" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="radio-current-info">
            <span className="radio-current-name">{currentStation.name}</span>
            <span className="radio-current-status">{isPlaying ? 'Läuft...' : 'Pausiert'}</span>
          </div>
          <input
            type="range"
            className="radio-volume"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            title={`Lautstärke: ${Math.round(volume * 100)}%`}
          />
        </div>
      )}

      {/* Station List */}
      <div className="radio-station-list">
        {stations.map((station, index) => (
          <div
            key={`${station.name}-${index}`}
            className={`radio-station ${currentStation?.url === station.url && isPlaying ? 'active' : ''}`}
            onClick={() => playStation(station)}
          >
            <span className="radio-station-logo">{station.logo}</span>
            <span className="radio-station-name">{station.name}</span>
            {index >= defaultStations.length && (
              <button
                className="radio-station-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCustomStation(index - defaultStations.length);
                }}
                title="Entfernen"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Station */}
      <div className="radio-add-section">
        {!showAddForm ? (
          <button className="radio-add-btn" onClick={() => setShowAddForm(true)}>
            + Sender hinzufügen
          </button>
        ) : (
          <div className="radio-add-form">
            <input
              type="text"
              placeholder="Sendername"
              value={newStation.name}
              onChange={(e) => setNewStation(s => ({ ...s, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Stream URL (MP3/AAC)"
              value={newStation.url}
              onChange={(e) => setNewStation(s => ({ ...s, url: e.target.value }))}
            />
            <div className="radio-add-actions">
              <button onClick={addCustomStation}>Hinzufügen</button>
              <button onClick={() => setShowAddForm(false)}>Abbrechen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
