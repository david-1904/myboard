import { useState, useCallback, useMemo, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard } from '../hooks/useDashboard';
import widgetRegistry from '../widgets/registry';
import WidgetWrapper from './WidgetWrapper';
import AddWidgetDialog from './AddWidgetDialog';
import BackgroundSettings, { BackgroundConfig, getBackgroundStyle } from './BackgroundSettings';

const ResponsiveGrid = WidthProvider(Responsive);

const DEFAULT_BG: BackgroundConfig = { type: 'color', value: '#f0f2f5' };

function loadBackground(): BackgroundConfig {
  try {
    const saved = localStorage.getItem('myboard-background');
    return saved ? JSON.parse(saved) : DEFAULT_BG;
  } catch {
    return DEFAULT_BG;
  }
}

function saveBackground(config: BackgroundConfig) {
  localStorage.setItem('myboard-background', JSON.stringify(config));
}

function loadDarkMode(): boolean {
  return localStorage.getItem('myboard-darkmode') === 'true';
}

function saveDarkMode(dark: boolean) {
  localStorage.setItem('myboard-darkmode', dark ? 'true' : 'false');
}

interface Props {
  onLogout: () => void;
  username: string;
}

export default function Board({ onLogout, username }: Props) {
  const { dashboard, loading, error, saveLayout, addWidget, updateWidgetConfig, removeWidget, updateLocalLayout } = useDashboard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bgSettingsOpen, setBgSettingsOpen] = useState(false);
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BG);
  const [bgKey, setBgKey] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setBackground(loadBackground());
    setDarkMode(loadDarkMode());
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newVal = !prev;
      saveDarkMode(newVal);
      return newVal;
    });
  }, []);

  const handleBgSave = useCallback((config: BackgroundConfig) => {
    setBackground(config);
    saveBackground(config);
    setBgKey(k => k + 1);
  }, []);

  const layouts = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.widgets.map(w => ({
      i: String(w.id),
      x: w.layoutX,
      y: w.layoutY,
      w: w.layoutW,
      h: w.layoutH,
      minW: 1,
      minH: 1,
    }));
  }, [dashboard]);

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    updateLocalLayout(layout);
    const items = layout.map(l => ({
      id: Number(l.i),
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
    }));
    saveLayout(items);
  }, [saveLayout, updateLocalLayout]);

  const handleAddWidget = useCallback(async (widgetType: string) => {
    await addWidget(widgetType);
  }, [addWidget]);

  if (loading) return <div className="board-loading">Laden...</div>;
  if (error) return <div className="board-error">Fehler: {error}</div>;
  if (!dashboard) return null;

  const bgImageUrl = background.type === 'picsum'
    ? `https://picsum.photos/seed/${background.value}/1920/1080`
    : background.type === 'custom'
    ? background.value
    : null;

  const isImageBg = background.type === 'picsum' || background.type === 'custom';
  const isGradientOrColor = background.type === 'color' || background.type === 'gradient';

  return (
    <div className={`board-container ${darkMode ? 'dark-mode' : ''}`}>
      {isImageBg && bgImageUrl && (
        <div
          className="board-background"
          style={{
            backgroundImage: `url(${bgImageUrl})`,
            filter: `blur(${background.blur || 0}px)`,
          }}
        />
      )}
      {isImageBg && (
        <div
          className="board-overlay"
          style={{ background: `rgba(0,0,0,${background.opacity || 0})` }}
        />
      )}
      {isGradientOrColor && (
        <div className="board-background" style={{ background: background.value }} />
      )}
      <header className="board-header">
        <h1>{dashboard.name}</h1>
        <div className="board-header-actions">
          <span className="board-username">{username}</span>
          <button className="btn btn-icon" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-icon" onClick={() => setBgSettingsOpen(true)} title="Hintergrund">
            ⚙️
          </button>
          <button className="btn btn-add" onClick={() => setDialogOpen(true)}>+ Widget</button>
          <button className="btn btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <ResponsiveGrid
        className="board-grid"
        layouts={{ lg: layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-header"
        compactType="vertical"
        isResizable={true}
        isDraggable={true}
      >
        {dashboard.widgets.map(widget => {
          const def = widgetRegistry[widget.widgetType];
          const Component = def?.component || widgetRegistry.PLACEHOLDER.component;

          return (
            <div key={String(widget.id)}>
              <WidgetWrapper
                widgetType={widget.widgetType}
                onDelete={() => removeWidget(widget.id)}
              >
                <Component
                  widget={widget}
                  onConfigChange={(config) => updateWidgetConfig(widget.id, config)}
                />
              </WidgetWrapper>
            </div>
          );
        })}
      </ResponsiveGrid>

      <AddWidgetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddWidget}
      />

      <BackgroundSettings
        open={bgSettingsOpen}
        onClose={() => setBgSettingsOpen(false)}
        currentBg={background}
        onSave={handleBgSave}
      />
    </div>
  );
}
