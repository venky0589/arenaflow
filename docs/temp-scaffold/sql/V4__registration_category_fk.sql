-- V4__registration_category_fk.sql
ALTER TABLE registration
  ADD COLUMN IF NOT EXISTS category_id BIGINT;

ALTER TABLE registration
  ADD CONSTRAINT fk_registration_category
  FOREIGN KEY (category_id) REFERENCES category(id);
