CREATE TABLE "codegram_account" (
	"userId" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "codegram_feed_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codegram_like" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"idea_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codegram_mission" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codegram_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"stack" varchar(256) NOT NULL,
	"vibe" varchar(256) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"next_step" text,
	"local_path" text,
	"github_url" text,
	"active_mission" jsonb,
	"soul" jsonb,
	"analysis" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codegram_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codegram_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"email" varchar(256),
	"image" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"github_token" text,
	"github_username" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "codegram_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "codegram_account" ADD CONSTRAINT "codegram_account_userId_codegram_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."codegram_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codegram_session" ADD CONSTRAINT "codegram_session_userId_codegram_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."codegram_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "codegram_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "feed_history_user_id_idx" ON "codegram_feed_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "codegram_like" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mission_project_id_idx" ON "codegram_mission" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "codegram_project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "codegram_session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "name_idx" ON "codegram_user" USING btree ("name");