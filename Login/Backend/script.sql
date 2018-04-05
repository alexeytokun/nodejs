CREATE DATABASE newdb;
USE newdb;

CREATE TABLE `tokens` (
    `id` INT(11) AUTO_INCREMENT,
    `uuid` VARCHAR(40),
    `timestamp` BIGINT(15),
    PRIMARY KEY(`id`)
);

CREATE TABLE `countries` (
    `country_id` INT(11) AUTO_INCREMENT,
    `name` VARCHAR(30),
    PRIMARY KEY(`country_id`)
);

CREATE TABLE `schools` (
    `school_id` INT(11) AUTO_INCREMENT,
    `name` VARCHAR(45),
    PRIMARY KEY(`school_id`)
);

CREATE TABLE `cities` (
    `city_id` INT(11) AUTO_INCREMENT,
    `name` VARCHAR(45),
    `country_id` INT(11),
    PRIMARY KEY(`city_id`),
    FOREIGN KEY(`country_id`)
		REFERENCES `countries`(`country_id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE `schools_to_cities` (
    `id` INT(11) AUTO_INCREMENT,
    `school_id` INT(11),
    `city_id` INT(11),
    PRIMARY KEY(`id`),
	FOREIGN KEY(`city_id`)
		REFERENCES `cities`(`city_id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(`school_id`)
    	REFERENCES `schools`(`school_id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE `users` (
    `id` INT(11) AUTO_INCREMENT,
    `username` VARCHAR(30) COLLATE utf8_bin,
    `surname` VARCHAR(30),
    `age` DATE,
    `role` VARCHAR(15),
    `country_id` INT(11),
    `city_id` INT(11),
    `school_id` INT(11),
    `password` VARCHAR(15),
    `bio` VARCHAR(250),
    PRIMARY KEY(`id`),
    FOREIGN KEY(`country_id`)
    		REFERENCES `countries`(`country_id`)
            ON UPDATE CASCADE
            ON DELETE SET NULL,
    FOREIGN KEY(`city_id`)
    		REFERENCES `cities`(`city_id`)
            ON UPDATE CASCADE
            ON DELETE SET NULL,
    FOREIGN KEY(`school_id`)
        	REFERENCES `schools`(`school_id`)
            ON UPDATE CASCADE
            ON DELETE SET NULL
);

INSERT INTO `countries` (`name`) VALUES ('Belarus');
INSERT INTO `countries` (`name`) VALUES ('Russia');
INSERT INTO `countries` (`name`) VALUES ('Germany');

INSERT INTO `cities` (`name`, `country_id`) VALUES ('Minsk', '1');
INSERT INTO `cities` (`name`, `country_id`) VALUES ('Brest', '1');
INSERT INTO `cities` (`name`, `country_id`) VALUES ('Moscow', '2');
INSERT INTO `cities` (`name`, `country_id`) VALUES ('SPB', '2');
INSERT INTO `cities` (`name`, `country_id`) VALUES ('Berlin', '3');

INSERT INTO `schools` (`name`) VALUES ('School 1');
INSERT INTO `schools` (`name`) VALUES ('School 2');
INSERT INTO `schools` (`name`) VALUES ('School 3');
INSERT INTO `schools` (`name`) VALUES ('School 3');
INSERT INTO `schools` (`name`) VALUES ('School 4');
INSERT INTO `schools` (`name`) VALUES ('School 4');
INSERT INTO `schools` (`name`) VALUES ('School 5');
INSERT INTO `schools` (`name`) VALUES ('School 5');
INSERT INTO `schools` (`name`) VALUES ('School 5');


INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('1', '1');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('2', '3');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('3', '5');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('4', '4');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('5', '1');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('6', '2');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('7', '4');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('8', '2');
INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES ('9', '3');


