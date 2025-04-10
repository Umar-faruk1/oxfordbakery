-- Create tables for the cake ordering application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow public read access to images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Allow users to update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create promo_codes table (MOVED BEFORE orders table)
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    promo_code_id UUID REFERENCES promo_codes(id),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    delivery_address TEXT,
    phone_number TEXT,
    special_instructions TEXT,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name) VALUES
    ('Birthday Cakes'),
    ('Wedding Cakes'),
    ('Custom Cakes'),
    ('Cupcakes'),
    ('Pastries')
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, price, description, category_id, image_url) VALUES
    ('Classic Chocolate Cake', 45.99, 'Rich chocolate cake with chocolate ganache and fresh berries', (SELECT id FROM categories WHERE name = 'Birthday Cakes'), '/cakes/chocolate-cake.jpg'),
    ('Vanilla Bean Wedding Cake', 299.99, 'Elegant three-tier vanilla cake with buttercream frosting', (SELECT id FROM categories WHERE name = 'Wedding Cakes'), '/cakes/wedding-cake.jpg'),
    ('Rainbow Unicorn Cake', 65.99, 'Colorful layered cake with magical unicorn decorations', (SELECT id FROM categories WHERE name = 'Custom Cakes'), '/cakes/unicorn-cake.jpg'),
    ('Red Velvet Cupcakes (6pcs)', 18.99, 'Classic red velvet cupcakes with cream cheese frosting', (SELECT id FROM categories WHERE name = 'Cupcakes'), '/cakes/red-velvet-cupcakes.jpg'),
    ('Chocolate Croissant', 3.99, 'Flaky butter croissant with rich chocolate filling', (SELECT id FROM categories WHERE name = 'Pastries'), '/cakes/chocolate-croissant.jpg')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can read categories" ON categories;
DROP POLICY IF EXISTS "Users can read menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can read their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can read their own order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Only admins can manage promo codes" ON promo_codes;

-- Create policies
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Users can read menu items" ON menu_items
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can read their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Promo codes policies
CREATE POLICY "Anyone can read active promo codes" ON promo_codes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage promo codes" ON promo_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percentage, expiry_date) VALUES
    ('WELCOME10', 10, NOW() + INTERVAL '30 days'),
    ('SUMMER20', 20, NOW() + INTERVAL '60 days'),
    ('HOLIDAY15', 15, NOW() + INTERVAL '90 days')
ON CONFLICT DO NOTHING; 