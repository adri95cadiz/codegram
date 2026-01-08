"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { IdeaCard } from "./IdeaCard";
import { ProjectPulseCard } from "./ProjectPulseCard";
import { VibeBar } from "./VibeBar";
import { Loader2 } from "lucide-react";

import { useLanguage } from "../i18n/LanguageContext";

export function DiscoverFeed({ onOpenEditor }: { onOpenEditor: () => void }) {
    const { t, language } = useLanguage();
    // Load initial state from localStorage if available, otherwise default
    const [vibe, setVibe] = useState("");
    const [mode, setMode] = useState<any>("chaos");
    const [duration, setDuration] = useState<any>("weekend");
    const [isInitialized, setIsInitialized] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Hydrate from localStorage on client mount
    useEffect(() => {
        const savedMode = localStorage.getItem("doom_feed_mode");
        const savedDuration = localStorage.getItem("doom_feed_duration");
        const savedVibe = localStorage.getItem("doom_feed_vibe");

        if (savedMode) setMode(savedMode);
        if (savedDuration) setDuration(savedDuration);
        if (savedVibe) setVibe(savedVibe);

        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever they change
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("doom_feed_mode", mode);
        localStorage.setItem("doom_feed_duration", duration);
        localStorage.setItem("doom_feed_vibe", vibe);
    }, [mode, duration, vibe, isInitialized]);

    // Query hooks MUST be called unconditionally at the top level
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
        api.feed.generateIdea.useInfiniteQuery(
            { vibe, mode, duration, language: language as "en" | "es" },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                // Disable query until we are initialized to prevent flashing default state
                enabled: isInitialized,
            }
        );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: "50%" }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll tracker
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const currentScrollY = container.scrollTop;
            if (currentScrollY > lastScrollY.current + 10) {
                setScrollDirection("down");
            } else if (currentScrollY < lastScrollY.current - 10) {
                setScrollDirection("up");
            }
            lastScrollY.current = currentScrollY;
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // Now we can have conditional returns
    if (!isInitialized) return null;

    // Reset feed when vibe changes
    const handleVibeChange = (newVibe: string) => {
        setVibe(newVibe);
    };

    // Always render structure to keep VibeBar persistent
    return (
        <div
            ref={containerRef}
            className="relative h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        >
            <div className={`fixed top-0 left-0 right-0 z-40 pointer-events-none transition-transform duration-300 ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}`}>
                <VibeBar
                    onVibeChange={handleVibeChange}
                    onModeChange={setMode}
                    onDurationChange={setDuration}
                    currentMode={mode}
                    currentDuration={duration}
                    isGenerating={status === 'pending' || isFetchingNextPage}
                />
            </div>

            {status === 'pending' ? (
                <div className="h-full w-full flex items-center justify-center pt-20">
                    <SkeletonIdeaCard />
                </div>
            ) : status === 'error' ? (
                <div className="h-full w-full flex items-center justify-center text-destructive">
                    {t("feed.error_loading")}
                </div>
            ) : (
                <>


                    {data?.pages.map((page, i) => (
                        <div key={i} className={i === 0 ? "pt-24" : ""}>
                            {page.type === "pulse" ? (
                                <ProjectPulseCard project={page.data} onOpenEditor={onOpenEditor} />
                            ) : (
                                <IdeaCard idea={page.data} />
                            )}
                        </div>
                    ))}

                    {/* Ghost Card Loader - Only visible when actively fetching */}
                    {isFetchingNextPage && (
                        <div className="h-[100dvh] w-full snap-start flex items-center justify-center p-4">
                            <SkeletonIdeaCard />
                        </div>
                    )}

                    {/* Invisible Trigger for Infinite Scroll */}
                    {hasNextPage && (
                        <div ref={loadMoreRef} className="h-1 w-full" />
                    )}

                    {!hasNextPage && !isFetchingNextPage && (
                        <div className="h-[50vh] w-full snap-center flex items-center justify-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                            End of Stream
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function SkeletonIdeaCard() {
    return (
        <div className="w-full max-w-md h-[80vh] bg-black border border-white/5 rounded-xl p-6 flex flex-col gap-4 animate-pulse relative z-10">
            {/* Header */}
            <div className="space-y-4 pt-16 px-2">
                <div className="flex justify-between">
                    <div className="h-5 w-24 bg-zinc-900 rounded-full" />
                    <div className="h-5 w-16 bg-zinc-900 rounded-full" />
                </div>
                <div className="h-16 w-3/4 bg-zinc-900 rounded-2xl" />
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 px-2 py-8">
                <div className="h-4 w-full bg-zinc-900 rounded" />
                <div className="h-4 w-full bg-zinc-900 rounded" />
                <div className="h-4 w-2/3 bg-zinc-900 rounded" />
            </div>

            {/* Footer Area */}
            <div className="h-28 w-full bg-zinc-900/50 rounded-2xl" />
        </div>
    );
}
