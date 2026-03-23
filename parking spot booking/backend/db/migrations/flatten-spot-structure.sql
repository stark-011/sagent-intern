SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_spots' AND column_name = 'vehicle_types') = 0,
    'ALTER TABLE parking_spots ADD COLUMN vehicle_types VARCHAR(255) NULL AFTER longitude',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_spots' AND column_name = 'slot_id') = 0,
    'ALTER TABLE parking_spots ADD COLUMN slot_id VARCHAR(50) NULL AFTER total_slots',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_spots' AND column_name = 'slot_code') = 0,
    'ALTER TABLE parking_spots ADD COLUMN slot_code VARCHAR(40) NULL AFTER slot_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_spots' AND column_name = 'slot_label') = 0,
    'ALTER TABLE parking_spots ADD COLUMN slot_label VARCHAR(80) NULL AFTER slot_code',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_spots' AND column_name = 'slot_status') = 0,
    'ALTER TABLE parking_spots ADD COLUMN slot_status VARCHAR(32) NOT NULL DEFAULT ''AVAILABLE'' AFTER slot_label',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_spots' AND column_name = 'is_device_open') = 0,
    'ALTER TABLE parking_spots ADD COLUMN is_device_open BIT(1) NOT NULL DEFAULT b''0'' AFTER slot_status',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE parking_spots ps
LEFT JOIN spot_slots ss ON ss.spot_id = ps.spot_id
LEFT JOIN (
    SELECT spot_id, GROUP_CONCAT(LOWER(vehicle_type) ORDER BY vehicle_type SEPARATOR ',') AS vehicle_types
    FROM parking_spot_vehicle_types
    GROUP BY spot_id
) psv ON psv.spot_id = ps.spot_id
SET
    ps.slot_id = COALESCE(ss.slot_id, ps.slot_id, CONCAT('slot_', ps.spot_id)),
    ps.slot_code = COALESCE(ss.slot_code, ps.slot_code, 'S-01'),
    ps.slot_label = COALESCE(ss.slot_label, ps.slot_label, 'Primary Slot'),
    ps.slot_status = COALESCE(ss.slot_status, ps.slot_status, 'AVAILABLE'),
    ps.is_device_open = COALESCE(ss.is_device_open, ps.is_device_open, b'0'),
    ps.vehicle_types = COALESCE(psv.vehicle_types, ps.vehicle_types, '');

ALTER TABLE parking_spots
    MODIFY COLUMN slot_id VARCHAR(50) NOT NULL,
    MODIFY COLUMN slot_code VARCHAR(40) NOT NULL,
    MODIFY COLUMN slot_status VARCHAR(32) NOT NULL;

SET @spot_slot_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'parking_spots'
      AND index_name = 'idx_spots_slot_id'
);
SET @spot_slot_index_sql := IF(
    @spot_slot_index_exists = 0,
    'CREATE UNIQUE INDEX idx_spots_slot_id ON parking_spots(slot_id)',
    'SELECT 1'
);
PREPARE stmt FROM @spot_slot_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'spot_id') = 0,
    'ALTER TABLE bookings ADD COLUMN spot_id VARCHAR(50) NULL AFTER pricing_rule_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE bookings b
JOIN spot_slots ss ON ss.slot_id = b.slot_id
SET b.spot_id = ss.spot_id
WHERE b.spot_id IS NULL OR b.spot_id = '';

ALTER TABLE bookings
    MODIFY COLUMN spot_id VARCHAR(50) NOT NULL;

SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reservation_holds' AND column_name = 'spot_id') = 0,
    'ALTER TABLE reservation_holds ADD COLUMN spot_id VARCHAR(50) NULL AFTER reserved_amount',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE reservation_holds rh
JOIN spot_slots ss ON ss.slot_id = rh.slot_id
SET rh.spot_id = ss.spot_id
WHERE rh.spot_id IS NULL OR rh.spot_id = '';

ALTER TABLE reservation_holds
    MODIFY COLUMN spot_id VARCHAR(50) NOT NULL;

SET @bookings_slot_fk := (
    SELECT constraint_name
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'bookings'
      AND column_name = 'slot_id'
      AND referenced_table_name = 'spot_slots'
    LIMIT 1
);
SET @bookings_slot_fk_sql := IF(
    @bookings_slot_fk IS NOT NULL,
    CONCAT('ALTER TABLE bookings DROP FOREIGN KEY ', @bookings_slot_fk),
    'SELECT 1'
);
PREPARE stmt FROM @bookings_slot_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @holds_slot_fk := (
    SELECT constraint_name
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'reservation_holds'
      AND column_name = 'slot_id'
      AND referenced_table_name = 'spot_slots'
    LIMIT 1
);
SET @holds_slot_fk_sql := IF(
    @holds_slot_fk IS NOT NULL,
    CONCAT('ALTER TABLE reservation_holds DROP FOREIGN KEY ', @holds_slot_fk),
    'SELECT 1'
);
PREPARE stmt FROM @holds_slot_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @bookings_spot_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'bookings'
      AND column_name = 'spot_id'
      AND referenced_table_name = 'parking_spots'
);
SET @bookings_spot_fk_sql := IF(
    @bookings_spot_fk_exists = 0,
    'ALTER TABLE bookings ADD CONSTRAINT fk_bookings_spot FOREIGN KEY (spot_id) REFERENCES parking_spots(spot_id)',
    'SELECT 1'
);
PREPARE stmt FROM @bookings_spot_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @holds_spot_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'reservation_holds'
      AND column_name = 'spot_id'
      AND referenced_table_name = 'parking_spots'
);
SET @holds_spot_fk_sql := IF(
    @holds_spot_fk_exists = 0,
    'ALTER TABLE reservation_holds ADD CONSTRAINT fk_holds_spot FOREIGN KEY (spot_id) REFERENCES parking_spots(spot_id)',
    'SELECT 1'
);
PREPARE stmt FROM @holds_spot_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DROP TABLE IF EXISTS parking_spot_vehicle_types;
DROP TABLE IF EXISTS spot_slots;
