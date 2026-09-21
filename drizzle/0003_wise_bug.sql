CREATE TABLE `alert_seen` (
	`alert_id` text NOT NULL,
	`listing_key` text NOT NULL,
	PRIMARY KEY(`alert_id`, `listing_key`)
);
--> statement-breakpoint
CREATE TABLE `alert_settings` (
	`alert_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`email_enabled` integer DEFAULT 0 NOT NULL,
	`unsubscribe_token` text NOT NULL,
	`lease` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`last_error` text
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`alert_id` text NOT NULL,
	`cars` text NOT NULL,
	`created_at` integer NOT NULL,
	`read_at` integer,
	`email_sent_at` integer,
	`email_attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_created` ON `notifications` (`user_id`,`created_at`);