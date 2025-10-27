-- V3__matches_bracket_columns.sql
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS category_id BIGINT,
  ADD COLUMN IF NOT EXISTS round INT,
  ADD COLUMN IF NOT EXISTS position INT,
  ADD COLUMN IF NOT EXISTS next_match_id BIGINT,
  ADD COLUMN IF NOT EXISTS winner_advances_as SMALLINT,
  ADD COLUMN IF NOT EXISTS participant1_registration_id BIGINT,
  ADD COLUMN IF NOT EXISTS participant2_registration_id BIGINT,
  ADD COLUMN IF NOT EXISTS is_bye BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE matches
  ADD CONSTRAINT fk_matches_category
  FOREIGN KEY (category_id) REFERENCES category(id);

ALTER TABLE matches
  ADD CONSTRAINT fk_matches_next
  FOREIGN KEY (next_match_id) REFERENCES matches(id);

ALTER TABLE matches
  ADD CONSTRAINT fk_matches_p1_registration
  FOREIGN KEY (participant1_registration_id) REFERENCES registration(id);

ALTER TABLE matches
  ADD CONSTRAINT fk_matches_p2_registration
  FOREIGN KEY (participant2_registration_id) REFERENCES registration(id);

CREATE INDEX IF NOT EXISTS idx_match_category_round ON matches (category_id, round);
CREATE INDEX IF NOT EXISTS idx_match_next ON matches (next_match_id);
