-- ============================================================
-- Enterprise QA Automation Platform - Target SUT Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'analyst')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- 5. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    user_email VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Deterministic Seed Data for Automated QA Validations
-- ============================================================

-- Seed Standard Users:
-- Admin: admin@qa-platform.test / AdminSecret123!
-- Customer: customer@qa-platform.test / CustomerSecret123!
INSERT INTO users (id, email, password_hash, role) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@qa-platform.test', '$2a$10$9s69m5v4n7N15h6f4zH0e.xZ8XF/Hl7x/rB2V8V1Wv7hR2e6Vz3z.', 'admin'),
    ('c0000000-0000-0000-0000-000000000001', 'customer@qa-platform.test', '$2a$10$9s69m5v4n7N15h6f4zH0e.xZ8XF/Hl7x/rB2V8V1Wv7hR2e6Vz3z.', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Seed Products:
INSERT INTO products (id, name, description, price, stock_quantity, category, is_active) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Mechanical Keyboard Pro', 'Tactile switches with RGB lighting', 99.99, 50, 'electronics', true),
    ('b0000000-0000-0000-0000-000000000002', 'Wireless Precision Mouse', 'Ergonomic 24000 DPI gaming mouse', 59.99, 80, 'electronics', true),
    ('b0000000-0000-0000-0000-000000000003', 'Noise-Cancelling Headphones', 'Active noise cancellation with 30h battery', 199.99, 25, 'audio', true),
    ('b0000000-0000-0000-0000-000000000004', 'Ergonomic Standing Desk Pad', 'Anti-fatigue high-density floor mat', 39.99, 100, 'furniture', true)
ON CONFLICT (id) DO NOTHING;
