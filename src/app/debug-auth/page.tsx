"use client";

import { useSession } from "@/components/auth/SessionProvider";

export default function DebugAuthPage() {
    const { data: session, status } = useSession();

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

            <div className="space-y-4">
                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="font-bold mb-2">Session Status:</h2>
                    <pre className="text-sm">{status}</pre>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="font-bold mb-2">Session Data:</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>

                {session?.user && (
                    <div className="bg-green-900/30 border border-green-500 p-4 rounded-lg">
                        <h2 className="font-bold mb-2 text-green-400">✓ Authenticated</h2>
                        <p>User ID: {session.user.id}</p>
                        <p>Name: {session.user.name}</p>
                        <p>Email: {session.user.email}</p>
                    </div>
                )}

                {!session && status === "unauthenticated" && (
                    <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg">
                        <h2 className="font-bold mb-2 text-red-400">✗ Not Authenticated</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
