
-- Create database (optional, you can also create this manually in phpMyAdmin)
-- CREATE DATABASE IF NOT EXISTS aerosachs_events;
-- USE aerosachs_events;

-- Create callsigns table
CREATE TABLE IF NOT EXISTS `callsigns` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create event_participations table
CREATE TABLE IF NOT EXISTS `event_participations` (
  `id` VARCHAR(36) NOT NULL,
  `callsign_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `departure_airport` VARCHAR(255) NOT NULL,
  `arrival_airport` VARCHAR(255) NOT NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_event_participations_callsign` (`callsign_id`),
  CONSTRAINT `fk_event_participations_callsign` FOREIGN KEY (`callsign_id`) REFERENCES `callsigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create manual_participation_counts table
CREATE TABLE IF NOT EXISTS `manual_participation_counts` (
  `id` VARCHAR(36) NOT NULL,
  `callsign_id` VARCHAR(36) NOT NULL,
  `count` INT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_callsign_id` (`callsign_id`),
  CONSTRAINT `fk_manual_counts_callsign` FOREIGN KEY (`callsign_id`) REFERENCES `callsigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert some initial callsigns as sample data
INSERT INTO `callsigns` (`id`, `code`, `is_active`) VALUES
('1', 'VA001', 1),
('2', 'VA002', 1),
('3', 'VA003', 1),
('4', 'VA004', 1),
('5', 'VA005', 1);

-- Insert some sample event participations
INSERT INTO `event_participations` (`id`, `callsign_id`, `date`, `departure_airport`, `arrival_airport`, `is_approved`, `submitted_at`, `approved_at`) VALUES
('1', '1', '2025-04-10', 'KJFK', 'KLAX', 1, '2025-04-05 10:30:00', '2025-04-06 14:20:00'),
('2', '2', '2025-04-12', 'EGLL', 'EHAM', 1, '2025-04-07 08:15:00', '2025-04-08 11:45:00'),
('3', '3', '2025-04-15', 'LFPG', 'LEMD', 0, '2025-04-13 16:20:00', NULL);

-- You can remove the sample data inserts if you don't want them
