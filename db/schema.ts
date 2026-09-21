import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('workspaces',{userId:text('user_id').primaryKey(),payload:text('payload').notNull(),updatedAt:integer('updated_at').notNull()});
export const usage = sqliteTable('usage',{userId:text('user_id').notNull(),day:text('day').notNull(),count:integer('count').notNull().default(0)},t=>[primaryKey({columns:[t.userId,t.day]})]);
export const alerts = sqliteTable('alerts',{id:text('id').primaryKey(),userId:text('user_id').notNull(),filters:text('filters').notNull(),enabled:integer('enabled').notNull().default(0),lastRun:integer('last_run'),nextRun:integer('next_run').notNull(),results:text('results')},t=>[index('idx_alerts_user').on(t.userId),index('idx_alerts_due').on(t.enabled,t.nextRun)]);
export const connections=sqliteTable('connections',{userId:text('user_id').notNull(),provider:text('provider').notNull(),encryptedKey:text('encrypted_key').notNull(),checkedAt:integer('checked_at').notNull()},t=>[primaryKey({columns:[t.userId,t.provider]})]);
export const alertSettings=sqliteTable('alert_settings',{
 alertId:text('alert_id').primaryKey(),email:text('email'),emailEnabled:integer('email_enabled').notNull().default(0),
 unsubscribeToken:text('unsubscribe_token').notNull(),lease:text('lease'),leaseUntil:integer('lease_until').notNull().default(0),lastError:text('last_error'),
});
export const alertSeen=sqliteTable('alert_seen',{alertId:text('alert_id').notNull(),listingKey:text('listing_key').notNull()},t=>[primaryKey({columns:[t.alertId,t.listingKey]})]);
export const notifications=sqliteTable('notifications',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),alertId:text('alert_id').notNull(),cars:text('cars').notNull(),
 createdAt:integer('created_at').notNull(),readAt:integer('read_at'),emailSentAt:integer('email_sent_at'),emailAttempts:integer('email_attempts').notNull().default(0),
},t=>[index('idx_notifications_user_created').on(t.userId,t.createdAt)]);
