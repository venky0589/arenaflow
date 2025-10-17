INSERT INTO tournament(name, location, start_date, end_date) VALUES
('City Open', 'Hyderabad', '2025-10-01', '2025-10-05'),
('Winter Cup', 'Bengaluru', '2025-12-10', '2025-12-12');

INSERT INTO player(first_name, last_name, gender, phone) VALUES
('Saina', 'K', 'F', '9000000001'),
('Sindhu', 'P', 'F', '9000000002'),
('Srikanth', 'K', 'M', '9000000003'),
('Lakshya', 'S', 'M', '9000000004');

INSERT INTO court(name, location_note) VALUES
('Court 1', 'Main Hall'),
('Court 2', 'Main Hall');

-- Create a default admin user: admin@example.com / admin123 (BCrypt hash pre-generated)
INSERT INTO users(email, password_hash, enabled) VALUES
('admin@example.com', '$2a$10$gR0wqFQH2mQq5qPqQ0Yp7uD1m3TuwHSQK9V1rCw3xVq1L1m6bXoQG', true); 
-- password hash = "admin123"

INSERT INTO user_account_roles(user_account_id, roles)
SELECT id, 'ADMIN' FROM users WHERE email='admin@example.com';
