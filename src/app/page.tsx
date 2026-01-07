"use client";

import { useState } from "react";
import { Feed } from "@/components/feed/Feed";
import { BottomNav } from "@/components/layout/BottomNav";
import { SavedView } from "@/components/profile/SavedView";

export default function Home() {
  const [currentView, setCurrentView] = useState<"feed" | "saved" | "profile">("feed");

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      {currentView === "feed" && <Feed />}
      {currentView === "saved" && <SavedView />}
      {currentView === "profile" && (
        <div className="h-screen flex items-center justify-center text-zinc-500 font-mono">
          Profile View (Coming Soon)
        </div>
      )}

      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </main>
  );
}
