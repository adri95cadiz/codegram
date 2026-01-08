"use client";

import { motion } from "framer-motion";
import { User, Settings, Heart, Zap, Trophy, LogOut, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedView } from "@/components/profile/SavedView";
import { useSession, signOut } from "@/components/auth/SessionProvider";
import { SignInButton } from "@/components/auth/SignInButton";
import { api } from "@/trpc/react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ProfileView() {
    const { data: session, status } = useSession();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState("");

    const { data: profile } = api.user.getProfile.useQuery(undefined, {
        enabled: !!session,
    });

    const { data: stats } = api.user.getStats.useQuery(undefined, {
        enabled: !!session,
    });

    const updateProfileMutation = api.user.updateProfile.useMutation({
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            setIsEditDialogOpen(false);
        },
        onError: (error) => {
            toast.error(`Failed to update profile: ${error.message}`);
        },
    });

    const handleEditProfile = () => {
        setEditName(profile?.name ?? "");
        setIsEditDialogOpen(true);
    };

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({ name: editName });
    };

    // Show sign-in prompt if not authenticated
    if (status === "loading") {
        return (
            <div className="h-screen w-full bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px] mx-auto mb-6">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <User className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-4">
                        Sign in to Continue
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        Connect your GitHub account to access your profile, projects, and saved ideas.
                    </p>
                    <SignInButton />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black text-white flex flex-col pt-16 pb-20">
            {/* Profile Header */}
            <div className="px-6 mb-8 flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                        <Avatar className="w-full h-full border-4 border-black">
                            <AvatarImage src={profile?.image ?? session.user?.image ?? undefined} />
                            <AvatarFallback>
                                {profile?.name?.[0]?.toUpperCase() ?? session.user?.name?.[0]?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-full border-2 border-black">
                        LVL 5
                    </div>
                </div>

                <h1 className="text-2xl font-black tracking-tight mb-1">
                    {profile?.name ?? session.user?.name ?? "Developer"}
                </h1>
                <p className="text-zinc-400 text-sm mb-4">
                    @{profile?.githubUsername ?? "user"} • Full Stack Wizard
                </p>

                <div className="flex gap-4 w-full max-w-xs justify-center mb-6">
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/50 min-w-[80px]">
                        <span className="text-xl font-bold text-white">{stats?.projectCount ?? 0}</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Projects</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/50 min-w-[80px]">
                        <span className="text-xl font-bold text-white">{stats?.likesCount ?? 0}</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Ideas</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/50 min-w-[80px]">
                        <span className="text-xl font-bold text-yellow-500">🔥 {stats?.streak ?? 0}</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Streak</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        onClick={handleEditProfile}
                    >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        onClick={() => signOut()}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                </div>
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

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Update your profile information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="border-zinc-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                        >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
