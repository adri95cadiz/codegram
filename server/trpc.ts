import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Inicializar tRPC
const t = initTRPC.create({
  transformer: superjson,
});

// Exportar helpers reutilizables
export const router = t.router;
export const publicProcedure = t.procedure;
