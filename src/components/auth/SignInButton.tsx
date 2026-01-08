"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useState } from "react";

export function SignInButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        await signIn("github");
    };

    return (
        <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
        >
            <Github className="w-6 h-6 mr-3" />
            {isLoading ? "Signing in..." : "Sign in with GitHub"}
        </Button>
    );
}
