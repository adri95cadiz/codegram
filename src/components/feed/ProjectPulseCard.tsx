"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/components/i18n/LanguageContext";

interface ProjectPulseProps {
    project: {
        id: number;
        title: string;
        description: string;
        stack: string;
        vibe: string;
        status: string;
        nextStep?: string | null;
    };
    onOpenEditor?: () => void;
}

export function ProjectPulseCard({ project, onOpenEditor }: ProjectPulseProps) {
    const { t } = useLanguage();

    return (
        <div className="h-[100dvh] w-full snap-start flex items-center justify-center p-0 sm:p-4 relative">
            <div className="absolute inset-0 z-0 bg-black">
                <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="w-full max-w-md h-full max-h-[100dvh] sm:max-h-[85vh] relative z-10"
            >
                <Card className="h-full flex flex-col border-green-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(34,197,94,0.2)] overflow-hidden relative group border-0 sm:border">

                    <CardHeader className="space-y-4 relative z-10 pt-20 sm:pt-6">
                        <div className="flex justify-between items-start">
                            <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-mono border-green-500/30 text-green-400 bg-green-900/20 backdrop-blur-md">
                                {project.status}
                            </Badge>
                            <Terminal className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tighter font-mono mt-2 text-white drop-shadow-2xl">
                            {project.title}
                        </h2>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-8 overflow-y-auto relative z-10 scrollbar-hide pb-24">
                        <div className="p-6 rounded-xl bg-green-950/30 border border-green-500/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest font-mono mb-2">
                                {t("card.next_step")}
                            </h3>
                            <p className="text-xl text-white font-mono leading-relaxed">
                                &gt; {project.nextStep || "Check project for details..."}
                            </p>
                        </div>

                        <p className="text-lg text-zinc-400 leading-relaxed">
                            {project.description}
                        </p>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-mono">
                                {t("card.the_stack")}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.stack.split(',').map((tech) => (
                                    <span key={tech} className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-400">
                                        {tech.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-4 pb-8 sm:pb-4 border-t border-green-500/10 bg-black/60 relative z-10 backdrop-blur-xl absolute bottom-0 left-0 right-0">
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-500 text-black font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={onOpenEditor}
                        >
                            <Terminal className="w-5 h-5 mr-2" />
                            {t("card.open_editor")}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
