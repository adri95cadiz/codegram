import { z } from "zod";
import { router, publicProcedure } from "../trpc";

// Store temporal en memoria (luego será DB)
const likedIdeas = new Set<number>();

export const ideasRouter = router({
  // Marcar idea como liked
  like: publicProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(({ input }) => {
      likedIdeas.add(input.ideaId);
      console.log("✅ Idea liked:", input.ideaId);
      
      // TODO: Aquí irá el trigger del job AI para crear repo
      return {
        success: true,
        ideaId: input.ideaId,
        message: "Repo creation job triggered",
      };
    }),

  // Obtener ideas liked
  getLiked: publicProcedure.query(() => {
    return Array.from(likedIdeas);
  }),
});
