import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";

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
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    email: varchar("email", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => [
    index("name_idx").on(example.name),
  ]
);

export const likes = createTable(
  "like",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id") // In a real app, this would reference users.id
      .notNull(), 
      // .references(() => users.id), // Commented out for now as we don't have auth yet
    
    // SNAPSHOT of the idea. 
    // Since we don't have an "ideas" table, we store the content here.
    ideaSnapshot: jsonb("idea_snapshot").notNull(), 
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => [
    index("user_id_idx").on(example.userId),
  ]
);

export const projects = createTable(
  "project",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    stack: varchar("stack", { length: 256 }).notNull(),
    vibe: varchar("vibe", { length: 100 }).notNull(),
    
    status: varchar("status", { length: 50 }).default("active").notNull(), // active, archived, completed
    nextStep: text("next_step"), // The current AI suggestion
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => [
    index("project_user_id_idx").on(example.userId),
  ]
);
