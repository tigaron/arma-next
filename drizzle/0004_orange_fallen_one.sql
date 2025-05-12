ALTER TABLE "arma-timer_guild" DROP CONSTRAINT "arma-timer_guild_ownerId_arma-timer_user_id_fk";
--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP CONSTRAINT "arma-timer_player_userId_arma-timer_user_id_fk";
--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP CONSTRAINT "arma-timer_player_guildId_arma-timer_guild_id_fk";
--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP CONSTRAINT "arma-timer_player_teamId_arma-timer_team_id_fk";
--> statement-breakpoint
ALTER TABLE "arma-timer_team" DROP CONSTRAINT "arma-timer_team_guildId_arma-timer_guild_id_fk";
--> statement-breakpoint
DROP INDEX "guild_owner_idx";--> statement-breakpoint
ALTER TABLE "arma-timer_guild" ADD CONSTRAINT "arma-timer_guild_id_arma-timer_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."arma-timer_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_userId_arma-timer_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."arma-timer_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_guildId_arma-timer_guild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."arma-timer_guild"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_teamId_arma-timer_team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."arma-timer_team"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "arma-timer_team" ADD CONSTRAINT "arma-timer_team_guildId_arma-timer_guild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."arma-timer_guild"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "arma-timer_guild" DROP COLUMN "ownerId";