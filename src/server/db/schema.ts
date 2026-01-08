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
    image: text("image"), // GitHub avatar URL
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
    githubToken: text("github_token"),
    githubUsername: varchar("github_username", { length: 256 }),
    totalXp: integer("total_xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),
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
    vibe: varchar("vibe", { length: 256 }).notNull(),
    
    status: varchar("status", { length: 50 }).default("active").notNull(), // active, archived, completed
    nextStep: text("next_step"), // The current AI suggestion
    
    // Phase 2: The Bridge to Reality
    localPath: text("local_path"), // Absolute path to the folder
    githubUrl: text("github_url"), // Optional: Clone source
    activeMission: jsonb("active_mission"), // The mission currently being executed
    
    // Phase 3: Project Soul
    soul: jsonb("soul"), // { personality: string, context: string, knowledge_base: string[] }
    analysis: jsonb("analysis"), // DEPRECATED: Kept to avoid drizzle-kit rename prompt
    
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

export const missions = createTable(
  "mission",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull(),
    
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, active, completed
    progress: integer("progress").default(0).notNull(),
    xp: integer("xp").default(100).notNull(), // XP reward for completing mission
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => [
    index("mission_project_id_idx").on(example.projectId),
  ]
);

export const feedHistory = createTable(
  "feed_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => [
    index("feed_history_user_id_idx").on(example.userId),
  ]
);
