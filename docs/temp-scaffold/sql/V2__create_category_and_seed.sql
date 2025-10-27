-- V2__create_category_and_seed.sql
-- Uses existing 'tournament', 'registration', and 'matches' tables.
CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    category_type VARCHAR(20) NOT NULL, -- SINGLES, DOUBLES
    format VARCHAR(30) NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    gender_restriction VARCHAR(20),
    min_age INT,
    max_age INT,
    max_participants INT,
    registration_fee NUMERIC(10,2),
    CONSTRAINT uq_category_tournament_name UNIQUE (tournament_id, name),
    CONSTRAINT fk_category_tournament FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

CREATE TABLE IF NOT EXISTS seed (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    registration_id BIGINT NOT NULL,
    seed_number INT NOT NULL,
    CONSTRAINT uq_seed_category_number UNIQUE (category_id, seed_number),
    CONSTRAINT uq_seed_category_registration UNIQUE (category_id, registration_id),
    CONSTRAINT fk_seed_category FOREIGN KEY (category_id) REFERENCES category(id),
    CONSTRAINT fk_seed_registration FOREIGN KEY (registration_id) REFERENCES registration(id)
);
