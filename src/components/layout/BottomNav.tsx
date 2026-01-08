"use client";

import { Globe, Gamepad2, User } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavProps {
    currentView: "feed" | "saved" | "profile";
    onViewChange: (view: "feed" | "saved" | "profile") => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">

                <NavButton
                    active={currentView === "feed"}
                    onClick={() => onViewChange("feed")}
                    icon={<Globe className="w-5 h-5" />}
                    label="NET"
                />

                <div className="w-px h-6 bg-zinc-800/50" />

                <NavButton
                    active={currentView === "saved"}
                    onClick={() => onViewChange("saved")}
                    icon={<Gamepad2 className="w-5 h-5" />}
                    label="WORLDS"
                />

                <div className="w-px h-6 bg-zinc-800/50" />

                <NavButton
                    active={currentView === "profile"}
                    onClick={() => onViewChange("profile")}
                    icon={<User className="w-5 h-5" />}
                    label="ID"
                />

            </div>
        </div>
    );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
        relative group flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300
        ${active ? "text-green-400 bg-green-950/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"}
      `}
        >
            {active && (
                <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 bg-green-500/10 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <div className={`relative z-10 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-105"}`}>
                {icon}
            </div>
            <span className="text-[9px] font-black tracking-widest mt-1 opacity-60 font-mono">
                {label}
            </span>
        </button>
    );
}
