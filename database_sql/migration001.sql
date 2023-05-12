-- Initial table creation

-- Users table
CREATE TABLE `user` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `email` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(500),
    `otp_secret` CHAR(16),
    `is_admin` BOOL NOT NULL DEFAULT FALSE
);

-- displaylevels
-- 0: show nothing
-- 1: show views
-- 2: + likes
-- 3: + dislikes
-- 4: + comments
CREATE TABLE `page` (
    `id` INT PRIMARY KEY AUTO_INCREMENT, 
    `slug` VARCHAR(50) UNIQUE, 
    `name` VARCHAR(100),
	`views` INT DEFAULT 0,
	`likes` INT DEFAULT 0,
	`dislikes` INT DEFAULT 0,
	`displaylevel` INT DEFAULT 4,
	CHECK (0 <= `displaylevel` <= 4)
);
