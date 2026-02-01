package com.myboard.controller;

import com.myboard.dto.WidgetConfigDto;
import com.myboard.model.WidgetInstance;
import com.myboard.model.WidgetType;
import com.myboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard/widgets")
public class WidgetController {

    private final DashboardService dashboardService;

    public WidgetController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping
    public ResponseEntity<?> addWidget(Authentication authentication,
                                       @RequestBody Map<String, String> body) {
        String typeStr = body.get("widgetType");
        WidgetType type;
        try {
            type = WidgetType.valueOf(typeStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid widget type: " + typeStr));
        }

        WidgetInstance widget = dashboardService.addWidget(authentication.getName(), type);
        return ResponseEntity.ok(toWidgetResponse(widget));
    }

    @PutMapping("/{id}/config")
    public ResponseEntity<?> updateConfig(Authentication authentication,
                                          @PathVariable Long id,
                                          @RequestBody WidgetConfigDto dto) {
        try {
            WidgetInstance widget = dashboardService.updateWidgetConfig(
                    authentication.getName(), id, dto.getConfig());
            return ResponseEntity.ok(toWidgetResponse(widget));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWidget(Authentication authentication,
                                          @PathVariable Long id) {
        try {
            dashboardService.deleteWidget(authentication.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Widget deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
