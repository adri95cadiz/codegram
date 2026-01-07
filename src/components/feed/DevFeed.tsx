"use client";

import { useState } from "react";
import { GitHubConnect } from "@/components/github/GitHubConnect";
import { FeatureCard } from "@/components/feed/FeatureCard";

export function DevFeed({ onOpenEditor }: { onOpenEditor: () => void }) {
    const [isConnected, setIsConnected] = useState(false);
    const [repos, setRepos] = useState<string[]>([]);

    const handleConnect = (selectedRepos: string[]) => {
        setRepos(selectedRepos);
        setIsConnected(true);
    };

    // Mock features based on selected repos
    const mockFeatures = [
        {
            id: "1",
            type: "feature" as const,
            title: "Implement Dark Mode",
            description: "Add a system-aware dark mode toggle using Tailwind CSS and local storage persistence.",
            repo: repos[0] || "codegram",
            impact: "medium" as const,
            files: ["src/app/layout.tsx", "src/components/ThemeToggle.tsx"]
        },
        {
            id: "2",
            type: "fix" as const,
            title: "Fix Infinite Scroll Jitter",
            description: "Resolve the layout shift occurring when new items are appended to the feed list.",
            repo: repos[0] || "codegram",
            impact: "high" as const,
            files: ["src/components/feed/Feed.tsx", "src/hooks/useScroll.ts"]
        },
        {
            id: "3",
            type: "chore" as const,
            title: "Upgrade Dependencies",
            description: "Bump Next.js to version 15 and update all related peer dependencies.",
            repo: repos[0] || "codegram",
            impact: "low" as const,
            files: ["package.json", "pnpm-lock.yaml"]
        }
    ];

    if (!isConnected) {
        return <GitHubConnect onConnect={handleConnect} />;
    }

    return (
        <div className="relative h-full w-full bg-zinc-950 overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            {mockFeatures.map((feature, i) => (
                <div key={i}>
                    <FeatureCard feature={feature} onOpenEditor={onOpenEditor} />
                </div>
            ))}

            <div className="h-40 w-full flex items-center justify-center snap-start text-zinc-500 pb-20">
                <p>All caught up! Check back later for more.</p>
            </div>
        </div>
    );
}
