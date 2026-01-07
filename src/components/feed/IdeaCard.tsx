"use client";

import { motion } from "framer-motion";
import { Heart, RefreshCw, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectModal } from "@/components/create/ProjectModal";

interface Idea {
    id: string;
    title: string;
    description: string;
    stack: string;
    effort: string;
    why: string;
    vibe: string;
}

export function IdeaCard({ idea }: { idea: Idea }) {
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const utils = api.useUtils();

    const toggleLike = api.feed.toggleLike.useMutation({
        onSuccess: () => {
            setIsLiked(true);
            toast.success("Idea saved to your collection!");
            setIsModalOpen(true);
        },
        onError: (err) => {
            toast.error("Failed to save idea: " + err.message);
        }
    });

    const handleLike = () => {
        if (isLiked) return;
        toggleLike.mutate({ idea });
    };

    // Generate a deterministic gradient based on the vibe length/chars
    const getGradient = (vibe: string) => {
        const gradients = [
            "from-pink-500/20 via-purple-500/20 to-indigo-500/20",
            "from-orange-500/20 via-red-500/20 to-yellow-500/20",
            "from-green-500/20 via-emerald-500/20 to-teal-500/20",
            "from-blue-500/20 via-cyan-500/20 to-sky-500/20",
        ];
        return gradients[vibe.length % gradients.length];
    };

    // Generate Pollinations Image URL
    const getImageUrl = () => {
        const prompt = encodeURIComponent(
            `${idea.vibe} style, ${idea.title}, ${idea.description}, abstract, minimal, 3d render, high quality, 4k`
        );
        // Use a seed based on ID to keep it consistent but unique
        const seed = idea.id;
        return `https://pollinations.ai/p/${prompt}?width=800&height=1200&seed=${seed}&nologo=true`;
    };

    return (
        <>
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                idea={idea}
            />
            <div className="h-[100dvh] w-full snap-start flex items-center justify-center p-0 sm:p-4 relative">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={getImageUrl()}
                        alt={idea.title}
                        className="w-full h-full object-cover opacity-60"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(idea.vibe)} mix-blend-overlay opacity-40`} />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className="w-full max-w-md h-full max-h-[100dvh] sm:max-h-[85vh] relative z-10"
                >
                    <Card className="h-full flex flex-col border-white/10 bg-black/20 backdrop-blur-md shadow-2xl overflow-hidden relative group border-0 sm:border">

                        <CardHeader className="space-y-4 relative z-10 pt-20 sm:pt-6">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-mono border-white/20 text-white/90 bg-black/40 backdrop-blur-md">
                                    {idea.vibe}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 font-mono text-xs backdrop-blur-md">
                                    {idea.effort}
                                </Badge>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] font-mono mt-2 text-white drop-shadow-2xl">
                                {idea.title}
                            </h2>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col gap-8 overflow-y-auto relative z-10 scrollbar-hide pb-24">
                            <p className="text-xl text-white/90 leading-relaxed font-medium drop-shadow-md">
                                {idea.description}
                            </p>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest font-mono">
                                    The Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {idea.stack.split(',').map((tech) => (
                                        <span key={tech} className="px-3 py-1.5 rounded-md bg-white/10 border border-white/10 text-sm font-mono text-white/90 hover:bg-white/20 transition-colors backdrop-blur-md">
                                            {tech.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest font-mono">
                                    Why it's sick
                                </h3>
                                <p className="text-base italic text-white/80 border-l-2 border-white/40 pl-4 py-1">
                                    "{idea.why}"
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="grid grid-cols-3 gap-4 pt-4 pb-8 sm:pb-4 border-t border-white/10 bg-black/40 relative z-10 backdrop-blur-xl absolute bottom-0 left-0 right-0">
                            <Button variant="ghost" size="icon" className="w-full h-14 rounded-2xl hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                                <RefreshCw className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="default"
                                size="icon"
                                className={`w-full h-14 rounded-2xl shadow-lg transition-all duration-300 ${isLiked ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 scale-105' : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'}`}
                                onClick={handleLike}
                                disabled={toggleLike.isPending}
                            >
                                <Heart className={`w-7 h-7 ${isLiked ? 'fill-current text-white' : 'text-black'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-full h-14 rounded-2xl hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                                <Share2 className="w-6 h-6" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}
