-- Seed initial data via Flyway (idempotent where possible)

-- Tournaments
INSERT INTO tournament(name, location, start_date, end_date) VALUES
('City Open', 'Hyderabad', '2025-10-01', '2025-10-05'),
('Winter Cup', 'Bengaluru', '2025-12-10', '2025-12-12');

-- Players
INSERT INTO player(first_name, last_name, gender, phone) VALUES
('Saina', 'K', 'F', '9000000001'),
('Sindhu', 'P', 'F', '9000000002'),
('Srikanth', 'K', 'M', '9000000003'),
('Lakshya', 'S', 'M', '9000000004');

-- Courts (unique by name)
INSERT INTO court(name, location_note) VALUES
('Court 1', 'Main Hall'),
('Court 2', 'Main Hall')
ON CONFLICT (name) DO NOTHING;

-- Default admin user: admin@example.com / admin123 (BCrypt hash pre-generated)
INSERT INTO users(email, password_hash, enabled) VALUES
('admin@example.com', '$2a$10$gR0wqFQH2mQq5qPqQ0Yp7uwbTshXJmj1B7keO615z7zNAdM.9cpu6', true)
ON CONFLICT (email) DO NOTHING;

-- Grant ADMIN role if not already present
INSERT INTO user_account_roles(user_account_id, roles)
SELECT u.id, 'ADMIN'
FROM users u
WHERE u.email = 'admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_account_roles r WHERE r.user_account_id = u.id AND r.roles = 'ADMIN'
  );

