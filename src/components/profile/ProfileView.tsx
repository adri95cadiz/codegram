"use client";

import { motion } from "framer-motion";
import { User, Settings, Heart, Zap, Trophy, Grid, List } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedView } from "@/components/profile/SavedView";

export function ProfileView() {
    return (
        <div className="h-screen w-full bg-black text-white flex flex-col pt-16 pb-20">
            {/* Profile Header */}
            <div className="px-6 mb-8 flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                        <Avatar className="w-full h-full border-4 border-black">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-full border-2 border-black">
                        LVL 5
                    </div>
                </div>

                <h1 className="text-2xl font-black tracking-tight mb-1">Adrián</h1>
                <p className="text-zinc-400 text-sm mb-4">@adri95cadiz • Full Stack Wizard</p>

                <div className="flex gap-4 w-full max-w-xs justify-center mb-6">
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/50 min-w-[80px]">
                        <span className="text-xl font-bold text-white">12</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Projects</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/50 min-w-[80px]">
                        <span className="text-xl font-bold text-white">148</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Ideas</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/50 min-w-[80px]">
                        <span className="text-xl font-bold text-yellow-500">🔥 7</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Streak</span>
                    </div>
                </div>

                <Button variant="outline" size="sm" className="rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                    <Settings className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 bg-zinc-950/50 rounded-t-[30px] border-t border-white/5 overflow-hidden">
                <Tabs defaultValue="collection" className="w-full h-full flex flex-col">
                    <div className="px-6 pt-6 pb-2">
                        <TabsList className="w-full bg-zinc-900/50 p-1 rounded-full grid grid-cols-2">
                            <TabsTrigger value="collection" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black">
                                <Heart className="w-4 h-4 mr-2" /> Collection
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black">
                                <Trophy className="w-4 h-4 mr-2" /> Achievements
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="collection" className="flex-1 overflow-hidden mt-0">
                        {/* Reusing existing SavedView logic but simplified */}
                        <SavedView />
                    </TabsContent>

                    <TabsContent value="stats" className="flex-1 p-6 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex flex-col justify-between">
                                <Zap className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold">Fast</p>
                                    <p className="text-xs text-zinc-500">Prototyper</p>
                                </div>
                            </div>
                            {/* More stats placeholders */}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
