CREATE DATABASE IF NOT EXISTS newdb;
USE newdb;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT(11) AUTO_INCREMENT,
    `username` VARCHAR(30) COLLATE utf8_bin,
    `surname` VARCHAR(30),
    `age` TINYINT(3),
    `role` VARCHAR(15),
    `password` VARCHAR(15),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `tokens` (
    `id` INT(11),
    `uuid` VARCHAR(40),
    `timestamp` BIGINT(15),
    PRIMARY KEY(`id`)
);


