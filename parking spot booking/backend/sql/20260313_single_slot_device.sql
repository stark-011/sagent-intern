-- Single-slot mode migration
-- 1) Add slot device state (open/close)
-- 2) Keep exactly one slot per parking spot
-- 3) Enforce total_slots = 1 at DB level
-- 4) Add unique slot-per-spot constraint

SET @has_device_col := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'spot_slots'
      AND column_name = 'is_device_open'
);
SET @sql := IF(
    @has_device_col = 0,
    'ALTER TABLE spot_slots ADD COLUMN is_device_open BIT(1) NOT NULL DEFAULT b''1''',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE spot_slots
SET is_device_open = b'1'
WHERE is_device_open IS NULL;

CREATE TEMPORARY TABLE tmp_keep_slot AS
SELECT spot_id, MIN(slot_id) AS keep_slot_id
FROM spot_slots
GROUP BY spot_id;

UPDATE bookings b
JOIN spot_slots ss ON ss.slot_id = b.slot_id
JOIN tmp_keep_slot ks ON ks.spot_id = ss.spot_id
SET b.slot_id = ks.keep_slot_id
WHERE b.slot_id <> ks.keep_slot_id;

UPDATE reservation_holds h
JOIN spot_slots ss ON ss.slot_id = h.slot_id
JOIN tmp_keep_slot ks ON ks.spot_id = ss.spot_id
SET h.slot_id = ks.keep_slot_id
WHERE h.slot_id <> ks.keep_slot_id;

DELETE ss
FROM spot_slots ss
LEFT JOIN tmp_keep_slot ks ON ss.slot_id = ks.keep_slot_id
WHERE ks.keep_slot_id IS NULL;

DROP TEMPORARY TABLE tmp_keep_slot;

INSERT INTO spot_slots (slot_id, slot_code, slot_label, slot_status, is_device_open, spot_id)
SELECT CONCAT('slot_', REPLACE(UUID(), '-', '')),
       'S-01',
       'Primary Slot',
       'AVAILABLE',
       b'1',
       ps.spot_id
FROM parking_spots ps
LEFT JOIN spot_slots ss ON ss.spot_id = ps.spot_id
WHERE ss.spot_id IS NULL;

UPDATE parking_spots
SET total_slots = 1;

SET @has_total_slots_check := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'parking_spots'
      AND constraint_type = 'CHECK'
      AND constraint_name = 'chk_parking_spots_total_slots_one'
);
SET @sql := IF(
    @has_total_slots_check = 0,
    'ALTER TABLE parking_spots ADD CONSTRAINT chk_parking_spots_total_slots_one CHECK (total_slots = 1)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_unique_slot_per_spot := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'spot_slots'
      AND column_name = 'spot_id'
      AND non_unique = 0
);
SET @sql := IF(
    @has_unique_slot_per_spot = 0,
    'ALTER TABLE spot_slots ADD CONSTRAINT uk_spot_slots_spot_id UNIQUE (spot_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
