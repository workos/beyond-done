-- Every question asked through the class chat, read at /chat-log.
CREATE TABLE IF NOT EXISTS chat_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  turn INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  error TEXT
);
