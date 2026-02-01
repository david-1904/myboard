package com.myboard.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "widget_instances")
public class WidgetInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id")
    private Dashboard dashboard;

    @Column(name = "widget_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private WidgetType widgetType;

    @Column(name = "layout_x", nullable = false)
    private int layoutX = 0;

    @Column(name = "layout_y", nullable = false)
    private int layoutY = 0;

    @Column(name = "layout_w", nullable = false)
    private int layoutW = 2;

    @Column(name = "layout_h", nullable = false)
    private int layoutH = 2;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> config = new HashMap<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public WidgetInstance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Dashboard getDashboard() { return dashboard; }
    public void setDashboard(Dashboard dashboard) { this.dashboard = dashboard; }

    public WidgetType getWidgetType() { return widgetType; }
    public void setWidgetType(WidgetType widgetType) { this.widgetType = widgetType; }

    public int getLayoutX() { return layoutX; }
    public void setLayoutX(int layoutX) { this.layoutX = layoutX; }

    public int getLayoutY() { return layoutY; }
    public void setLayoutY(int layoutY) { this.layoutY = layoutY; }

    public int getLayoutW() { return layoutW; }
    public void setLayoutW(int layoutW) { this.layoutW = layoutW; }

    public int getLayoutH() { return layoutH; }
    public void setLayoutH(int layoutH) { this.layoutH = layoutH; }

    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
