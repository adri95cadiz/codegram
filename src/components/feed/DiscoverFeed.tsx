"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { IdeaCard } from "./IdeaCard";
import { ProjectPulseCard } from "./ProjectPulseCard";
import { VibeBar } from "./VibeBar";
import { Loader2 } from "lucide-react";

export function DiscoverFeed({ onOpenEditor }: { onOpenEditor: () => void }) {
    const [vibe, setVibe] = useState("");
    const [mode, setMode] = useState<any>("chaos");
    const [duration, setDuration] = useState<any>("weekend");
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
        api.feed.generateIdea.useInfiniteQuery(
            { vibe, mode, duration },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Reset feed when vibe changes
    const handleVibeChange = (newVibe: string) => {
        setVibe(newVibe);
    };

    if (status === "pending") {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="h-full w-full flex items-center justify-center text-destructive">
                Error loading feed.
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-background overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            <VibeBar
                onVibeChange={handleVibeChange}
                onModeChange={setMode}
                onDurationChange={setDuration}
                currentMode={mode}
                currentDuration={duration}
            />

            {data.pages.map((page, i) => (
                <div key={i}>
                    {page.type === "pulse" ? (
                        <ProjectPulseCard project={page.data} onOpenEditor={onOpenEditor} />
                    ) : (
                        <IdeaCard idea={page.data} />
                    )}
                </div>
            ))}

            <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center snap-start">
                {isFetchingNextPage && (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    );
}
