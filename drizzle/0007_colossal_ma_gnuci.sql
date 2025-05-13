CREATE TABLE "arma-timer_color" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"teamId" varchar(255),
	"label" text NOT NULL,
	"position" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP CONSTRAINT "arma-timer_player_userId_arma-timer_user_id_fk";
--> statement-breakpoint
DROP INDEX "player_color_idx";--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP CONSTRAINT "arma-timer_player_pkey";--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD COLUMN "inviteToken" varchar(255) PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD COLUMN "colorId" varchar(255);--> statement-breakpoint
ALTER TABLE "arma-timer_color" ADD CONSTRAINT "arma-timer_color_teamId_arma-timer_team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."arma-timer_team"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "color_team_idx" ON "arma-timer_color" USING btree ("teamId","label");--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_colorId_arma-timer_color_id_fk" FOREIGN KEY ("colorId") REFERENCES "public"."arma-timer_color"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_userId_arma-timer_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."arma-timer_user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "player_user_idx" ON "arma-timer_player" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "player_color_idx" ON "arma-timer_player" USING btree ("colorId");--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP COLUMN "color";