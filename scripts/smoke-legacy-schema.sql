-- Schema einer Bestands-Datenbank im Baseline-Stand (entspricht 0001-initial-schema),
-- OHNE SequelizeMeta - so sah die Produktion vor v0.7.24 aus (sync()-Zeit).
--
-- Fuer Szenario 2 in scripts/smoke-test.sh. Vorher loeschte das Szenario nur
-- SequelizeMeta aus der Datenbank von Szenario 1; deren Schema war dann aber schon auf
-- dem neuesten Stand, und alle Migrationen liefen ein zweites Mal darueber. Migration
-- 0003 liest die Spalte writtenTo, die es danach nicht mehr gibt.
--
-- Herkunft: CREATE-TABLE-Anweisungen aus dem Uberspace-Dump von enzlor_prod vom
-- 2026-09-19 (in SequelizeMeta stand nur 0001). Nur das Schema - keine Daten.
-- EINGEFROREN wie die Baseline selbst: Diese Datei wird nicht an neue Migrationen angepasst.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `comments` (
  `id` varchar(255) NOT NULL,
  `writtenBy` varchar(255) NOT NULL,
  `writtenTo` varchar(255) NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `writtenBy` (`writtenBy`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`writtenBy`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `festivalEvents` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bringYourOwnBottle` tinyint(1) DEFAULT NULL,
  `bringYourOwnFood` tinyint(1) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `UserId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `festivalEvents_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friendRequests` (
  `id` varchar(255) NOT NULL,
  `senderId` varchar(255) NOT NULL,
  `receiverId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `senderId` (`senderId`),
  KEY `receiverId` (`receiverId`),
  CONSTRAINT `friendRequests_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `friendRequests_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friendships` (
  `id` varchar(255) NOT NULL,
  `friend1Id` varchar(255) NOT NULL,
  `friend2Id` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `friendships_friend1Id_friend2Id_unique` (`friend1Id`,`friend2Id`),
  KEY `friend2Id` (`friend2Id`),
  CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`friend1Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`friend2Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `groupMembers` (
  `id` varchar(255) NOT NULL,
  `GroupId` varchar(255) NOT NULL,
  `UserId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `groupMembers_UserId_GroupId_unique` (`GroupId`,`UserId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `groupMembers_ibfk_1` FOREIGN KEY (`GroupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `groupMembers_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `groups` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `ownerId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ownerId` (`ownerId`),
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guestInformations` (
  `id` varchar(255) NOT NULL,
  `food` varchar(255) DEFAULT NULL,
  `drink` varchar(255) DEFAULT NULL,
  `numberOfOtherGuests` int(11) DEFAULT NULL,
  `coming` tinyint(1) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `FestivalEventId` varchar(255) NOT NULL,
  `UserId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guest_informations__festival_event_id__user_id` (`FestivalEventId`,`UserId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `guestInformations_ibfk_1` FOREIGN KEY (`FestivalEventId`) REFERENCES `festivalEvents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `guestInformations_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessionTokens` (
  `UserId` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`UserId`),
  CONSTRAINT `sessionTokens_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `userImages` (
  `id` varchar(255) NOT NULL,
  `UserId` varchar(255) NOT NULL,
  `image` longblob NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `userImages_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `forename` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Ausgedachte Altdaten (Testdaten duerfen wachsen, das Schema oben nicht). Kommentare: writtenTo zeigt auf ein Festival, auf ein
-- Profil und ins Leere (Waise aus der Zeit ohne FK). Migration 0003 muss die ersten
-- beiden der richtigen Spalte zuordnen und die Waise verwerfen.
INSERT INTO `users` (`id`, `password`, `nickname`, `createdAt`, `updatedAt`) VALUES
  ('legacy-owner', 'hash', 'legacy_owner', NOW(), NOW()),
  ('legacy-guest', 'hash', 'legacy_guest', NOW(), NOW());
INSERT INTO `festivalEvents` (`id`, `name`, `UserId`, `createdAt`, `updatedAt`) VALUES
  ('legacy-festival', 'Altes Festival', 'legacy-owner', NOW(), NOW());
INSERT INTO `comments` (`id`, `writtenBy`, `writtenTo`, `comment`, `createdAt`, `updatedAt`) VALUES
  ('legacy-c-festival', 'legacy-guest', 'legacy-festival', 'ans Festival', NOW(), NOW()),
  ('legacy-c-profil', 'legacy-guest', 'legacy-owner', 'ans Profil', NOW(), NOW()),
  ('legacy-c-waise', 'legacy-guest', 'gibt-es-nicht', 'ins Leere', NOW(), NOW());

-- Zu- und Absage im alten Format (coming als Boolean). Migration 0004 macht daraus
-- answer = 'yes' bzw. 'no'.
INSERT INTO `guestInformations` (`id`, `coming`, `numberOfOtherGuests`, `FestivalEventId`, `UserId`, `createdAt`, `updatedAt`) VALUES
  ('legacy-g-zusage', 1, 0, 'legacy-festival', 'legacy-guest', NOW(), NOW()),
  ('legacy-g-absage', 0, 0, 'legacy-festival', 'legacy-owner', NOW(), NOW());
