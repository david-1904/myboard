CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dashboards (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id),
    name        VARCHAR(100) DEFAULT 'My Board',
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE widget_instances (
    id           BIGSERIAL PRIMARY KEY,
    dashboard_id BIGINT REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type  VARCHAR(50) NOT NULL,
    layout_x     INT NOT NULL DEFAULT 0,
    layout_y     INT NOT NULL DEFAULT 0,
    layout_w     INT NOT NULL DEFAULT 2,
    layout_h     INT NOT NULL DEFAULT 2,
    config       JSONB DEFAULT '{}',
    created_at   TIMESTAMP DEFAULT NOW()
);
