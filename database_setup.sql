-- database_setup.sql
CREATE DATABASE community_help;

-- Connect to the database and create tables
\c community_help;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(10),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_rankings INTEGER DEFAULT 0,
    average_rank DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Rankings table with unique constraint
CREATE TABLE rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    rank_value INTEGER NOT NULL CHECK (rank_value IN (1, 2, 3)),
    ranked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_rankings_post_id ON rankings(post_id);
CREATE INDEX idx_rankings_user_id ON rankings(user_id);
CREATE INDEX idx_users_phone ON users(phone_number);

-- Function to update post rankings
CREATE OR REPLACE FUNCTION update_post_rankings()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the post's ranking aggregates
    UPDATE posts p
    SET 
        total_rankings = (
            SELECT COUNT(*) 
            FROM rankings r 
            WHERE r.post_id = p.id
        ),
        average_rank = (
            SELECT AVG(r.rank_value)::DECIMAL(3,2)
            FROM rankings r 
            WHERE r.post_id = p.id
        )
    WHERE p.id = NEW.post_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rankings
CREATE TRIGGER update_post_rankings_trigger
AFTER INSERT OR UPDATE OR DELETE ON rankings
FOR EACH ROW
EXECUTE FUNCTION update_post_rankings();