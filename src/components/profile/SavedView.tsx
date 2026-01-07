"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, ArrowRight } from "lucide-react";

// Mock data for now
const SAVED_IDEAS = [
    {
        id: "1",
        title: "Vim-Motion File Manager",
        description: "Navigate your file system with HJKL. Blazingly fast.",
        stack: "Rust, Ratatui",
        vibe: "Chaos",
        effort: "Weekend",
    },
    {
        id: "2",
        title: "Generative SVG Avatars",
        description: "Create unique avatars based on wallet addresses.",
        stack: "React, SVG, Math",
        vibe: "Artist",
        effort: "Quick",
    },
    {
        id: "3",
        title: "Local-First CRM",
        description: "Manage clients without sending data to the cloud.",
        stack: "SQLite, Electron",
        vibe: "Serious",
        effort: "Month",
    },
];

export function SavedView() {
    return (
        <div className="h-screen w-full bg-black text-white p-4 pt-20 pb-24 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-6">
                <header className="space-y-2">
                    <h1 className="text-3xl font-black font-mono tracking-tighter">Collection</h1>
                    <p className="text-zinc-400">Your stash of potential doom.</p>
                </header>

                <div className="grid gap-4">
                    {SAVED_IDEAS.map((idea) => (
                        <Card key={idea.id} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900 transition-colors group cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] uppercase tracking-widest">
                                        {idea.vibe}
                                    </Badge>
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                </div>
                                <CardTitle className="text-xl font-bold font-mono mt-2 group-hover:text-primary transition-colors">
                                    {idea.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400 line-clamp-2">
                                    {idea.description}
                                </p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                                        {idea.stack}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
