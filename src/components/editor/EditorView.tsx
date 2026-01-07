"use client";

import { useState } from "react";
import { X, Play, MessageSquare, FileCode, ChevronRight, ChevronDown, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface EditorViewProps {
    isOpen: boolean;
    onClose: () => void;
    initialFile?: string;
}

export function EditorView({ isOpen, onClose, initialFile = "src/app/page.tsx" }: EditorViewProps) {
    const [activeFile, setActiveFile] = useState(initialFile);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [code, setCode] = useState(`// ${initialFile}
import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Hello World
      </h1>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Count: {count}
      </button>
    </div>
  );
}`);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-zinc-950 text-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                    <span className="font-mono text-sm text-zinc-300">{activeFile}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-500/10">
                        <Play className="w-4 h-4 mr-1" /> Run
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File Tree (Hidden on small screens, visible on larger) */}
                <div className="hidden sm:flex w-64 border-r border-zinc-800 flex-col bg-zinc-900/30">
                    <div className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Explorer</div>
                    <div className="px-2 space-y-1">
                        <div className="flex items-center gap-1 text-zinc-400 text-sm p-1 hover:bg-zinc-800 rounded cursor-pointer">
                            <ChevronDown className="w-4 h-4" /> src
                        </div>
                        <div className="pl-4 space-y-1">
                            <div className="flex items-center gap-2 text-blue-400 text-sm p-1 bg-blue-500/10 rounded cursor-pointer">
                                <FileCode className="w-4 h-4" /> page.tsx
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 text-sm p-1 hover:bg-zinc-800 rounded cursor-pointer">
                                <FileCode className="w-4 h-4" /> layout.tsx
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative flex flex-col">
                    <ScrollArea className="flex-1 p-4 font-mono text-sm leading-relaxed">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full min-h-[500px] bg-transparent border-none focus:ring-0 resize-none outline-none text-zinc-300 placeholder-zinc-600"
                            spellCheck={false}
                        />
                    </ScrollArea>

                    {/* Chat Overlay Trigger */}
                    <div className="absolute bottom-6 right-6">
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                            onClick={() => setIsChatOpen(!isChatOpen)}
                        >
                            <MessageSquare className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chat Overlay */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 h-[50vh] bg-zinc-900 border-t border-zinc-800 rounded-t-3xl shadow-2xl flex flex-col"
                    >
                        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-6">
                            <span className="font-bold text-sm">Agent Chat</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="h-8 w-8">
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">AI</div>
                                <div className="bg-zinc-800 rounded-2xl rounded-tl-none p-3 text-sm text-zinc-300 max-w-[80%]">
                                    I noticed you're working on the layout. Want me to add a responsive grid?
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask the agent..."
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 h-10 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-500">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
