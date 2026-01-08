"use client";

import { useState } from "react";
import { Feed } from "@/components/feed/Feed";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { ProfileView } from "@/components/profile/ProfileView";
import { DoomChat } from "@/components/doom/DoomChat";
import { EditorView } from "@/components/editor/EditorView";
import { Button } from "@/components/ui/button";
import { MessageSquareDashed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [currentView, setCurrentView] = useState<"feed" | "saved" | "profile">("feed");
  const [isDoomMode, setIsDoomMode] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorRoot, setEditorRoot] = useState<string | undefined>(undefined);

  const handleOpenEditor = (path: string) => {
    setEditorRoot(path);
    setIsEditorOpen(true);
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <AnimatePresence>
        {isDoomMode && <DoomChat onClose={() => setIsDoomMode(false)} />}
        {isEditorOpen && <EditorView isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} projectRoot={editorRoot} />}
      </AnimatePresence>

      <div className={`transition-all duration-500 ${isDoomMode || isEditorOpen ? "scale-95 opacity-50 blur-sm pointer-events-none" : ""}`}>
        {currentView === "feed" && <Feed />}
        {currentView === "saved" && <ProjectsView onOpenEditor={handleOpenEditor} />}
        {currentView === "profile" && <ProfileView />}
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
