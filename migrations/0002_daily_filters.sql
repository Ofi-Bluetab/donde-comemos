CREATE TABLE daily_filters (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  max_minutes INTEGER CHECK(max_minutes BETWEEN 0 AND 300),
  max_price REAL CHECK(max_price BETWEEN 0 AND 500),
  cuisine TEXT NOT NULL DEFAULT ''
);
