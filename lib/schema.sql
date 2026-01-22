-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS rich_menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    width INTEGER NOT NULL DEFAULT 800,
    height INTEGER NOT NULL DEFAULT 270,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rich_menu_areas table
CREATE TABLE IF NOT EXISTS rich_menu_areas (
    id SERIAL PRIMARY KEY,
    rich_menu_id INTEGER NOT NULL REFERENCES rich_menus(id) ON DELETE CASCADE,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB NOT NULL,
    bg_color VARCHAR(32) DEFAULT NULL,
    bg_opacity REAL DEFAULT 0.2,
    border_color VARCHAR(32) DEFAULT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure existing databases get the new columns
ALTER TABLE rich_menu_areas ADD COLUMN IF NOT EXISTS bg_color VARCHAR(32) DEFAULT NULL;
ALTER TABLE rich_menu_areas ADD COLUMN IF NOT EXISTS bg_opacity REAL DEFAULT 0.2;
ALTER TABLE rich_menu_areas ADD COLUMN IF NOT EXISTS border_color VARCHAR(32) DEFAULT NULL; 

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rich_menus_created_at ON rich_menus(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rich_menu_areas_rich_menu_id ON rich_menu_areas(rich_menu_id);
CREATE INDEX IF NOT EXISTS idx_rich_menu_areas_order_index ON rich_menu_areas(rich_menu_id, order_index);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_rich_menus_updated_at ON rich_menus;
CREATE TRIGGER update_rich_menus_updated_at
    BEFORE UPDATE ON rich_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rich_menu_areas_updated_at ON rich_menu_areas;
CREATE TRIGGER update_rich_menu_areas_updated_at
    BEFORE UPDATE ON rich_menu_areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO rich_menus (name, width, height) VALUES ('Sample Menu', 800, 270);
