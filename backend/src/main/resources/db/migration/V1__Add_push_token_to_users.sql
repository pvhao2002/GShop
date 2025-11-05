-- Add push token column to users table for push notifications
ALTER TABLE users ADD COLUMN push_token VARCHAR(255);

-- Create index for faster lookups by push token
CREATE INDEX idx_users_push_token ON users(push_token);