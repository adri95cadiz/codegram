import { type DefaultSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import { env } from "@/env";
import { users, accounts, sessions, verificationTokens } from "@/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode to see errors
  callbacks: {
    session: ({ session, user }) => {
      console.log("Session callback - user:", user);
      return {
        ...session,
        user: {
          ...session.user,
          id: String(user.id), // Convert to string for compatibility
        },
      };
    },
  },
  events: {
    signIn: async (message) => {
      console.log("✅ Sign in event:", message);
    },
    createUser: async (message) => {
      console.log("✅ User created:", message);
    },
  },
  adapter: DrizzleAdapter(db),
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the GitHub provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/", // Redirect to home page for sign in
  },
  session: {
    strategy: "database",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
import { getServerSession } from "next-auth/next";

export const getServerAuthSession = () => getServerSession(authOptions);
