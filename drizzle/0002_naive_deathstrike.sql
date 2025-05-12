DROP INDEX "player_user_idx";--> statement-breakpoint
ALTER TABLE "arma-timer_player" DROP CONSTRAINT "arma-timer_player_guildId_userId_pk";--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD PRIMARY KEY ("userId");--> statement-breakpoint
ALTER TABLE "arma-timer_player" ALTER COLUMN "guildId" SET DATA TYPE varchar(255);