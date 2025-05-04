-- Sample data for testing counter-specific order filtering
-- Run this after product_categories.sql

-- Insert sample products for each category
INSERT INTO public.products (name, price, description, category_id) 
VALUES 
  -- Coffee products
  ('Espresso', 3.50, 'Strong Italian coffee', (SELECT id FROM product_categories WHERE name = 'coffee')),
  ('Cappuccino', 4.50, 'Espresso with steamed milk and foam', (SELECT id FROM product_categories WHERE name = 'coffee')),
  ('Latte', 4.75, 'Espresso with lots of steamed milk', (SELECT id FROM product_categories WHERE name = 'coffee')),
  
  -- Pastry products
  ('Croissant', 3.25, 'Buttery French pastry', (SELECT id FROM product_categories WHERE name = 'pastry')),
  ('Chocolate Muffin', 3.75, 'Rich chocolate muffin', (SELECT id FROM product_categories WHERE name = 'pastry')),
  ('Cinnamon Roll', 4.25, 'Sweet roll with cinnamon and icing', (SELECT id FROM product_categories WHERE name = 'pastry')),
  
  -- Bar products
  ('Mojito', 8.50, 'Rum cocktail with mint and lime', (SELECT id FROM product_categories WHERE name = 'bar')),
  ('Margarita', 9.00, 'Tequila cocktail with lime and salt', (SELECT id FROM product_categories WHERE name = 'bar')),
  ('Old Fashioned', 10.00, 'Whiskey cocktail with bitters', (SELECT id FROM product_categories WHERE name = 'bar'))
ON CONFLICT (id) DO NOTHING;

-- Create a sample order with items from all three categories
DO $$
DECLARE
  new_order_id UUID := gen_random_uuid();
  coffee_category_id INTEGER;
  pastry_category_id INTEGER;
  bar_category_id INTEGER;
  espresso_id INTEGER;
  croissant_id INTEGER;
  mojito_id INTEGER;
BEGIN
  -- Get category IDs
  SELECT id INTO coffee_category_id FROM product_categories WHERE name = 'coffee';
  SELECT id INTO pastry_category_id FROM product_categories WHERE name = 'pastry';
  SELECT id INTO bar_category_id FROM product_categories WHERE name = 'bar';
  
  -- Get product IDs
  SELECT id INTO espresso_id FROM products WHERE name = 'Espresso';
  SELECT id INTO croissant_id FROM products WHERE name = 'Croissant';
  SELECT id INTO mojito_id FROM products WHERE name = 'Mojito';
  
  -- Create order
  INSERT INTO public.orders (
    id, 
    user_id, 
    status, 
    created_at, 
    updated_at, 
    table_number, 
    customer_name, 
    total_amount
  ) VALUES (
    new_order_id,
    (SELECT id FROM users LIMIT 1), -- Just use any user ID
    'pending',
    NOW(),
    NOW(),
    5,
    'Sample Customer',
    16.25 -- Total of all items
  );
  
  -- Add order items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    quantity,
    price,
    category_id
  ) VALUES
  -- Coffee item
  (
    new_order_id,
    espresso_id,
    1,
    3.50,
    coffee_category_id
  ),
  -- Pastry item
  (
    new_order_id,
    croissant_id,
    1,
    3.25,
    pastry_category_id
  ),
  -- Bar item
  (
    new_order_id,
    mojito_id,
    1,
    8.50,
    bar_category_id
  );
  
  RAISE NOTICE 'Created sample order with ID: %', new_order_id;
END $$;
