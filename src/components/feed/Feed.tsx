"use client";

import { useState } from "react";
import { DiscoverFeed } from "./DiscoverFeed";
import { DevFeed } from "./DevFeed";
import { WIPFeed } from "./WIPFeed";
import { EditorView } from "@/components/editor/EditorView";
import { cn } from "@/lib/utils";
import { Sparkles, Github, Bot } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageContext";

export function Feed() {
    const [feedMode, setFeedMode] = useState<"discover" | "dev" | "wip">("discover");
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const { t } = useLanguage();

    const handleOpenEditor = () => setIsEditorOpen(true);

    return (
        <div className="h-screen w-full bg-black relative">
            <EditorView isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />

            {/* Top Mode Switcher */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-14 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-1 flex gap-1 pointer-events-auto shadow-2xl">
                    <button
                        onClick={() => setFeedMode("discover")}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                            feedMode === "discover"
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Sparkles className="w-3 h-3" /> {t("feed.discover")}
                    </button>
                    <button
                        onClick={() => setFeedMode("dev")}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                            feedMode === "dev"
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Github className="w-3 h-3" /> {t("feed.dev")}
                    </button>
                    <button
                        onClick={() => setFeedMode("wip")}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                            feedMode === "wip"
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Bot className="w-3 h-3" /> {t("feed.wip")}
                    </button>
                </div>
            </div>

            {/* Feed Content */}
            <div className="h-full w-full pt-0">
                {feedMode === "discover" && <DiscoverFeed onOpenEditor={handleOpenEditor} />}
                {feedMode === "dev" && <DevFeed onOpenEditor={handleOpenEditor} />}
                {feedMode === "wip" && <WIPFeed />}
            </div>
        </div>
    );
}
