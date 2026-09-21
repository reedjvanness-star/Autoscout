CREATE TABLE `connections` (
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`encrypted_key` text NOT NULL,
	`checked_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `provider`)
);
