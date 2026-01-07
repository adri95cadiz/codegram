"use client";

import { Bot } from "lucide-react";

export function WIPFeed() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black mb-2">Agent Control Center</h2>
            <p className="text-zinc-400 mb-8 max-w-xs">
                Active agent tasks and lines of work will appear here. Start a project to see agents in action.
            </p>
        </div>
    );
}
