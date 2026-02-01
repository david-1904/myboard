package com.myboard.controller;

import com.myboard.dto.LayoutUpdateRequest;
import com.myboard.model.Dashboard;
import com.myboard.model.WidgetInstance;
import com.myboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        Dashboard dashboard = dashboardService.getDashboard(authentication.getName());
        return ResponseEntity.ok(toDashboardResponse(dashboard));
    }

    @PutMapping("/layout")
    public ResponseEntity<?> updateLayout(Authentication authentication,
                                          @RequestBody LayoutUpdateRequest request) {
        dashboardService.updateLayout(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Layout updated"));
    }

    private Map<String, Object> toDashboardResponse(Dashboard dashboard) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", dashboard.getId());
        response.put("name", dashboard.getName());
        response.put("widgets", dashboard.getWidgets().stream().map(this::toWidgetResponse).toList());
        return response;
    }

    private Map<String, Object> toWidgetResponse(WidgetInstance widget) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", widget.getId());
        response.put("widgetType", widget.getWidgetType().name());
        response.put("layoutX", widget.getLayoutX());
        response.put("layoutY", widget.getLayoutY());
        response.put("layoutW", widget.getLayoutW());
        response.put("layoutH", widget.getLayoutH());
        response.put("config", widget.getConfig());
        return response;
    }
}
