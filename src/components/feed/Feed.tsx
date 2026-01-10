"use client";

import { useState } from "react";
import { DiscoverFeed } from "./DiscoverFeed";
import { EditorView } from "@/components/editor/EditorView";
import { useLanguage } from "@/components/i18n/LanguageContext";

export function Feed({ onNavigateToProfile }: { onNavigateToProfile?: () => void }) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { t } = useLanguage();
    const handleOpenEditor = () => setIsEditorOpen(true);

    return (
        <div className="h-screen w-full bg-black relative">
            <EditorView isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />

            {/* Feed Content - Defaulting to Discover Feed as requested */}
            <div className="h-full w-full pt-0">
                <DiscoverFeed onOpenEditor={handleOpenEditor} onNavigateToProfile={onNavigateToProfile} />
            </div>
        </div>
    );
}
