-- Run this if you already have smc_career_connect DB and want to add chat.
-- In MySQL: USE smc_career_connect; then run the statements below.
   USE smc_career_connect;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS chat_rooms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  companyId INT UNSIGNED NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  roomId INT UNSIGNED NOT NULL,
  senderType ENUM('STUDENT', 'ADMIN') NOT NULL,
  senderId INT UNSIGNED NOT NULL,
  content TEXT DEFAULT NULL,
  voiceNotePath VARCHAR(500) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roomId) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  INDEX idx_room_created (roomId, createdAt)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_last_seen (
  userType ENUM('STUDENT', 'ADMIN') NOT NULL,
  userId INT UNSIGNED NOT NULL,
  roomId INT UNSIGNED NOT NULL,
  lastSeenAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (userType, userId, roomId),
  FOREIGN KEY (roomId) REFERENCES chat_rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create a chat room for every existing company that doesn't have one
INSERT IGNORE INTO chat_rooms (companyId)
SELECT id FROM companies;

SET FOREIGN_KEY_CHECKS = 1;
