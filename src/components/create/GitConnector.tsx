"use client";

import { Github, CheckCircle2, AlertCircle, Loader2, LogOut, ChevronRight, Globe } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GitConnectorProps {
    onRepoSelect: (repo: { url: string, name: string }) => void;
}

export function GitConnector({ onRepoSelect }: GitConnectorProps) {
    const utils = api.useUtils();
    const { data: status, isLoading: isLoadingStatus } = api.github.getConnectionStatus.useQuery();
    const { data: repos, isLoading: isLoadingRepos } = api.github.getRepos.useQuery(undefined, {
        enabled: !!status?.isConnected
    });

    const disconnect = api.github.disconnect.useMutation({
        onSuccess: () => {
            utils.github.getConnectionStatus.invalidate();
        }
    });

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
                            <h4 className="text-sm font-bold text-white">GitHub Not Connected</h4>
                            <p className="text-[10px] text-zinc-500">Sign in with GitHub to access your repositories.</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs text-blue-400 leading-relaxed">
                            To clone repositories, you need to sign in with GitHub OAuth. This will give the app access to your repositories.
                        </p>
                    </div>

                    <div className="text-center text-[10px] text-zinc-600">
                        Please sign out and sign in again using the <strong className="text-zinc-400">GitHub OAuth</strong> option.
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

            {status.needsReauth && (
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-orange-400">Re-authentication Required</p>
                            <p className="text-xs text-orange-300/80 leading-relaxed">
                                Your GitHub connection doesn't have permission to access private repositories.
                                Please <strong>disconnect</strong> and <strong>sign in again with GitHub</strong> to grant the necessary permissions.
                            </p>
                            <p className="text-[10px] text-orange-400/60">
                                Current scope: {status.scope || "unknown"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-900">
                <p className="text-[10px] text-zinc-500">
                    <strong className="text-zinc-400">Missing organization repos?</strong> Ensure you've granted access to your organizations in your <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">GitHub App settings</a>.
                </p>
            </div>

            {repos && repos.length === 0 && (
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <p className="text-xs text-blue-400 leading-relaxed">
                        <strong>No repositories found?</strong> You may need to sign out and sign in again with GitHub to grant access to your repositories (including private ones).
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Your Repositories</h4>
                    {repos && repos.length > 0 && (
                        <span className="text-[9px] text-zinc-600">{repos.length} repos</span>
                    )}
                </div>
                <ScrollArea className="h-[300px] border border-zinc-900 rounded-xl bg-black">
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
    );
}
