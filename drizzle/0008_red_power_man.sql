ALTER TABLE "arma-timer_guild" DROP CONSTRAINT "arma-timer_guild_id_arma-timer_user_id_fk";
--> statement-breakpoint
ALTER TABLE "arma-timer_guild" ADD COLUMN "ownerId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "arma-timer_guild" ADD CONSTRAINT "arma-timer_guild_ownerId_arma-timer_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."arma-timer_user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "guild_user_idx" ON "arma-timer_guild" USING btree ("ownerId");