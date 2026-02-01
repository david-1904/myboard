package com.myboard.dto;

import java.util.List;

public class LayoutUpdateRequest {

    private List<WidgetLayoutItem> layouts;

    public List<WidgetLayoutItem> getLayouts() { return layouts; }
    public void setLayouts(List<WidgetLayoutItem> layouts) { this.layouts = layouts; }

    public static class WidgetLayoutItem {
        private Long id;
        private int x;
        private int y;
        private int w;
        private int h;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public int getX() { return x; }
        public void setX(int x) { this.x = x; }

        public int getY() { return y; }
        public void setY(int y) { this.y = y; }

        public int getW() { return w; }
        public void setW(int w) { this.w = w; }

        public int getH() { return h; }
        public void setH(int h) { this.h = h; }
    }
}
