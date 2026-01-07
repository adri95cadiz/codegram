import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Briefcase, GraduationCap, Rocket, Palette, Gamepad2, Clock, Calendar, CalendarDays, CalendarRange, Building2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VibeBarProps {
    onVibeChange: (vibe: string) => void;
    onModeChange: (mode: any) => void;
    onDurationChange: (duration: any) => void;
    currentMode: string;
    currentDuration: string;
}

export function VibeBar({ onVibeChange, onModeChange, onDurationChange, currentMode, currentDuration }: VibeBarProps) {
    const [vibe, setVibe] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (vibe.trim()) {
            onVibeChange(vibe);
            setVibe("");
        }
    };

    const modeIcons: Record<string, React.ReactNode> = {
        chaos: <Zap className="w-4 h-4 text-yellow-500" />,
        serious: <Briefcase className="w-4 h-4 text-blue-500" />,
        learning: <GraduationCap className="w-4 h-4 text-green-500" />,
        startup: <Rocket className="w-4 h-4 text-orange-500" />,
        artist: <Palette className="w-4 h-4 text-purple-500" />,
        gamedev: <Gamepad2 className="w-4 h-4 text-red-500" />,
    };

    const durationIcons: Record<string, React.ReactNode> = {
        quick: <Clock className="w-4 h-4 text-zinc-400" />,
        weekend: <Calendar className="w-4 h-4 text-zinc-400" />,
        week: <CalendarDays className="w-4 h-4 text-zinc-400" />,
        month: <CalendarRange className="w-4 h-4 text-zinc-400" />,
        founder: <Building2 className="w-4 h-4 text-zinc-400" />,
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
                            {modeIcons[currentMode] || <Zap className="w-4 h-4" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuItem onClick={() => onModeChange("chaos")} className="gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" /> Chaos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("serious")} className="gap-2">
                            <Briefcase className="w-4 h-4 text-blue-500" /> Serious
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("learning")} className="gap-2">
                            <GraduationCap className="w-4 h-4 text-green-500" /> Learning
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("startup")} className="gap-2">
                            <Rocket className="w-4 h-4 text-orange-500" /> Startup
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("artist")} className="gap-2">
                            <Palette className="w-4 h-4 text-purple-500" /> Artist
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModeChange("gamedev")} className="gap-2">
                            <Gamepad2 className="w-4 h-4 text-red-500" /> Game Dev
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0 hover:bg-white/10">
                            {durationIcons[currentDuration] || <Calendar className="w-4 h-4" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuItem onClick={() => onDurationChange("quick")} className="gap-2">
                            <Clock className="w-4 h-4" /> Quick Fix (1-2h)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDurationChange("weekend")} className="gap-2">
                            <Calendar className="w-4 h-4" /> Weekend (48h)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDurationChange("week")} className="gap-2">
                            <CalendarDays className="w-4 h-4" /> Hackathon (1w)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDurationChange("month")} className="gap-2">
                            <CalendarRange className="w-4 h-4" /> Side Hustle (1m)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDurationChange("founder")} className="gap-2">
                            <Building2 className="w-4 h-4" /> Founder Mode
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Input
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder={`Vibe check...`}
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
