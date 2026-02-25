-- =====================================================
-- Service Link Pro - Supabase Database Schema
-- =====================================================
-- Custom Authentication System (No Supabase Auth)
-- This schema creates all necessary tables for vehicle service management
-- Run this script in your Supabase SQL Editor

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS service_records CASCADE;
DROP TABLE IF EXISTS service_schedules CASCADE;
DROP TABLE IF EXISTS service_master CASCADE;
DROP TABLE IF EXISTS insurance_data CASCADE;
DROP TABLE IF EXISTS insurance_renewals CASCADE;
DROP TABLE IF EXISTS overdue_calls CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS upcoming_insurance_renewals CASCADE;
DROP TABLE IF EXISTS upcoming_service_calls CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Custom Authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- =====================================================
-- VEHICLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_no VARCHAR(50) UNIQUE NOT NULL,
    product_line VARCHAR(100) NOT NULL,
    vc_no VARCHAR(50) NOT NULL,
    sale_date DATE NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile1 VARCHAR(20) NOT NULL,
    mobile2 VARCHAR(20),
    mobile3 VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_vehicles_bin_no ON vehicles(bin_no);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg_no ON vehicles(reg_no);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_name ON vehicles(customer_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_mobile1 ON vehicles(mobile1);
CREATE INDEX IF NOT EXISTS idx_vehicles_product_line ON vehicles(product_line);
CREATE INDEX IF NOT EXISTS idx_vehicles_sale_date ON vehicles(sale_date);

-- =====================================================
-- SERVICE RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jc_no VARCHAR(50) UNIQUE NOT NULL,
    jc_closed_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    km_runs INTEGER NOT NULL CHECK (km_runs >= 0),
    bin_no VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_service_records_vehicle FOREIGN KEY (bin_no) REFERENCES vehicles(bin_no) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_records_bin_no ON service_records(bin_no);
CREATE INDEX IF NOT EXISTS idx_service_records_jc_no ON service_records(jc_no);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON service_records(jc_closed_date);
CREATE INDEX IF NOT EXISTS idx_service_records_service_type ON service_records(service_type);

-- =====================================================
-- SERVICE SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vc_no VARCHAR(50) NOT NULL,
    product_line VARCHAR(100) NOT NULL,
    free_service INTEGER NOT NULL CHECK (free_service >= 0),
    frequency_days INTEGER NOT NULL CHECK (frequency_days > 0),
    km_frequency INTEGER NOT NULL CHECK (km_frequency > 0),
    max_services INTEGER NOT NULL CHECK (max_services > 0),
    variation_days INTEGER DEFAULT 0 CHECK (variation_days >= 0),
    variation_kms INTEGER DEFAULT 0 CHECK (variation_kms >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_schedules_vc_no ON service_schedules(vc_no);
CREATE INDEX IF NOT EXISTS idx_service_schedules_product_line ON service_schedules(product_line);
    -- idx_service_schedules_service_type removed

-- =====================================================
-- SERVICE MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_no VARCHAR(50) NOT NULL,
    reg_no VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    product_line VARCHAR(100) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    free_service BOOLEAN DEFAULT false,
    expected_date DATE NOT NULL,
    expected_kms INTEGER NOT NULL CHECK (expected_kms >= 0),
    status VARCHAR(50) NOT NULL CHECK (status IN ('planned', 'called', 'booked', 'serviced', 'not_interested', 'wrong_number', 'overdue')),
    agent_id UUID,
    agent_name VARCHAR(255),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    last_call_date DATE,
    next_follow_up_date DATE,
    call_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_service_master_vehicle FOREIGN KEY (bin_no) REFERENCES vehicles(bin_no) ON DELETE CASCADE,
    CONSTRAINT fk_service_master_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_master_bin_no ON service_master(bin_no);
CREATE INDEX IF NOT EXISTS idx_service_master_status ON service_master(status);
CREATE INDEX IF NOT EXISTS idx_service_master_agent_id ON service_master(agent_id);
CREATE INDEX IF NOT EXISTS idx_service_master_expected_date ON service_master(expected_date);
CREATE INDEX IF NOT EXISTS idx_service_master_priority ON service_master(priority);
CREATE INDEX IF NOT EXISTS idx_service_master_next_follow_up ON service_master(next_follow_up_date);

-- =====================================================
-- INSURANCE DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_no VARCHAR(50) NOT NULL,
    reg_no VARCHAR(50) NOT NULL,
    policy_date DATE NOT NULL,
    policy_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_insurance_data_vehicle FOREIGN KEY (bin_no) REFERENCES vehicles(bin_no) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insurance_data_bin_no ON insurance_data(bin_no);
CREATE INDEX IF NOT EXISTS idx_insurance_data_policy_date ON insurance_data(policy_date);

-- =====================================================
-- INSURANCE RENEWALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_no VARCHAR(50) NOT NULL,
    reg_no VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    last_policy_date DATE NOT NULL,
    policy_expiry_date DATE NOT NULL,
    expected_renewal_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('planned', 'called', 'renewed', 'shifted', 'not_interested')),
    agent_id UUID,
    agent_name VARCHAR(255),
    last_call_date DATE,
    next_follow_up_date DATE,
    call_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_insurance_renewals_vehicle FOREIGN KEY (bin_no) REFERENCES vehicles(bin_no) ON DELETE CASCADE,
    CONSTRAINT fk_insurance_renewals_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insurance_renewals_bin_no ON insurance_renewals(bin_no);
CREATE INDEX IF NOT EXISTS idx_insurance_renewals_status ON insurance_renewals(status);
CREATE INDEX IF NOT EXISTS idx_insurance_renewals_agent_id ON insurance_renewals(agent_id);
CREATE INDEX IF NOT EXISTS idx_insurance_renewals_expiry_date ON insurance_renewals(policy_expiry_date);
CREATE INDEX IF NOT EXISTS idx_insurance_renewals_next_follow_up ON insurance_renewals(next_follow_up_date);

-- =====================================================
-- CALL LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL,
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('service', 'insurance')),
    agent_id UUID NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('connected', 'not_connected', 'switched_off', 'wrong_number')),
    decision VARCHAR(50) CHECK (decision IN ('will_book', 'not_interested', 'already_serviced', 'sold_vehicle', 'follow_up')),
    next_follow_up_date DATE,
    booking_date DATE,
    remarks TEXT,
    call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_call_logs_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_call_logs_record_id ON call_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_agent_id ON call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_date ON call_logs(call_date);
CREATE INDEX IF NOT EXISTS idx_call_logs_record_type ON call_logs(record_type);
CREATE INDEX IF NOT EXISTS idx_call_logs_outcome ON call_logs(outcome);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_records_updated_at ON service_records;
CREATE TRIGGER update_service_records_updated_at BEFORE UPDATE ON service_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_schedules_updated_at ON service_schedules;
CREATE TRIGGER update_service_schedules_updated_at BEFORE UPDATE ON service_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_master_updated_at ON service_master;
CREATE TRIGGER update_service_master_updated_at BEFORE UPDATE ON service_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_data_updated_at ON insurance_data;
CREATE TRIGGER update_insurance_data_updated_at BEFORE UPDATE ON insurance_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_renewals_updated_at ON insurance_renewals;
CREATE TRIGGER update_insurance_renewals_updated_at BEFORE UPDATE ON insurance_renewals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Disable RLS for custom authentication
-- We're using JWT tokens instead of Supabase Auth
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_renewals DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DEMO DATA
-- =====================================================
-- Demo Credentials (bcrypt hashed):
--   Admin:  admin@servicelink.com   | password: admin123
--   Agent1: agent1@servicelink.com  | password: agent123
--   Agent2: agent2@servicelink.com  | password: agent123

INSERT INTO users (name, email, password_hash, role, active) VALUES
('Admin User', 'admin@servicelink.com', '$2b$10$KVb5Qq4MduS3sp1lV5gFJe5nWuI3B1PpZfsxaaELaKqi7rtD5He7S', 'admin', true),
('Agent One', 'agent1@servicelink.com', '$2b$10$OebGJsCJa/Lz/ieHjDklUuc94.awPdHzASMMEy59jnb3RqOPxMeJi', 'agent', true),
('Agent Two', 'agent2@servicelink.com', '$2b$10$OebGJsCJa/Lz/ieHjDklUuc94.awPdHzASMMEy59jnb3RqOPxMeJi', 'agent', true)
ON CONFLICT (email) DO NOTHING;

-- Sample Vehicles
INSERT INTO vehicles (bin_no, product_line, vc_no, sale_date, reg_no, customer_name, mobile1, mobile2) VALUES
('VEH001', 'Honda City', 'VC001', '2023-01-15', 'MH12AB1234', 'Rajesh Kumar', '9876543210', '9876543211'),
('VEH002', 'Honda Amaze', 'VC002', '2023-02-20', 'MH12CD5678', 'Priya Sharma', '9876543220', NULL),
('VEH003', 'Honda Jazz', 'VC003', '2023-03-10', 'MH12EF9012', 'Amit Patel', '9876543230', '9876543231'),
('VEH004', 'Honda WR-V', 'VC004', '2023-04-05', 'MH12GH3456', 'Sneha Desai', '9876543240', NULL),
('VEH005', 'Honda Civic', 'VC005', '2023-05-12', 'MH12IJ7890', 'Vikram Singh', '9876543250', '9876543251')
ON CONFLICT (bin_no) DO NOTHING;

-- Sample Service Schedules
INSERT INTO service_schedules (vc_no, product_line, free_service, frequency_days, km_frequency, max_services, variation_days, variation_kms) VALUES
('VC001', 'Honda City', 3, 365, 80000, 10, 15, 2000)
ON CONFLICT DO NOTHING;

-- Sample Service Master Records
INSERT INTO service_master (bin_no, reg_no, customer_name, mobile, product_line, service_type, free_service, expected_date, expected_kms, status, priority, agent_id, agent_name) 
SELECT 
    'VEH001', 
    'MH12AB1234', 
    'Rajesh Kumar', 
    '9876543210', 
    'Honda City', 
    '2nd Service', 
    false, 
    CURRENT_DATE + INTERVAL '7 days', 
    15000, 
    'planned', 
    'high',
    u.id,
    u.name
FROM users u WHERE u.email = 'agent1@servicelink.com'
ON CONFLICT DO NOTHING;

INSERT INTO service_master (bin_no, reg_no, customer_name, mobile, product_line, service_type, free_service, expected_date, expected_kms, status, priority, agent_id, agent_name) 
SELECT 
    'VEH002', 
    'MH12CD5678', 
    'Priya Sharma', 
    '9876543220', 
    'Honda Amaze', 
    '1st Free Service', 
    true, 
    CURRENT_DATE - INTERVAL '2 days', 
    1200, 
    'overdue', 
    'high',
    u.id,
    u.name
FROM users u WHERE u.email = 'agent1@servicelink.com'
ON CONFLICT DO NOTHING;

-- Sample Insurance Data
INSERT INTO insurance_data (bin_no, reg_no, policy_date, policy_type) VALUES
('VEH001', 'MH12AB1234', '2023-01-15', 'Comprehensive'),
('VEH002', 'MH12CD5678', '2023-02-20', 'Comprehensive'),
('VEH003', 'MH12EF9012', '2023-03-10', 'Third Party')
ON CONFLICT DO NOTHING;

-- Sample Insurance Renewals
INSERT INTO insurance_renewals (bin_no, reg_no, customer_name, mobile, last_policy_date, policy_expiry_date, expected_renewal_date, status, agent_id, agent_name)
SELECT 
    'VEH001', 
    'MH12AB1234', 
    'Rajesh Kumar', 
    '9876543210', 
    '2024-01-15', 
    '2025-01-15', 
    '2024-12-15', 
    'planned',
    u.id,
    u.name
FROM users u WHERE u.email = 'agent2@servicelink.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS (For common queries)
-- =====================================================

-- View for overdue services
CREATE OR REPLACE VIEW overdue_services AS
SELECT 
    sm.*
FROM service_master sm
JOIN vehicles v ON sm.bin_no = v.bin_no
WHERE sm.expected_date < CURRENT_DATE 
  AND sm.status NOT IN ('serviced', 'not_interested');

-- View for upcoming services (next 30 days)
CREATE OR REPLACE VIEW upcoming_services AS
SELECT 
    sm.*
FROM service_master sm
JOIN vehicles v ON sm.bin_no = v.bin_no
WHERE sm.expected_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND sm.status IN ('planned', 'called');

-- View for upcoming insurance renewals (next 60 days)
CREATE OR REPLACE VIEW upcoming_insurance_renewals AS
SELECT 
    ir.*
FROM insurance_renewals ir
JOIN vehicles v ON ir.bin_no = v.bin_no
WHERE ir.expected_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
  AND ir.status NOT IN ('renewed', 'shifted', 'not_interested');


-- =====================================================
-- FUNCTIONS (For common operations)
-- =====================================================

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID DEFAULT NULL, p_is_admin BOOLEAN DEFAULT false)
RETURNS JSON AS $$
DECLARE
    result JSON;
    v_total_vehicles INTEGER;
    v_service_due INTEGER;
    v_service_overdue INTEGER;
    v_insurance_due INTEGER;
    v_calls_today INTEGER;
    v_conversions_today INTEGER;
BEGIN
    IF p_is_admin THEN
        -- Admin sees all stats
        SELECT COUNT(*) INTO v_total_vehicles FROM vehicles;
        SELECT COUNT(*) INTO v_service_due FROM service_master 
            WHERE expected_date <= CURRENT_DATE + INTERVAL '7 days' AND status = 'planned';
        SELECT COUNT(*) INTO v_service_overdue FROM service_master 
            WHERE expected_date < CURRENT_DATE AND status NOT IN ('serviced', 'not_interested');
        SELECT COUNT(*) INTO v_insurance_due FROM insurance_renewals 
            WHERE expected_renewal_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'planned';
        SELECT COUNT(*) INTO v_calls_today FROM call_logs 
            WHERE DATE(call_date) = CURRENT_DATE;
        SELECT COUNT(*) INTO v_conversions_today FROM call_logs 
            WHERE DATE(call_date) = CURRENT_DATE AND decision IN ('will_book', 'already_serviced');
    ELSE
        -- Agent sees only their stats
        SELECT COUNT(DISTINCT bin_no) INTO v_total_vehicles FROM service_master WHERE agent_id = p_user_id;
        SELECT COUNT(*) INTO v_service_due FROM service_master 
            WHERE agent_id = p_user_id AND expected_date <= CURRENT_DATE + INTERVAL '7 days' AND status = 'planned';
        SELECT COUNT(*) INTO v_service_overdue FROM service_master 
            WHERE agent_id = p_user_id AND expected_date < CURRENT_DATE AND status NOT IN ('serviced', 'not_interested');
        SELECT COUNT(*) INTO v_insurance_due FROM insurance_renewals 
            WHERE agent_id = p_user_id AND expected_renewal_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'planned';
        SELECT COUNT(*) INTO v_calls_today FROM call_logs 
            WHERE agent_id = p_user_id AND DATE(call_date) = CURRENT_DATE;
        SELECT COUNT(*) INTO v_conversions_today FROM call_logs 
            WHERE agent_id = p_user_id AND DATE(call_date) = CURRENT_DATE AND decision IN ('will_book', 'already_serviced');
    END IF;
    
    SELECT json_build_object(
        'totalVehicles', v_total_vehicles,
        'serviceDue', v_service_due,
        'serviceOverdue', v_service_overdue,
        'insuranceDue', v_insurance_due,
        'callsToday', v_calls_today,
        'conversionsToday', v_conversions_today
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SERVICE GENERATION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_service_record()
RETURNS TRIGGER AS $$
DECLARE
    v_product_line VARCHAR(100);
    v_free_service_limit INTEGER;
    v_frequency_days INTEGER;
    v_km_frequency INTEGER;
    v_service_count INTEGER;
    v_next_service_num INTEGER;
    v_next_service_type VARCHAR(100);
    v_next_expected_date DATE;
    v_next_expected_kms INTEGER;
    v_customer_details RECORD;
BEGIN
    -- 1. Get vehicle details
    SELECT product_line, reg_no, customer_name, mobile1, id 
    INTO v_product_line, v_customer_details.reg_no, v_customer_details.customer_name, v_customer_details.mobile, v_customer_details.id
    FROM vehicles 
    WHERE bin_no = NEW.bin_no;

    IF v_product_line IS NULL THEN
        RAISE NOTICE 'Vehicle not found for bin_no: %', NEW.bin_no;
        RETURN NEW;
    END IF;

    -- 2. Get schedule details
    SELECT free_service, frequency_days, km_frequency 
    INTO v_free_service_limit, v_frequency_days, v_km_frequency
    FROM service_schedules 
    WHERE product_line = v_product_line;

    IF v_free_service_limit IS NULL THEN
        RAISE NOTICE 'Service schedule not found for product_line: %', v_product_line;
        RETURN NEW;
    END IF;

    -- 3. Count existing service records for this vehicle
    -- Includes the NEW record because this is an AFTER INSERT trigger? 
    -- Actually, count BEFORE this one? No, valid history includes this one.
    -- Wait, if it's AFTER INSERT, the new record is in the table.
    SELECT COUNT(*) INTO v_service_count 
    FROM service_records 
    WHERE bin_no = NEW.bin_no;
    
    -- 4. Calculate next service number
    v_next_service_num := v_service_count + 1;

    -- 5. Determine Service Type text
    IF v_next_service_num <= v_free_service_limit THEN
        -- Need ordinal suffix logic logic e.g. 1st, 2nd, 3rd...
        -- For simplicity:
        IF v_next_service_num = 1 THEN v_next_service_type := '1st Free Service';
        ELSIF v_next_service_num = 2 THEN v_next_service_type := '2nd Free Service';
        ELSIF v_next_service_num = 3 THEN v_next_service_type := '3rd Free Service';
        ELSE v_next_service_type := v_next_service_num || 'th Free Service';
        END IF;
    ELSE
        IF v_next_service_num = 1 THEN v_next_service_type := '1st Paid Service'; -- Unlikely if free limit > 0
        ELSIF v_next_service_num = 2 THEN v_next_service_type := '2nd Paid Service';
        ELSIF v_next_service_num = 3 THEN v_next_service_type := '3rd Paid Service';
        ELSE v_next_service_type := v_next_service_num || 'th Paid Service';
        END IF;
    END IF;

    -- 6. Calculate Expected Date and KMs
    v_next_expected_date := NEW.jc_closed_date + (v_frequency_days || ' days')::INTERVAL;
    v_next_expected_kms := NEW.km_runs + v_km_frequency;

    -- 7. Insert or Update Service Master
    -- We want to upsert based on bin_no (assuming one active upcoming service per vehicle)
    -- BUT service_master doesn't have a unique constraint on bin_no alone, 
    -- it might track history. However, usually 'service_master' is the "Upcoming Service" list.
    -- Let's check constraints. FK exists. No unique constraint on bin_no in CREATE TABLE.
    -- However, logic implies we are scheduling the *next* one. 
    -- So we should probably close any previous 'planned' service matches and insert/update new one.
    
    -- Mark previous planned services as serviced (if not already done by app logic)
    UPDATE service_master 
    SET status = 'serviced', 
        updated_at = NOW() 
    WHERE bin_no = NEW.bin_no 
      AND status NOT IN ('serviced', 'not_interested');

    -- Insert new planned service
    INSERT INTO service_master (
        bin_no, 
        reg_no, 
        customer_name, 
        mobile, 
        product_line, 
        service_type, 
        free_service, 
        expected_date, 
        expected_kms, 
        status, 
        priority
    ) VALUES (
        NEW.bin_no,
        v_customer_details.reg_no,
        v_customer_details.customer_name,
        v_customer_details.mobile,
        v_product_line,
        v_next_service_type,
        (v_next_service_num <= v_free_service_limit), -- boolean for free_service column in master
        v_next_expected_date,
        v_next_expected_kms,
        'planned',
        'medium' -- Default priority
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trigger_new_service_record ON service_records;
CREATE TRIGGER trigger_new_service_record
    AFTER INSERT ON service_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_service_record();

-- =====================================================
-- MARK SERVICE DONE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION handle_service_master_update()
RETURNS TRIGGER AS $$
DECLARE
    v_jc_no VARCHAR(50);
BEGIN
    -- Check if status changed to 'serviced'
    IF NEW.status = 'serviced' AND OLD.status != 'serviced' THEN
        -- Generate a pseudo Job Card Number
        v_jc_no := 'AGENT-MARK-' || substring(uuid_generate_v4()::text from 1 for 8);

        -- Insert into service_records
        -- This insertion will fire 'handle_new_service_record' trigger automatically!
        INSERT INTO service_records (
            jc_no,
            jc_closed_date,
            service_type,
            km_runs,
            bin_no
        ) VALUES (
            v_jc_no,
            CURRENT_DATE,
            OLD.service_type, -- Use the type described in the plan (e.g. "2nd Free Service")
            OLD.expected_kms, -- Use expected KMs as actuals since we don't have input
            OLD.bin_no
        );
        
        RAISE NOTICE 'Auto-created service record for %', NEW.bin_no;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trigger_mark_service_done ON service_master;
CREATE TRIGGER trigger_mark_service_done
    AFTER UPDATE ON service_master
    FOR EACH ROW
    EXECUTE FUNCTION handle_service_master_update();


-- =====================================================
-- REBUILD SERVICE MASTER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION rebuild_service_master()
RETURNS void AS $$
DECLARE
    v_vehicle RECORD;
    v_schedule RECORD;
    v_service_count INTEGER;
    v_days_since_sale INTEGER;
    v_services_due_count INTEGER;
    v_next_service_num INTEGER;
    v_next_service_type VARCHAR(100);
    v_next_expected_date DATE;
    v_next_expected_kms INTEGER;
    v_free_service_limit INTEGER;
    v_frequency_days INTEGER;
    v_km_frequency INTEGER;
    v_status VARCHAR(50);
BEGIN
    -- Loop through all vehicles
    FOR v_vehicle IN SELECT * FROM vehicles LOOP
        SELECT COUNT(*) INTO v_service_count 
        FROM service_records 
        WHERE bin_no = v_vehicle.bin_no;

        IF v_service_count = 0 THEN
            -- No records found, calculate based on sale date
            
            -- Get Limit and Frequency
            SELECT free_service, frequency_days, km_frequency 
            INTO v_free_service_limit, v_frequency_days, v_km_frequency
            FROM service_schedules 
            WHERE product_line = v_vehicle.product_line;
            
            IF FOUND THEN
                -- Calculate days since sale
                v_days_since_sale := CURRENT_DATE - v_vehicle.sale_date;
                
                -- Estimate how many services should have been done or are due
                IF v_frequency_days > 0 THEN
                     v_services_due_count := ROUND(v_days_since_sale::NUMERIC / v_frequency_days::NUMERIC);
                ELSE 
                     v_services_due_count := 0;
                END IF;

                -- If result is 0 (brand new car), maybe show 1st service anyway as planned
                IF v_services_due_count < 1 THEN
                    v_services_due_count := 1;
                END IF;
                
                v_next_service_num := v_services_due_count;

                -- Determine Service Type Text
                IF v_next_service_num <= v_free_service_limit THEN
                    IF v_next_service_num = 1 THEN v_next_service_type := '1st Free Service';
                    ELSIF v_next_service_num = 2 THEN v_next_service_type := '2nd Free Service';
                    ELSIF v_next_service_num = 3 THEN v_next_service_type := '3rd Free Service';
                    ELSE v_next_service_type := v_next_service_num || 'th Free Service';
                    END IF;
                ELSE
                    IF v_next_service_num = 1 THEN v_next_service_type := '1st Paid Service'; 
                    ELSIF v_next_service_num = 2 THEN v_next_service_type := '2nd Paid Service';
                    ELSIF v_next_service_num = 3 THEN v_next_service_type := '3rd Paid Service';
                    ELSE v_next_service_type := v_next_service_num || 'th Paid Service';
                    END IF;
                END IF;

                 -- Calculate Expected Date and KMs
                 v_next_expected_date := v_vehicle.sale_date + (v_next_service_num * v_frequency_days || ' days')::INTERVAL;
                 v_next_expected_kms := v_next_service_num * v_km_frequency;

                 -- Determine Status
                 IF v_next_expected_date < CURRENT_DATE THEN
                    v_status := 'overdue';
                 ELSE
                    v_status := 'planned';
                 END IF;
                 
                -- Clean existing entries for this vehicle
                DELETE FROM service_master WHERE bin_no = v_vehicle.bin_no AND status IN ('planned', 'called', 'overdue');

                INSERT INTO service_master (
                    bin_no, 
                    reg_no, 
                    customer_name, 
                    mobile, 
                    product_line, 
                    service_type, 
                    free_service, 
                    expected_date, 
                    expected_kms, 
                    status, 
                    priority
                ) VALUES (
                    v_vehicle.bin_no,
                    v_vehicle.reg_no,
                    v_vehicle.customer_name,
                    v_vehicle.mobile1,
                    v_vehicle.product_line,
                    v_next_service_type,
                    (v_next_service_num <= v_free_service_limit), 
                    v_next_expected_date,
                    v_next_expected_kms,
                    v_status,
                    'medium'
                );
                
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Schema creation completed successfully!
-- 
-- ✅ Custom authentication with bcrypt password hashing
-- ✅ All tables created with proper indexes and constraints
-- ✅ Demo users inserted (check comments above for credentials)
-- ✅ Sample data for testing
-- ✅ Views for common queries
-- ✅ Helper functions for dashboard stats
-- ✅ Service Master Rebuild function added
-- 
-- Next steps:
-- 1. Test login with demo credentials
-- 2. Verify all tables are created correctly
-- 3. Test the application functionality
