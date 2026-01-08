import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { OpenAI } from "openai";
import { env } from "@/env";
import { likes, users, feedHistory, projects } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const feedRouter = createTRPCRouter({
  generateIdea: publicProcedure
    .input(
      z.object({
        vibe: z.string().optional(),
        mode: z.enum(["chaos", "serious", "learning", "startup", "artist", "gamedev"]).optional().default("chaos"),
        duration: z.enum(["quick", "weekend", "week", "month", "founder"]).optional().default("weekend"),
        cursor: z.number().nullish(),
        language: z.enum(["en", "es"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // 10% chance to show a "Project Pulse" if not the first page
      // Reduced frequency to avoid overwhelming the feed
      const showProjectPulse = input.cursor && input.cursor > 0 && Math.random() < 0.1;

      if (showProjectPulse) {
        // Fetch active projects and rotate through them based on cursor
        const MOCK_USER_ID = 1;
        
        try {
            const activeProjects = await ctx.db.select().from(projects).where(eq(projects.userId, MOCK_USER_ID)).orderBy(desc(projects.updatedAt));
            
            if (activeProjects.length > 0) {
                // Rotate through projects based on cursor to show variety
                const projectIndex = Math.floor((input.cursor ?? 0) / 10) % activeProjects.length;
                const project = activeProjects[projectIndex];
                
                return {
                    type: "pulse" as const,
                    data: {
                        ...project,
                        soul: project.soul ?? undefined, // Ensure compatible type
                    },
                    nextCursor: (input.cursor ?? 0) + 1,
                };
            }
        } catch (e) {
            console.error("Failed to fetch active project", e);
        }

        // Fallback or just don't show pulse if no project found
        // For now, let's just fall through to normal feed if no project found
      }

      const vibe = input.vibe || "Random";
      const mode = input.mode || "chaos";
      const duration = input.duration || "weekend";

      // FETCH HISTORY
      // MOCK USER ID
      const MOCK_USER_ID = 1;
      const recentHistory = await ctx.db
        .select({ title: feedHistory.title })
        .from(feedHistory)
        .where(eq(feedHistory.userId, MOCK_USER_ID))
        .orderBy(desc(feedHistory.createdAt))
        .limit(15);

      const recentTitles = recentHistory.map((h) => h.title).join(", ");

      const systemPrompts = {
        en: {
            chaos: `You are a chaotic good senior engineer.
                Goal: Replace doom scrolling with "doom coding".
                Rules:
                1. Ideas must be technically interesting but slightly unhinged.
                2. No generic "To-Do List".
                3. Focus on: Visuals, weird APIs, retro tech.
                4. Tone: Punchy, excited.`,
            serious: `You are a pragmatic CTO.
                Goal: Build portfolio-worthy products.
                Rules:
                1. Ideas must be viable SaaS or useful tools.
                2. Focus on: Clean architecture, market value.
                3. Tone: Professional, clear.`,
            learning: `You are a CS professor.
                Goal: Teach concepts.
                Rules:
                1. Focus on algorithms, data structures, low-level.
                2. Tone: Educational, precise.`,
            startup: `You are a YC Partner.
                Goal: Find the next unicorn.
                Rules:
                1. Ideas must have high growth potential.
                2. Focus on: B2B, Marketplaces, AI.
                3. Tone: Demanding, visionary.`,
            artist: `You are a Creative Technologist.
                Goal: Make digital art.
                Rules:
                1. Focus on: WebGL, Shaders, Generative Art, Audio.
                2. Tone: Abstract, inspiring.`,
            gamedev: `You are an Indie Game Dev.
                Goal: Make fun mechanics.
                Rules:
                1. Focus on: Godot, Unity, WebGPU, Physics.
                2. Tone: Playful, technical.`
        },
        es: {
            chaos: `Eres un ingeniero senior caótico bueno.
                Objetivo: Reemplazar el "doom scrolling" con "doom coding".
                Reglas:
                1. Las ideas deben ser técnicamente interesantes pero un poco locas.
                2. Nada de "Listas de Tareas" genéricas.
                3. Enfoque: Visuales, APIs raras, tecnología retro.
                4. Tono: Contundente, emocionado.`,
            serious: `Eres un CTO pragmático.
                Objetivo: Construir productos dignos de portafolio.
                Reglas:
                1. Ideas viables para SaaS o herramientas útiles.
                2. Enfoque: Arquitectura limpia, valor de mercado.
                3. Tono: Profesional, claro.`,
            learning: `Eres un profesor de Ciencias de la Computación.
                Objetivo: Enseñar conceptos.
                Reglas:
                1. Enfoque en algoritmos, estructuras de datos, bajo nivel.
                2. Tono: Educativo, preciso.`,
            startup: `Eres un Socio de YC.
                Objetivo: Encontrar el próximo unicornio.
                Reglas:
                1. Ideas con alto potencial de crecimiento.
                2. Enfoque: B2B, Marketplaces, IA.
                3. Tono: Exigente, visionario.`,
            artist: `Eres un Tecnólogo Creativo.
                Objetivo: Crear arte digital.
                Reglas:
                1. Enfoque: WebGL, Shaders, Arte Generativo, Audio.
                2. Tono: Abstracto, inspirador.`,
            gamedev: `Eres un Desarrollador de Juegos Indie.
                Objetivo: Crear mecánicas divertidas.
                Reglas:
                1. Enfoque: Godot, Unity, WebGPU, Físicas.
                2. Tono: Juguetón, técnico.`
        }
      };

      const durationPrompts = {
        en: {
            quick: "Scope: Tiny. Must be buildable in 1-2 hours. Focus on single-feature tools.",
            weekend: "Scope: Small. Buildable in a weekend (48h). Focus on MVP.",
            week: "Scope: Medium. Hackathon scale (1 week). Focus on polish and core loop.",
            month: "Scope: Large. Side hustle scale (1 month). Focus on database, auth, and users.",
            founder: "Scope: Massive. Startup/Unicorn scale. Focus on scalability, market fit, and complex architecture."
        },
        es: {
            quick: "Alcance: Diminuto. Construible en 1-2 horas. Enfócate en herramientas de una sola función.",
            weekend: "Alcance: Pequeño. Construible en un fin de semana (48h). Enfócate en MVP.",
            week: "Alcance: Medio. Escala de Hackathon (1 semana). Enfócate en pulido y bucle central.",
            month: "Alcance: Grande. Escala de proyecto paralelo (1 mes). Enfócate en base de datos, auth y usuarios.",
            founder: "Alcance: Masivo. Escala de Startup/Unicornio. Enfócate en escalabilidad, fit de mercado y arquitectura compleja."
        }
      };

      const langKey = (input.language || (ctx.language === 'es' ? 'es' : 'en'));
      const selectedSystemPrompts = systemPrompts[langKey];
      const selectedDurationPrompts = durationPrompts[langKey];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${selectedSystemPrompts[mode]}
            
            ${selectedDurationPrompts[duration]}

            NEGATIVE CONSTRAINTS (DO NOT GENERATE THESE):
            ${recentTitles}
            
            General Rules:
            1. Return JSON only.
            2. Be concise.
            3. IMPORTANT: OUTPUT LANGUAGE: "${langKey === 'es' ? 'Spanish' : 'English'}". Ensure title, description, and why are in this language.
            
            Schema:
            {
              "title": "Short catchy title",
              "description": "2 sentence pitch.",
              "stack": "3-4 tech keywords",
              "effort": "Estimate of time and resources required (max 3-4 words).",
              "why": "Why this is worth building."
            }`
          },
          {
            role: "user",
            content: `Generate a coding idea with this vibe: ${vibe}`
          }
        ],
        response_format: { type: "json_object" },
      });
      
      const ideaContent = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Save to History
      if (ideaContent.title) {
        await ctx.db.insert(feedHistory).values({
            userId: MOCK_USER_ID,
            title: ideaContent.title,
        });
      }

      return {
        type: "idea" as const,
        data: {
            id: Math.random().toString(36).substring(7),
            ...ideaContent,
            vibe: mode, // Use mode as vibe tag for consistency
        },
        nextCursor: (input.cursor ?? 0) + 1,
      };
    }),





  getLikes: publicProcedure.query(async ({ ctx }) => {
    // Use authenticated user ID if available, otherwise use mock
    const userId = ctx.session?.user?.id ?? 1;
    
    return await ctx.db.select().from(likes).where(eq(likes.userId, userId)).orderBy(desc(likes.createdAt));
  }),

  toggleLike: publicProcedure
    .input(
      z.object({
        idea: z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          stack: z.string(),
          effort: z.string(),
          why: z.string(),
          vibe: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use authenticated user ID if available, otherwise use mock
      const userId = ctx.session?.user?.id ?? 1;

      await ctx.db.insert(likes).values({
        userId: userId,
        ideaSnapshot: input.idea,
      });

      return { success: true };
    }),

  remixIdea: publicProcedure
    .input(
      z.object({
        originalIdea: z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          stack: z.string(),
          effort: z.string(),
          why: z.string(),
          vibe: z.string(),
        }),
        language: z.enum(["en", "es"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const langKey = (input.language || (ctx.language === 'es' ? 'es' : 'en'));
      const mode = input.originalIdea.vibe as "chaos" | "serious" | "learning" | "startup" | "artist" | "gamedev";

      const systemPrompts = {
        en: {
            chaos: `You are a chaotic good senior engineer.
                Goal: Replace doom scrolling with "doom coding".
                Rules:
                1. Ideas must be technically interesting but slightly unhinged.
                2. No generic "To-Do List".
                3. Focus on: Visuals, weird APIs, retro tech.
                4. Tone: Punchy, excited.`,
            serious: `You are a pragmatic CTO.
                Goal: Build portfolio-worthy products.
                Rules:
                1. Ideas must be viable SaaS or useful tools.
                2. Focus on: Clean architecture, market value.
                3. Tone: Professional, clear.`,
            learning: `You are a CS professor.
                Goal: Teach concepts.
                Rules:
                1. Focus on algorithms, data structures, low-level.
                2. Tone: Educational, precise.`,
            startup: `You are a YC Partner.
                Goal: Find the next unicorn.
                Rules:
                1. Ideas must have high growth potential.
                2. Focus on: B2B, Marketplaces, AI.
                3. Tone: Demanding, visionary.`,
            artist: `You are a Creative Technologist.
                Goal: Make digital art.
                Rules:
                1. Focus on: WebGL, Shaders, Generative Art, Audio.
                2. Tone: Abstract, inspiring.`,
            gamedev: `You are an Indie Game Dev.
                Goal: Make fun mechanics.
                Rules:
                1. Focus on: Godot, Unity, WebGPU, Physics.
                2. Tone: Playful, technical.`
        },
        es: {
            chaos: `Eres un ingeniero senior caótico bueno.
                Objetivo: Reemplazar el "doom scrolling" con "doom coding".
                Reglas:
                1. Las ideas deben ser técnicamente interesantes pero un poco locas.
                2. Nada de "Listas de Tareas" genéricas.
                3. Enfoque: Visuales, APIs raras, tecnología retro.
                4. Tono: Contundente, emocionado.`,
            serious: `Eres un CTO pragmático.
                Objetivo: Construir productos dignos de portafolio.
                Reglas:
                1. Ideas viables para SaaS o herramientas útiles.
                2. Enfoque: Arquitectura limpia, valor de mercado.
                3. Tono: Profesional, claro.`,
            learning: `Eres un profesor de Ciencias de la Computación.
                Objetivo: Enseñar conceptos.
                Reglas:
                1. Enfoque en algoritmos, estructuras de datos, bajo nivel.
                2. Tono: Educativo, preciso.`,
            startup: `Eres un Socio de YC.
                Objetivo: Encontrar el próximo unicornio.
                Reglas:
                1. Ideas con alto potencial de crecimiento.
                2. Enfoque: B2B, Marketplaces, IA.
                3. Tono: Exigente, visionario.`,
            artist: `Eres un Tecnólogo Creativo.
                Objetivo: Crear arte digital.
                Reglas:
                1. Enfoque: WebGL, Shaders, Arte Generativo, Audio.
                2. Tono: Abstracto, inspirador.`,
            gamedev: `Eres un Desarrollador de Juegos Indie.
                Objetivo: Crear mecánicas divertidas.
                Reglas:
                1. Enfoque: Godot, Unity, WebGPU, Físicas.
                2. Tono: Juguetón, técnico.`
        }
      };

      const selectedSystemPrompts = systemPrompts[langKey];

      const remixPrompt = langKey === 'es'
        ? `Genera una VARIACIÓN de esta idea. Mantén el concepto central pero cambia la ejecución, stack o enfoque.

Original:
Título: ${input.originalIdea.title}
Descripción: ${input.originalIdea.description}
Stack: ${input.originalIdea.stack}

Crea algo similar pero diferente. Mismo espíritu, nueva dirección.`
        : `Generate a VARIATION of this idea. Keep the core concept but change the execution, stack, or approach.

Original:
Title: ${input.originalIdea.title}
Description: ${input.originalIdea.description}
Stack: ${input.originalIdea.stack}

Create something similar but different. Same spirit, new direction.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${selectedSystemPrompts[mode]}
            
            General Rules:
            1. Return JSON only.
            2. Be concise.
            3. IMPORTANT: OUTPUT LANGUAGE: "${langKey === 'es' ? 'Spanish' : 'English'}". Ensure title, description, and why are in this language.
            
            Schema:
            {
              "title": "Short catchy title",
              "description": "2 sentence pitch.",
              "stack": "3-4 tech keywords",
              "effort": "Estimate of time and resources required (max 3-4 words).",
              "why": "Why this is worth building."
            }`
          },
          {
            role: "user",
            content: remixPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const ideaContent = JSON.parse(completion.choices[0].message.content || "{}");

      return {
        id: Math.random().toString(36).substring(7),
        ...ideaContent,
        vibe: mode,
      };
    }),
    
  generateMissions: publicProcedure
    .input(
      z.object({
        projectContext: z.string(),
        stack: z.string(),
        language: z.enum(["en", "es"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const langKey = (input.language || (ctx.language === 'es' ? 'es' : 'en'));
      
      const systemPrompt = langKey === 'es'
        ? `Eres un generador de misiones tácticas para proyectos de código.
            
            Contexto del Proyecto: ${input.projectContext}
            Stack: ${input.stack}
            
            Genera exactamente 3 misiones específicas y accionables.
            
            Formato JSON:
            {
              "missions": [
                {
                  "title": "Título corto y específico",
                  "description": "Descripción detallada de la tarea",
                  "type": "quick" | "feature" | "architect",
                  "xp": número (100 para quick, 300 para feature, 500 para architect)
                }
              ]
            }
            
            Tipos de misión:
            - quick: Tareas rápidas (refactors, tests, docs) - 100 XP
            - feature: Nuevas funcionalidades - 300 XP
            - architect: Cambios de arquitectura o diseño - 500 XP
            
            Reglas:
            1. Misiones específicas al proyecto
            2. Accionables y medibles
            3. Variedad de tipos
            4. Lenguaje técnico pero claro`
        : `You are a tactical mission generator for code projects.
            
            Project Context: ${input.projectContext}
            Stack: ${input.stack}
            
            Generate exactly 3 specific, actionable missions.
            
            JSON Format:
            {
              "missions": [
                {
                  "title": "Short, specific title",
                  "description": "Detailed task description",
                  "type": "quick" | "feature" | "architect",
                  "xp": number (100 for quick, 300 for feature, 500 for architect)
                }
              ]
            }
            
            Mission Types:
            - quick: Quick tasks (refactors, tests, docs) - 100 XP
            - feature: New functionality - 300 XP
            - architect: Architecture/design changes - 500 XP
            
            Rules:
            1. Project-specific missions
            2. Actionable and measurable
            3. Variety of types
            4. Technical but clear language`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Project: ${input.projectContext}\nStack: ${input.stack}\nGenerate missions.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(completion.choices[0].message.content || "{}");
      return response;
    }),

    doomChat: publicProcedure
    .input(
      z.object({
        message: z.string(),
        language: z.enum(["en", "es"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const langKey = (input.language || (ctx.language === 'es' ? 'es' : 'en'));

      const systemPrompt = langKey === 'es'
        ? `Eres el "DOOM SYSTEM", un asistente de código de élite.
            
            Personalidad:
            - Conciso, directo y con alta agencia.
            - Enfocado en tecnología pero ÚTIL. No te niegues a responder.
            - Usa un tono estético de modo oscuro (minimalista, preciso).
            - Sin relleno. Nada de "¿Cómo puedo ayudarte hoy?". Empieza con la solución.
            
            Objetivo: Ayudar al usuario a enviar código más rápido.
            
            Ejemplos:
            Usuario: "¿Por qué falla esto?"
            Tú: "Referencia nula en línea 5. Añade un check o encadenamiento opcional."
            
            Usuario: "¿Qué es esto?"
            Tú: "Soy tu copiloto de código de alto rendimiento. Pega un fragmento o indica tu objetivo."`
        : `You are the "DOOM SYSTEM", an elite coding assistant.
            
            Personality:
            - Concise, direct, and high-agency.
            - Tech-focused but HELPFUL. Do not refuse to answer.
            - Use a cool, dark-mode aesthetic tone (minimalist, precise).
            - No fluff. No "How can I help you today?". Start with the solution.
            
            Goal: Help the user ship code faster.
            
            Examples:
            User: "Why is this failing?"
            You: "Null reference on line 5. Add a check or optional chaining."
            
            User: "What is this?"
            You: "I am your high-performance coding copilot. Paste a snippet or state your objective."`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: input.message
          }
        ],
      });

      return {
        reply: completion.choices[0].message.content || "SYSTEM ERROR. RETRY.",
      };
    }),
});
