CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires);
CREATE TABLE restaurants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  price REAL NOT NULL CHECK(price > 0 AND price <= 500),
  minutes INTEGER NOT NULL CHECK(minutes BETWEEN 0 AND 300),
  address TEXT NOT NULL DEFAULT '',
  demo INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE ratings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  quality INTEGER NOT NULL CHECK(quality BETWEEN 1 AND 5),
  service INTEGER NOT NULL CHECK(service BETWEEN 1 AND 5),
  value INTEGER NOT NULL CHECK(value BETWEEN 1 AND 5),
  distance INTEGER NOT NULL CHECK(distance BETWEEN 1 AND 5),
  PRIMARY KEY(user_id, restaurant_id)
);
CREATE INDEX ratings_restaurant ON ratings(restaurant_id);
CREATE TABLE auth_attempts (
  address TEXT PRIMARY KEY,
  started INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
CREATE INDEX auth_attempts_started ON auth_attempts(started);
