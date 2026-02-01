import { WidgetDefinition } from '../types';
import ClockWidget from './ClockWidget';
import NotesWidget from './NotesWidget';
import PlaceholderWidget from './PlaceholderWidget';

const widgetRegistry: Record<string, WidgetDefinition> = {
  CLOCK:       { component: ClockWidget, name: 'Uhr', defaultSize: { w: 2, h: 2 } },
  NOTES:       { component: NotesWidget, name: 'Notizen', defaultSize: { w: 3, h: 3 } },
  PLACEHOLDER: { component: PlaceholderWidget, name: 'Platzhalter', defaultSize: { w: 2, h: 2 } },
};

export default widgetRegistry;
