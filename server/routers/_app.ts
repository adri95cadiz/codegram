import { router } from "../trpc";
import { ideasRouter } from "./ideas";

// App router principal - aquí irán todos los routers
export const appRouter = router({
  ideas: ideasRouter,
});

// Exportar tipo para uso en cliente
export type AppRouter = typeof appRouter;
