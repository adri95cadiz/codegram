import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const githubRouter = createTRPCRouter({
  saveToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Basic validation: try to fetch user info from GitHub
      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${input.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) throw new Error("Invalid GitHub Token");
        const userData = await response.json() as { login: string };

        await ctx.db
          .update(users)
          .set({
            githubToken: input.token,
            githubUsername: userData.login,
          })
          .where(eq(users.id, userId));

        return { success: true, username: userData.login };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "GitHub Authentication failed");
      }
    }),

  getRepos: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // First try to get OAuth access token from accounts table
    const account = await ctx.db.query.accounts.findFirst({
      where: (a, { and, eq }) => and(
        eq(a.userId, userId),
        eq(a.provider, "github")
      ),
    });

    const token = account?.access_token;
    if (!token) return [];

    let allRepos: Array<{ name: string, full_name: string, html_url: string, description: string, private: boolean }> = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && page <= 5) { // Limit to 500 repos to prevent timeouts
      console.log(`Fetching repos page ${page}...`);
      const response = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=100&visibility=all&page=${page}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        console.error("GitHub API error:", await response.text());
        break;
      }

      const pageRepos = await response.json() as typeof allRepos;
      if (pageRepos.length === 0) {
        hasNextPage = false;
      } else {
        allRepos = [...allRepos, ...pageRepos];
        if (pageRepos.length < 100) {
          hasNextPage = false;
        }
        page++;
      }
    }

    console.log(`Total fetched ${allRepos.length} repos, private count:`, allRepos.filter(r => r.private).length);

    return allRepos.map(r => ({
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description
    }));
  }),

  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Check if user has GitHub OAuth account linked
    const account = await ctx.db.query.accounts.findFirst({
      where: (a, { and, eq }) => and(
        eq(a.userId, userId),
        eq(a.provider, "github")
      ),
    });

    // Also get user info for username
    const user = await ctx.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    const hasRepoScope = account?.scope?.includes("repo") ?? false;

    return {
      isConnected: !!account?.access_token,
      username: user?.githubUsername ?? user?.name ?? null,
      scope: account?.scope ?? null,
      hasRepoScope,
      needsReauth: !!account?.access_token && !hasRepoScope,
    };
  }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await ctx.db
      .update(users)
      .set({ githubToken: null, githubUsername: null })
      .where(eq(users.id, userId));
    return { success: true };
  }),
});
