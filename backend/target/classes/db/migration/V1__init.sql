-- V1__init.sql
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_account_roles (
    user_account_id BIGINT NOT NULL,
    roles VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS player (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(16),
    phone VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS court (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    location_note VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS matches (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    court_id BIGINT REFERENCES court(id),
    player1_id BIGINT REFERENCES player(id),
    player2_id BIGINT REFERENCES player(id),
    score1 INTEGER,
    score2 INTEGER,
    status VARCHAR(32),
    scheduled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    player_id BIGINT NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    category_type VARCHAR(32) NOT NULL
);
