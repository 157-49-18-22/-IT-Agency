-- Create Client User - Fixed Query

USE it_agency_pms;

-- Add createdAt and updatedAt fields to the INSERT
INSERT INTO users (name, email, password, role, status, department, designation, joinDate, createdAt, updatedAt)
VALUES ('Client User', 'client@gmail.com', '123123', 'client', 'active', 'Client', 'Client', CURDATE(), NOW(), NOW());

-- Verify client user created
SELECT id, name, email, role, status, department FROM users WHERE email = 'client@gmail.com';
