CREATE INDEX `idx_alerts_user` ON `alerts` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_alerts_due` ON `alerts` (`enabled`,`next_run`);