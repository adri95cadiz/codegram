"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/provider";
import type { GeneratedIdea } from "@/lib/ai/generator";

export function IdeaFeed() {
  const [currentIdea, setCurrentIdea] = useState<GeneratedIdea | null>(null);
  const [vibe, setVibe] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadIdea = async (customVibe?: string) => {
    const queryVibe = customVibe || vibe || "";
    setIsLoading(true);
    try {
      // Call tRPC via HTTP POST with proper format
      const response = await fetch("/api/trpc/generateIdea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vibe: queryVibe || undefined,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error ${response.status}:`, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const idea = await response.json();
      console.log("Raw API response:", idea);
      
      if (idea && typeof idea === "object" && idea.title) {
        console.log("✅ Valid idea received:", idea);
        setCurrentIdea(idea);
        setIsLiked(false);
      } else {
        console.error("Invalid idea structure:", idea);
      }
    } catch (error) {
      console.error("Error generating idea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemix = async () => {
    const remixVibe = vibe ? `${vibe}, but different` : "totally different vibe";
    await loadIdea(remixVibe);
    setVibe(remixVibe);
  };

  const handleDoubleTap = () => {
    setIsLiked(!isLiked);
    if (!isLiked && currentIdea) {
      console.log("❤️ Liked idea:", currentIdea.title);
      // TODO: Save to DB
    }
  };

  if (!currentIdea) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 px-4 bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Codegram</h1>
          <p className="text-zinc-400">Turn doom scrolling into doom coding</p>
        </div>

        <input
          type="text"
          placeholder="Vibe: rust, games, ai, weird, lowlevel..."
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadIdea()}
          className="w-full max-w-md px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />

        <button
          onClick={() => loadIdea()}
          disabled={isLoading}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? "Generating..." : "Start scrolling"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center px-4 bg-black overflow-hidden"
      onDoubleClick={handleDoubleTap}
    >
      {isLoading ? (
        <div className="text-center">
          <div className="text-2xl mb-4">✨</div>
          <p className="text-zinc-400">Generating idea...</p>
        </div>
      ) : (
        <>
        {/* Idea Card */}
        <div className="w-full max-w-md bg-linear-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          {/* Effort Badge */}
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            ⏱️ {currentIdea?.effort || "unknown"}
          </div>

        {/* Title */}
        <h2 className="text-3xl font-bold leading-tight text-white">
          {currentIdea?.title || "Loading..."}
        </h2>

        {/* Description */}
        <p className="text-lg text-zinc-300">{currentIdea.description}</p>

        {/* Why */}
        <div className="text-sm text-zinc-400 border-l-2 border-purple-500 pl-4">
          <p className="font-semibold text-zinc-300 mb-2">Why?</p>
          <p>{currentIdea.why}</p>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-2">
          {(currentIdea.stack || []).map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-sm bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleDoubleTap}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              isLiked
                ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {isLiked ? "❤️ Liked" : "🤍 Like"}
          </button>
          <button
            onClick={() => handleRemix()}
            disabled={isLoading}
            className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-all"
          >
            🎲 Remix
          </button>
          <button
            onClick={() => loadIdea()}
            disabled={isLoading}
            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? "..." : "↓ Next"}
          </button>
        </div>
      </div>
      </>
      )}

      {/* Hint */}
      <p className="text-zinc-500 text-sm mt-8">Double-tap card to like</p>
    </div>
  );
}
