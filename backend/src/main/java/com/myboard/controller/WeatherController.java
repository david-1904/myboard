package com.myboard.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private static final String OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric&lang=de";
    private static final String OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric&lang=de&cnt=40";
    private static final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry> forecastCache = new ConcurrentHashMap<>();

    public WeatherController(@Value("${weather.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
    }

    @GetMapping
    public ResponseEntity<?> getWeather(@RequestParam String city) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OpenWeather API key not configured"));
        }

        String cacheKey = city.toLowerCase().trim();
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return ResponseEntity.ok(cached.data);
        }

        try {
            String url = String.format(OPENWEATHER_URL, city, apiKey);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            cache.put(cacheKey, new CacheEntry(response));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch weather data: " + e.getMessage()));
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(@RequestParam String city) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OpenWeather API key not configured"));
        }

        String cacheKey = city.toLowerCase().trim();
        CacheEntry cached = forecastCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return ResponseEntity.ok(cached.data);
        }

        try {
            String url = String.format(OPENWEATHER_FORECAST_URL, city, apiKey);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            forecastCache.put(cacheKey, new CacheEntry(response));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch forecast data: " + e.getMessage()));
        }
    }

    private static class CacheEntry {
        final Map<String, Object> data;
        final long timestamp;

        CacheEntry(Map<String, Object> data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_DURATION_MS;
        }
    }
}
