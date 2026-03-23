SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'buffer_minutes') = 0,
    'ALTER TABLE bookings ADD COLUMN buffer_minutes INT NOT NULL DEFAULT 60 AFTER booked_end_time',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'buffer_end_time') = 0,
    'ALTER TABLE bookings ADD COLUMN buffer_end_time DATETIME(6) NULL AFTER buffer_minutes',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE bookings
SET
    buffer_minutes = COALESCE(NULLIF(buffer_minutes, 0), 60),
    buffer_end_time = CASE
        WHEN booked_end_time IS NULL THEN buffer_end_time
        ELSE DATE_ADD(booked_end_time, INTERVAL COALESCE(NULLIF(buffer_minutes, 0), 60) MINUTE)
    END
WHERE buffer_end_time IS NULL
   OR buffer_minutes IS NULL
   OR buffer_minutes = 0;

ALTER TABLE bookings
    MODIFY COLUMN buffer_minutes INT NOT NULL,
    MODIFY COLUMN buffer_end_time DATETIME(6) NOT NULL;
