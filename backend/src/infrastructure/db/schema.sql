CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_id VARCHAR(50) NOT NULL,
  vessel_type VARCHAR(50) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  ghg_intensity DECIMAL(10, 4) NOT NULL,
  fuel_consumption DECIMAL(10, 2) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  total_emissions DECIMAL(10, 2) NOT NULL,
  is_baseline BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  cb_gco2eq DECIMAL(15, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  amount_gco2eq DECIMAL(15, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pool_members (
  pool_id INT REFERENCES pools(id),
  ship_id VARCHAR(50) NOT NULL,
  cb_before DECIMAL(15, 2) NOT NULL,
  cb_after DECIMAL(15, 2) NOT NULL,
  PRIMARY KEY (pool_id, ship_id)
);

-- Seed Data
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline) VALUES
('R001', 'Container', 'HFO', 2024, 91.0, 5000, 12000, 4500, false),
('R002', 'BulkCarrier', 'LNG', 2024, 88.0, 4800, 11500, 4200, false),
('R003', 'Tanker', 'MGO', 2024, 93.5, 5100, 12500, 4700, false),
('R004', 'RoRo', 'HFO', 2025, 89.2, 4900, 11800, 4300, false),
('R005', 'Container', 'LNG', 2025, 90.5, 4950, 11900, 4400, false);
