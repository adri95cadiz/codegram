"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

    useEffect(() => {
        setError(searchParams.get("error"));
        setCallbackUrl(searchParams.get("callbackUrl"));
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-6 text-red-500">Authentication Error</h1>

            <div className="space-y-4">
                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="font-bold mb-2">Error:</h2>
                    <pre className="text-sm text-red-400 whitespace-pre-wrap break-all">
                        {error || "No error parameter"}
                    </pre>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="font-bold mb-2">Callback URL:</h2>
                    <pre className="text-sm text-zinc-400 whitespace-pre-wrap break-all">
                        {callbackUrl || "No callback URL"}
                    </pre>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="font-bold mb-2">All URL Parameters:</h2>
                    <pre className="text-sm text-zinc-400">
                        {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
                    </pre>
                </div>

                <div className="mt-6">
                    <a
                        href="/api/auth/signin"
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg inline-block"
                    >
                        Try Again
                    </a>
                </div>
            </div>
        </div>
    );
}
