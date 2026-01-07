"use client";

import { useState } from "react";
import { Github, Check, Search, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface GitHubConnectProps {
    onConnect: (repos: string[]) => void;
}

export function GitHubConnect({ onConnect }: GitHubConnectProps) {
    const [step, setStep] = useState<"connect" | "select">("connect");
    const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    const mockRepos = [
        "codegram",
        "awesome-project",
        "nextjs-starter",
        "ai-agent-template",
        "portfolio-v2",
        "design-system"
    ];

    const handleConnect = () => {
        // Simulate auth delay
        setTimeout(() => setStep("select"), 800);
    };

    const toggleRepo = (repo: string) => {
        if (selectedRepos.includes(repo)) {
            setSelectedRepos(selectedRepos.filter(r => r !== repo));
        } else {
            setSelectedRepos([...selectedRepos, repo]);
        }
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-50" />

            <div className="relative z-10 w-full max-w-md">
                {step === "connect" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8"
                    >
                        <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-2xl shadow-white/10">
                            <Github className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight">Connect GitHub</h2>
                            <p className="text-zinc-400">
                                Import your repositories to unlock AI-powered features, bug fixes, and code optimizations.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleConnect}
                            className="w-full h-14 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-lg"
                        >
                            Authorize Access
                        </Button>
                        <p className="text-xs text-zinc-600 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Secure Connection via OAuth 2.0
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-[60vh]"
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-1">Select Repositories</h2>
                            <p className="text-zinc-400 text-sm">Choose projects to analyze</p>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search repositories..."
                                className="pl-9 bg-zinc-900 border-zinc-800 rounded-xl h-12 text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <ScrollArea className="flex-1 -mx-2 px-2">
                            <div className="space-y-2">
                                {mockRepos
                                    .filter(r => r.includes(search.toLowerCase()))
                                    .map((repo) => (
                                        <div
                                            key={repo}
                                            onClick={() => toggleRepo(repo)}
                                            className={`
                                            p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                                            ${selectedRepos.includes(repo)
                                                    ? "bg-white text-black border-white"
                                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"}
                                        `}
                                        >
                                            <span className="font-mono font-medium">{repo}</span>
                                            {selectedRepos.includes(repo) && (
                                                <Check className="w-5 h-5" />
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>

                        <div className="pt-6 mt-auto">
                            <Button
                                size="lg"
                                onClick={() => onConnect(selectedRepos)}
                                disabled={selectedRepos.length === 0}
                                className="w-full h-14 rounded-full bg-green-500 text-black hover:bg-green-400 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Import {selectedRepos.length} Projects
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
