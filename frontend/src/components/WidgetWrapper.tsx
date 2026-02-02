import { ReactNode } from 'react';
import widgetRegistry from '../widgets/registry';

interface Props {
  widgetType: string;
  onDelete: () => void;
  children: ReactNode;
}

export default function WidgetWrapper({ widgetType, onDelete, children }: Props) {
  const def = widgetRegistry[widgetType];
  const title = def?.name || widgetType;

  return (
    <div className="widget-wrapper">
      <div className="widget-header">
        <span className="widget-title">{title}</span>
        <button
          className="widget-delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Widget entfernen"
        >
          &times;
        </button>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
}
