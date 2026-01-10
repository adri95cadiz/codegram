"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Key, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TokenSignIn() {
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            toast.error("Please enter a GitHub Personal Access Token");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                token: token.trim(),
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid token or authentication failed");
            } else {
                toast.success("Welcome, Builder!");
                window.location.reload(); // Refresh to pick up session
            }
        } catch (error) {
            toast.error("An error occurred during authentication");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignIn} className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <Key className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Vibe Access</h3>
                    <p className="text-xs text-zinc-400">Enter GitHub PAT to force sign-in</p>
                </div>
            </div>

            <div className="relative group">
                <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-black/50 border-zinc-800 focus:border-orange-500/50 transition-all pl-10 h-12"
                />
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                    </>
                ) : "Force Entry"}
            </Button>

            <p className="text-[10px] text-zinc-500 text-center px-4">
                This token will be used to analyze and write code to your projects.
            </p>
        </form>
    );
}
