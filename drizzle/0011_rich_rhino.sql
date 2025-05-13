ALTER TABLE "arma-timer_team" ADD COLUMN "isDefault" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "team_default_idx" ON "arma-timer_team" USING btree ("isDefault");