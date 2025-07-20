CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  price NUMERIC(10,2),
  stock INTEGER,
  category VARCHAR(50)
);

CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id),
  quantity INTEGER,
  type VARCHAR(10) CHECK (type IN ('purchase', 'sale')),
  customer_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (id, name, price, stock, category) VALUES
('P001', 'Laptop Asus ROG', 15000000.00, 10, 'Electronics'),
('P002', 'iPhone 13', 12000000.00, 15, 'Electronics'),
('P003', 'Samsung TV 55"', 7000000.00, 8, 'Electronics'),
('P004', 'Headphone JBL', 950000.00, 20, 'Accessories'),
('P005', 'Keyboard Mechanical', 750000.00, 25, 'Accessories'),
('P006', 'Air Conditioner LG', 5000000.00, 5, 'Home Appliance'),
('P007', 'Rice Cooker Philips', 650000.00, 30, 'Home Appliance'),
('P008', 'Smartwatch Xiaomi', 1250000.00, 12, 'Electronics'),
('P009', 'Gaming Mouse Razer', 550000.00, 18, 'Accessories'),
('P010', 'Printer Canon', 2300000.00, 7, 'Electronics');

INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T001', 'P001', 1, 'sale', 'C001', '2025-07-01 10:00:00'),
('T002', 'P002', 2, 'sale', 'C002', '2025-07-01 11:30:00'),
('T003', 'P003', 3, 'purchase', 'S001', '2025-07-01 14:15:00'),
('T004', 'P004', 1, 'sale', 'C003', '2025-07-02 09:00:00'),
('T005', 'P005', 2, 'sale', 'C004', '2025-07-02 10:45:00'),
('T006', 'P006', 1, 'sale', 'C005', '2025-07-03 08:30:00'),
('T007', 'P007', 4, 'purchase', 'S002', '2025-07-03 13:10:00'),
('T008', 'P008', 2, 'sale', 'C006', '2025-07-04 15:20:00'),
('T009', 'P009', 1, 'sale', 'C007', '2025-07-05 10:50:00'),
('T010', 'P010', 1, 'sale', 'C008', '2025-07-06 16:00:00'),
('T011', 'P001', 2, 'purchase', 'S003', '2025-07-06 17:30:00'),
('T012', 'P002', 1, 'sale', 'C009', '2025-07-07 09:45:00'),
('T013', 'P004', 3, 'purchase', 'S004', '2025-07-07 14:15:00'),
('T014', 'P005', 1, 'sale', 'C010', '2025-07-08 11:20:00'),
('T015', 'P003', 1, 'sale', 'C011', '2025-07-09 08:10:00'),
('T016', 'P006', 2, 'purchase', 'S005', '2025-07-09 12:00:00'),
('T017', 'P007', 3, 'sale', 'C012', '2025-07-10 15:30:00'),
('T018', 'P008', 1, 'purchase', 'S006', '2025-07-11 10:00:00'),
('T019', 'P009', 2, 'sale', 'C013', '2025-07-11 13:45:00'),
('T020', 'P010', 2, 'purchase', 'S007', '2025-07-12 09:30:00'),
('T021', 'P001', 1, 'sale', 'C014', '2025-07-12 15:20:00'),
('T022', 'P002', 3, 'purchase', 'S008', '2025-07-13 08:40:00'),
('T023', 'P004', 2, 'sale', 'C015', '2025-07-13 14:00:00'),
('T024', 'P005', 2, 'purchase', 'S009', '2025-07-14 11:15:00'),
('T025', 'P003', 1, 'sale', 'C016', '2025-07-14 13:50:00'),
('T026', 'P006', 1, 'sale', 'C017', '2025-07-15 10:10:00'),
('T027', 'P007', 2, 'sale', 'C018', '2025-07-15 14:30:00'),
('T028', 'P008', 2, 'sale', 'C019', '2025-07-16 12:00:00'),
('T029', 'P009', 1, 'purchase', 'S010', '2025-07-17 16:40:00'),
('T030', 'P010', 1, 'sale', 'C020', '2025-07-18 10:25:00');

-- Januari (01)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T031', 'P001', 1, 'sale', 'C021', '2025-01-10 10:00:00'),
('T032', 'P002', 2, 'purchase', 'S011', '2025-01-18 14:30:00');

-- Februari (02)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T033', 'P003', 1, 'sale', 'C022', '2025-02-05 09:15:00'),
('T034', 'P004', 3, 'purchase', 'S012', '2025-02-20 13:45:00');

-- Maret (03)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T035', 'P005', 2, 'sale', 'C023', '2025-03-07 11:00:00'),
('T036', 'P006', 1, 'sale', 'C024', '2025-03-25 16:20:00');

-- April (04)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T037', 'P007', 3, 'purchase', 'S013', '2025-04-10 10:40:00'),
('T038', 'P008', 1, 'sale', 'C025', '2025-04-21 14:50:00');

-- Mei (05)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T039', 'P009', 2, 'sale', 'C026', '2025-05-12 09:25:00'),
('T040', 'P010', 1, 'purchase', 'S014', '2025-05-28 15:15:00');

-- Juni (06)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T041', 'P001', 2, 'sale', 'C027', '2025-06-03 11:30:00'),
('T042', 'P002', 1, 'sale', 'C028', '2025-06-17 13:00:00');

-- Juli (07) → Sudah banyak di transaksi awal

-- Agustus (08)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T043', 'P003', 3, 'purchase', 'S015', '2025-08-09 10:10:00'),
('T044', 'P004', 2, 'sale', 'C029', '2025-08-22 14:45:00');

-- September (09)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T045', 'P005', 1, 'sale', 'C030', '2025-09-05 12:20:00'),
('T046', 'P006', 2, 'purchase', 'S016', '2025-09-15 15:55:00');

-- Oktober (10)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T047', 'P007', 3, 'sale', 'C031', '2025-10-10 10:00:00'),
('T048', 'P008', 1, 'purchase', 'S017', '2025-10-28 13:30:00');

-- November (11)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T049', 'P009', 1, 'sale', 'C032', '2025-11-03 09:00:00'),
('T050', 'P010', 2, 'purchase', 'S018', '2025-11-19 14:10:00');

-- Desember (12)
INSERT INTO transactions (id, product_id, quantity, type, customer_id, created_at) VALUES
('T051', 'P001', 2, 'sale', 'C033', '2025-12-05 11:15:00'),
('T052', 'P002', 1, 'sale', 'C034', '2025-12-20 16:30:00');
