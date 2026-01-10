import { type DefaultSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import { env } from "@/env";
import { users, createTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
      githubUsername?: string;
      githubToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    githubUsername?: string | null;
    githubToken?: string | null;
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
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.githubUsername = user.githubUsername;
        token.githubToken = user.githubToken;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
          githubUsername: token.githubUsername as string | undefined,
          githubToken: token.githubToken as string | undefined,
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
  adapter: DrizzleAdapter(db, createTable),
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
    CredentialsProvider({
      name: "GitHub Token",
      credentials: {
        token: { label: "GitHub Token", type: "text", placeholder: "ghp_..." }
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        try {
          const response = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `token ${credentials.token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          if (!response.ok) return null;
          const userData = await response.json() as { id: number, login: string, name: string, email: string, avatar_url: string };

          // Manually upsert user for Credentials Provider since it doesn't use the adapter automatically
          const stringId = String(userData.id);
          let dbUser = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, stringId),
          });

          if (!dbUser) {
            const [newUser] = await db.insert(users).values({
              id: stringId,
              name: userData.name || userData.login,
              email: userData.email,
              image: userData.avatar_url,
              githubUsername: userData.login,
              githubToken: credentials.token,
            }).returning();
            dbUser = newUser;
          } else if (credentials.token) {
            await db.update(users)
              .set({
                githubToken: credentials.token,
                githubUsername: userData.login,
                updatedAt: new Date(),
              })
              .where(eq(users.id, stringId));
          }

          return {
            id: stringId,
            name: userData.name || userData.login,
            email: userData.email,
            image: userData.avatar_url,
            githubUsername: userData.login,
            githubToken: credentials.token,
          };
        } catch (error) {
          console.error("Credentials Auth Error:", error);
          return null;
        }
      }
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
    strategy: "jwt",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
import { getServerSession } from "next-auth/next";

export const getServerAuthSession = () => getServerSession(authOptions);
