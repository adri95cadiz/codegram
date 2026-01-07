import { feedRouter } from "./routers/feed";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
