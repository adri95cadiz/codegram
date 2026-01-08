"use client";

import { useState } from "react";
import { Github, Key, CheckCircle2, AlertCircle, Loader2, LogOut, ChevronRight, Globe } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface GitConnectorProps {
    onRepoSelect: (repo: { url: string, name: string }) => void;
}

export function GitConnector({ onRepoSelect }: GitConnectorProps) {
    const [token, setToken] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const utils = api.useUtils();
    const { data: status, isLoading: isLoadingStatus } = api.github.getConnectionStatus.useQuery();
    const { data: repos, isLoading: isLoadingRepos } = api.github.getRepos.useQuery(undefined, {
        enabled: !!status?.isConnected
    });

    const saveToken = api.github.saveToken.useMutation({
        onSuccess: () => {
            utils.github.getConnectionStatus.invalidate();
            setIsConnecting(false);
            setToken("");
        },
        onError: (err) => {
            setIsConnecting(false);
            alert(err.message);
        }
    });

    const disconnect = api.github.disconnect.useMutation({
        onSuccess: () => {
            utils.github.getConnectionStatus.invalidate();
        }
    });

    const handleConnect = () => {
        if (!token) return;
        setIsConnecting(true);
        saveToken.mutate({ token });
    };

    if (isLoadingStatus) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-600" /></div>;
    }

    if (!status?.isConnected) {
        return (
            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-zinc-800">
                            <Github className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Connect GitHub</h4>
                            <p className="text-[10px] text-zinc-500">Provide a Personal Access Token to list your repos.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                            <Input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="pl-9 bg-black border-zinc-800 focus:border-green-500/50"
                                placeholder="ghp_xxxxxxxxxxxx"
                            />
                        </div>
                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                        >
                            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Link GitHub"}
                        </Button>
                        <p className="text-[9px] text-zinc-600 text-center">
                            Token requires <code className="text-zinc-400">repo</code> scope.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-zinc-200">Linked as {status.username}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnect.mutate()}
                    className="h-7 text-[10px] text-zinc-500 hover:text-red-400"
                >
                    <LogOut className="w-3 h-3 mr-1" /> Disconnect
                </Button>
            </div>

            <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Your Repositories</h4>
                <div className="border border-zinc-900 rounded-xl bg-black overflow-hidden h-[300px] flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="p-1 space-y-1">
                            {isLoadingRepos ? (
                                <div className="p-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-zinc-600" /></div>
                            ) : repos?.length === 0 ? (
                                <div className="p-8 text-center text-xs text-zinc-600">No repositories found.</div>
                            ) : (
                                repos?.map((repo) => (
                                    <button
                                        key={repo.fullName}
                                        onClick={() => onRepoSelect({ url: repo.url, name: repo.name })}
                                        className="w-full text-left p-3 rounded-lg hover:bg-zinc-900/50 transition-colors group flex items-start gap-3"
                                    >
                                        <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700">
                                            <Globe className="w-3 h-3 text-zinc-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">{repo.name}</div>
                                            <div className="text-[10px] text-zinc-500 truncate">{repo.fullName}</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-zinc-500 self-center" />
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
