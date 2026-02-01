import { useState, useEffect } from 'react';
import { WidgetProps } from '../types';

export default function ClockWidget(_props: WidgetProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#888', marginTop: 4 }}>
        {now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
