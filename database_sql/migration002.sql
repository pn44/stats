CREATE TABLE `preference` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `type` INT NOT NULL DEFAULT 0, -- 0=string, 1=int, 2=float, 3=bool
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT,
    `user` INT NOT NULL,
    CONSTRAINT FK_PreferenceUser FOREIGN KEY (`user`) 
    REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
);