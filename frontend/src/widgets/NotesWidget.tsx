import { useState, useEffect, useRef } from 'react';
import { WidgetProps } from '../types';

export default function NotesWidget({ widget, onConfigChange }: WidgetProps) {
  const [text, setText] = useState((widget.config.text as string) || '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText((widget.config.text as string) || '');
  }, [widget.config.text]);

  const handleChange = (value: string) => {
    setText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onConfigChange({ text: value });
    }, 500);
  };

  return (
    <textarea
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Notizen hier eingeben..."
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        outline: 'none',
        resize: 'none',
        padding: 8,
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        backgroundColor: 'transparent',
      }}
    />
  );
}
