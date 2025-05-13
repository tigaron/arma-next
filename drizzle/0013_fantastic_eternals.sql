CREATE TABLE "arma-timer_battleSlot" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arma-timer_guild" ADD COLUMN "battleSlotId" varchar(255);--> statement-breakpoint
CREATE INDEX "battle_slot_label_idx" ON "arma-timer_battleSlot" USING btree ("label");--> statement-breakpoint
ALTER TABLE "arma-timer_guild" ADD CONSTRAINT "arma-timer_guild_battleSlotId_arma-timer_battleSlot_id_fk" FOREIGN KEY ("battleSlotId") REFERENCES "public"."arma-timer_battleSlot"("id") ON DELETE set null ON UPDATE cascade;