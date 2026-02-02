import { WidgetDefinition } from '../types';
import ClockWidget from './ClockWidget';
import NotesWidget from './NotesWidget';
import PlaceholderWidget from './PlaceholderWidget';
import WeatherWidget from './WeatherWidget';
import MatrixWidget from './MatrixWidget';
import RssWidget from './RssWidget';
import IptvWidget from './IptvWidget';
import RadioWidget from './RadioWidget';

const widgetRegistry: Record<string, WidgetDefinition> = {
  CLOCK:       { component: ClockWidget, name: 'Uhr', defaultSize: { w: 2, h: 2 } },
  NOTES:       { component: NotesWidget, name: 'Notizen', defaultSize: { w: 3, h: 3 } },
  PLACEHOLDER: { component: PlaceholderWidget, name: 'Platzhalter', defaultSize: { w: 2, h: 2 } },
  WEATHER:     { component: WeatherWidget, name: 'Wetter', defaultSize: { w: 2, h: 3 } },
  MATRIX:      { component: MatrixWidget, name: 'Matrix', defaultSize: { w: 2, h: 3 } },
  RSS:         { component: RssWidget, name: 'News', defaultSize: { w: 3, h: 3 } },
  IPTV:        { component: IptvWidget, name: 'IPTV', defaultSize: { w: 4, h: 4 } },
  RADIO:       { component: RadioWidget, name: 'Radio', defaultSize: { w: 2, h: 4 } },
};

export default widgetRegistry;
