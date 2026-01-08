"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Loader2, Sparkles, Terminal } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SavedView() {
    const utils = api.useUtils();
    const router = useRouter();
    const { data: savedIdeas, isLoading } = api.feed.getLikes.useQuery();

    const createProject = api.projects.create.useMutation({
        onSuccess: () => {
            toast.success("Project Initialized", {
                description: "Your creative journey begins now."
            });
            utils.projects.invalidate();
            // In a real app we might switch tabs, but for now just toast
        },
        onError: () => {
            toast.error("Failed to initialize project");
        }
    });

    const handlePromoteToProject = (idea: any) => {
        const snapshot = idea.ideaSnapshot;
        createProject.mutate({
            title: snapshot.title,
            description: snapshot.description,
            stack: snapshot.stack,
            vibe: snapshot.vibe,
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    // Adapt the DB data shape to UI
    const ideas = savedIdeas?.map(like => like.ideaSnapshot as any) || [];

    return (
        <div className="h-screen w-full bg-black text-white p-4 pt-20 pb-24 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-6">
                <header className="space-y-2">
                    <h1 className="text-3xl font-black font-mono tracking-tighter">Collection</h1>
                    <p className="text-zinc-400">Your stash of potential doom.</p>
                </header>

                <div className="grid gap-4">
                    {ideas.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-zinc-800 rounded-xl text-center text-zinc-500">
                            No saved ideas yet. Go verify the feed!
                        </div>
                    ) : ideas.map((idea: any, i: number) => (
                        <Card key={i} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900 transition-colors group">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] uppercase tracking-widest">
                                        {idea.vibe || "CONCEPT"}
                                    </Badge>
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                </div>
                                <CardTitle className="text-xl font-bold font-mono mt-2 group-hover:text-primary transition-colors">
                                    {idea.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                                    {idea.description}
                                </p>
                                <div className="flex items-center justify-between mt-4 border-t border-zinc-800 pt-3">
                                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                                        {idea.stack}
                                    </span>
                                    <Button
                                        size="sm"
                                        className="bg-white text-black hover:bg-zinc-200 font-bold"
                                        onClick={() => handlePromoteToProject({ ideaSnapshot: idea })}
                                    >
                                        <Terminal className="w-3 h-3 mr-2" />
                                        Build This
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
