-- Add rejection_reason to products table for Phase 4
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
