-- Set local user as super admin for testing
UPDATE users 
SET is_super_admin = true 
WHERE email = 'lanyondeborah@gmail.com';

-- Verify the change
SELECT id, email, full_name, is_super_admin, admin_approval_status 
FROM users 
WHERE email = 'lanyondeborah@gmail.com';
