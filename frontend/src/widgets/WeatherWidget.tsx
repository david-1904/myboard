import { useState, useEffect, useRef, useCallback } from 'react';
import { WidgetProps } from '../types';
import { getWeather, getForecast, WeatherData, ForecastData, ForecastItem } from '../api/weatherApi';

export default function WeatherWidget({ widget, onConfigChange }: WidgetProps) {
  const [city, setCity] = useState((widget.config.city as string) || '');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWeather = useCallback(async (cityName: string) => {
    if (!cityName.trim()) {
      setWeather(null);
      setForecast(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [weatherData, forecastData] = await Promise.all([
        getWeather(cityName),
        getForecast(cityName),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError('Wetterdaten konnten nicht geladen werden');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedCity = (widget.config.city as string) || '';
    setCity(savedCity);
    if (savedCity) {
      fetchWeather(savedCity);
    }
  }, [widget.config.city, fetchWeather]);

  useEffect(() => {
    if (city.trim()) {
      refreshRef.current = setInterval(() => {
        fetchWeather(city);
      }, 10 * 60 * 1000);
    }
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [city, fetchWeather]);

  const handleCityChange = (value: string) => {
    setCity(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onConfigChange({ city: value });
      fetchWeather(value);
    }, 800);
  };

  const getWeatherIconUrl = (icon: string) =>
    `https://openweathermap.org/img/wn/${icon}@2x.png`;

  const getDailyForecast = (forecastData: ForecastData): ForecastItem[] => {
    const daily: ForecastItem[] = [];
    const seen = new Set<string>();

    for (const item of forecastData.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seen.has(date) && item.dt_txt.includes('12:00')) {
        seen.add(date);
        daily.push(item);
        if (daily.length >= 5) break;
      }
    }

    if (daily.length < 5) {
      for (const item of forecastData.list) {
        const date = item.dt_txt.split(' ')[0];
        if (!seen.has(date)) {
          seen.add(date);
          daily.push(item);
          if (daily.length >= 5) break;
        }
      }
    }

    return daily;
  };

  const formatDay = (dtTxt: string) => {
    const date = new Date(dtTxt);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  };

  return (
    <div className="weather-widget">
      <input
        type="text"
        value={city}
        onChange={(e) => handleCityChange(e.target.value)}
        placeholder="Stadt eingeben..."
        className="weather-input"
      />

      <div className="weather-content">
        {loading && <div className="weather-loading">Laden...</div>}
        {error && <div className="weather-error">{error}</div>}

        {!loading && !error && weather && (
          <>
            <div className="weather-current">
              <div className="weather-main">
                <img
                  src={getWeatherIconUrl(weather.weather[0].icon)}
                  alt={weather.weather[0].description}
                  className="weather-icon"
                />
                <div className="weather-temp">{Math.round(weather.main.temp)}°</div>
              </div>
              <div className="weather-city">{weather.name}</div>
              <div className="weather-desc">{weather.weather[0].description}</div>
              <div className="weather-details">
                <span>💧 {weather.main.humidity}%</span>
                <span>💨 {Math.round(weather.wind.speed * 3.6)} km/h</span>
                <span>🌡️ {Math.round(weather.main.feels_like)}°</span>
              </div>
            </div>

            {forecast && (
              <div className="weather-forecast">
                {getDailyForecast(forecast).map((item, idx) => (
                  <div key={idx} className="forecast-day">
                    <div className="forecast-day-name">{formatDay(item.dt_txt)}</div>
                    <img
                      src={getWeatherIconUrl(item.weather[0].icon)}
                      alt={item.weather[0].description}
                      className="forecast-icon"
                    />
                    <div className="forecast-temp">{Math.round(item.main.temp)}°</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && !weather && city.trim() === '' && (
          <div className="weather-empty">Stadt eingeben um Wetter anzuzeigen</div>
        )}
      </div>
    </div>
  );
}
