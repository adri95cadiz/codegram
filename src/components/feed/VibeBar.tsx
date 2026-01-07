"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Briefcase, GraduationCap } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VibeBarProps {
    onVibeChange: (vibe: string) => void;
    onModeChange: (mode: "chaos" | "serious" | "learning") => void;
    currentMode: "chaos" | "serious" | "learning";
}

export function VibeBar({ onVibeChange, onModeChange, currentMode }: VibeBarProps) {
    const [vibe, setVibe] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (vibe.trim()) {
            onVibeChange(vibe);
            setVibe("");
        }
    };

    const modeIcons = {
        chaos: <Zap className="w-4 h-4 text-yellow-500" />,
        serious: <Briefcase className="w-4 h-4 text-blue-500" />,
        learning: <GraduationCap className="w-4 h-4 text-green-500" />,
    };

    return (
        <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl flex gap-2 pointer-events-auto transition-all focus-within:ring-1 focus-within:ring-white/20"
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0 hover:bg-white/10">
                            {modeIcons[currentMode]}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuItem onClick={() => onModeChange("chaos")} className="gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" /> Chaos Mode
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("serious")} className="gap-2">
                            <Briefcase className="w-4 h-4 text-blue-500" /> Serious Mode
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("learning")} className="gap-2">
                            <GraduationCap className="w-4 h-4 text-green-500" /> Learning Mode
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Input
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder={`Vibe check (${currentMode} mode)...`}
                    className="bg-transparent border-none text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-white text-black hover:bg-zinc-200 shrink-0 w-10 h-10"
                >
                    <Sparkles className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
