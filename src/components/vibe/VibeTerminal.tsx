"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, X, ChevronRight, Check, Play, Loader2, FileCode, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface VibeTerminalProps {
    onClose: () => void;
    projectPath: string;
}

export function VibeTerminal({ onClose, projectPath }: VibeTerminalProps) {
    const [vibe, setVibe] = useState("");
    const [logs, setLogs] = useState<{ id: string; type: "input" | "thought" | "system" | "success"; text: string }[]>([
        { id: "1", type: "system", text: `VIBE TERMINAL LINKED TO: ${projectPath}` },
        { id: "2", type: "system", text: "READY FOR INPUT..." },
    ]);
    const [stage, setStage] = useState<"idle" | "thinking" | "ready-to-apply" | "applying">("idle");
    const [suggestedChanges, setSuggestedChanges] = useState<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const vibeMutation = api.vibe.processVibe.useMutation({
        onSuccess: (data) => {
            setLogs(prev => [...prev, { id: Date.now().toString(), type: "thought", text: data.thought }]);
            setSuggestedChanges(data.changes);
            setStage("ready-to-apply");
        },
        onError: (err) => {
            setLogs(prev => [...prev, { id: Date.now().toString(), type: "system", text: `ERROR: ${err.message}` }]);
            setStage("idle");
        }
    });

    const writeFileMutation = api.inspector.writeFile.useMutation();

    const handleSendVibe = () => {
        if (!vibe.trim() || stage !== "idle") return;

        setLogs(prev => [...prev, { id: Date.now().toString(), type: "input", text: vibe }]);
        setStage("thinking");
        vibeMutation.mutate({ vibe, projectPath });
        setVibe("");
    };

    const handleApply = async () => {
        if (!suggestedChanges || suggestedChanges.length === 0) return;

        setStage("applying");
        setLogs(prev => [...prev, { id: Date.now().toString(), type: "system", text: "APPLYING CHANGES..." }]);

        try {
            for (const change of suggestedChanges) {
                const fullPath = `${projectPath}/${change.file}`;
                await writeFileMutation.mutateAsync({
                    path: fullPath,
                    content: change.content,
                });
                setLogs(prev => [...prev, { id: Date.now().toString(), type: "success", text: `MODIFIED: ${change.file}` }]);
            }
            setLogs(prev => [...prev, { id: Date.now().toString(), type: "system", text: "ALL CHANGES APPLIED SUCCESSFULLY." }]);
            setSuggestedChanges(null);
            setStage("idle");
        } catch (err: any) {
            setLogs(prev => [...prev, { id: Date.now().toString(), type: "system", text: `FAILED TO APPLY: ${err.message}` }]);
            setStage("idle");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-[100] bg-[#0c0c0c] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-[#151515] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Wand2 className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-zinc-100 font-bold text-xs uppercase tracking-widest">Vibe Coding / Opencode</h2>
                    </div>
                </div>
                <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full text-zinc-500 hover:text-white">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Terminal View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2 text-xs">
                        <span className={`font-bold ${log.type === "input" ? "text-blue-500" :
                                log.type === "thought" ? "text-purple-400" :
                                    log.type === "success" ? "text-green-500" : "text-zinc-600"
                            }`}>
                            {log.type === "input" ? ">" : log.type === "thought" ? "?" : "::"}
                        </span>
                        <span className={
                            log.type === "input" ? "text-zinc-100" :
                                log.type === "thought" ? "text-purple-300 italic" :
                                    log.type === "success" ? "text-green-400" : "text-zinc-500"
                        }>
                            {log.text}
                        </span>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Action Bar */}
            <AnimatePresence>
                {stage === "ready-to-apply" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3 bg-purple-500/10 border-t border-purple-500/30 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] text-purple-300 uppercase font-bold tracking-tight">AI Proposed Changes Available</span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setStage("idle")} className="text-zinc-400 hover:text-white text-[10px] h-7 px-3">
                                DISCARD
                            </Button>
                            <Button size="sm" onClick={handleApply} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] h-7 px-4 shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                                APPLY CHANGES
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-[#111] border-t border-zinc-800">
                <div className="relative">
                    <Input
                        value={vibe}
                        onChange={(e) => setVibe(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendVibe()}
                        placeholder={stage === "thinking" ? "AI IS ANALYZING..." : "WHAT'S THE VIBE?"}
                        disabled={stage !== "idle"}
                        className="bg-black border-zinc-800 text-zinc-100 pl-10 h-10 text-xs focus-visible:ring-purple-500/50"
                    />
                    <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {stage === "thinking" && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                        {stage === "idle" && (
                            <Button size="icon" variant="ghost" onClick={handleSendVibe} className="h-7 w-7 text-zinc-600 hover:text-purple-500">
                                <Zap className="w-4 h-4 fill-current" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
