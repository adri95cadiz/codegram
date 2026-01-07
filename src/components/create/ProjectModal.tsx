"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Terminal, ArrowRight } from "lucide-react";
import { useState } from "react";

interface Idea {
    id: string;
    title: string;
    description: string;
    stack: string;
    effort: string;
    why: string;
    vibe: string;
}

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: Idea | null;
}

export function ProjectModal({ isOpen, onClose, idea }: ProjectModalProps) {
    const [isIgniting, setIsIgniting] = useState(false);

    if (!idea) return null;

    const handleIgnite = () => {
        setIsIgniting(true);
        // Mock AI Agent trigger
        setTimeout(() => {
            setIsIgniting(false);
            onClose();
            // In a real app, this would navigate to the project workspace
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-mono font-bold flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-green-500" />
                        Initialize Project
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        You are about to start a new Doom Coding session.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Target</h3>
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                            <h4 className="font-bold text-lg">{idea.title}</h4>
                            <p className="text-sm text-zinc-400 mt-1">{idea.description}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {idea.stack.split(',').map((tech) => (
                                <Badge key={tech} variant="outline" className="border-zinc-700 text-zinc-300">
                                    {tech.trim()}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto hover:bg-zinc-900 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleIgnite}
                        disabled={isIgniting}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                        {isIgniting ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Igniting Agent...
                            </>
                        ) : (
                            <>
                                Ignite Project <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
