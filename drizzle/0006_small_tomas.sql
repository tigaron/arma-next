ALTER TABLE "arma-timer_player" ADD COLUMN "color" text;--> statement-breakpoint
CREATE INDEX "player_color_idx" ON "arma-timer_player" USING btree ("color");