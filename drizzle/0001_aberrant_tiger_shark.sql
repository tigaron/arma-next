CREATE TABLE "arma-timer_guild" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"ownerId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "arma-timer_player" (
	"guildId" varchar NOT NULL,
	"userId" varchar(255) NOT NULL,
	"teamId" varchar(255) NOT NULL,
	CONSTRAINT "arma-timer_player_guildId_userId_pk" PRIMARY KEY("guildId","userId")
);
--> statement-breakpoint
CREATE TABLE "arma-timer_team" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"guildId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "arma-timer_guild" ADD CONSTRAINT "arma-timer_guild_ownerId_arma-timer_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."arma-timer_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_guildId_arma-timer_guild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."arma-timer_guild"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_userId_arma-timer_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."arma-timer_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arma-timer_player" ADD CONSTRAINT "arma-timer_player_teamId_arma-timer_team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."arma-timer_team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arma-timer_team" ADD CONSTRAINT "arma-timer_team_guildId_arma-timer_guild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."arma-timer_guild"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guild_owner_idx" ON "arma-timer_guild" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "player_guild_idx" ON "arma-timer_player" USING btree ("guildId");--> statement-breakpoint
CREATE INDEX "player_user_idx" ON "arma-timer_player" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "player_team_idx" ON "arma-timer_player" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "team_guild_idx" ON "arma-timer_team" USING btree ("guildId");