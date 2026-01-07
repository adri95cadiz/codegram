"use client";

import { motion } from "framer-motion";
import { Terminal, Plus, ArrowRight, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProjectsView() {
    // Mock data for now - in real app this would come from tRPC
    const projects = [
        {
            id: "1",
            title: "AI-Powered Pomodoro",
            description: "A productivity timer that adapts to your focus levels using webcam analysis.",
            status: "in-progress",
            lastActive: "2h ago",
            progress: 65,
            stack: ["React", "TensorFlow.js"],
            nextStep: "Implement face detection logic"
        },
        {
            id: "2",
            title: "Crypto Arbitrage Bot",
            description: "Scanning DEXs for price discrepancies.",
            status: "paused",
            lastActive: "2d ago",
            progress: 30,
            stack: ["Node.js", "Ethers.js"],
            nextStep: "Connect to Uniswap V3"
        }
    ];

    return (
        <div className="h-screen w-full bg-black text-white flex flex-col pt-16 pb-20 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Active Projects</h1>
                    <p className="text-zinc-400 text-sm">Your creative factory</p>
                </div>
                <Button size="icon" className="rounded-full bg-white text-black hover:bg-zinc-200">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-4 pb-8">
                    {projects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden group hover:border-zinc-700 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={`
                                            ${project.status === 'in-progress' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-zinc-700 text-zinc-400'}
                                            uppercase text-[10px] tracking-widest
                                        `}>
                                            {project.status}
                                        </Badge>
                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {project.lastActive}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-bold mt-2 group-hover:text-green-400 transition-colors">
                                        {project.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-zinc-400">
                                        {project.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/50">
                                            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Next Step</p>
                                            <p className="text-sm font-mono text-green-400 flex items-center gap-2">
                                                <Terminal className="w-3 h-3" />
                                                &gt; {project.nextStep}
                                            </p>
                                        </div>

                                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold group-hover:translate-x-1 transition-transform" variant="secondary">
                                        Continue Building <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}

                    <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                        <p>Start a new project from the feed to see it here.</p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
