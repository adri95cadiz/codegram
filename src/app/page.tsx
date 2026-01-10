"use client";

import { useState } from "react";
import { Feed } from "@/components/feed/Feed";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { ProfileView } from "@/components/profile/ProfileView";
import { DoomChat } from "@/components/doom/DoomChat";
import { EditorView } from "@/components/editor/EditorView";
import { VibeTerminal } from "@/components/vibe/VibeTerminal";
import { Button } from "@/components/ui/button";
import { MessageSquareDashed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "@/components/auth/SessionProvider";
import { SignInButton } from "@/components/auth/SignInButton";

export default function Home() {
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState<"feed" | "saved" | "profile">("feed");
  const [isDoomMode, setIsDoomMode] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVibeOpen, setIsVibeOpen] = useState(false);
  const [editorRoot, setEditorRoot] = useState<string | undefined>(undefined);
  const [openAISettings, setOpenAISettings] = useState(false);

  const handleOpenEditor = (path: string) => {
    setEditorRoot(path);
    setIsEditorOpen(true);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Initializing Vibe...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black relative flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg text-center space-y-12">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4"
            >
              Building the future. While scrolling your feed.
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl font-black text-white tracking-tighter"
            >
              CODEGRAM <span className="text-orange-500">.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-zinc-400 text-lg max-w-md mx-auto"
            >
              Doom coding with your own tokens
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col items-center gap-4">
              <SignInButton />
              <p className="text-zinc-500 text-sm">Sign in to go full doom mode</p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <AnimatePresence>
        {isDoomMode && <DoomChat onClose={() => setIsDoomMode(false)} />}
        {isEditorOpen && <EditorView isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} projectRoot={editorRoot} />}
        {isVibeOpen && <VibeTerminal onClose={() => setIsVibeOpen(false)} projectPath={editorRoot ?? ""} />}
      </AnimatePresence>

      <div className={`transition-all duration-500 ${isDoomMode || isEditorOpen ? "scale-95 opacity-50 blur-sm pointer-events-none" : ""}`}>
        {currentView === "feed" && <Feed onNavigateToProfile={() => { setCurrentView("profile"); setOpenAISettings(true); }} />}
        {currentView === "saved" && <ProjectsView onOpenEditor={handleOpenEditor} onOpenVibe={(path) => { setEditorRoot(path); setIsVibeOpen(true); }} />}
        {currentView === "profile" && <ProfileView openAISettings={openAISettings} onSettingsClose={() => setOpenAISettings(false)} />}
      </div>

      {!isDoomMode && !isEditorOpen && (
        <>
          <BottomNav currentView={currentView} onViewChange={setCurrentView} />

          {/* Doom Mode Trigger FAB */}
          <div className="fixed bottom-24 right-4 z-40">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-black shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-red-400 animate-pulse hover:animate-none transition-all hover:scale-110"
              onClick={() => setIsDoomMode(true)}
            >
              <MessageSquareDashed className="w-7 h-7 stroke-[2.5]" />
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
