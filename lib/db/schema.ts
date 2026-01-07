import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").unique().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
  ideaJson: text("idea_json").notNull(), // Guardamos el JSON de la idea generada
  vibePrompt: text("vibe_prompt"), // La vibe en la que se generó
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
