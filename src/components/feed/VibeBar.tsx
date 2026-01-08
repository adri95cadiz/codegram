import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Briefcase, GraduationCap, Rocket, Palette, Gamepad2, Clock, Calendar, CalendarDays, CalendarRange, Building2, Command, Search, ArrowRight, X, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VibeBarProps {
    onVibeChange: (vibe: string) => void;
    onModeChange: (mode: any) => void;
    onDurationChange: (duration: any) => void;
    currentMode: string;
    currentDuration: string;
    isGenerating?: boolean; // New prop for feedback
}

export function VibeBar({ onVibeChange, onModeChange, onDurationChange, currentMode, currentDuration, isGenerating = false }: VibeBarProps) {
    const [vibe, setVibe] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (vibe.trim()) {
            onVibeChange(vibe);
            setVibe("");
            inputRef.current?.blur();
            setIsExpanded(false);
        }
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isExpanded]);

    const modeIcons: Record<string, React.ReactNode> = {
        chaos: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
        serious: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
        learning: <GraduationCap className="w-3.5 h-3.5 text-green-400" />,
        startup: <Rocket className="w-3.5 h-3.5 text-orange-400" />,
        artist: <Palette className="w-3.5 h-3.5 text-purple-400" />,
        gamedev: <Gamepad2 className="w-3.5 h-3.5 text-red-500" />,
    };

    const durationIcons: Record<string, React.ReactNode> = {
        quick: <Clock className="w-3.5 h-3.5 text-zinc-400" />,
        weekend: <Calendar className="w-3.5 h-3.5 text-zinc-400" />,
        week: <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />,
        month: <CalendarRange className="w-3.5 h-3.5 text-zinc-400" />,
        founder: <Building2 className="w-3.5 h-3.5 text-zinc-400" />,
    };

    return (
        <div className="w-full flex justify-center py-6 px-4 pointer-events-none sticky top-0 z-50">
            <motion.div
                ref={containerRef}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "relative w-full max-w-2xl pointer-events-auto transition-all duration-500",
                    isExpanded ? "scale-[1.02]" : "scale-100"
                )}
            >
                {/* Glow Effect */}
                <div className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-700",
                    isExpanded && "opacity-100"
                )} />

                <form
                    onSubmit={handleSubmit}
                    onFocus={() => setIsExpanded(true)}
                    className={cn(
                        "relative flex flex-col gap-2 p-2 rounded-2xl backdrop-blur-xl border transition-all duration-300",
                        isExpanded
                            ? "bg-black/80 border-white/20 shadow-2xl shadow-purple-500/10"
                            : "bg-black/40 border-white/10 shadow-lg hover:bg-black/60"
                    )}
                >
                    {/* Top Row: Input */}
                    <div className="flex items-center gap-3 px-2">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            isGenerating ? "bg-purple-500/20 animate-pulse" : "bg-zinc-800/50"
                        )}>
                            {isGenerating ? <Sparkles className="w-4 h-4 text-purple-400" /> : <Command className="w-4 h-4 text-zinc-400" />}
                        </div>

                        <Input
                            ref={inputRef}
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={isGenerating ? "Dreaming up new ideas..." : "Type a vibe (e.g., 'Retro cyberpunk chat app')..."}
                            className="flex-1 bg-transparent border-none text-base text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-0"
                            disabled={isGenerating}
                        />

                        {vibe && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setVibe("");
                                    inputRef.current?.focus();
                                }}
                                className="h-6 w-6 p-0 rounded-full hover:bg-white/10 text-zinc-500"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}

                        <Button
                            type="submit"
                            size="icon"
                            disabled={!vibe.trim() || isGenerating}
                            className={cn(
                                "rounded-xl w-9 h-9 transition-all duration-300",
                                vibe.trim()
                                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                            )}
                        >
                            {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Bottom Row: Controls */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap items-center gap-2 pt-2 px-2 pb-1 border-t border-white/5">
                                    {/* Mode Selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white font-normal px-2.5">
                                                {modeIcons[currentMode]}
                                                <span className="capitalize">{currentMode}</span>
                                                <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="bg-[#18181b] border-zinc-800 text-zinc-200 w-48 p-1">
                                            <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-zinc-500">Personality Engine</div>
                                            {Object.entries(modeIcons).map(([key, icon]) => (
                                                <DropdownMenuItem
                                                    key={key}
                                                    onClick={() => {
                                                        onModeChange(key);
                                                    }}
                                                    className={cn("gap-2 text-xs focus:bg-zinc-800 focus:text-white cursor-pointer", currentMode === key && "bg-zinc-800 text-white")}
                                                >
                                                    {icon} <span className="capitalize flex-1">{key}</span>
                                                    {currentMode === key && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Duration Selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white font-normal px-2.5">
                                                {durationIcons[currentDuration]}
                                                <span className="capitalize">{currentDuration}</span>
                                                <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="bg-[#18181b] border-zinc-800 text-zinc-200 w-48 p-1">
                                            <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-zinc-500">Time Scope</div>
                                            {Object.entries(durationIcons).map(([key, icon]) => (
                                                <DropdownMenuItem
                                                    key={key}
                                                    onClick={() => {
                                                        onDurationChange(key);
                                                    }}
                                                    className={cn("gap-2 text-xs focus:bg-zinc-800 focus:text-white cursor-pointer", currentDuration === key && "bg-zinc-800 text-white")}
                                                >
                                                    {icon} <span className="capitalize flex-1">{key}</span>
                                                    {currentDuration === key && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="flex-1" />

                                    {/* Quick Hints */}
                                    <div className="flex gap-2 text-[10px] text-zinc-500 font-mono hidden sm:flex">
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">↵ Submit</span>
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">ESC Cancel</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </motion.div>
        </div>
    );
}

