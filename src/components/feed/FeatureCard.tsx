"use client";

import { motion } from "framer-motion";
import { GitPullRequest, GitMerge, Bug, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
    feature: {
        id: string;
        type: "feature" | "fix" | "chore";
        title: string;
        description: string;
        repo: string;
        impact: "high" | "medium" | "low";
        files: string[];
    };
    onOpenEditor?: () => void;
}

export function FeatureCard({ feature, onOpenEditor }: FeatureCardProps) {
    const typeIcons = {
        feature: <Zap className="w-5 h-5 text-yellow-500" />,
        fix: <Bug className="w-5 h-5 text-red-500" />,
        chore: <GitMerge className="w-5 h-5 text-blue-500" />,
    };

    const impactColors = {
        high: "bg-red-500/20 text-red-400 border-red-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };

    return (
        <div className="h-[100dvh] w-full snap-start flex items-center justify-center p-0 sm:p-4 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="w-full max-w-md h-full max-h-[100dvh] sm:max-h-[85vh] relative z-10"
            >
                <Card className="h-full flex flex-col border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl overflow-hidden relative group border-0 sm:border">
                    <CardHeader className="space-y-4 pt-20 sm:pt-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-zinc-700 text-zinc-400 bg-zinc-900">
                                    {feature.repo}
                                </Badge>
                                <Badge variant="outline" className={`uppercase text-[10px] tracking-widest ${impactColors[feature.impact]}`}>
                                    {feature.impact} Impact
                                </Badge>
                            </div>
                            {typeIcons[feature.type]}
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
                            {feature.title}
                        </h2>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto scrollbar-hide pb-24 space-y-6">
                        <p className="text-lg text-zinc-300 leading-relaxed">
                            {feature.description}
                        </p>

                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <GitPullRequest className="w-4 h-4" /> Suggested Changes
                            </h3>
                            <div className="space-y-2">
                                {feature.files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm font-mono text-zinc-400 bg-black/40 p-2 rounded border border-zinc-800/50">
                                        <span>{file}</span>
                                        <span className="text-yellow-500 text-xs">M</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-4 pb-8 sm:pb-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-xl absolute bottom-0 left-0 right-0">
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={onOpenEditor}
                        >
                            <GitPullRequest className="w-5 h-5 mr-2" />
                            Review & Merge
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
