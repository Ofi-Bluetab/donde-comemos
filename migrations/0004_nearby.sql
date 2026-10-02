ALTER TABLE restaurants ADD COLUMN latitude REAL;
ALTER TABLE restaurants ADD COLUMN longitude REAL;
ALTER TABLE restaurants ADD COLUMN external_id TEXT;
CREATE UNIQUE INDEX restaurants_external ON restaurants(external_id) WHERE external_id IS NOT NULL;
CREATE TABLE office_locations(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, latitude REAL NOT NULL, longitude REAL NOT NULL);
CREATE TABLE nearby_cache(cache_key TEXT PRIMARY KEY, payload TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE provider_limits(provider TEXT PRIMARY KEY, requested INTEGER NOT NULL);
