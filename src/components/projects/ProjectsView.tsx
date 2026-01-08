import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Plus, ArrowRight, Clock, Sparkles, Loader2, Eye, Trash2, AlertTriangle, Cpu, Zap, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "../i18n/LanguageContext";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, GitBranch, Github, Link as LinkIcon, RefreshCcw, CheckCircle2, Circle, Ghost, X, Award } from "lucide-react";
import { toast } from "sonner";
import { FolderSelector } from "../create/FolderSelector";
import { GitConnector } from "../create/GitConnector";
import { useSession } from "../auth/SessionProvider";
import { SignInButton } from "../auth/SignInButton";

interface ProjectsViewProps {
    onOpenEditor?: (path: string) => void;
}

interface Mission {
    title: string;
    description: string;
    type: "quick" | "feature" | "architect";
    xp: number;
}

export function ProjectsView({ onOpenEditor }: ProjectsViewProps) {
    const { t, language } = useLanguage();
    const { data: session, status } = useSession();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isAddMissionOpen, setIsAddMissionOpen] = useState(false);
    const [newMissionTitle, setNewMissionTitle] = useState("");
    const [newMissionDesc, setNewMissionDesc] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Dialog State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newProject, setNewProject] = useState({ title: "", description: "", stack: "React", vibe: "Chill" });
    const [linkPath, setLinkPath] = useState("");
    const [cloneUrl, setCloneUrl] = useState("");
    const [targetFolder, setTargetFolder] = useState("");

    const utils = api.useUtils();

    // Show sign-in prompt if not authenticated
    if (status === "loading") {
        return (
            <div className="h-screen w-full bg-black text-white flex items-center justify-center pt-16 pb-24">
                <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center px-6 pt-16 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 p-[2px] mx-auto mb-6">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <Terminal className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-4">
                        Sign in to Access Projects
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        Connect your GitHub account to create and manage your coding projects.
                    </p>
                    <SignInButton />
                </motion.div>
            </div>
        );
    }

    // Data Fetching
    const { data: projects, isLoading } = api.projects.getAll.useQuery();

    // Safely find the project
    const activeProject = projects?.find(p => String(p.id) === String(selectedProject));

    const { data: dbMissions, isLoading: loadingMissions } = api.missions.getByProject.useQuery(
        { projectId: Number(selectedProject) },
        { enabled: !!selectedProject }
    );

    // Get user stats for XP display
    const { data: userStats } = api.projects.getAll.useQuery(undefined, {
        select: (data) => {
            // This is a workaround - in a real app you'd have a separate user query
            // For now we'll calculate from completed missions
            return { totalXp: 0, level: 1 };
        }
    });

    const generateMissions = api.feed.generateMissions.useMutation({
        onSuccess: async (data) => {
            // Automatically add generated missions to DB
            if (activeProject && data.missions) {
                for (const m of data.missions) {
                    await createMission.mutateAsync({
                        projectId: activeProject.id,
                        title: (m as any).title,
                        description: (m as any).description
                    });
                }
                utils.missions.getByProject.invalidate({ projectId: activeProject.id });
            }
            setError(null);
            toast.success("Missions generated and deployed.");
        },
        onError: (err) => {
            console.error("Mission generation failed:", err);
            setError("Failed to generate missions. Try again.");
        }
    });

    const createMission = api.missions.create.useMutation({
        onSuccess: () => {
            utils.missions.getByProject.invalidate({ projectId: Number(selectedProject) });
            setNewMissionTitle("");
            setNewMissionDesc("");
            setIsAddMissionOpen(false);
            toast.success("Mission created!");
        }
    });

    const acceptMission = api.missions.acceptMission.useMutation({
        onSuccess: () => {
            utils.missions.getByProject.invalidate({ projectId: Number(selectedProject) });
            toast.success("Mission accepted!");
        }
    });

    const rejectMission = api.missions.rejectMission.useMutation({
        onSuccess: () => {
            utils.missions.getByProject.invalidate({ projectId: Number(selectedProject) });
            toast.success("Mission rejected");
        }
    });

    const updateMissionProgress = api.missions.updateProgress.useMutation({
        onSuccess: () => {
            utils.missions.getByProject.invalidate({ projectId: Number(selectedProject) });
        }
    });

    const completeMission = api.missions.completeMission.useMutation({
        onSuccess: (data) => {
            utils.missions.getByProject.invalidate({ projectId: Number(selectedProject) });
            if (data.leveledUp) {
                toast.success(`🎉 Mission Complete! +${data.xpGained} XP - Level Up! Now Level ${data.newLevel}!`);
            } else {
                toast.success(`✅ Mission Complete! +${data.xpGained} XP`);
            }
        }
    });

    const deleteProject = api.projects.delete.useMutation({
        onSuccess: () => {
            utils.projects.getAll.invalidate();
            if (activeProject) setSelectedProject(null);
        }
    });

    const createProject = api.projects.create.useMutation({
        onSuccess: (project) => {
            // Once created, we initialize it if path/url is provided
            if (linkPath) {
                initProject.mutate({ id: project[0].id, localPath: linkPath });
            } else if (cloneUrl && targetFolder) {
                // First clone, then init. For now, we just init assuming done.
                // In real app, we'd await clone first. 
                // Let's implement clone mutation call here if needed, but for now simplify.
                cloneRepo.mutate({ repoUrl: cloneUrl, targetPath: targetFolder });
                initProject.mutate({ id: project[0].id, localPath: targetFolder, githubUrl: cloneUrl });
            }
            utils.projects.getAll.invalidate();
            setIsAddOpen(false);
            setLinkPath("");
            setCloneUrl("");
            setTargetFolder("");
        }
    });

    const initProject = api.projects.initializeProject.useMutation({
        onSuccess: () => {
            utils.projects.getAll.invalidate();
        }
    });

    const cloneRepo = api.inspector.cloneRepo.useMutation();

    const handleProjectSelect = (project: NonNullable<typeof projects>[number]) => {
        setSelectedProject(String(project.id));
        setError(null);
    };

    const handleGenerateMissions = () => {
        if (!activeProject) return;
        generateMissions.mutate({
            projectContext: `${activeProject.title}: ${activeProject.description}`,
            stack: activeProject.stack,
            language: language as "en" | "es"
        });
    };

    const handleCreateMission = () => {
        if (!newMissionTitle || !activeProject) return;
        createMission.mutate({
            projectId: activeProject.id,
            title: newMissionTitle,
            description: newMissionDesc
        });
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        deleteProject.mutate({ id });
    };



    return (
        <div className="h-screen w-full bg-black text-white flex flex-col pt-16 pb-24 px-6 relative font-sans selection:bg-green-500/30">
            <AnimatePresence>
                {selectedProject && activeProject && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="absolute inset-0 z-50 bg-zinc-950/98 backdrop-blur-3xl p-8 flex flex-col pt-20"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 border-b border-zinc-900 pb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 font-mono tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                    {t("mission_control.title")}
                                </h2>
                                <p className="text-zinc-500 text-xs mt-2 font-mono flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    {t("mission_control.operational_target")}: {activeProject.title ? activeProject.title.toUpperCase() : "PROJECT"}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* User XP Stats */}
                                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-yellow-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-zinc-600 uppercase font-mono">Level</span>
                                            <span className="text-sm font-black text-green-400 font-mono">{userStats?.level || 1}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-zinc-800" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-600 uppercase font-mono">Total XP</span>
                                        <span className="text-sm font-black text-yellow-500 font-mono">{userStats?.totalXp || 0}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedProject(null)}
                                    className="hover:bg-red-500/10 hover:text-red-400 rounded-full w-10 h-10 p-0 transition-colors"
                                >
                                    <span className="sr-only">Close</span>
                                    <div className="w-5 h-5 border-2 border-current rotate-45" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 pr-4 -mr-4 min-h-0">
                            {/* Soul Section */}
                            {!!activeProject.soul && (
                                <div className="p-5 rounded-2xl bg-purple-900/10 border border-purple-500/20 mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Ghost className="w-12 h-12 text-purple-500" />
                                    </div>
                                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono mb-3 flex items-center gap-2">
                                        <Ghost className="w-3 h-3" /> The Soul
                                    </h3>
                                    <p className="text-sm text-purple-200/90 font-mono mb-3 italic leading-relaxed">
                                        "{(activeProject.soul as { personality: string }).personality}"
                                    </p>
                                    <div className="text-[11px] text-purple-300/50 font-mono leading-relaxed bg-black/40 p-3 rounded-lg border border-purple-500/10">
                                        {(activeProject.soul as { context: string }).context}
                                    </div>
                                </div>
                            )}

                            {/* Command Deck Lite */}
                            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-[10px] font-mono whitespace-nowrap"
                                    onClick={() => activeProject?.localPath && onOpenEditor?.(activeProject.localPath)}
                                    disabled={!activeProject?.localPath}
                                >
                                    <Eye className="w-3 h-3 mr-2" /> {t("mission_control.view_source")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-[10px] font-mono whitespace-nowrap"
                                >
                                    <Terminal className="w-3 h-3 mr-2" /> {t("mission_control.logs")}
                                </Button>
                                <Dialog open={isAddMissionOpen} onOpenChange={setIsAddMissionOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-green-600/10 border-green-500/20 text-green-400 hover:bg-green-600/20 text-[10px] font-mono whitespace-nowrap"
                                        >
                                            <Plus className="w-3 h-3 mr-2" /> New Mission
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950 border-green-500/20 sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-green-500 font-mono">Initialize Target Mission</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Target Objective"
                                                    className="bg-black border-zinc-900 focus:border-green-500/50 text-white font-mono"
                                                    value={newMissionTitle}
                                                    onChange={(e) => setNewMissionTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Textarea
                                                    placeholder="Tactical explanation..."
                                                    className="bg-black border-zinc-900 focus:border-green-500/50 text-white font-mono min-h-[100px]"
                                                    value={newMissionDesc}
                                                    onChange={(e) => setNewMissionDesc(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 text-black font-black uppercase tracking-widest"
                                                onClick={handleCreateMission}
                                                disabled={createMission.isPending}
                                            >
                                                {createMission.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Deploy Mission"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Intelligence Feed */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Target className="w-3 h-3 text-green-500" /> Operational Missions
                                    </h3>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={handleGenerateMissions}
                                        disabled={generateMissions.isPending}
                                        className="h-7 text-[9px] font-bold tracking-wider bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-green-500/50 transition-all text-zinc-500 hover:text-green-400"
                                    >
                                        <RefreshCcw className={`w-3 h-3 mr-2 ${generateMissions.isPending ? "animate-spin" : ""}`} />
                                        {generateMissions.isPending ? "SCANNING..." : "SCAN FOR MISSIONS"}
                                    </Button>
                                </div>

                                {loadingMissions ? (
                                    <div className="space-y-2">
                                        {[1, 2].map(n => <div key={n} className="h-20 bg-zinc-900/40 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : error ? (
                                    <div className="p-6 border border-red-900/30 bg-red-950/10 rounded-xl flex flex-col items-center text-center">
                                        <AlertTriangle className="w-8 h-8 text-red-500/50 mb-3" />
                                        <p className="text-red-400 font-mono text-[10px] mb-4">{error}</p>
                                    </div>
                                ) : dbMissions?.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl">
                                        <p className="text-[10px] uppercase font-mono text-zinc-600 tracking-widest">No active missions detected.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 pb-20">
                                        {dbMissions?.map((mission) => (
                                            <motion.div
                                                key={mission.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                            >
                                                <Card className="bg-zinc-900/30 border-zinc-800/50 hover:border-green-500/20 transition-all overflow-hidden group">
                                                    <CardHeader className="p-4 space-y-3">
                                                        <div className="flex items-start gap-4">
                                                            <div className="mt-1">
                                                                {mission.status === 'completed' ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                ) : mission.status === 'active' ? (
                                                                    <Circle className="w-4 h-4 text-blue-500 animate-pulse fill-blue-500/20" />
                                                                ) : (
                                                                    <Circle className="w-4 h-4 text-yellow-500" />
                                                                )}
                                                            </div>
                                                            <div className="space-y-1 flex-1">
                                                                <CardTitle className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                                                                    {mission.title}
                                                                </CardTitle>
                                                                <CardDescription className="text-[11px] text-zinc-500 leading-normal line-clamp-2">
                                                                    {mission.description}
                                                                </CardDescription>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <Badge variant="outline" className="text-[8px] border-zinc-800 text-zinc-600 uppercase">
                                                                    {mission.status}
                                                                </Badge>
                                                                <div className="flex items-center gap-1 text-yellow-500">
                                                                    <Award className="w-3 h-3" />
                                                                    <span className="text-[10px] font-bold font-mono">{mission.xp} XP</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Pending Mission Actions */}
                                                        {mission.status === 'pending' && (
                                                            <div className="flex gap-2 pt-2 border-t border-zinc-800">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => acceptMission.mutate({ missionId: mission.id })}
                                                                    disabled={acceptMission.isPending}
                                                                    className="flex-1 bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 h-8 text-xs"
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => rejectMission.mutate({ missionId: mission.id })}
                                                                    disabled={rejectMission.isPending}
                                                                    className="flex-1 hover:bg-red-500/10 text-red-400 h-8 text-xs"
                                                                >
                                                                    <X className="w-3 h-3 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Active Mission Progress */}
                                                        {mission.status === 'active' && (
                                                            <div className="space-y-2 pt-2 border-t border-zinc-800">
                                                                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                                                                    <span>PROGRESS</span>
                                                                    <span className="text-green-400">{mission.progress}%</span>
                                                                </div>
                                                                <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                                                                        style={{ width: `${mission.progress}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2 pt-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateMissionProgress.mutate({
                                                                            missionId: mission.id,
                                                                            progress: Math.min(100, mission.progress + 25)
                                                                        })}
                                                                        disabled={mission.progress >= 100}
                                                                        className="flex-1 bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white h-7 text-[10px]"
                                                                    >
                                                                        +25%
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => completeMission.mutate({ missionId: mission.id })}
                                                                        disabled={mission.progress < 100 || completeMission.isPending}
                                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-7 text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {completeMission.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : `Complete (+${mission.xp} XP)`}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Completed Mission */}
                                                        {mission.status === 'completed' && (
                                                            <div className="pt-2 border-t border-zinc-800">
                                                                <div className="flex items-center justify-center gap-2 text-green-500 text-xs font-mono">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    <span>COMPLETED - {mission.xp} XP EARNED</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardHeader>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white mb-1">{t("projects.title")}</h1>
                    <p className="text-zinc-500 text-sm font-medium">{t("projects.subtitle")}</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="rounded-full bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10 transition-transform active:scale-95 z-40">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950/95 border-zinc-800 text-white sm:max-w-lg p-0 overflow-hidden backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="text-2xl font-black font-mono tracking-tight flex items-center gap-2">
                                <Plus className="w-6 h-6 text-green-500" /> INITIALIZE_NEW_SYSTEM
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 font-mono text-xs">
                                LINK LOCAL SOURCE OR CLONE REMOTE REPOSITORY
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="link" className="w-full">
                            <div className="px-6 mt-4">
                                <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50">
                                    <TabsTrigger value="link" className="rounded-full data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs font-bold uppercase tracking-wider">
                                        <Folder className="w-3.5 h-3.5 mr-2" /> Local
                                    </TabsTrigger>
                                    <TabsTrigger value="clone" className="rounded-full data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs font-bold uppercase tracking-wider">
                                        <GitBranch className="w-3.5 h-3.5 mr-2" /> Git
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6 pt-4 space-y-6 max-h-[60vh] overflow-y-scroll">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Target Name</label>
                                            <Input
                                                value={newProject.title}
                                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                                className="bg-black/40 border-zinc-800 h-11 focus:border-green-500/50 transition-colors"
                                                placeholder="SYSTEM_ID"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Framework</label>
                                            <Input
                                                value={newProject.stack}
                                                onChange={(e) => setNewProject({ ...newProject, stack: e.target.value })}
                                                className="bg-black/40 border-zinc-800 h-11 focus:border-green-500/50 transition-colors"
                                                placeholder="React, Next.js..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Context / Description</label>
                                        <Input
                                            value={newProject.description}
                                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            className="bg-black/40 border-zinc-800 h-11 focus:border-green-500/50 transition-colors"
                                            placeholder="Deep analysis of spectral signatures..."
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-zinc-900 pt-6">
                                    <TabsContent value="link" className="mt-0 space-y-4 outline-none">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <LinkIcon className="w-3 h-3 text-blue-500" /> Source Path
                                                </label>
                                                {linkPath && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-0 text-[9px]">PATH_SET</Badge>}
                                            </div>
                                            <FolderSelector
                                                onSelect={(path) => {
                                                    setLinkPath(path);
                                                    if (!newProject.title) {
                                                        const name = path.split(/[\\/]/).pop() || "project";
                                                        setNewProject(prev => ({ ...prev, title: name }));
                                                    }
                                                }}
                                                initialPath={linkPath || "C:/Users"}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="clone" className="mt-0 space-y-4 outline-none">
                                        <GitConnector
                                            onRepoSelect={(repo) => {
                                                setCloneUrl(repo.url);
                                                if (!newProject.title) setNewProject(prev => ({ ...prev, title: repo.name }));
                                            }}
                                        />

                                        {cloneUrl && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800"
                                            >
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Cloning Repository</label>
                                                    <div className="text-xs font-mono text-zinc-300 truncate">{cloneUrl}</div>
                                                </div>
                                                <div className="space-y-1.5 border-t border-zinc-800 pt-3">
                                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">C:/ DESTINATION_PATH</label>
                                                    <FolderSelector onSelect={setTargetFolder} initialPath={targetFolder || "C:/Users"} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </TabsContent>
                                </div>
                            </div>

                            <DialogFooter className="p-6 bg-zinc-900/50 border-t border-zinc-900 flex-col sm:flex-row gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsAddOpen(false)}
                                    className="sm:w-auto w-full hover:bg-zinc-800 text-zinc-500 hover:text-white"
                                >
                                    ABORT
                                </Button>
                                <Button
                                    onClick={() => createProject.mutate(newProject)}
                                    disabled={createProject.isPending || initProject.isPending || cloneRepo.isPending || (!linkPath && (!cloneUrl || !targetFolder))}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black tracking-tighter shadow-[0_0_20px_rgba(22,163,74,0.3)] h-11"
                                >
                                    {(createProject.isPending || initProject.isPending || cloneRepo.isPending) ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> INITIALIZE_SUBSYSTEM</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6 min-h-0">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
                        {projects?.map((project, i) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card
                                    onClick={() => handleProjectSelect(project)}
                                    className="bg-zinc-900/30 border-zinc-800/60 backdrop-blur-sm group hover:border-zinc-700 hover:bg-zinc-900/50 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-8 h-8 text-zinc-600 hover:text-red-400 hover:bg-red-950/30"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-zinc-950 border-zinc-900">
                                                <DialogHeader>
                                                    <DialogTitle className="text-white">{t("mission_control.delete_title")}</DialogTitle>
                                                    <DialogDescription className="text-zinc-500">
                                                        {t("mission_control.delete_confirm").replace("{title}", project.title)}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline" className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900">
                                                            {t("common.cancel")}
                                                        </Button>
                                                    </DialogClose>
                                                    <Button
                                                        onClick={(e) => handleDelete(e, project.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                                                    >
                                                        {t("mission_control.delete_action")}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <CardHeader className="p-6 pb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className={`
                                                    ${project.status === 'active' ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-zinc-800 text-zinc-500'}
                                                    uppercase text-[10px] tracking-widest font-bold px-2 py-0.5 w-fit
                                                `}>
                                                    {project.status}
                                                </Badge>
                                                {(project.analysis as any)?.vibe && (
                                                    <Badge variant="outline" className="border-purple-500/20 text-purple-400 bg-purple-500/5 uppercase text-[10px] tracking-widest font-bold px-2 py-0.5 w-fit">
                                                        {(project.analysis as any).vibe}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-zinc-600 font-mono">
                                                ID: {project.id}
                                            </span>
                                        </div>
                                        {!!project.soul && (
                                            <div className="mb-2 p-2 rounded bg-purple-500/5 border border-purple-500/10">
                                                <p className="text-[9px] text-purple-400 font-mono italic line-clamp-1">
                                                    "{(project.soul as { personality: string }).personality}"
                                                </p>
                                            </div>
                                        )}
                                        <CardTitle className="text-xl font-bold text-zinc-100 group-hover:text-green-400 transition-colors">
                                            {project.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-zinc-500 mt-2 text-sm">
                                            {project.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <div className="mt-4 p-3 rounded-lg bg-zinc-950/50 border border-zinc-900 group-hover:border-zinc-800 transition-colors">
                                            <p className="text-[10px] text-zinc-600 uppercase font-bold mb-1.5 flex items-center gap-2">
                                                <Terminal className="w-3 h-3" /> {t("mission_control.next_objective")}
                                            </p>
                                            <p className="text-sm font-mono text-zinc-300">
                                                {project.nextStep || t("mission_control.init_repo")}
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0 flex justify-end">
                                        <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors flex items-center gap-1">
                                            {t("mission_control.open")} <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
