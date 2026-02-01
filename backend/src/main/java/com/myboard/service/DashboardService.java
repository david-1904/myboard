package com.myboard.service;

import com.myboard.dto.LayoutUpdateRequest;
import com.myboard.model.*;
import com.myboard.repository.DashboardRepository;
import com.myboard.repository.WidgetInstanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final WidgetInstanceRepository widgetInstanceRepository;
    private final UserService userService;

    public DashboardService(DashboardRepository dashboardRepository,
                            WidgetInstanceRepository widgetInstanceRepository,
                            UserService userService) {
        this.dashboardRepository = dashboardRepository;
        this.widgetInstanceRepository = widgetInstanceRepository;
        this.userService = userService;
    }

    @Transactional
    public Dashboard getDashboard(String username) {
        User user = userService.findByUsername(username);
        Dashboard dashboard = dashboardRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Dashboard d = new Dashboard(user);
                    return dashboardRepository.save(d);
                });
        // Initialize widgets collection within transaction
        dashboard.getWidgets().size();
        return dashboard;
    }

    @Transactional
    public void updateLayout(String username, LayoutUpdateRequest request) {
        Dashboard dashboard = getDashboard(username);
        for (LayoutUpdateRequest.WidgetLayoutItem item : request.getLayouts()) {
            widgetInstanceRepository.findById(item.getId()).ifPresent(widget -> {
                if (widget.getDashboard().getId().equals(dashboard.getId())) {
                    widget.setLayoutX(item.getX());
                    widget.setLayoutY(item.getY());
                    widget.setLayoutW(item.getW());
                    widget.setLayoutH(item.getH());
                    widgetInstanceRepository.save(widget);
                }
            });
        }
    }

    @Transactional
    public WidgetInstance addWidget(String username, WidgetType type) {
        Dashboard dashboard = getDashboard(username);
        WidgetInstance widget = new WidgetInstance();
        widget.setDashboard(dashboard);
        widget.setWidgetType(type);

        switch (type) {
            case CLOCK -> { widget.setLayoutW(2); widget.setLayoutH(2); }
            case NOTES -> { widget.setLayoutW(3); widget.setLayoutH(3); }
            case PLACEHOLDER -> { widget.setLayoutW(2); widget.setLayoutH(2); }
        }

        return widgetInstanceRepository.save(widget);
    }

    @Transactional
    public WidgetInstance updateWidgetConfig(String username, Long widgetId, Map<String, Object> config) {
        Dashboard dashboard = getDashboard(username);
        WidgetInstance widget = widgetInstanceRepository.findById(widgetId)
                .orElseThrow(() -> new IllegalArgumentException("Widget not found"));

        if (!widget.getDashboard().getId().equals(dashboard.getId())) {
            throw new IllegalArgumentException("Widget does not belong to this dashboard");
        }

        widget.setConfig(config);
        return widgetInstanceRepository.save(widget);
    }

    @Transactional
    public void deleteWidget(String username, Long widgetId) {
        Dashboard dashboard = getDashboard(username);
        WidgetInstance widget = widgetInstanceRepository.findById(widgetId)
                .orElseThrow(() -> new IllegalArgumentException("Widget not found"));

        if (!widget.getDashboard().getId().equals(dashboard.getId())) {
            throw new IllegalArgumentException("Widget does not belong to this dashboard");
        }

        widgetInstanceRepository.delete(widget);
    }
}
