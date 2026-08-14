-- ============================================================
-- NAGDRISHTI AI — POSTGIS SPATIAL DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL with PostGIS 3.4+
-- SRID: 4326 (WGS 84 GPS Coordinates)
-- ============================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Nagpur Municipal Administrative & Risk Zones
CREATE TABLE IF NOT EXISTS nagpur_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    marathi_name VARCHAR(100),
    elevation_meters NUMERIC(6, 2) NOT NULL,
    drainage_capacity_pct INTEGER CHECK (drainage_capacity_pct BETWEEN 0 AND 100),
    population INTEGER,
    baseline_risk VARCHAR(20) DEFAULT 'LOW',
    center_geom GEOMETRY(Point, 4326) NOT NULL,
    boundary_geom GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nagpur_zones_boundary ON nagpur_zones USING GIST (boundary_geom);
CREATE INDEX IF NOT EXISTS idx_nagpur_zones_center ON nagpur_zones USING GIST (center_geom);

-- 2. Citizen Crowdsourced Reports
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_name VARCHAR(100),
    issue_type VARCHAR(50) NOT NULL, -- Waterlogging, Pothole, Road Damage, Traffic, Drainage Overflow, Fallen Tree
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, SEVERE
    description TEXT,
    image_url TEXT,
    location_name VARCHAR(255),
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, VERIFIED, DISPATCHED, RESOLVED
    upvotes INTEGER DEFAULT 1,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_geom ON citizen_reports USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports (verification_status);

-- 3. Year-Round Construction & Civil Works Intelligence
CREATE TABLE IF NOT EXISTS construction_projects (
    id VARCHAR(50) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- METRO_EXPANSION, FLYOVER_REPAIR, ROAD_WIDENING, DRAINAGE_UPGRADE, etc.
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, PLANNED, COMPLETED, HALTED
    zone_id VARCHAR(50) REFERENCES nagpur_zones(id),
    executing_agency VARCHAR(150),
    traffic_impact VARCHAR(20) DEFAULT 'MODERATE',
    speed_limit_kmh INTEGER DEFAULT 30,
    lane_closures TEXT,
    detour_advice TEXT,
    start_date DATE,
    expected_end_date DATE,
    source VARCHAR(50) DEFAULT 'NMC_MUNICIPAL_FEED',
    confidence_score_pct NUMERIC(5, 2) DEFAULT 90.0,
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    perimeter_geom GEOMETRY(Polygon, 4326),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_construction_location ON construction_projects USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_construction_perimeter ON construction_projects USING GIST (perimeter_geom);

-- 4. Satellite Earth Observation & AI Flood Inundation Polygons
CREATE TABLE IF NOT EXISTS satellite_flood_detections (
    id VARCHAR(100) PRIMARY KEY,
    satellite VARCHAR(50) NOT NULL, -- SENTINEL_1_SAR, SENTINEL_2_MSI
    acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
    zone_id VARCHAR(50) REFERENCES nagpur_zones(id),
    feature_type VARCHAR(50) NOT NULL, -- FLOOD_INUNDATION, STANDING_WATER, URBAN_CHANGE
    area_hectares NUMERIC(8, 2),
    confidence_pct NUMERIC(5, 2) NOT NULL,
    severity VARCHAR(20) DEFAULT 'HIGH',
    inundation_geom GEOMETRY(Polygon, 4326) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satellite_inundation ON satellite_flood_detections USING GIST (inundation_geom);

-- 5. Emergency Civic Resources & Response Units
CREATE TABLE IF NOT EXISTS emergency_resources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- DEWATERING_PUMP, ASPHALT_REPAIR_UNIT, TRAFFIC_SQUAD, TREE_CUTTER, BOAT_TEAM
    status VARCHAR(30) DEFAULT 'AVAILABLE', -- AVAILABLE, DEPLOYED, BUSY, OFFLINE
    total_quantity INTEGER DEFAULT 1,
    deployed_quantity INTEGER DEFAULT 0,
    assigned_zone_id VARCHAR(50) REFERENCES nagpur_zones(id),
    base_location_geom GEOMETRY(Point, 4326) NOT NULL,
    last_dispatched_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_emergency_resources_geom ON emergency_resources USING GIST (base_location_geom);

-- 6. Spatial Query Functions

-- A. Find incidents within radius (km) of user GPS point
CREATE OR REPLACE FUNCTION get_incidents_within_radius(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION
)
RETURNS TABLE (
    report_id UUID,
    issue_type VARCHAR,
    severity VARCHAR,
    location_name VARCHAR,
    distance_km DOUBLE PRECISION,
    reported_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.issue_type,
        cr.severity,
        cr.location_name,
        ROUND((ST_Distance(
            cr.location_geom::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000.0)::numeric, 2)::double precision AS distance_km,
        cr.reported_at
    FROM citizen_reports cr
    WHERE ST_DWithin(
        cr.location_geom::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_km * 1000.0
    )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- B. Find nearest available emergency pump or response team
CREATE OR REPLACE FUNCTION find_nearest_resource(
    target_lat DOUBLE PRECISION,
    target_lng DOUBLE PRECISION,
    resource_type VARCHAR
)
RETURNS TABLE (
    resource_id VARCHAR,
    resource_name VARCHAR,
    available_qty INTEGER,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        er.id,
        er.name,
        (er.total_quantity - er.deployed_quantity) AS available_qty,
        ST_Distance(
            er.base_location_geom::geography,
            ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
        ) AS distance_meters
    FROM emergency_resources er
    WHERE er.type = resource_type AND (er.total_quantity - er.deployed_quantity) > 0
    ORDER BY distance_meters ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
