import { useState, useEffect, useCallback } from 'react';
import { DashboardData, WidgetData } from '../types';
import * as api from '../api/dashboardApi';

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveLayout = useCallback(async (layouts: { id: number; x: number; y: number; w: number; h: number }[]) => {
    try {
      await api.updateLayout(layouts);
    } catch (e) {
      console.error('Failed to save layout:', e);
    }
  }, []);

  const addWidget = useCallback(async (widgetType: string) => {
    const widget = await api.addWidget(widgetType);
    setDashboard(prev => prev ? { ...prev, widgets: [...prev.widgets, widget] } : prev);
    return widget;
  }, []);

  const updateWidgetConfig = useCallback(async (widgetId: number, config: Record<string, unknown>) => {
    const updated = await api.updateWidgetConfig(widgetId, config);
    setDashboard(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        widgets: prev.widgets.map(w => w.id === widgetId ? updated : w),
      };
    });
  }, []);

  const removeWidget = useCallback(async (widgetId: number) => {
    try {
      await api.deleteWidget(widgetId);
      setDashboard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          widgets: prev.widgets.filter(w => w.id !== widgetId),
        };
      });
    } catch (e) {
      console.error('Failed to delete widget:', e);
      alert('Widget konnte nicht gelöscht werden');
    }
  }, []);

  const updateLocalLayout = useCallback((layouts: ReactGridLayout.Layout[]) => {
    setDashboard(prev => {
      if (!prev) return prev;
      const widgetMap = new Map(prev.widgets.map(w => [String(w.id), w]));
      const updatedWidgets = layouts.map(l => {
        const widget = widgetMap.get(l.i);
        if (!widget) return null;
        return { ...widget, layoutX: l.x, layoutY: l.y, layoutW: l.w, layoutH: l.h };
      }).filter((w): w is WidgetData => w !== null);
      return { ...prev, widgets: updatedWidgets };
    });
  }, []);

  return { dashboard, loading, error, saveLayout, addWidget, updateWidgetConfig, removeWidget, updateLocalLayout, reload: load };
}
