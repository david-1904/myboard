import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  currentBg: BackgroundConfig;
  onSave: (config: BackgroundConfig) => void;
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'picsum' | 'custom';
  value: string;
  blur?: number;
  opacity?: number;
}

const GRADIENT_PRESETS = [
  { id: 'sunset', name: 'Sonnenuntergang', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'ocean', name: 'Ozean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'forest', name: 'Wald', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'night', name: 'Nacht', value: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)' },
  { id: 'aurora', name: 'Aurora', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #7c3aed 100%)' },
  { id: 'fire', name: 'Feuer', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { id: 'midnight', name: 'Mitternacht', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'cosmic', name: 'Kosmos', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
];

const COLOR_PRESETS = [
  '#f0f2f5',
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#1b262c',
  '#2d4059',
  '#222831',
  '#393e46',
];

export default function BackgroundSettings({ open, onClose, currentBg, onSave }: Props) {
  const [type, setType] = useState<'color' | 'gradient' | 'picsum' | 'custom'>(currentBg.type);
  const [value, setValue] = useState(currentBg.value);
  const [blur, setBlur] = useState(currentBg.blur ?? 0);
  const [opacity, setOpacity] = useState(currentBg.opacity ?? 0.3);

  if (!open) return null;

  const handleSave = () => {
    onSave({ type, value, blur, opacity });
    onClose();
  };

  const handleNewPicsum = () => {
    const seed = Date.now().toString();
    setValue(seed);
    onSave({ type: 'picsum', value: seed, blur, opacity });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog bg-dialog" onClick={e => e.stopPropagation()}>
        <h3>Hintergrund</h3>

        <div className="bg-tabs">
          <button
            className={`bg-tab ${type === 'color' ? 'active' : ''}`}
            onClick={() => setType('color')}
          >
            Farbe
          </button>
          <button
            className={`bg-tab ${type === 'gradient' ? 'active' : ''}`}
            onClick={() => setType('gradient')}
          >
            Verlauf
          </button>
          <button
            className={`bg-tab ${type === 'picsum' ? 'active' : ''}`}
            onClick={() => setType('picsum')}
          >
            Foto
          </button>
          <button
            className={`bg-tab ${type === 'custom' ? 'active' : ''}`}
            onClick={() => setType('custom')}
          >
            URL
          </button>
        </div>

        <div className="bg-content">
          {type === 'color' && (
            <div className="bg-colors">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  className={`bg-color-btn ${value === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setValue(color)}
                />
              ))}
              <input
                type="color"
                value={value.startsWith('#') ? value : '#f0f2f5'}
                onChange={e => setValue(e.target.value)}
                className="bg-color-picker"
              />
            </div>
          )}

          {type === 'gradient' && (
            <div className="bg-gradients">
              {GRADIENT_PRESETS.map(grad => (
                <button
                  key={grad.id}
                  className={`bg-gradient-btn ${value === grad.value ? 'active' : ''}`}
                  style={{ background: grad.value }}
                  onClick={() => setValue(grad.value)}
                  title={grad.name}
                />
              ))}
            </div>
          )}

          {type === 'picsum' && (
            <>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                Zufälliges Foto von Picsum.photos
              </p>
              <button className="btn btn-refresh" onClick={handleNewPicsum}>
                Neues Foto laden
              </button>
            </>
          )}

          {type === 'custom' && (
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={type === 'custom' ? value : ''}
              onChange={e => setValue(e.target.value)}
              className="bg-url-input"
            />
          )}

          {(type === 'picsum' || type === 'custom') && (
            <div className="bg-sliders">
              <label>
                Blur: {blur}px
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={e => setBlur(Number(e.target.value))}
                />
              </label>
              <label>
                Abdunkeln: {Math.round(opacity * 100)}%
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={opacity * 100}
                  onChange={e => setOpacity(Number(e.target.value) / 100)}
                />
              </label>
            </div>
          )}
        </div>

        <div className="bg-actions">
          <button className="btn btn-add" onClick={handleSave}>Speichern</button>
          <button className="dialog-close" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

export function getBackgroundStyle(config: BackgroundConfig): React.CSSProperties {
  if (config.type === 'color') {
    return { background: config.value };
  }

  if (config.type === 'gradient') {
    return { background: config.value };
  }

  const imageUrl = config.type === 'picsum'
    ? `https://picsum.photos/seed/${config.value}/1920/1080`
    : config.value;

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };
}
