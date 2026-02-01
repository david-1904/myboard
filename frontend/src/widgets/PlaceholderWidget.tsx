import { WidgetProps } from '../types';

export default function PlaceholderWidget({ widget }: WidgetProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#999',
    }}>
      <div style={{ fontSize: '1.5rem' }}>&#9744;</div>
      <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{widget.widgetType}</div>
      <div style={{ fontSize: '0.75rem', color: '#bbb' }}>
        {widget.layoutW} &times; {widget.layoutH}
      </div>
    </div>
  );
}
