package com.myboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/xtream")
public class XtreamController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/info")
    public ResponseEntity<String> getAccountInfo(
            @RequestParam String server,
            @RequestParam String username,
            @RequestParam String password) {
        String url = buildUrl(server, username, password, null);
        return proxyRequest(url);
    }

    @GetMapping("/live-categories")
    public ResponseEntity<String> getLiveCategories(
            @RequestParam String server,
            @RequestParam String username,
            @RequestParam String password) {
        String url = buildUrl(server, username, password, "get_live_categories");
        return proxyRequest(url);
    }

    @GetMapping("/live-streams")
    public ResponseEntity<String> getLiveStreams(
            @RequestParam String server,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(required = false) String categoryId) {
        String url = buildUrl(server, username, password, "get_live_streams");
        if (categoryId != null && !categoryId.isEmpty()) {
            url += "&category_id=" + URLEncoder.encode(categoryId, StandardCharsets.UTF_8);
        }
        return proxyRequest(url);
    }

    @GetMapping("/vod-categories")
    public ResponseEntity<String> getVodCategories(
            @RequestParam String server,
            @RequestParam String username,
            @RequestParam String password) {
        String url = buildUrl(server, username, password, "get_vod_categories");
        return proxyRequest(url);
    }

    @GetMapping("/vod-streams")
    public ResponseEntity<String> getVodStreams(
            @RequestParam String server,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(required = false) String categoryId) {
        String url = buildUrl(server, username, password, "get_vod_streams");
        if (categoryId != null && !categoryId.isEmpty()) {
            url += "&category_id=" + URLEncoder.encode(categoryId, StandardCharsets.UTF_8);
        }
        return proxyRequest(url);
    }

    private String buildUrl(String server, String username, String password, String action) {
        String baseUrl = server.endsWith("/") ? server : server + "/";
        String url = baseUrl + "player_api.php?username=" +
                URLEncoder.encode(username, StandardCharsets.UTF_8) +
                "&password=" + URLEncoder.encode(password, StandardCharsets.UTF_8);
        if (action != null) {
            url += "&action=" + action;
        }
        return url;
    }

    private ResponseEntity<String> proxyRequest(String url) {
        try {
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }
}
