import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTableCreator,
  timestamp,
  varchar,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM.
 * Use the same database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `codegram_${name}`);

export const users = createTable(
  "user",
  {
    id: text("id").notNull().primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
    githubToken: text("github_token"),
    githubUsername: varchar("github_username", { length: 256 }),
    openaiKey: text("openai_key"),
    anthropicKey: text("anthropic_key"),
    geminiKey: text("gemini_key"),
    preferredModel: varchar("preferred_model", { length: 50 }).default("gpt-4o-mini").notNull(),
    totalXp: integer("total_xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),
  }
);

export const likes = createTable(
  "like",
  {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    ideaSnapshot: jsonb("idea_snapshot").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
  ]
);

export const projects = createTable(
  "project",
  {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    stack: varchar("stack", { length: 256 }).notNull(),
    vibe: varchar("vibe", { length: 256 }).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    nextStep: text("next_step"),
    localPath: text("local_path"),
    githubUrl: text("github_url"),
    activeMission: jsonb("active_mission"),
    soul: jsonb("soul"),
    analysis: jsonb("analysis"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("project_user_id_idx").on(table.userId),
  ]
);

export const missions = createTable(
  "mission",
  {
    id: text("id").notNull().primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    progress: integer("progress").default(0).notNull(),
    xp: integer("xp").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("mission_project_id_idx").on(table.projectId),
  ]
);

export const feedHistory = createTable(
  "feed_history",
  {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("feed_history_user_id_idx").on(table.userId),
  ]
);

// NextAuth.js Tables - Strict specification
export const accounts = createTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = createTable(
  "session",
  {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  }
);

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
