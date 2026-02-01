import widgetRegistry from '../widgets/registry';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (widgetType: string) => void;
}

export default function AddWidgetDialog({ open, onClose, onAdd }: Props) {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Widget hinzufugen</h3>
        <div className="dialog-grid">
          {Object.entries(widgetRegistry).map(([type, def]) => (
            <button
              key={type}
              className="dialog-item"
              onClick={() => { onAdd(type); onClose(); }}
            >
              <span className="dialog-item-name">{def.name}</span>
              <span className="dialog-item-size">{def.defaultSize.w}&times;{def.defaultSize.h}</span>
            </button>
          ))}
        </div>
        <button className="dialog-close" onClick={onClose}>Abbrechen</button>
      </div>
    </div>
  );
}
