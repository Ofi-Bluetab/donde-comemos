CREATE TABLE groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE group_members (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(group_id,user_id)
);
CREATE INDEX group_members_user ON group_members(user_id,group_id);
INSERT INTO groups(id,name,join_code,created_by)
VALUES(1,'Mi equipo',lower(hex(randomblob(16))),(SELECT MIN(id) FROM users));
INSERT INTO group_members(group_id,user_id) SELECT 1,id FROM users;
ALTER TABLE restaurants ADD COLUMN group_id INTEGER REFERENCES groups(id);
UPDATE restaurants SET group_id=1;
CREATE INDEX restaurants_group ON restaurants(group_id,id);
ALTER TABLE sessions ADD COLUMN active_group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;
UPDATE sessions SET active_group_id=1;
