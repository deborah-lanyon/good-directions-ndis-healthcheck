-- Update password for local development database
-- Replace 'your-email@example.com' with your actual email address

UPDATE users SET password = 'scrypt$cdfec7fee9ad6df2f69a1f8e6029c7a8$4c1b860627ce8dd268c361f17a958f3c3aefaad2e4e7f8588da57671904f033b8dd0aac06bf0e42809a4d933b068c40c165f937563f9b4378601d0e74d8c53e7' WHERE email = 'your-email@example.com';

-- This will set the password to: Winston1058!
