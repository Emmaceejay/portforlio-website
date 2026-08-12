CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  service_id TEXT NOT NULL CHECK (
    service_id IN (
      'iot-embedded',
      'cctv-training',
      'automation-design',
      'web-development'
    )
  ),
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_works_service_date
ON works (service_id, date DESC);
