import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { OpenAI } from "openai";
import { env } from "@/env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const scannerRouter = createTRPCRouter({
  scanCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
        fileType: z.string().optional(),
        language: z.enum(["en", "es"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const langKey = (input.language || (ctx.language === 'es' ? 'es' : 'en'));

      const systemPrompt = langKey === 'es'
        ? `Eres el "ESCÁNER DE CÓDIGO", un subsistema de análisis heurístico.
            
            Objetivo: Analizar el código y detectar "Anomalías" (Bugs, Malas Prácticas u Optimizaciones).
            
            Reglas:
            1. Retorna un array JSON de anomalías.
            2. "severity" puede ser: "CRITICAL" (Bug), "WARNING" (Olor), "INFO" (Optimización).
            3. "line" debe ser un número de línea válido en el código.
            4. "action" es una etiqueta corta para el arreglo (ej. "Borrar no usado", "Envolver en useMemo").
            5. IMPORTANTE: "message" y "action" DEBEN estar en ESPAÑOL.
            
            Formato de Respuesta (JSON):
            {
                "anomalies": [
                    {
                        "line": 10,
                        "severity": "CRITICAL",
                        "message": "Posible bucle infinito",
                        "action": "Añadir condición de ruptura"
                    }
                ]
            }`
        : `You are the "CODE SCANNNER", a heuristic analysis sub-system.
            
            Goal: Analyze the code and detect "Anomalies" (Bugs, Bad Practices, or Optimizations).
            
            Rules:
            1. Return a JSON array of anomalies.
            2. "severity" can be: "CRITICAL" (Bug), "WARNING" (Smell), "INFO" (Optimization).
            3. "line" must be a valid line number in the code.
            4. "action" is a short label for the fix (e.g. "Remove Unused", "Wrap in useMemo").
            
            Response Format (JSON):
            {
                "anomalies": [
                    {
                        "line": 10,
                        "severity": "CRITICAL",
                        "message": "Potential infinite loop",
                        "action": "Add break condition"
                    }
                ]
            }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze this code:\n\n${input.code}`
          }
        ],
        response_format: { type: "json_object" },
      });

      let content = completion.choices[0].message.content || "{ \"anomalies\": [] }";
      // Sanitize markdown
      content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

      let response;
      try {
        response = JSON.parse(content);
      } catch (e) {
        console.error("Scanner parse error", e);
        response = { anomalies: [] };
      }

      return {
        anomalies: response.anomalies || []
      };
    }),

  proactiveScan: publicProcedure
    .input(z.object({
        projectPath: z.string(),
        language: z.enum(["en", "es"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
        // 1. MOCK FILE SELECTION (In real app, we'd list files and pick one)
        // For now, we simulate finding a specific "smelly" file or pattern
        const scenarios = [
            {
                file: "src/components/Button.tsx",
                code: "const Button = (props: any) => <button {...props} />",
                issue: "Usage of 'any' type in core component."
            },
            {
                file: "src/utils/helpers.ts",
                code: "export const formatDate = (d: Date) => d.toString() // TODO: Fix locale",
                issue: "Lazy date formatting."
            },
            {
                file: "src/server/api/routers/post.ts",
                code: "const data = await ctx.db.query('SELECT * FROM posts')",
                issue: "Raw SQL query without validation."
            }
        ];
        
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const langKey = (input.language || (ctx.language === 'es' ? 'es' : 'en'));

        const systemPrompt = langKey === 'es'
          ? `Eres el MOTOR DE BUCLE DOOM.
             Tu trabajo es encontrar código y sugerir una "Misión de Arreglo" inmediata.
             
             Archivo Actual: ${scenario.file}
             Problema Detectado: ${scenario.issue}
             
             Genera una Misión JSON:
             {
                "title": "Nombre de la Misión (ej. 'Purgar Any')",
                "description": "Explicación breve de por qué esto apesta.",
                "file": "${scenario.file}",
                "suggestedAction": "Descripción de lo que harás."
             }`
          : `You are the DOOM LOOP ENGINE.
             Your job is to find code and suggest an immediate "Fix Mission".
             
             Current File: ${scenario.file}
             Detected Issue: ${scenario.issue}
             
             Generate a Mission JSON:
             {
                "title": "Mission Name (e.g. 'Purge Any')",
                "description": "Brief explanation of why this sucks.",
                "file": "${scenario.file}",
                "suggestedAction": "Description of what you will do."
             }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }],
            response_format: { type: "json_object" },
        });

        const content = JSON.parse(completion.choices[0].message.content || "{}");
        
        return {
            ...content,
            id: Math.random().toString(36).substring(7)
        };
    }),
});
