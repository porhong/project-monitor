ALTER TABLE `module_entries` ADD COLUMN `overview` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `module_entries` ADD COLUMN `scope` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `module_entries` ADD COLUMN `resources` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `module_entries` ADD COLUMN `constraints` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `module_entries` ADD COLUMN `schedule` text NOT NULL DEFAULT '';
