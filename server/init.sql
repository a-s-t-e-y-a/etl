-- Create global_sales_master table
CREATE TABLE IF NOT EXISTS global_sales_master (
    item_id VARCHAR(255) NOT NULL,
    master_code INT NOT NULL,
    master_name VARCHAR(255),
    region TEXT,
    gmv NUMERIC,
    quantity FLOAT8,
    sale_month VARCHAR(50),
    platform VARCHAR(255),
    PRIMARY KEY (item_id, master_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_region ON global_sales_master(region);
CREATE INDEX IF NOT EXISTS idx_platform ON global_sales_master(platform);
CREATE INDEX IF NOT EXISTS idx_sale_month ON global_sales_master(sale_month);
CREATE INDEX IF NOT EXISTS idx_item_id ON global_sales_master(item_id);

-- Insert sample data (optional)
INSERT INTO global_sales_master (item_id, master_code, master_name, region, gmv, quantity, sale_month, platform) VALUES
('ITEM001', 1001, 'Product A', 'North America', 15000.50, 250.5, '2024-01', 'Amazon'),
('ITEM002', 1002, 'Product B', 'Europe', 22000.75, 350.25, '2024-01', 'Shopify'),
('ITEM003', 1003, 'Product C', 'Asia', 18500.00, 300.0, '2024-01', 'Alibaba'),
('ITEM004', 1004, 'Product D', 'North America', 12000.25, 200.75, '2024-02', 'Amazon'),
('ITEM005', 1005, 'Product E', 'Europe', 25000.00, 400.5, '2024-02', 'eBay')
ON CONFLICT (item_id, master_code) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE global_sales_master TO postgres;
