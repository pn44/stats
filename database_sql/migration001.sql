-- Initial table creation

-- Users table
CREATE TABLE `user` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `email` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(500),
    `otp_secret` CHAR(16),
    `is_admin` BOOL NOT NULL DEFAULT FALSE
);

CREATE TABLE `provider` (
    `id` INT PRIMARY KEY AUTO_INCREMENT, 
    `name` VARCHAR(50) NOT NULL, 
    `country` CHAR(2), 
    `module_name` VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE `category` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `uid` VARCHAR(70) NOT NULL UNIQUE,
    `rating` INT,
    CONSTRAINT `CK_rating` CHECK (0 <= `rating` <=3)
);

CREATE TABLE `article` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(300),
    `date_time` TIMESTAMP,
    `link` VARCHAR(400),
    `description` TEXT,
    `creator` VARCHAR(50),
    `uid` VARCHAR(20) NOT NULL UNIQUE,
    `category` INT,
    `imageurl` VARCHAR(255),
    `provider` INT,
    CONSTRAINT FK_ArticleProvider FOREIGN KEY (`provider`) 
    REFERENCES `provider`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_ArticleCategory FOREIGN KEY (`category`) 
    REFERENCES `category`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
);
