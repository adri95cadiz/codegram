import { z } from "zod";
import { router, publicProcedure } from "./init";
import { generateIdea } from "@/lib/ai/generator";

export const appRouter = router({
  // Generate a new idea with optional vibe modifier
  generateIdea: publicProcedure
    .input(z.object({ vibe: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      const vibe = input?.vibe || "";
      return await generateIdea(vibe);
    }),
});

export type AppRouter = typeof appRouter;
