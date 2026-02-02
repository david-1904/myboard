package com.myboard.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/rss")
public class RssController {

    private static final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @GetMapping(produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getRss(@RequestParam String url) {
        // Validate URL to prevent SSRF
        if (!isValidRssUrl(url)) {
            return ResponseEntity.badRequest().body("<error>Invalid RSS URL</error>");
        }

        String cacheKey = url.toLowerCase();
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return ResponseEntity.ok(cached.data);
        }

        try {
            String response = restTemplate.getForObject(url, String.class);
            cache.put(cacheKey, new CacheEntry(response));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("<error>Failed to fetch RSS: " + e.getMessage() + "</error>");
        }
    }

    @GetMapping("/google-news")
    public ResponseEntity<String> getGoogleNews(@RequestParam String query) {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = "https://news.google.com/rss/search?q=" + encodedQuery + "&hl=de&gl=DE&ceid=DE:de";

        String cacheKey = "google-news:" + query.toLowerCase();
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_XML)
                    .body(cached.data);
        }

        try {
            String response = restTemplate.getForObject(url, String.class);
            cache.put(cacheKey, new CacheEntry(response));
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_XML)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("<error>Failed to fetch news: " + e.getMessage() + "</error>");
        }
    }

    private boolean isValidRssUrl(String url) {
        return url != null &&
               (url.startsWith("https://") || url.startsWith("http://")) &&
               !url.contains("localhost") &&
               !url.contains("127.0.0.1") &&
               !url.contains("0.0.0.0");
    }

    private static class CacheEntry {
        final String data;
        final long timestamp;

        CacheEntry(String data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_DURATION_MS;
        }
    }
}
