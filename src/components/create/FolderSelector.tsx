"use client";

import { useState, useEffect } from "react";
import { Folder, ChevronRight, HardDrive, ArrowLeft, Check } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface FolderSelectorProps {
    onSelect: (path: string) => void;
    initialPath?: string;
}

export function FolderSelector({ onSelect, initialPath = "C:/" }: FolderSelectorProps) {
    const [currentPath, setCurrentPath] = useState(initialPath);
    const { data: entries, isLoading, error } = api.inspector.getFiles.useQuery({ path: currentPath });

    const handleLevelUp = () => {
        const parts = currentPath.split(/[\\/]/).filter(Boolean);
        if (parts.length > 1) {
            parts.pop();
            const newPath = parts.join("/") + "/";
            setCurrentPath(newPath);
        } else if (parts.length === 1) {
            setCurrentPath("C:/");
        }
    };

    const handleSelectFolder = (path: string) => {
        setCurrentPath(path);
    };

    const confirmSelection = () => {
        onSelect(currentPath);
    };

    return (
        <div className="flex flex-col h-[400px] border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleLevelUp}
                        className="h-8 w-8 hover:bg-zinc-800 text-zinc-400"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-xs font-mono text-zinc-500 truncate">
                        {currentPath}
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={confirmSelection}
                    className="bg-green-600 hover:bg-green-700 text-white h-8 text-[10px] font-bold uppercase tracking-wider"
                >
                    <Check className="w-3 h-3 mr-1" /> Select
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {isLoading ? (
                        <div className="p-4 flex justify-center">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent animate-spin rounded-full" />
                        </div>
                    ) : error ? (
                        <div className="p-4 text-xs text-red-400 font-mono">
                            Error reading path. Access denied or invalid.
                        </div>
                    ) : (
                        entries?.map((entry) => (
                            <button
                                key={entry.path}
                                onClick={() => entry.type === 'directory' && handleSelectFolder(entry.path)}
                                className={`
                                    w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all
                                    ${entry.type === 'directory' ? 'hover:bg-zinc-900 cursor-pointer' : 'opacity-50 cursor-default'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Folder className={`w-4 h-4 ${entry.type === 'directory' ? 'text-blue-400 fill-blue-400/10' : 'text-zinc-600'}`} />
                                    <span className="text-sm font-medium text-zinc-300 truncate">{entry.name}</span>
                                </div>
                                {entry.type === 'directory' && (
                                    <ChevronRight className="w-4 h-4 text-zinc-700" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
