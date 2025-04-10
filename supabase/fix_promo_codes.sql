-- First, check if the promo_codes table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'promo_codes') THEN
        -- Create promo_codes table if it doesn't exist
        CREATE TABLE IF NOT EXISTS promo_codes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code TEXT UNIQUE NOT NULL,
            discount_percentage INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT true,
            expiry_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert sample promo codes
        INSERT INTO promo_codes (code, discount_percentage, expiry_date) VALUES
            ('WELCOME10', 10, NOW() + INTERVAL '30 days'),
            ('SUMMER20', 20, NOW() + INTERVAL '60 days'),
            ('HOLIDAY15', 15, NOW() + INTERVAL '90 days')
        ON CONFLICT DO NOTHING;
        
        -- Create index for promo codes
        CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
        
        -- Enable RLS for promo codes
        ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for promo codes
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
    END IF;
END $$;

-- Now check if the orders table has the promo_code_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'promo_code_id'
    ) THEN
        -- Add promo_code_id column to orders table
        ALTER TABLE orders ADD COLUMN promo_code_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE orders 
        ADD CONSTRAINT fk_orders_promo_code 
        FOREIGN KEY (promo_code_id) 
        REFERENCES promo_codes(id);
        
        -- Create index for the foreign key
        CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON orders(promo_code_id);
    END IF;
END $$; 