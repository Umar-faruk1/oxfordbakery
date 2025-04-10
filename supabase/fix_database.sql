-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table if it doesn't exist
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

-- Create promo_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table if it doesn't exist
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

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Check and add missing columns to orders table
DO $$
BEGIN
    -- Check for total_amount column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;

    -- Check for promo_code_id column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'promo_code_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN promo_code_id UUID;
        ALTER TABLE orders 
        ADD CONSTRAINT fk_orders_promo_code 
        FOREIGN KEY (promo_code_id) 
        REFERENCES promo_codes(id);
    END IF;

    -- Check for discount_amount column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON orders(promo_code_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Insert sample data if tables are empty
DO $$
BEGIN
    -- Insert sample categories if none exist
    IF NOT EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
        INSERT INTO categories (name) VALUES
            ('Birthday Cakes'),
            ('Wedding Cakes'),
            ('Custom Cakes'),
            ('Cupcakes'),
            ('Pastries')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert sample menu items if none exist
    IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN
        INSERT INTO menu_items (name, price, description, category_id, image_url) VALUES
            ('Classic Chocolate Cake', 45.99, 'Rich chocolate cake with chocolate ganache and fresh berries', (SELECT id FROM categories WHERE name = 'Birthday Cakes'), '/cakes/chocolate-cake.jpg'),
            ('Vanilla Bean Wedding Cake', 299.99, 'Elegant three-tier vanilla cake with buttercream frosting', (SELECT id FROM categories WHERE name = 'Wedding Cakes'), '/cakes/wedding-cake.jpg'),
            ('Rainbow Unicorn Cake', 65.99, 'Colorful layered cake with magical unicorn decorations', (SELECT id FROM categories WHERE name = 'Custom Cakes'), '/cakes/unicorn-cake.jpg'),
            ('Red Velvet Cupcakes (6pcs)', 18.99, 'Classic red velvet cupcakes with cream cheese frosting', (SELECT id FROM categories WHERE name = 'Cupcakes'), '/cakes/red-velvet-cupcakes.jpg'),
            ('Chocolate Croissant', 3.99, 'Flaky butter croissant with rich chocolate filling', (SELECT id FROM categories WHERE name = 'Pastries'), '/cakes/chocolate-croissant.jpg')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert sample promo codes if none exist
    IF NOT EXISTS (SELECT 1 FROM promo_codes LIMIT 1) THEN
        INSERT INTO promo_codes (code, discount_percentage, expiry_date) VALUES
            ('WELCOME10', 10, NOW() + INTERVAL '30 days'),
            ('SUMMER20', 20, NOW() + INTERVAL '60 days'),
            ('HOLIDAY15', 15, NOW() + INTERVAL '90 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$; 