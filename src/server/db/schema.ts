import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import {
  index,
  pgTableCreator,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from 'next-auth/adapters';
import type { DateRange } from 'react-day-picker';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `arma-timer_${name}`);

export const users = createTable('user', (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: 'date',
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  guild: one(guilds, {
    fields: [users.id],
    references: [guilds.ownerId],
  }),
  player: one(players, {
    fields: [users.id],
    references: [players.userId],
  }),
}));

export type User = InferSelectModel<typeof users>;

export const accounts = createTable(
  'account',
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount['type']>().notNull(),
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
    index('account_user_id_idx').on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = createTable(
  'session',
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [index('t_user_id_idx').on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  'verification_token',
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const guilds = createTable(
  'guild',
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    name: d.varchar({ length: 256 }).notNull(),
    battleSlotId: d.varchar({ length: 255 }).references(() => battleSlots.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    battleDates: d.jsonb().$type<DateRange>(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index('guild_user_idx').on(t.ownerId)],
);

export const guildsRelations = relations(guilds, ({ one, many }) => ({
  owner: one(users, {
    fields: [guilds.id],
    references: [users.id],
  }),
  battleSlot: one(battleSlots, {
    fields: [guilds.battleSlotId],
    references: [battleSlots.id],
  }),
  teams: many(teams),
  players: many(players),
}));

export type Guild = InferSelectModel<typeof guilds>;

export const teams = createTable(
  'team',
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
        onUpdate: 'cascade',
      }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    isDefault: d.boolean().notNull().default(false),
  }),
  (t) => [
    index('team_guild_idx').on(t.guildId),
    index('team_default_idx').on(t.isDefault),
  ],
);

export const teamsRelations = relations(teams, ({ one, many }) => ({
  guild: one(guilds, {
    fields: [teams.guildId],
    references: [guilds.id],
  }),
  players: many(players),
  colors: many(colors),
}));

export type Team = InferSelectModel<typeof teams>;

export const colors = createTable(
  'color',
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teamId: d.varchar({ length: 255 }).references(() => teams.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    label: d.text({ enum: ['blue', 'yellow', 'green', 'red'] }).notNull(),
    position: d.smallint().notNull(),
  }),
  (t) => [uniqueIndex('color_team_idx').on(t.teamId, t.label)],
);

export const colorsRelations = relations(colors, ({ one, many }) => ({
  team: one(teams, {
    fields: [colors.teamId],
    references: [teams.id],
  }),
  players: many(players),
}));

export type Color = InferSelectModel<typeof colors>;

export const players = createTable(
  'player',
  (d) => ({
    inviteToken: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d.varchar({ length: 255 }).references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    guildId: d.varchar({ length: 255 }).references(() => guilds.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    teamId: d.varchar({ length: 255 }).references(() => teams.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    colorId: d.varchar({ length: 255 }).references(() => colors.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    position: d.smallint().notNull(),
  }),
  (t) => [
    index('player_user_idx').on(t.userId),
    index('player_guild_idx').on(t.guildId),
    index('player_team_idx').on(t.teamId),
    index('player_color_idx').on(t.colorId),
  ],
);

export const playersRelations = relations(players, ({ one }) => ({
  guild: one(guilds, {
    fields: [players.guildId],
    references: [guilds.id],
  }),
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  color: one(colors, {
    fields: [players.colorId],
    references: [colors.id],
  }),
}));

export type Player = InferSelectModel<typeof players>;

export const battleSlots = createTable(
  'battleSlot',
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    label: d
      .text({
        enum: ['21:00 – 22:00', '1:00 – 2:00', '4:00 – 5:00', '11:00 – 12:00'],
      })
      .notNull(),
  }),
  (t) => [index('battle_slot_label_idx').on(t.label)],
);

export const battleSlotsRelations = relations(battleSlots, ({ many }) => ({
  guilds: many(guilds),
}));

export type BattleSlot = InferSelectModel<typeof battleSlots>;
