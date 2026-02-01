import { ComponentType } from 'react';

export interface WidgetData {
  id: number;
  widgetType: string;
  layoutX: number;
  layoutY: number;
  layoutW: number;
  layoutH: number;
  config: Record<string, unknown>;
}

export interface DashboardData {
  id: number;
  name: string;
  widgets: WidgetData[];
}

export interface WidgetDefinition {
  component: ComponentType<WidgetProps>;
  name: string;
  defaultSize: { w: number; h: number };
}

export interface WidgetProps {
  widget: WidgetData;
  onConfigChange: (config: Record<string, unknown>) => void;
}
