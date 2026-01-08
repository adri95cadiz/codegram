import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { promises as fs } from "fs";
import path from "path";

// Simple safety check to prevent reading outside allowed dirs (basic implementation)
// In a real app we'd strict whitelist this.
export const isSafePath = (targetPath: string) => {
  return !targetPath.includes("..") && !targetPath.includes("node_modules") && !targetPath.includes(".git");
};

export const inspectorRouter = createTRPCRouter({
  getFiles: publicProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
        try {
            const entries = await fs.readdir(input.path, { withFileTypes: true });
            return entries
                .filter(entry => 
                    !entry.name.startsWith('.') && 
                    entry.name !== 'node_modules' &&
                    entry.name !== 'dist' &&
                    entry.name !== '.git'
                )
                .map(entry => ({
                    name: entry.name,
                    type: entry.isDirectory() ? "directory" : "file",
                    path: path.join(input.path, entry.name)
                }));
        } catch (error) {
            console.error("Failed to read directory:", error);
            throw new Error("Failed to read directory. Check path.");
        }
    }),

  getProjectTree: publicProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
        if (!isSafePath(input.path)) throw new Error("Unsafe path.");
        
        async function buildTree(currentPath: string, depth = 0): Promise<any[]> {
            if (depth > 5) return []; // Safety limit
            try {
                const entries = await fs.readdir(currentPath, { withFileTypes: true });
                const filtered = entries.filter(e => 
                    !e.name.startsWith('.') && 
                    e.name !== 'node_modules' &&
                    e.name !== 'dist' &&
                    e.name !== '.git'
                );

                const nodes = await Promise.all(filtered.map(async (entry) => {
                    const fullPath = path.join(currentPath, entry.name);
                    const isDir = entry.isDirectory();
                    
                    return {
                        name: entry.name,
                        type: isDir ? "directory" : "file",
                        path: fullPath,
                        children: isDir ? await buildTree(fullPath, depth + 1) : undefined
                    };
                }));
                return nodes;
            } catch (e) {
                return [];
            }
        }

        return await buildTree(input.path);
    }),

  getFile: publicProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
        if (!isSafePath(input.path)) throw new Error("Unsafe path access denied.");
        try {
            const ext = path.extname(input.path).toLowerCase();
            const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
            
            if (isImage) {
                const buffer = await fs.readFile(input.path);
                return { content: buffer.toString('base64'), isBinary: true, mimeType: `image/${ext.replace('.', '')}` };
            }
            
            const content = await fs.readFile(input.path, 'utf-8');
            return { content, isBinary: false };
        } catch (error) {
            console.error("Failed to read file:", error);
            throw new Error("Failed to read file.");
        }
    }),

  writeFile: publicProcedure
    .input(z.object({ 
        path: z.string(),
        content: z.string() 
    }))
    .mutation(async ({ input }) => {
        if (!isSafePath(input.path)) throw new Error("Unsafe path access denied.");
        try {
            await fs.writeFile(input.path, input.content, 'utf-8');
            return { success: true };
        } catch (error) {
            console.error("Failed to write file:", error);
            throw new Error("Failed to write file.");
        }
    }),

  cloneRepo: publicProcedure
    .input(z.object({
        repoUrl: z.string().url(),
        targetPath: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        if (!isSafePath(input.targetPath)) throw new Error("Unsafe path access denied.");
        
        // Get user's github token for potential private repo access
        const mockUserId = 1;
        const user = await ctx.db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, mockUserId)
        });

        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);

        let cloneUrl = input.repoUrl;
        if (user?.githubToken && cloneUrl.includes("github.com")) {
            // Inject token for auth: https://<token>@github.com/user/repo
            cloneUrl = cloneUrl.replace("https://", `https://${user.githubToken}@`);
        }

        try {
            await execAsync(`git clone ${cloneUrl} ${input.targetPath}`);
            return { success: true };
        } catch (error) {
            console.error("Failed to clone repo:", error);
            throw new Error("Failed to clone repository. Ensure git is installed and path is available.");
        }
    }),
});
