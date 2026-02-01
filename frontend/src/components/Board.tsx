import { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard } from '../hooks/useDashboard';
import widgetRegistry from '../widgets/registry';
import WidgetWrapper from './WidgetWrapper';
import AddWidgetDialog from './AddWidgetDialog';

const ResponsiveGrid = WidthProvider(Responsive);

interface Props {
  onLogout: () => void;
  username: string;
}

export default function Board({ onLogout, username }: Props) {
  const { dashboard, loading, error, saveLayout, addWidget, updateWidgetConfig, removeWidget, updateLocalLayout } = useDashboard();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  return (
    <div className="board-container">
      <header className="board-header">
        <h1>{dashboard.name}</h1>
        <div className="board-header-actions">
          <span className="board-username">{username}</span>
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
    </div>
  );
}
