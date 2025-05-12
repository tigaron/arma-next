import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `arma-timer_${name}`);

export const users = createTable("user", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export type User = InferSelectModel<typeof users>;

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		type: d
			.varchar({ length: 255 })
			.$type<AdapterAccount["type"]>()
			.notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		expires: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const guilds = createTable(
	"guild",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade'
			}),
		name: d.varchar({ length: 256 }).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.$onUpdate(() => new Date()),
	}),
);

export const guildsRelations = relations(guilds, ({ one, many }) => ({
	owner: one(users, {
		fields: [guilds.id],
		references: [users.id],
	}),
	teams: many(teams),
	players: many(players),
}));

export type Guild = InferSelectModel<typeof guilds>;

export const teams = createTable(
	"team",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: d.varchar({ length: 256 }).notNull(),
		guildId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => guilds.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade'
			}),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.$onUpdate(() => new Date()),
	}),
	(t) => [
		index("team_guild_idx").on(t.guildId),
	],
);

export const teamsRelations = relations(teams, ({ one, many }) => ({
	guild: one(guilds, {
		fields: [teams.guildId],
		references: [guilds.id],
	}),
	players: many(players),
}));

export type Team = InferSelectModel<typeof teams>;

export const players = createTable(
	"player",
	(d) => ({
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade'
			}),
		guildId: d
			.varchar({ length: 255 })
			.references(() => guilds.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade'
			}),
		teamId: d
			.varchar({ length: 255 })
			.references(() => teams.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade'
			}),
		color: d.text({ enum: ["blue", "yellow", "green", "red"] })
	}),
	(t) => [
		index("player_guild_idx").on(t.guildId),
		index("player_team_idx").on(t.teamId),
		index("player_color_idx").on(t.color),
	],
);

export const playersRelations = relations(players, ({ one }) => ({
	guild: one(guilds, {
		fields: [players.guildId],
		references: [guilds.id]
	}),
	user: one(users, {
		fields: [players.userId],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [players.teamId],
		references: [teams.id]
	}),
}));

export type Player = InferSelectModel<typeof players>;
