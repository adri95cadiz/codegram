import { feedRouter } from "./routers/feed";
import { scannerRouter } from "./routers/scanner";
import { projectsRouter } from "./routers/projects";
import { inspectorRouter } from "./routers/inspector";
import { missionsRouter } from "./routers/missions";
import { githubRouter } from "./routers/github";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  feed: feedRouter,
  scanner: scannerRouter,
  projects: projectsRouter,
  inspector: inspectorRouter,
  missions: missionsRouter,
  github: githubRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
