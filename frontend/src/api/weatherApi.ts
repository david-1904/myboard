import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

export interface ForecastData {
  list: ForecastItem[];
  city: {
    name: string;
  };
}

export async function getWeather(city: string): Promise<WeatherData> {
  const res = await api.get('/weather', { params: { city } });
  return res.data;
}

export async function getForecast(city: string): Promise<ForecastData> {
  const res = await api.get('/weather/forecast', { params: { city } });
  return res.data;
}
