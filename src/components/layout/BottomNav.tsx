"use client";

import { Home, Heart, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
    currentView: "feed" | "saved" | "profile";
    onViewChange: (view: "feed" | "saved" | "profile") => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <div className="mx-auto max-w-md bg-black/80 backdrop-blur-xl border border-white/10 rounded-full h-16 px-6 flex items-center justify-between shadow-2xl pointer-events-auto">
                <button
                    onClick={() => onViewChange("feed")}
                    className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                        currentView === "feed" ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <Home className="w-6 h-6" />
                </button>

                <button
                    onClick={() => onViewChange("saved")}
                    className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                        currentView === "saved" ? "text-red-500 bg-red-500/10" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <Heart className={cn("w-6 h-6", currentView === "saved" && "fill-current")} />
                </button>

                <button
                    onClick={() => onViewChange("profile")}
                    className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                        currentView === "profile" ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <User className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
